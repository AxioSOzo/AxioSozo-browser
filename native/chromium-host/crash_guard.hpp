#pragma once
// Crash and hang robustness for the engine host (browser process only).
//
// 1. Inherited Mach exception ports. posix_spawn children inherit their parent's
//    task exception ports. Zen/Firefox registers Breakpad's handler for
//    EXC_BAD_ACCESS, EXC_BAD_INSTRUCTION, EXC_ARITHMETIC, EXC_BREAKPOINT,
//    EXC_CRASH, EXC_RESOURCE and EXC_GUARD
//    (toolkit/crashreporter/breakpad-client/mac/handler/exception_handler.cc).
//    For another task's exception that handler "simply ignores it" and returns
//    without a valid RetCode, so a faulting host (and every Chromium helper it
//    spawned) stayed parked on the faulting instruction instead of dying
//    (E1 2026-09-30: logs/host-hang-sample-*.txt, 100% of samples at the fault).
//    Clearing the task-level ports before CEF starts restores the default
//    (host-level ReportCrash, then the BSD signal): the process dies at once,
//    Zen's dead-name notification and Subprocess exit fire, and helpers spawned
//    later inherit the cleared ports.
// 2. Bounded exit. Once the host decides to end (shutdown, pipe EOF, protocol
//    or surface failure, SIGTERM, parent death) a watchdog on a libdispatch
//    worker (independent of the possibly stuck main thread) SIGKILLs the host's
//    own direct children and _exit()s after N seconds, so no teardown stall
//    (Keychain, CEF shutdown, static destructors) can keep a dead host around.
#include <dispatch/dispatch.h>
#include <libproc.h>
#include <mach/mach.h>
#include <signal.h>
#include <sys/proc_info.h>
#include <unistd.h>
#include <cstdio>

namespace axio::crash {

// Everything Breakpad (and Crashpad) may register, plus EXC_CRASH which is not
// part of EXC_MASK_ALL.
constexpr exception_mask_t kClearedMask = EXC_MASK_ALL | EXC_MASK_CRASH;

// Number of inherited task-level exception-port registrations (valid ports) in
// `mask`, or -1 when they cannot be read.
inline int inheritedExceptionPorts(exception_mask_t mask = kClearedMask) {
  exception_mask_t masks[EXC_TYPES_COUNT];
  mach_port_t ports[EXC_TYPES_COUNT];
  exception_behavior_t behaviors[EXC_TYPES_COUNT];
  thread_state_flavor_t flavors[EXC_TYPES_COUNT];
  mach_msg_type_number_t count = EXC_TYPES_COUNT;
  if (task_get_exception_ports(mach_task_self(), mask, masks, &count, ports, behaviors, flavors) != KERN_SUCCESS)
    return -1;
  int valid = 0;
  for (mach_msg_type_number_t i = 0; i < count; ++i) {
    if (MACH_PORT_VALID(ports[i])) {
      ++valid;
      mach_port_deallocate(mach_task_self(), ports[i]);
    }
  }
  return valid;
}

// Clears the task-level exception ports. Returns the number of inherited
// registrations that were present, or -1 when clearing failed.
inline int clearInheritedExceptionPorts() {
  int inherited = inheritedExceptionPorts();
  kern_return_t result = task_set_exception_ports(mach_task_self(), kClearedMask, MACH_PORT_NULL,
                                                  EXCEPTION_DEFAULT, THREAD_STATE_NONE);
  if (result != KERN_SUCCESS) {
    // Fall back to one exception type at a time; report failure if any remains.
    for (int type = 1; type < EXC_TYPES_COUNT; ++type) {
      exception_mask_t bit = exception_mask_t(1) << type;
      if (kClearedMask & bit)
        task_set_exception_ports(mach_task_self(), bit, MACH_PORT_NULL, EXCEPTION_DEFAULT, THREAD_STATE_NONE);
    }
    if (inheritedExceptionPorts() != 0) return -1;
  }
  return inherited;
}

// SIGKILLs this process's direct children (Chromium helpers), re-checking each
// pid's parent so a recycled pid is never signalled. Returns how many.
inline int killOwnChildren() {
  pid_t self = getpid();
  pid_t pids[512] = {};
  int reported = proc_listchildpids(self, pids, sizeof(pids));
  if (reported <= 0) return 0;
  int killed = 0;
  for (size_t i = 0; i < sizeof(pids) / sizeof(pids[0]); ++i) {
    if (pids[i] <= 0) continue;
    struct proc_bsdinfo info;
    if (proc_pidinfo(pids[i], PROC_PIDTBSDINFO, 0, &info, sizeof(info)) != int(sizeof(info))) continue;
    if (pid_t(info.pbi_ppid) != self) continue;
    if (kill(pids[i], SIGKILL) == 0) ++killed;
  }
  return killed;
}

// Guarantees process exit within `seconds` (earliest armed deadline wins).
// Runs on a libdispatch worker thread; only async-signal-safe-ish calls.
inline void armExitWatchdog(double seconds, int code, const char* reason) {
  dispatch_after(dispatch_time(DISPATCH_TIME_NOW, int64_t(seconds * NSEC_PER_SEC)),
                 dispatch_get_global_queue(QOS_CLASS_USER_INITIATED, 0), ^{
                   int killed = killOwnChildren();
                   fprintf(stderr, "AXIO_CEF_EXIT_WATCHDOG reason=%s after=%.1fs killed_children=%d\n", reason,
                           seconds, killed);
                   _exit(code);
                 });
}

// Parent (Zen) death: arm the watchdog even when the main thread is stuck and
// never notices stdin EOF. `onExit` runs on the same worker queue.
inline void watchParent(double seconds, int code, void (^onExit)(void)) {
  pid_t parent = getppid();
  if (parent <= 1) return;
  // Kept for the process lifetime: a released source (ARC) would stop firing.
  static dispatch_source_t source = nullptr;
  if (source) return;
  source = dispatch_source_create(DISPATCH_SOURCE_TYPE_PROC, uintptr_t(parent), DISPATCH_PROC_EXIT,
                                  dispatch_get_global_queue(QOS_CLASS_USER_INITIATED, 0));
  if (!source) return;
  dispatch_source_set_event_handler(source, ^{
    if (onExit) onExit();
    armExitWatchdog(seconds, code, "parent_exited");
  });
  dispatch_resume(source);
  // The parent may already be gone (reparented to launchd) before the source existed.
  if (getppid() != parent) {
    if (onExit) onExit();
    armExitWatchdog(seconds, code, "parent_exited");
  }
}

}  // namespace axio::crash

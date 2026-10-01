// Real-process tests for crash_guard.hpp (no CEF). Run by `probe.py test-native`.
//
// The parent installs a Breakpad-like task exception handler on itself (the
// same masks Firefox registers) that answers a *foreign* task's exception with
// KERN_SUCCESS, which is what Breakpad's uninitialised reply code amounts to
// when it is 0: the kernel resumes the faulting thread, which faults again.
// Children are posix_spawned, so they inherit that port exactly as the CEF host
// inherits Zen's. Cases:
//   inherit      child sees the inherited port registrations;
//   hang         child faults WITHOUT clearing: must still be alive after 1.5 s;
//   reset        child clears (clearInheritedExceptionPorts) then faults: must
//                die by signal promptly;
//   watchdog     armExitWatchdog SIGKILLs the child's own children and _exits;
//   orphan       watchParent: the child's parent exits, the child exits.
// Prints one JSON line; exit 0 only when every case passed.
#include <mach-o/dyld.h>
#include <mach/mach.h>
#include <mach/mach_time.h>
#include <mach/ndr.h>
#include <poll.h>
#include <signal.h>
#include <spawn.h>
#include <sys/wait.h>
#include <unistd.h>
#include <atomic>
#include <cerrno>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <string>
#include <thread>
#include "../crash_guard.hpp"

extern char** environ;

namespace {

mach_timebase_info_data_t timebase;
double nowMs() { return double(mach_absolute_time()) * timebase.numer / timebase.denom / 1e6; }

// ---- Breakpad-like exception server (parent only) ----
struct ExceptionRequest {
  mach_msg_header_t header;
  mach_msg_body_t body;
  mach_msg_port_descriptor_t thread;
  mach_msg_port_descriptor_t task;
  NDR_record_t ndr;
  exception_type_t exception;
  mach_msg_type_number_t codeCount;
  int64_t code[2];
  mach_msg_trailer_t trailer;
  uint8_t slack[256];
};
struct ExceptionReply {
  mach_msg_header_t header;
  NDR_record_t ndr;
  kern_return_t result;
};
std::atomic<int> foreignExceptions{0};

void serveExceptions(mach_port_t port) {
  for (;;) {
    ExceptionRequest request{};
    if (mach_msg(&request.header, MACH_RCV_MSG, 0, sizeof(request), port, MACH_MSG_TIMEOUT_NONE, MACH_PORT_NULL) !=
        MACH_MSG_SUCCESS)
      return;
    bool foreign = (request.header.msgh_bits & MACH_MSGH_BITS_COMPLEX) && request.task.name != mach_task_self();
    if (foreign) foreignExceptions++;
    ExceptionReply reply{};
    reply.header.msgh_bits = MACH_MSGH_BITS(MACH_MSGH_BITS_REMOTE(request.header.msgh_bits), 0);
    reply.header.msgh_size = sizeof(reply);
    reply.header.msgh_remote_port = request.header.msgh_remote_port;
    reply.header.msgh_id = request.header.msgh_id + 100;
    reply.ndr = NDR_record;
    reply.result = KERN_SUCCESS;  // "handled": the kernel resumes the faulting thread
    mach_msg(&reply.header, MACH_SEND_MSG, sizeof(reply), 0, MACH_PORT_NULL, MACH_MSG_TIMEOUT_NONE, MACH_PORT_NULL);
    if (request.header.msgh_bits & MACH_MSGH_BITS_COMPLEX) {
      mach_port_deallocate(mach_task_self(), request.thread.name);
      mach_port_deallocate(mach_task_self(), request.task.name);
    }
    // Throttle the fault/resume loop so the test does not burn a core.
    usleep(2000);
  }
}

bool installBreakpadLikeHandler() {
  mach_port_t port = MACH_PORT_NULL;
  if (mach_port_allocate(mach_task_self(), MACH_PORT_RIGHT_RECEIVE, &port) != KERN_SUCCESS) return false;
  if (mach_port_insert_right(mach_task_self(), port, port, MACH_MSG_TYPE_MAKE_SEND) != KERN_SUCCESS) return false;
  exception_mask_t mask = EXC_MASK_BAD_ACCESS | EXC_MASK_BAD_INSTRUCTION | EXC_MASK_ARITHMETIC | EXC_MASK_BREAKPOINT |
                          EXC_MASK_CRASH | EXC_MASK_RESOURCE | EXC_MASK_GUARD;
  if (task_set_exception_ports(mach_task_self(), mask, port, EXCEPTION_DEFAULT | MACH_EXCEPTION_CODES,
                               THREAD_STATE_NONE) != KERN_SUCCESS)
    return false;
  std::thread(serveExceptions, port).detach();
  return true;
}

// ---- child roles ----
[[noreturn]] void fault() {
  volatile int* bad = reinterpret_cast<volatile int*>(uintptr_t(8));
  *bad = 1;
  _exit(99);  // never reached
}

int child(const std::string& role, int report) {
  auto say = [&](const std::string& text) { (void)!write(report, text.data(), text.size()); };
  if (role == "inherit") {
    say(std::to_string(axio::crash::inheritedExceptionPorts()) + "\n");
    return 0;
  }
  if (role == "hang") { say("fault\n"); fault(); }
  if (role == "reset") {
    int inherited = axio::crash::clearInheritedExceptionPorts();
    say(std::to_string(inherited) + " " + std::to_string(axio::crash::inheritedExceptionPorts()) + "\n");
    fault();
  }
  if (role == "watchdog") {
    pid_t grandchild = -1;
    const char* args[] = {"/bin/sleep", "60", nullptr};
    if (posix_spawn(&grandchild, "/bin/sleep", nullptr, nullptr, (char* const*)args, environ)) return 3;
    say(std::to_string(grandchild) + "\n");
    axio::crash::armExitWatchdog(0.3, 76, "test");
    for (;;) pause();
  }
  if (role == "orphan-host") {
    axio::crash::watchParent(0.2, 77, nullptr);
    for (;;) pause();
  }
  if (role == "orphan-middle") {
    pid_t host = -1;
    char self[1024]; uint32_t size = sizeof(self);
    if (_NSGetExecutablePath(self, &size)) return 3;
    const char* args[] = {self, "orphan-host", nullptr};
    if (posix_spawn(&host, self, nullptr, nullptr, (char* const*)args, environ)) return 3;
    say(std::to_string(host) + "\n");
    usleep(300000);  // let the host arm its parent watch, then vanish
    _exit(0);
  }
  return 2;
}

// ---- parent helpers ----
struct Spawned { pid_t pid = -1; int out = -1; };
Spawned spawnRole(const char* self, const char* role) {
  int fds[2];
  if (pipe(fds)) return {};
  posix_spawn_file_actions_t actions;
  posix_spawn_file_actions_init(&actions);
  posix_spawn_file_actions_adddup2(&actions, fds[1], 3);
  const char* args[] = {self, role, nullptr};
  Spawned result;
  if (posix_spawn(&result.pid, self, &actions, nullptr, (char* const*)args, environ)) result.pid = -1;
  posix_spawn_file_actions_destroy(&actions);
  close(fds[1]);
  result.out = fds[0];
  return result;
}
std::string readLine(int fd, int timeoutMs) {
  std::string line;
  double deadline = nowMs() + timeoutMs;
  while (nowMs() < deadline) {
    pollfd p{fd, POLLIN, 0};
    if (poll(&p, 1, 20) <= 0) continue;
    char c;
    if (read(fd, &c, 1) != 1) break;
    if (c == '\n') return line;
    line += c;
  }
  return line;
}
// Waits up to timeoutMs; returns elapsed ms, or -1 (still running). status out.
double waitExit(pid_t pid, int timeoutMs, int& status) {
  double start = nowMs();
  while (nowMs() - start < timeoutMs) {
    pid_t done = waitpid(pid, &status, WNOHANG);
    if (done == pid) return nowMs() - start;
    usleep(1000);
  }
  return -1;
}
bool gone(pid_t pid) { return kill(pid, 0) != 0 && errno == ESRCH; }

}  // namespace

int main(int argc, char** argv) {
  mach_timebase_info(&timebase);
  if (argc == 2) return child(argv[1], 3);
  if (!installBreakpadLikeHandler()) { puts("{\"status\":\"FAIL\",\"reason\":\"handler_install\"}"); return 1; }
  std::string json = "{";
  bool ok = true;
  auto add = [&](const std::string& key, const std::string& value) {
    json += (json.size() > 1 ? "," : "") + ("\"" + key + "\":" + value);
  };

  {  // inherit
    Spawned s = spawnRole(argv[0], "inherit");
    std::string seen = readLine(s.out, 3000);
    int status = 0; waitExit(s.pid, 3000, status);
    int count = atoi(seen.c_str());
    add("inherited_registrations", std::to_string(count));
    ok &= count >= 1;
  }
  {  // hang: reproduces E1
    Spawned s = spawnRole(argv[0], "hang");
    readLine(s.out, 3000);
    int status = 0;
    double exited = waitExit(s.pid, 1500, status);
    bool hung = exited < 0;
    add("hang_without_reset", hung ? "true" : "false");
    add("foreign_exceptions_served", std::to_string(foreignExceptions.load()));
    if (hung) { kill(s.pid, SIGKILL); waitExit(s.pid, 3000, status); }
    ok &= hung;
  }
  {  // reset: the host's fix
    Spawned s = spawnRole(argv[0], "reset");
    std::string seen = readLine(s.out, 3000);
    double faultAt = nowMs();
    int status = 0;
    double exited = waitExit(s.pid, 5000, status);
    double ms = exited < 0 ? -1 : nowMs() - faultAt;
    bool signalled = exited >= 0 && WIFSIGNALED(status);
    add("reset_report", "\"" + seen + "\"");
    add("reset_exit_ms", std::to_string(ms));
    add("reset_signal", std::to_string(signalled ? WTERMSIG(status) : 0));
    if (exited < 0) { kill(s.pid, SIGKILL); waitExit(s.pid, 3000, status); }
    int before = -1, after = -1;
    sscanf(seen.c_str(), "%d %d", &before, &after);
    ok &= signalled && ms >= 0 && ms < 1000 && before >= 1 && after == 0;
  }
  {  // watchdog
    Spawned s = spawnRole(argv[0], "watchdog");
    pid_t grandchild = atoi(readLine(s.out, 3000).c_str());
    int status = 0;
    double exited = waitExit(s.pid, 3000, status);
    usleep(200000);
    bool code = exited >= 0 && WIFEXITED(status) && WEXITSTATUS(status) == 76;
    bool killed = grandchild > 0 && gone(grandchild);
    add("watchdog_exit_ms", std::to_string(exited));
    add("watchdog_code_76", code ? "true" : "false");
    add("watchdog_killed_child", killed ? "true" : "false");
    if (exited < 0) { kill(s.pid, SIGKILL); waitExit(s.pid, 3000, status); }
    if (!killed && grandchild > 0) kill(grandchild, SIGKILL);
    ok &= code && killed && exited < 1500;
  }
  {  // orphan
    Spawned s = spawnRole(argv[0], "orphan-middle");
    pid_t host = atoi(readLine(s.out, 3000).c_str());
    int status = 0; waitExit(s.pid, 3000, status);
    double start = nowMs();
    while (host > 0 && !gone(host) && nowMs() - start < 3000) usleep(5000);
    bool exited = host > 0 && gone(host);
    add("orphan_exit_ms", std::to_string(exited ? nowMs() - start : -1));
    if (!exited && host > 0) kill(host, SIGKILL);
    ok &= exited;
  }
  add("status", ok ? "\"PASS\"" : "\"FAIL\"");
  json += "}";
  puts(json.c_str());
  return ok ? 0 : 1;
}

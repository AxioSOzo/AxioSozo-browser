// Linux bounded-exit test for linux/platform_linux.cc armExitWatchdog: a "host" whose
// UI thread is stuck must still exit with the armed code and take every descendant
// (Chromium helpers, including grandchildren such as zygote-forked renderers) with it.
// Real processes, no CEF runtime. Built by probe.py test-native (Linux).
#include <errno.h>
#include <signal.h>
#include <sys/prctl.h>
#include <sys/wait.h>
#include <unistd.h>

#include <cassert>
#include <chrono>
#include <cstdio>
#include <thread>

#include "core/platform.hpp"

// True once `pid` no longer exists (re-parented zombies are reaped meanwhile).
static bool gone(pid_t pid, std::chrono::milliseconds wait) {
  auto deadline = std::chrono::steady_clock::now() + wait;
  while (std::chrono::steady_clock::now() < deadline) {
    while (waitpid(-1, nullptr, WNOHANG) > 0) {}
    if (kill(pid, 0) != 0 && errno == ESRCH) return true;
    std::this_thread::sleep_for(std::chrono::milliseconds(20));
  }
  return false;
}

int main() {
  // Orphaned descendants are re-parented to this test, so it can prove they died.
  assert(prctl(PR_SET_CHILD_SUBREAPER, 1) == 0);
  int pids[2];
  assert(pipe(pids) == 0);
  auto started = std::chrono::steady_clock::now();
  pid_t host = fork();
  assert(host >= 0);
  if (host == 0) {
    close(pids[0]);
    pid_t child = fork();  // "zygote"
    if (child == 0) {
      pid_t grandchild = fork();  // "renderer"
      if (grandchild == 0) { for (;;) pause(); }
      (void)!write(pids[1], &grandchild, sizeof(grandchild));
      for (;;) pause();
    }
    (void)!write(pids[1], &child, sizeof(child));
    axio::platform::armExitWatchdog(0.5, 76, "test");
    for (;;) pause();  // a UI thread that never returns
  }
  close(pids[1]);
  pid_t helpers[2] = {0, 0};
  assert(read(pids[0], &helpers[0], sizeof(pid_t)) == sizeof(pid_t));
  assert(read(pids[0], &helpers[1], sizeof(pid_t)) == sizeof(pid_t));
  int status = 0;
  assert(waitpid(host, &status, 0) == host);
  double seconds = std::chrono::duration<double>(std::chrono::steady_clock::now() - started).count();
  assert(WIFEXITED(status) && WEXITSTATUS(status) == 76);
  assert(seconds >= 0.4 && seconds < 5);
  for (pid_t helper : helpers) assert(gone(helper, std::chrono::milliseconds(3000)));
  printf("PASS: stuck host exited %d after %.2fs and SIGKILLed its child and grandchild (killDescendants via /proc)\n",
         WEXITSTATUS(status), seconds);

  // reapHelpers (normal shutdown): a helper that exits by itself is only reaped; one
  // that does not exit within the grace period is killed, grandchildren included.
  pid_t quick = fork();
  assert(quick >= 0);
  if (quick == 0) { usleep(100 * 1000); _exit(0); }
  assert(axio::platform::reapHelpers(2) == 0);
  assert(kill(quick, 0) != 0 && errno == ESRCH);
  int stuck[2];
  assert(pipe(stuck) == 0);
  pid_t lingering = fork();
  assert(lingering >= 0);
  if (lingering == 0) {
    pid_t grandchild = fork();
    if (grandchild == 0) { for (;;) pause(); }
    (void)!write(stuck[1], &grandchild, sizeof(grandchild));
    for (;;) pause();
  }
  pid_t grandchild = 0;
  assert(read(stuck[0], &grandchild, sizeof(pid_t)) == sizeof(pid_t));
  started = std::chrono::steady_clock::now();
  int killed = axio::platform::reapHelpers(0.3);
  seconds = std::chrono::duration<double>(std::chrono::steady_clock::now() - started).count();
  assert(killed == 2 && seconds >= 0.25 && seconds < 3);
  assert(gone(lingering, std::chrono::milliseconds(3000)) && gone(grandchild, std::chrono::milliseconds(3000)));
  printf("PASS: reapHelpers reaped a helper that exited and killed 2 lingering ones after %.2fs\n", seconds);
  return 0;
}

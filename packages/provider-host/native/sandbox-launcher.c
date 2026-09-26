/* Trusted app-owned lifetime supervisor. The child receives only stdin/stdout/
 * stderr; fd 3 is a parent-liveness pipe, never inherited by the sandboxed child.
 * Profile generation and executable allowlisting live in sandbox.mjs.
 * This launcher alone is NOT a sandbox and must never run an unprofiled client. */
#include <errno.h>
#include <fcntl.h>
#include <poll.h>
#include <signal.h>
#include <spawn.h>
#include <stdio.h>
#include <stdlib.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <time.h>
#include <unistd.h>

extern char **environ;
#ifndef AXIOSOZO_MAX_LIFETIME_MS
#define AXIOSOZO_MAX_LIFETIME_MS 30000
#endif
static volatile sig_atomic_t stopping = 0;
static void stop_handler(int sig) { (void)sig; stopping = 1; }
static long long now_ms(void) {
  struct timespec ts; clock_gettime(CLOCK_MONOTONIC, &ts);
  return (long long)ts.tv_sec * 1000 + ts.tv_nsec / 1000000;
}
static int reap(pid_t child, int *status) {
  int result; do { result = (int)waitpid(child, status, WNOHANG); } while (result < 0 && errno == EINTR);
  return result;
}
static void terminate_owned_child(pid_t child, int *status) {
  if (reap(child, status) != 0) { kill(-child, SIGKILL); return; }
  kill(-child, SIGTERM);
  long long deadline = now_ms() + 250;
  while (now_ms() < deadline) {
    if (reap(child, status) != 0) { kill(-child, SIGKILL); return; }
    struct timespec pause = {0, 10000000}; nanosleep(&pause, NULL);
  }
  kill(-child, SIGKILL);
  while (waitpid(child, status, 0) < 0 && errno == EINTR) {}
}
int main(int argc, char **argv) {
  if (argc < 5 || fcntl(3, F_GETFD) < 0) return 64;
  char *end = NULL; long duration = strtol(argv[1], &end, 10);
  if (!end || *end || duration < 20 || duration > AXIOSOZO_MAX_LIFETIME_MS || argv[3][0] != '/') return 64;
  struct sigaction handler = {0}; handler.sa_handler = stop_handler;
  sigaction(SIGTERM, &handler, NULL); sigaction(SIGINT, &handler, NULL); signal(SIGPIPE, SIG_IGN);
  char **child_argv = calloc((size_t)argc + 1, sizeof(char *));
  if (!child_argv) return 70;
  child_argv[0] = "/usr/bin/sandbox-exec"; child_argv[1] = "-p"; child_argv[2] = argv[2];
  for (int i = 3; i < argc; i++) child_argv[i] = argv[i];
  posix_spawn_file_actions_t actions; posix_spawn_file_actions_init(&actions);
  for (int fd = 0; fd < 3; fd++) posix_spawn_file_actions_adddup2(&actions, fd, fd);
  posix_spawn_file_actions_addclose(&actions, 3);
  posix_spawnattr_t attributes; posix_spawnattr_init(&attributes);
  posix_spawnattr_setflags(&attributes, POSIX_SPAWN_CLOEXEC_DEFAULT | POSIX_SPAWN_SETPGROUP);
  posix_spawnattr_setpgroup(&attributes, 0);
  pid_t child = -1; int result = posix_spawn(&child, child_argv[0], &actions, &attributes, child_argv, environ);
  posix_spawn_file_actions_destroy(&actions); posix_spawnattr_destroy(&attributes); free(child_argv);
  if (result) { fprintf(stderr, "AXIOSOZO_BROKER spawn_error=%d\n", result); return 78; }
  fprintf(stderr, "AXIOSOZO_BROKER child_pid=%d policy=seatbelt-supervised\n", child);
  struct pollfd lifetime = {3, POLLIN | POLLHUP | POLLERR, 0};
  const long long deadline = now_ms() + duration; int status = 0; const char *reason = "child_exit";
  while (reap(child, &status) == 0) {
    if (stopping || now_ms() >= deadline) { reason = stopping ? "cancelled" : "deadline"; terminate_owned_child(child, &status); break; }
    int polled = poll(&lifetime, 1, 20);
    if (polled < 0 && errno != EINTR) { reason = "lifetime_error"; terminate_owned_child(child, &status); break; }
    if (polled > 0) {
      char byte; ssize_t read_count = read(3, &byte, 1);
      if (read_count >= 0 || errno != EINTR) { reason = "parent_closed"; terminate_owned_child(child, &status); break; }
    }
  }
  /* Every admitted helper inherits the owned group; no external process or
   * process-name match is targeted. Clean remaining helpers after leader exit. */
  kill(-child, SIGKILL);
  close(3); fprintf(stderr, "AXIOSOZO_BROKER reaped=%d reason=%s\n", child, reason);
  if (WIFEXITED(status)) return WEXITSTATUS(status);
  return WIFSIGNALED(status) ? 128 + WTERMSIG(status) : 70;
}

/* TEST_FIXTURE ONLY. Touches synthetic paths supplied by the test runner.
 * The unsandboxed baseline creates a short-lived child to establish syscall
 * support. Under the real broker, fork and all subprocess execution must fail. */
#include <arpa/inet.h>
#include <errno.h>
#include <fcntl.h>
#include <signal.h>
#include <spawn.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/socket.h>
#include <sys/stat.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <unistd.h>
extern char **environ;
static int access_file(const char *base, const char *suffix, int flags) {
  char path[4096]; if (snprintf(path, sizeof(path), "%s/%s", base, suffix) >= (int)sizeof(path)) return EINVAL;
  int fd = open(path, flags, 0600); if (fd < 0) return errno;
  if (flags & O_CREAT) { const char c = 'x'; if (write(fd, &c, 1) < 0) { int e = errno; close(fd); return e; } }
  else { char c; if (read(fd, &c, 1) < 0) { int e = errno; close(fd); return e; } }
  close(fd); return 0;
}
static int spawn_shell(const char *target) {
  pid_t child = -1; char *const args[] = {"/bin/sh", "-c", "printf fixture > \"$1\"", "fixture", (char *)target, NULL};
  int result = posix_spawn(&child, args[0], NULL, NULL, args, environ);
  if (!result) { int status; while (waitpid(child, &status, 0) < 0 && errno == EINTR) {} return WIFEXITED(status) ? WEXITSTATUS(status) : 70; }
  return result;
}
int main(int argc, char **argv) {
  if (argc < 2) return 64;
  const int lifetime_fd_hidden = fcntl(3, F_GETFD) < 0;
  setvbuf(stdout, NULL, _IONBF, 0);
  if (!strcmp(argv[1], "tree") && argc == 4) {
    pid_t helper = -1; char *const args[] = {argv[2], "hold", NULL};
    int result = posix_spawn(&helper, args[0], NULL, NULL, args, environ);
    if (result) return result;
    printf("{\"label\":\"TEST_FIXTURE\",\"pid\":%d,\"helper_pid\":%d}\n", getpid(), helper);
    if (!strcmp(argv[3], "exit")) { usleep(100000); return 0; }
    signal(SIGTERM, SIG_IGN); for (;;) pause();
  }
  if (!strcmp(argv[1], "hold")) {
    signal(SIGTERM, SIG_IGN); signal(SIGINT, SIG_IGN);
    printf("{\"label\":\"TEST_FIXTURE\",\"pid\":%d,\"lifetime_fd_hidden\":%s}\n", getpid(), fcntl(3, F_GETFD) < 0 ? "true" : "false");
    for (;;) pause();
  }
  if (strcmp(argv[1], "probe") || argc != 5) return 64;
  const char *allowed = argv[2]; const char *outside = argv[3];
  int allowed_read = access_file(allowed, "input.txt", O_RDONLY);
  int allowed_write = access_file(allowed, "output.txt", O_WRONLY | O_CREAT | O_TRUNC);
  int denied_read = access_file(outside, "secret.txt", O_RDONLY);
  int denied_write = access_file(outside, "should-not-exist.txt", O_WRONLY | O_CREAT | O_TRUNC);
  int symlink_read = access_file(allowed, "escape.txt", O_RDONLY);
  int codex_config = access_file(outside, ".codex/config.toml", O_RDONLY);
  int claude_hooks = access_file(outside, ".claude/settings.json", O_RDONLY);
  int mcp_config = access_file(outside, ".mcp.json", O_RDONLY);
  int instructions = access_file(outside, "AGENTS.md", O_RDONLY);
  char marker[4096]; snprintf(marker, sizeof(marker), "%s/hook-marker.txt", allowed);
  int shell = spawn_shell(marker);
  pid_t forked = fork(); int fork_error = forked < 0 ? errno : 0;
  if (forked == 0) _exit(0);
  if (forked > 0) { int status; while (waitpid(forked, &status, 0) < 0 && errno == EINTR) {} }
  int sock = socket(AF_INET, SOCK_STREAM, 0); int network_error = sock < 0 ? errno : 0;
  if (sock >= 0) {
    struct sockaddr_in address = {0}; address.sin_family = AF_INET; address.sin_addr.s_addr = htonl(INADDR_LOOPBACK); address.sin_port = htons((unsigned short)atoi(argv[4]));
    if (connect(sock, (struct sockaddr *)&address, sizeof(address))) network_error = errno;
    close(sock);
  }
  printf("{\"label\":\"TEST_FIXTURE\",\"pid\":%d,\"allowed_read\":%d,\"allowed_write\":%d,\"outside_read\":%d,\"outside_write\":%d,\"symlink_read\":%d,\"codex_config\":%d,\"claude_hooks\":%d,\"mcp_config\":%d,\"instructions\":%d,\"shell\":%d,\"fork\":%d,\"network\":%d,\"lifetime_fd_hidden\":%s}\n", getpid(), allowed_read, allowed_write, denied_read, denied_write, symlink_read, codex_config, claude_hooks, mcp_config, instructions, shell, fork_error, network_error, lifetime_fd_hidden ? "true" : "false");
  return 0;
}

// Linux platform layer of the portable host core (core/platform.hpp).
#include "../core/platform.hpp"

#include <dirent.h>
#include <errno.h>
#include <signal.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <time.h>
#include <unistd.h>

#include <chrono>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <map>
#include <set>
#include <string>
#include <thread>
#include <vector>

namespace axio::platform {

const char* name() {
#if defined(__aarch64__)
  return "linuxarm64";
#elif defined(__x86_64__)
  return "linux64";
#else
#error "Unsupported Linux architecture for the pinned CEF distributions"
#endif
}

uint64_t nowNs() {
  timespec now{};
  clock_gettime(CLOCK_MONOTONIC, &now);
  return uint64_t(now.tv_sec) * 1000000000ull + uint64_t(now.tv_nsec);
}

// CEF's Linux translator (browser_platform_delegate_native_linux.cc, X11 build)
// derives keydown/keyup keysym and DomKey from windows_key_code; the character
// field matters only for KEYEVENT_CHAR, which always carries text.
char16_t keyCharacter(int) { return 0; }

// X11/XKB keycodes (evdev + 8): KEY_UP 103, KEY_DOWN 108.
int arrowNativeKeyCode(bool up) { return up ? 111 : 116; }

// Linux probe: KEYEVENT_CHAR U+E000 + (seq & 0xFFF) (private use) with Alt+Ctrl.
// ui::MakeWebKeyboardEventFromUiEvent sets is_system_key from Alt, so Blink's
// HandleCharEvent returns kNotHandled before DOM dispatch; Ctrl makes the
// modifiers differ from Blink's Alt-only access-key modifiers, so no accesskey can
// fire. native_key_code 0 maps to DomCode::NONE; the character round-trips through
// NativeWebKeyboardEvent(ui::KeyEvent, char16_t) into OnKeyEvent.
static constexpr char16_t ProbeBase = 0xE000;
void fillKeyProbe(cef_key_event_t& probe, uint64_t seq) {
  probe.type = KEYEVENT_CHAR;
  probe.is_system_key = 1;
  probe.modifiers = EVENTFLAG_ALT_DOWN | EVENTFLAG_CONTROL_DOWN;
  probe.native_key_code = 0;
  probe.windows_key_code = 0;
  probe.character = char16_t(uint64_t(ProbeBase) + (seq & KeyProbeMask));
  probe.unmodified_character = probe.character;
}
bool keyProbeReport(const cef_key_event_t& report, uint64_t& low) {
  if (report.type != KEYEVENT_CHAR || !report.is_system_key) return false;
  uint64_t character = uint64_t(report.character);
  if (character < uint64_t(ProbeBase) || character > uint64_t(ProbeBase) + KeyProbeMask) return false;
  low = character - uint64_t(ProbeBase);
  return true;
}
// Chromium reports DomCodeToNativeKeycode(NativeKeycodeToDomCode(sent)), which is the
// sent X11 keycode for every known key and 0 for unknown ones; windows_key_code is
// reported "located" for Shift/Control/Alt (VKEY_LSHIFT etc.).
static int locatedGeneric(int code) {
  switch (code) {
    case 0xA0: case 0xA1: return 0x10;
    case 0xA2: case 0xA3: return 0x11;
    case 0xA4: case 0xA5: return 0x12;
    default: return code;
  }
}
bool sameKeydown(const cef_key_event_t& report, int sentNative, int sentWindows) {
  if (report.native_key_code == sentNative) return true;
  return report.native_key_code == 0 && locatedGeneric(report.windows_key_code) == locatedGeneric(sentWindows);
}

// The host has no system clipboard path of its own on Linux (Chromium's own X11
// clipboard handles page copy/paste); context-menu "Copy image" is unavailable.
bool copyImage(const uint8_t*, size_t) { return false; }

// Every live descendant of this process (Chromium zygote, renderers, GPU, utility),
// found through /proc so that sandboxed processes in their own PID namespaces are
// included. Zombies (exited, not yet reaped) are not counted.
static std::vector<pid_t> descendants() {
  pid_t self = getpid();
  std::map<pid_t, std::vector<pid_t>> children;
  if (DIR* proc = opendir("/proc")) {
    while (dirent* entry = readdir(proc)) {
      char* end = nullptr;
      long pid = strtol(entry->d_name, &end, 10);
      if (!end || *end || pid <= 0) continue;
      char path[64];
      snprintf(path, sizeof(path), "/proc/%ld/stat", pid);
      FILE* f = fopen(path, "r");
      if (!f) continue;
      char buffer[512] = {};
      size_t n = fread(buffer, 1, sizeof(buffer) - 1, f);
      fclose(f);
      buffer[n] = 0;
      // Field 4 (ppid) follows the parenthesised command name, which may contain spaces.
      char* close = strrchr(buffer, ')');
      if (!close) continue;
      char state = 0;
      long parent = 0;
      if (sscanf(close + 1, " %c %ld", &state, &parent) != 2 || state == 'Z') continue;
      children[pid_t(parent)].push_back(pid_t(pid));
    }
    closedir(proc);
  }
  std::vector<pid_t> pending = {self}, found;
  std::set<pid_t> seen = {self};
  while (!pending.empty()) {
    pid_t next = pending.back();
    pending.pop_back();
    for (pid_t child : children[next])
      if (seen.insert(child).second) { found.push_back(child); pending.push_back(child); }
  }
  return found;
}
// Returns how many were signalled.
static int killDescendants() {
  int killed = 0;
  for (pid_t pid : descendants()) if (kill(pid, SIGKILL) == 0) ++killed;
  return killed;
}

// Chromium's zygotes (including the SUID-sandboxed ones) exit only when the browser
// process closes their socket, i.e. when this host exits; waiting for them is useless.
static bool zygote(pid_t pid) {
  char path[64];
  snprintf(path, sizeof(path), "/proc/%d/cmdline", int(pid));
  FILE* f = fopen(path, "r");
  if (!f) return false;
  char buffer[4096] = {};
  size_t n = fread(buffer, 1, sizeof(buffer) - 1, f);
  fclose(f);
  for (size_t i = 0; i < n; ++i) if (!buffer[i]) buffer[i] = ' ';  // argv or a rewritten title
  return strstr(buffer, "--type=zygote") != nullptr;
}

int reapHelpers(double seconds) {
  auto deadline = std::chrono::steady_clock::now() + std::chrono::duration<double>(seconds);
  for (;;) {
    while (waitpid(-1, nullptr, WNOHANG) > 0) {}
    std::vector<pid_t> left = descendants();
    if (left.empty()) return 0;
    bool onlyZygotes = true;
    for (pid_t pid : left) onlyZygotes = onlyZygotes && zygote(pid);
    if (onlyZygotes || std::chrono::steady_clock::now() >= deadline) break;
    std::this_thread::sleep_for(std::chrono::milliseconds(20));
  }
  int killed = killDescendants();
  while (waitpid(-1, nullptr, WNOHANG) > 0) {}
  return killed;
}

void armExitWatchdog(double seconds, int code, const char* reason) {
  std::string why = reason ? reason : "unknown";
  std::thread([seconds, code, why] {
    timespec wait{time_t(seconds), long((seconds - double(time_t(seconds))) * 1e9)};
    while (nanosleep(&wait, &wait) != 0 && errno == EINTR) {}
    int killed = killDescendants();
    fprintf(stderr, "AXIO_CEF_EXIT_WATCHDOG reason=%s after=%.1fs killed_descendants=%d\n", why.c_str(), seconds, killed);
    fflush(stderr);
    _exit(code);
  }).detach();
}

}  // namespace axio::platform

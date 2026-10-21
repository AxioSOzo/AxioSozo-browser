#pragma once
// The few things the portable host core needs from its platform layer
// (linux/platform_linux.cc today; the macOS host keeps its own host.mm path).
#include <cstddef>
#include <cstdint>
#include <string>
#include "include/capi/cef_browser_capi.h"

namespace axio::platform {

// Runtime label reported in `ready.platform` / `version.platform`, e.g. "linux64".
const char* name();

// Monotonic clock in nanoseconds.
uint64_t nowNs();

// `character`/`unmodified_character` for a keydown/keyup without text. macOS needs
// AppKit's function-key characters; on Linux CEF derives the key from
// windows_key_code (X11 keysym tables) and 0 is correct.
char16_t keyCharacter(int nativeKeyCode);

// Native key codes of the arrow keys used by accessibility increment/decrement.
int arrowNativeKeyCode(bool up);

// Key-verdict probe: an inert KEYEVENT_CHAR that Blink answers "not handled" before
// any DOM dispatch. The platform decides how the probe carries `seq` so that its
// unhandled report (CefKeyboardHandler::OnKeyEvent) can be recognised.
constexpr uint64_t KeyProbeMask = 0xFFF;
void fillKeyProbe(cef_key_event_t& probe, uint64_t seq);
// True when `report` is a probe; `low` receives seq & KeyProbeMask.
bool keyProbeReport(const cef_key_event_t& report, uint64_t& low);
// True when an unhandled keydown report belongs to a keydown sent with these codes.
bool sameKeydown(const cef_key_event_t& report, int sentNativeKeyCode, int sentWindowsKeyCode);

// Places PNG bytes on the system clipboard (context menu "Copy image").
// False when the platform layer has no clipboard path.
bool copyImage(const uint8_t* png, size_t size);

// After CEF shut down: waits up to `seconds` for this host's own helper processes
// to exit, then SIGKILLs any that remain. Returns how many were killed.
int reapHelpers(double seconds);

// Guarantees process exit within `seconds` even when the UI thread is stuck:
// kills this host's own Chromium helpers, then _exit(code).
void armExitWatchdog(double seconds, int code, const char* reason);

}  // namespace axio::platform

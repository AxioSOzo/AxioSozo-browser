#pragma once
// Portable C++ core of the AxioSozo CEF engine host (contracts/cef-v1.md).
// It owns the whole cef-v1 stream protocol (authenticated hello, exact-key
// command validation, target/generation binding, AXCF BGRA frames with credit
// flow control, input, browser-UI delegation, accessibility mirror, heartbeat)
// and the E0 fixture probe. It uses only the CEF C API, the C++ standard
// library, POSIX pipes (transport.hpp) and zlib, and calls its platform layer
// through core/platform.hpp.
//
// Status: the Linux host (linux/main_linux.cc) runs on this core. The macOS host
// still runs host.mm + stream.inc/input.inc/a11y.inc unchanged; moving it onto this
// core needs the IOSurface path ported and a real macOS E0/E1 run first.
#include <csignal>
#include <string>
#include <vector>
#include "include/capi/cef_app_capi.h"

namespace axio::host {

// Set by the platform's SIGINT/SIGTERM handler (async-signal-safe).
extern volatile sig_atomic_t interrupted;

struct LaunchConfig {
  bool streaming = false;
  std::string fixtureUrl;              // E0 only: http://127.0.0.1:PORT/engine.html
  std::string profile;                 // CEF root_cache_path; web sessions keep their profile here
  std::string evidence;                // cef-runtime.log and E0 PNG frames
  std::string subprocessPath;          // browser_subprocess_path (empty: this executable)
  std::vector<std::string> switches;   // fixed browser-process switches "name=value" (platform policy)
};

// E0 accepts only the synthetic local fixture page.
bool validFixtureUrl(const std::string& url);

// Stream mode, before CEF starts: moves the private pipes to CLOEXEC descriptors,
// reads and validates `hello` (10 s). False = refuse to start (exit 64).
bool streamHandshake();

// Configures handlers, initializes CEF, runs its message loop and shuts it down.
// Returns the process exit status.
int runBrowser(int argc, char** argv, const LaunchConfig& config);

// Renderer helper application (focused-node reports for IME placement).
cef_app_t* rendererApp();

}  // namespace axio::host

// AxioSozo CEF OSR engine host, Linux browser process. E0/component only, never
// Zen embedding evidence by itself. The protocol lives in ../core/host_core.cc.
//
//   AxioCEFProbe http://127.0.0.1:PORT/engine.html PRIVATE_PROFILE EVIDENCE_DIR   (E0 probe)
//   AxioCEFProbe --stream PRIVATE_PROFILE EVIDENCE_DIR                            (cef-v1 stream)
//
// Sandbox: settings.no_sandbox stays 0 and no sandbox switch is ever appended.
// Chromium uses its user-namespace sandbox when the kernel allows it, otherwise
// the SUID helper `chrome-sandbox` next to this executable (root:root, 4755); if
// neither is usable Chromium refuses to start, which the probe reports.
#include <dirent.h>
#include <limits.h>
#include <signal.h>
#include <sys/stat.h>
#include <sys/un.h>
#include <unistd.h>

#include <chrono>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <string>
#include <thread>

#include "../core/cef_util.hpp"
#include "../core/host_core.hpp"
#include "../core/platform.hpp"

static void bindCef() {
#define AXIO_CEF_BIND(name) axio::cef::p_##name = &::name;
  AXIO_CEF_FUNCTIONS(AXIO_CEF_BIND)
#undef AXIO_CEF_BIND
}

static void stopSignal(int) { axio::host::interrupted = 1; }

static std::string executableDirectory() {
  char path[PATH_MAX];
  ssize_t n = readlink("/proc/self/exe", path, sizeof(path) - 1);
  if (n <= 0) return std::string();
  path[n] = 0;
  std::string value(path);
  size_t slash = value.rfind('/');
  return slash == std::string::npos ? std::string() : value.substr(0, slash);
}

// Zen gone (even while our UI thread is stuck): bounded exit, helpers included.
// getppid() polling, not PR_SET_PDEATHSIG: the latter fires when the spawning
// *thread* of the parent exits, which Gecko's Subprocess worker may do.
static void watchParent() {
  pid_t parent = getppid();
  std::thread([parent] {
    while (getppid() == parent) std::this_thread::sleep_for(std::chrono::milliseconds(250));
    axio::host::interrupted = 1;
    axio::platform::armExitWatchdog(5, 77, "parent_exited");
  }).detach();
}

// One fixed, reviewed browser-process switch, never caller supplied: OSR needs no
// window, but Chromium's clipboard and font/IME services follow the ozone platform.
// With an X display the host uses X11 (clipboard shared with the desktop, also via
// XWayland); without one it uses the headless backend (page clipboard is then
// process-local). Wayland-only clipboard ownership needs an input serial that a
// windowless client never has, so WAYLAND_DISPLAY alone selects headless too.
static std::string ozonePlatform() {
  const char* display = getenv("DISPLAY");
  return display && *display ? "x11" : "headless";
}

// Chromium's ProcessSingleton binds <TMPDIR>/org.chromium.Chromium.XXXXXX/SingletonSocket
// and aborts when that exceeds sockaddr_un.sun_path (108 bytes). Launchers pass the
// private profile as TMPDIR, which is usually deeper than that allows, so the host
// then moves TMPDIR to a fresh 0700 directory of its own under /tmp and removes it
// after CEF shut down. Nothing else changes: the profile and caches stay where they were.
static constexpr size_t SingletonSuffix = sizeof("/org.chromium.Chromium.XXXXXX/SingletonSocket");
static std::string ownTemporary;
static void removeTree(const std::string& path) {
  if (DIR* directory = opendir(path.c_str())) {
    while (dirent* entry = readdir(directory)) {
      if (!strcmp(entry->d_name, ".") || !strcmp(entry->d_name, "..")) continue;
      std::string child = path + "/" + entry->d_name;
      struct stat info{};
      if (lstat(child.c_str(), &info) == 0 && S_ISDIR(info.st_mode)) removeTree(child);
      else unlink(child.c_str());
    }
    closedir(directory);
  }
  rmdir(path.c_str());
}
static bool shortTemporaryDirectory() {
  const char* current = getenv("TMPDIR");
  if (current && *current && strlen(current) + SingletonSuffix <= sizeof(sockaddr_un::sun_path)) return true;
  char path[] = "/tmp/axio-cef-XXXXXX";
  if (!mkdtemp(path)) return false;
  ownTemporary = path;
  return setenv("TMPDIR", path, 1) == 0;
}

int main(int argc, char** argv) {
  bindCef();
  for (int i = 1; i < argc; ++i) {
    if (strncmp(argv[i], "--type=", 7) == 0) {
      // Subprocesses run AxioCEFProbeHelper (browser_subprocess_path); never this binary.
      fprintf(stderr, "AxioCEFProbe is the browser process only\n");
      return 64;
    }
  }
  if (argc != 4) {
    fprintf(stderr, "usage: AxioCEFProbe local-fixture-url|--stream private-profile evidence-dir\n");
    return 64;
  }
  axio::host::LaunchConfig config;
  config.streaming = strcmp(argv[1], "--stream") == 0;
  if (!config.streaming) {
    if (!axio::host::validFixtureUrl(argv[1])) {
      fprintf(stderr, "only the synthetic local fixture is allowed\n");
      return 64;
    }
    config.fixtureUrl = argv[1];
  }
  config.profile = argv[2];
  config.evidence = argv[3];
  signal(SIGPIPE, SIG_IGN);
  if (config.streaming) watchParent();
  // The authentication secret arrives on the inherited pipe before CEF starts.
  if (config.streaming && !axio::host::streamHandshake()) return 64;
  if (!axio::cef::runtimeMatchesHeaders()) {
    fprintf(stderr, "CEF API version rejected\n");
    return 70;
  }
  signal(SIGINT, stopSignal);
  signal(SIGTERM, stopSignal);
  std::string directory = executableDirectory();
  if (directory.empty()) {
    fprintf(stderr, "cannot resolve the host directory\n");
    return 70;
  }
  if (!shortTemporaryDirectory()) {
    fprintf(stderr, "cannot create a short private TMPDIR for Chromium's process singleton\n");
    return 70;
  }
  config.subprocessPath = directory + "/AxioCEFProbeHelper";
  config.switches.push_back("ozone-platform=" + ozonePlatform());
  fprintf(stderr, "AXIO_CEF_LINUX platform=%s ozone=%s\n", axio::platform::name(), ozonePlatform().c_str());
  int status = axio::host::runBrowser(argc, argv, config);
  // Nothing of this host outlives it. After shutdown only the zygotes remain (they would
  // exit with this process); they are ended now, other helpers get up to 1 s.
  if (int killed = axio::platform::reapHelpers(1)) fprintf(stderr, "AXIO_CEF_HELPERS_ENDED count=%d\n", killed);
  if (!ownTemporary.empty()) removeTree(ownTemporary);
  return status;
}

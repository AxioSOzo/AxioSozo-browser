// In-Zen check of the host's crash fix (E2 harness, not a unit test).
// Spawned by Zen chrome code through Subprocess exactly like the CEF host, so
// it inherits Zen's real task exception ports (Breakpad). Usage:
//   fault_probe inherit   report inherited registrations, then fault
//   fault_probe reset     clear them with the host's code (crash_guard.hpp), then fault
// Prints "inherited=N after=M" and flushes before faulting. With `inherit` the
// E1 hang reproduces (the process stays parked on the fault); with `reset` it
// dies by SIGSEGV at once.
#include <cstdio>
#include <cstring>
#include "../crash_guard.hpp"

int main(int argc, char** argv) {
  if (argc != 2 || (strcmp(argv[1], "inherit") && strcmp(argv[1], "reset"))) return 64;
  int inherited = axio::crash::inheritedExceptionPorts();
  if (!strcmp(argv[1], "reset")) axio::crash::clearInheritedExceptionPorts();
  printf("inherited=%d after=%d\n", inherited, axio::crash::inheritedExceptionPorts());
  fflush(stdout);
  usleep(50000);  // let the parent timestamp the line
  volatile int* bad = reinterpret_cast<volatile int*>(uintptr_t(8));
  *bad = 1;
  return 99;
}

// AxioSozo CEF subprocess executable on Linux (zygote, renderer, GPU, utility).
// Chromium's own Linux sandbox (namespaces or SUID chrome-sandbox, plus seccomp-bpf)
// is set up by the zygote; this helper adds nothing to or removes nothing from it.
// Renderers report focused-node kind/bounds for IME placement (core rendererApp).
#include <cstdio>

#include "../core/cef_util.hpp"
#include "../core/host_core.hpp"

int main(int argc, char** argv) {
#define AXIO_CEF_BIND(name) axio::cef::p_##name = &::name;
  AXIO_CEF_FUNCTIONS(AXIO_CEF_BIND)
#undef AXIO_CEF_BIND
  if (!axio::cef::runtimeMatchesHeaders()) {
    fprintf(stderr, "CEF API version rejected\n");
    return 70;
  }
  cef_main_args_t args{argc, argv};
  return axio::cef::p_cef_execute_process(&args, axio::host::rendererApp(), nullptr);
}

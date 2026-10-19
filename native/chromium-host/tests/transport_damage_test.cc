// Frame damage on the AXCF transport (transport.hpp frameWithDamage). Native unit
// test only; not CEF rendering evidence.
#include "transport.hpp"

#include <sys/wait.h>

#include <cassert>
#include <csignal>
#include <cstdio>
#include <cstring>
#include <string>
#include <vector>

static void exact(int fd, void* data, size_t size) {
  auto* p = static_cast<unsigned char*>(data);
  while (size) {
    pollfd f{fd, POLLIN, 0};
    assert(poll(&f, 1, 5000) > 0);
    ssize_t n = read(fd, p, size);
    assert(n > 0);
    p += n;
    size -= size_t(n);
  }
}
static std::string metadata(int fd) {
  std::array<uint8_t, 16> h{};
  exact(fd, h.data(), 16);
  assert(h[7] == 2);
  uint32_t meta = 0, bytes = 0;
  for (int i = 0; i < 4; i++) { meta = (meta << 8) | h[8 + i]; bytes = (bytes << 8) | h[12 + i]; }
  std::string text(meta, 0);
  std::vector<uint8_t> payload(bytes);
  exact(fd, text.data(), meta);
  exact(fd, payload.data(), bytes);
  assert(bytes == 4 * 4 * 4);  // the full 4x4 frame always travels
  return text;
}
static std::string take(axio::Transport& transport) {
  auto deadline = std::chrono::steady_clock::now() + std::chrono::seconds(5);
  while (std::chrono::steady_clock::now() < deadline) {
    if (auto line = transport.pop()) return *line;
    std::this_thread::sleep_for(std::chrono::milliseconds(1));
  }
  abort();
}

int main() {
  signal(SIGPIPE, SIG_IGN);
  int input[2], output[2];
  assert(pipe(input) == 0 && pipe(output) == 0);
  pid_t child = fork();
  assert(child >= 0);
  if (!child) {
    close(input[1]); close(output[0]);
    assert(dup2(input[0], 0) >= 0 && dup2(output[1], 1) >= 0);
    close(input[0]); close(output[1]);
    axio::Transport transport;
    assert(transport.start());
    uint8_t pixels[64] = {};
    const uint32_t a[4] = {1, 1, 1, 1}, b[4] = {2, 0, 2, 1}, c[4] = {0, 3, 1, 1};
    // 1: delivered as is, and in flight until acknowledged.
    assert(transport.frameWithDamage("tab", "{\"frame_id\":1}", "t", 1, pixels, 4, 4, a));
    assert(take(transport) == "one\n");
    // 2 is replaced by 3 while 1 is outstanding: 3 carries the union of both.
    assert(transport.frameWithDamage("tab", "{\"frame_id\":2}", "t", 2, pixels, 4, 4, a));
    assert(transport.frameWithDamage("tab", "{\"frame_id\":3}", "t", 3, pixels, 4, 4, b));
    assert(transport.acknowledge(1, "t"));
    assert(take(transport) == "three\n");
    // A dropped pending frame (resize, navigation) makes the next one full-size.
    assert(transport.frameWithDamage("tab", "{\"frame_id\":4}", "t", 4, pixels, 4, 4, c));
    transport.invalidatePendingFrame("tab");
    assert(transport.frameWithDamage("tab", "{\"frame_id\":5}", "t", 5, pixels, 4, 4, c));
    assert(transport.acknowledge(3, "t"));
    assert(take(transport) == "five\n");
    // Then damage is exact again; plain frame() output is unchanged (no damage member).
    assert(transport.frameWithDamage("tab", "{\"frame_id\":6}", "t", 6, pixels, 4, 4, c));
    assert(transport.acknowledge(5, "t"));
    assert(take(transport) == "six\n");
    assert(transport.frame("other", "{\"frame_id\":7}", "o", 7, pixels, 64));
    assert(transport.acknowledge(6, "t"));
    assert(take(transport) == "seven\n");
    // Damage outside the frame is a host bug: fail closed.
    const uint32_t outside[4] = {3, 0, 2, 1};
    assert(!transport.frameWithDamage("tab", "{\"frame_id\":8}", "t", 8, pixels, 4, 4, outside));
    assert(transport.failed());
    transport.stop();
    _exit(0);
  }
  close(input[0]); close(output[1]);
  auto send = [&](const char* text) { assert(write(input[1], text, strlen(text)) == ssize_t(strlen(text))); };
  assert(metadata(output[0]) == "{\"frame_id\":1,\"damage\":[[1,1,1,1]]}"); send("one\n");
  assert(metadata(output[0]) == "{\"frame_id\":3,\"damage\":[[1,0,3,2]]}"); send("three\n");
  assert(metadata(output[0]) == "{\"frame_id\":5,\"damage\":[[0,0,4,4]]}"); send("five\n");
  assert(metadata(output[0]) == "{\"frame_id\":6,\"damage\":[[0,3,1,1]]}"); send("six\n");
  assert(metadata(output[0]) == "{\"frame_id\":7}"); send("seven\n");
  close(input[1]); close(output[0]);
  int status = 0;
  assert(waitpid(child, &status, 0) == child && WIFEXITED(status) && WEXITSTATUS(status) == 0);
  printf("PASS: frame damage is appended on write, merged into a replacing frame, full after a dropped frame, "
         "bounded, and absent from plain frames\n");
}

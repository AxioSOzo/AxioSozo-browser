// Rectangle-only frame payloads on the AXCF transport (hello `damage_payload:true`,
// transport.hpp setDamagePayload) and the Linux stdout pipe capacity. Native unit test
// only; not CEF rendering evidence.
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
static std::string packet(int fd, std::vector<uint8_t>& payload) {
  std::array<uint8_t, 16> h{};
  exact(fd, h.data(), 16);
  assert(h[7] == 2);
  uint32_t meta = 0, bytes = 0;
  for (int i = 0; i < 4; i++) { meta = (meta << 8) | h[8 + i]; bytes = (bytes << 8) | h[12 + i]; }
  std::string text(meta, 0);
  payload.assign(bytes, 0);
  exact(fd, text.data(), meta);
  exact(fd, payload.data(), bytes);
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
// 4x4 frame whose pixel (x, y) is the four bytes {x, y, generation, 255}.
static std::vector<uint8_t> frame(uint8_t generation) {
  std::vector<uint8_t> pixels(64);
  for (int y = 0; y < 4; y++)
    for (int x = 0; x < 4; x++) {
      uint8_t* p = pixels.data() + (y * 4 + x) * 4;
      p[0] = uint8_t(x); p[1] = uint8_t(y); p[2] = generation; p[3] = 255;
    }
  return pixels;
}
static void rows(const std::vector<uint8_t>& payload, int x, int y, int w, int h, uint8_t generation) {
  assert(payload.size() == size_t(w * h * 4));
  for (int row = 0; row < h; row++)
    for (int column = 0; column < w; column++) {
      const uint8_t* p = payload.data() + (row * w + column) * 4;
      assert(p[0] == x + column && p[1] == y + row && p[2] == generation && p[3] == 255);
    }
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
#ifdef __linux__
    // The stdout pipe was enlarged (fs.pipe-max-size permitting; 1 MiB by default).
    FILE* limit = fopen("/proc/sys/fs/pipe-max-size", "r");
    long max = 0;
    if (limit) { assert(fscanf(limit, "%ld", &max) == 1); fclose(limit); }
    assert(transport.pipeBytes() >= std::min<long>(axio::PipeBytes, max ? max : 65536));
#endif
    transport.setDamagePayload(true);
    const uint32_t whole[4] = {0, 0, 4, 4}, a[4] = {1, 1, 2, 1}, b[4] = {3, 2, 1, 2};
    auto one = frame(1), two = frame(2), three = frame(3), four = frame(4);
    assert(transport.frameWithDamage("tab", "{\"frame_id\":1}", "t", 1, one.data(), 4, 4, whole));
    assert(take(transport) == "one\n");
    // 2 is replaced by 3 while 1 is outstanding: 3's payload is the union, from 3's pixels.
    assert(transport.frameWithDamage("tab", "{\"frame_id\":2}", "t", 2, two.data(), 4, 4, a));
    assert(transport.frameWithDamage("tab", "{\"frame_id\":3}", "t", 3, three.data(), 4, 4, b));
    assert(transport.acknowledge(1, "t"));
    assert(take(transport) == "three\n");
    assert(transport.frameWithDamage("tab", "{\"frame_id\":4}", "t", 4, four.data(), 4, 4, a));
    assert(transport.acknowledge(3, "t"));
    assert(take(transport) == "four\n");
    // Plain frame() output stays whole.
    assert(transport.frame("other", "{\"frame_id\":5}", "o", 5, one.data(), 64));
    assert(transport.acknowledge(4, "t"));
    assert(take(transport) == "five\n");
    transport.stop();
    _exit(0);
  }
  close(input[0]); close(output[1]);
  auto send = [&](const char* text) { assert(write(input[1], text, strlen(text)) == ssize_t(strlen(text))); };
  std::vector<uint8_t> payload;
  assert(packet(output[0], payload) == "{\"frame_id\":1,\"damage\":[[0,0,4,4]]}"); rows(payload, 0, 0, 4, 4, 1); send("one\n");
  assert(packet(output[0], payload) == "{\"frame_id\":3,\"damage\":[[1,1,3,3]]}"); rows(payload, 1, 1, 3, 3, 3); send("three\n");
  assert(packet(output[0], payload) == "{\"frame_id\":4,\"damage\":[[1,1,2,1]]}"); rows(payload, 1, 1, 2, 1, 4); send("four\n");
  assert(packet(output[0], payload) == "{\"frame_id\":5}"); assert(payload.size() == 64); send("five\n");
  close(input[1]); close(output[0]);
  int status = 0;
  assert(waitpid(child, &status, 0) == child && WIFEXITED(status) && WEXITSTATUS(status) == 0);
  printf("PASS: damage_payload frames carry only the (merged) rectangle's rows from the newest pixels, "
         "plain frames stay whole, and the Linux stdout pipe is enlarged\n");
}

// frame_transport "memfd" on the AXCF transport (engine-stream-v1 §6.3, transport.hpp
// enableMemfd), Linux only. The parent reads each frame's slot the way Zen does: a
// positioned read of /proc/<host pid>/fd/<memfd> (IOUtils.read with offset/maxBytes).
// Native unit test only; not CEF rendering evidence.
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
static std::string packet(int fd, uint32_t& payloadBytes) {
  std::array<uint8_t, 16> h{};
  exact(fd, h.data(), 16);
  uint32_t meta = 0;
  payloadBytes = 0;
  for (int i = 0; i < 4; i++) { meta = (meta << 8) | h[8 + i]; payloadBytes = (payloadBytes << 8) | h[12 + i]; }
  std::string text(meta, 0);
  exact(fd, text.data(), meta);
  std::vector<uint8_t> payload(payloadBytes);
  exact(fd, payload.data(), payloadBytes);
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
static long number(const std::string& json, const char* key) {
  size_t at = json.find(std::string("\"") + key + "\":");
  assert(at != std::string::npos);
  return strtol(json.c_str() + at + strlen(key) + 3, nullptr, 10);
}

int main() {
#ifndef __linux__
  printf("SKIPPED: memfd frames are Linux only\n");
  return 0;
#else
  signal(SIGPIPE, SIG_IGN);
  int input[2], output[2], report[2];
  assert(pipe(input) == 0 && pipe(output) == 0 && pipe(report) == 0);
  pid_t child = fork();
  assert(child >= 0);
  if (!child) {
    close(input[1]); close(output[0]); close(report[0]);
    assert(dup2(input[0], 0) >= 0 && dup2(output[1], 1) >= 0);
    close(input[0]); close(output[1]);
    axio::Transport transport;
    assert(transport.start());
    int fd = transport.enableMemfd(2, 4 * 4 * 4);
    assert(fd >= 0 && transport.memfd() == fd && transport.memfdSlots() == 2 && transport.memfdSlotBytes() == 64);
    assert(transport.enableMemfd(2, 64) < 0);  // once only
    assert(fcntl(fd, F_GETFD) & FD_CLOEXEC);    // helpers never inherit it
    assert(write(report[1], &fd, sizeof(fd)) == sizeof(fd));
    transport.setDamagePayload(true);
    std::vector<uint8_t> a(64, 0xa1), b(64, 0xb2), c(64, 0xc3);
    const uint32_t whole[4] = {0, 0, 4, 4}, band[4] = {0, 1, 4, 2};
    assert(transport.frameWithDamage("tab", "{\"frame_id\":1}", "t", 1, a.data(), 4, 4, whole));
    assert(take(transport) == "one\n");
    assert(transport.frameWithDamage("tab", "{\"frame_id\":2}", "t", 2, b.data(), 4, 4, band));
    assert(transport.acknowledge(1, "t"));
    assert(take(transport) == "two\n");
    assert(transport.frame("other", "{\"frame_id\":3}", "o", 3, c.data(), 64));
    assert(transport.acknowledge(2, "t"));
    assert(take(transport) == "three\n");
    // Oversized for a slot: fail closed.
    std::vector<uint8_t> big(65, 1);
    assert(transport.frame("other", "{\"frame_id\":4}", "o", 4, big.data(), big.size()));
    assert(transport.acknowledge(3, "o"));
    auto deadline = std::chrono::steady_clock::now() + std::chrono::seconds(5);
    while (!transport.failed() && std::chrono::steady_clock::now() < deadline) std::this_thread::sleep_for(std::chrono::milliseconds(1));
    assert(transport.failed());
    transport.stop();
    _exit(0);
  }
  close(input[0]); close(output[1]); close(report[1]);
  int fd = -1;
  exact(report[0], &fd, sizeof(fd));
  std::string path = "/proc/" + std::to_string(child) + "/fd/" + std::to_string(fd);
  auto send = [&](const char* text) { assert(write(input[1], text, strlen(text)) == ssize_t(strlen(text))); };
  auto slot = [&](const std::string& meta, size_t bytes, uint8_t value) {
    int file = open(path.c_str(), O_RDONLY | O_CLOEXEC);
    assert(file >= 0);
    std::vector<uint8_t> data(bytes);
    assert(pread(file, data.data(), bytes, off_t(number(meta, "slot") * 64)) == ssize_t(bytes));
    close(file);
    for (uint8_t v : data) assert(v == value);
  };
  uint32_t payload = 0;
  std::string one = packet(output[0], payload);
  assert(one == "{\"frame_id\":1,\"damage\":[[0,0,4,4]],\"slot\":0,\"payload_bytes\":64}" && payload == 0);
  slot(one, 64, 0xa1); send("one\n");
  std::string two = packet(output[0], payload);
  assert(two == "{\"frame_id\":2,\"damage\":[[0,1,4,2]],\"slot\":1,\"payload_bytes\":32}" && payload == 0);
  slot(two, 32, 0xb2); send("two\n");
  std::string three = packet(output[0], payload);
  assert(three == "{\"frame_id\":3,\"slot\":0,\"payload_bytes\":64}" && payload == 0);
  slot(three, 64, 0xc3); send("three\n");
  close(input[1]); close(output[0]);
  int status = 0;
  assert(waitpid(child, &status, 0) == child && WIFEXITED(status) && WEXITSTATUS(status) == 0);
  printf("PASS: memfd frames carry no pipe payload, name alternating slots the parent reads through "
         "/proc/<pid>/fd, compose with damage_payload, and an oversized frame fails closed\n");
  return 0;
#endif
}

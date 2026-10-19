// Linux frame-transport prototype (docs/perf/pixel-path.md "shared-memory frame transport").
// Native measurement only, no engine and no Gecko: a forked "host" sends frames of a given
// size to a "receiver" in one of three ways, and the receiver ends with the whole frame in its
// own memory (as Zen must, before an upload):
//
//   pipe       AXCF-like framing over a pipe of the given capacity; the receiver reads the way
//              Firefox Subprocess does (one read(2) per poll wakeup into a fresh buffer of the
//              remaining size, then one concatenation copy) — the cost model of Zen's
//              Subprocess-based reader, without its worker message hop.
//   pipe-rect  the same with only a damage band of `--damage` share of the rows in the payload,
//              patched into the receiver's whole frame (hello.damage_payload).
//   shm        a sealed memfd ring of 3 slots shared once over a Unix SOCK_SEQPACKET socket
//              (SCM_RIGHTS); per frame a 40-byte message {slot, frame_id, damage}; the receiver
//              copies the damage rows from the slot into its frame and returns the slot.
//
// One frame in flight (like engine-stream-v1 §6) unless --inflight 2 (shm only).
// usage: shm_proto MODE WIDTH HEIGHT FRAMES [--pipe-bytes N] [--damage SHARE] [--inflight K]
// Prints one JSON line: frames/s, MB/s of payload, receiver per-frame ms (median, p95), CPU of
// sender and receiver (user+sys ms per frame).
#include <fcntl.h>
#include <linux/memfd.h>
#include <poll.h>
#include <sys/mman.h>
#include <sys/resource.h>
#include <sys/socket.h>
#include <sys/syscall.h>
#include <sys/time.h>
#include <sys/wait.h>
#include <unistd.h>

#include <algorithm>
#include <chrono>
#include <cstdint>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <memory>
#include <string>
#include <vector>

namespace {
using Clock = std::chrono::steady_clock;
double ms(Clock::duration d) { return std::chrono::duration<double, std::milli>(d).count(); }

struct Message { uint32_t magic, slot; uint64_t frame; uint32_t width, height, damage[4]; };

void die(const char* what) { perror(what); _exit(2); }
void writeAll(int fd, const void* data, size_t size) {
  auto* p = static_cast<const uint8_t*>(data);
  while (size) {
    ssize_t n = write(fd, p, size);
    if (n < 0) { if (errno == EINTR) continue; if (errno == EAGAIN) { pollfd f{fd, POLLOUT, 0}; poll(&f, 1, -1); continue; } die("write"); }
    p += n; size -= size_t(n);
  }
}
void readAll(int fd, void* data, size_t size) {
  auto* p = static_cast<uint8_t*>(data);
  while (size) {
    ssize_t n = read(fd, p, size);
    if (n < 0) { if (errno == EINTR) continue; die("read"); }
    if (!n) die("eof");
    p += n; size -= size_t(n);
  }
}
double cpuMs(int who) {
  rusage u{}; getrusage(who, &u);
  return (u.ru_utime.tv_sec + u.ru_stime.tv_sec) * 1000.0 + (u.ru_utime.tv_usec + u.ru_stime.tv_usec) / 1000.0;
}
void paint(std::vector<uint8_t>& frame, uint64_t id, uint32_t width, uint32_t y0, uint32_t rows) {
  for (uint32_t y = y0; y < y0 + rows; ++y) {
    uint32_t* row = reinterpret_cast<uint32_t*>(frame.data() + size_t(y) * width * 4);
    for (uint32_t x = 0; x < width; ++x) row[x] = 0xff000000u | uint32_t((x + y + id) * 2654435761u >> 8);
  }
}
}  // namespace

int main(int argc, char** argv) {
  if (argc < 5) { fprintf(stderr, "usage: %s pipe|pipe-rect|shm W H FRAMES [--pipe-bytes N] [--damage S] [--inflight K]\n", argv[0]); return 64; }
  std::string mode = argv[1];
  uint32_t width = uint32_t(atoi(argv[2])), height = uint32_t(atoi(argv[3]));
  int frames = atoi(argv[4]), pipeBytes = 0, inflight = 1;
  double damageShare = 1.0;
  for (int i = 5; i + 1 < argc; i += 2) {
    std::string key = argv[i];
    if (key == "--pipe-bytes") pipeBytes = atoi(argv[i + 1]);
    else if (key == "--damage") damageShare = atof(argv[i + 1]);
    else if (key == "--inflight") inflight = atoi(argv[i + 1]);
  }
  const size_t frameBytes = size_t(width) * height * 4;
  const uint32_t bandRows = std::max<uint32_t>(1, uint32_t(height * damageShare));
  const bool shm = mode == "shm", rect = mode == "pipe-rect" || (shm && damageShare < 1.0);
  int data[2], acks[2];
  if (shm) { if (socketpair(AF_UNIX, SOCK_SEQPACKET | SOCK_CLOEXEC, 0, data)) die("socketpair"); }
  else if (pipe2(data, O_CLOEXEC)) die("pipe");
  if (pipe2(acks, O_CLOEXEC)) die("pipe");
  if (!shm && pipeBytes) fcntl(data[1], F_SETPIPE_SZ, pipeBytes);
  int actualPipe = shm ? 0 : fcntl(data[1], F_GETPIPE_SZ);
  const int slots = 3;

  pid_t child = fork();
  if (child < 0) die("fork");
  if (!child) {  // ---- host
    close(data[0]); close(acks[1]);
    std::vector<uint8_t> frame(frameBytes);
    uint8_t* ring = nullptr;
    if (shm) {
      int memfd = int(syscall(SYS_memfd_create, "axio-frames", MFD_CLOEXEC | MFD_ALLOW_SEALING));
      if (memfd < 0) die("memfd_create");
      if (ftruncate(memfd, off_t(frameBytes) * slots)) die("ftruncate");
      if (fcntl(memfd, F_ADD_SEALS, F_SEAL_SHRINK | F_SEAL_GROW | F_SEAL_SEAL)) die("seal");
      ring = static_cast<uint8_t*>(mmap(nullptr, frameBytes * slots, PROT_READ | PROT_WRITE, MAP_SHARED, memfd, 0));
      if (ring == MAP_FAILED) die("mmap");
      char byte = 'F';
      iovec io{&byte, 1};
      alignas(cmsghdr) char control[CMSG_SPACE(sizeof(int))] = {};
      msghdr message{};
      message.msg_iov = &io; message.msg_iovlen = 1; message.msg_control = control; message.msg_controllen = sizeof(control);
      cmsghdr* c = CMSG_FIRSTHDR(&message);
      c->cmsg_level = SOL_SOCKET; c->cmsg_type = SCM_RIGHTS; c->cmsg_len = CMSG_LEN(sizeof(int));
      memcpy(CMSG_DATA(c), &memfd, sizeof(int));
      if (sendmsg(data[1], &message, 0) != 1) die("sendmsg");
      close(memfd);
    }
    int credit = shm ? inflight : 1, nextSlot = 0;
    std::vector<uint8_t> payload;
    for (int i = 1; i <= frames; ++i) {
      while (!credit) { uint32_t token; readAll(acks[0], &token, 4); credit++; }
      uint32_t y0 = rect ? uint32_t((i * 37) % (height - bandRows + 1)) : 0, rows = rect ? bandRows : height;
      if (i == 1) { y0 = 0; rows = height; }
      paint(frame, uint64_t(i), width, y0, rows);  // the engine's own render cost, excluded below
      if (shm) {
        uint8_t* slot = ring + size_t(nextSlot) * frameBytes;
        memcpy(slot + size_t(y0) * width * 4, frame.data() + size_t(y0) * width * 4, size_t(rows) * width * 4);
        Message m{0x41584653, uint32_t(nextSlot), uint64_t(i), width, height, {0, y0, width, rows}};
        if (send(data[1], &m, sizeof(m), 0) != ssize_t(sizeof(m))) die("send");
        nextSlot = (nextSlot + 1) % slots;
      } else {
        // Host transport copy (transport.hpp copies the frame), then header + rows.
        payload.assign(frame.begin() + ptrdiff_t(size_t(y0) * width * 4), frame.begin() + ptrdiff_t(size_t(y0 + rows) * width * 4));
        uint32_t header[4] = {uint32_t(i), y0, rows, uint32_t(payload.size())};
        writeAll(data[1], header, sizeof(header));
        writeAll(data[1], payload.data(), payload.size());
      }
      credit--;
    }
    while (credit < (shm ? inflight : 1)) { uint32_t token; readAll(acks[0], &token, 4); credit++; }
    _exit(0);
  }
  // ---- receiver (Zen)
  close(data[1]); close(acks[0]);
  std::vector<uint8_t> whole(frameBytes);
  uint8_t* ring = nullptr;
  if (shm) {
    char byte;
    iovec io{&byte, 1};
    alignas(cmsghdr) char control[CMSG_SPACE(sizeof(int))] = {};
    msghdr message{};
    message.msg_iov = &io; message.msg_iovlen = 1; message.msg_control = control; message.msg_controllen = sizeof(control);
    if (recvmsg(data[0], &message, MSG_CMSG_CLOEXEC) != 1) die("recvmsg");
    cmsghdr* c = CMSG_FIRSTHDR(&message);
    if (!c || c->cmsg_type != SCM_RIGHTS) die("no fd");
    int memfd; memcpy(&memfd, CMSG_DATA(c), sizeof(int));
    int seals = fcntl(memfd, F_GET_SEALS);
    if ((seals & (F_SEAL_SHRINK | F_SEAL_GROW)) != (F_SEAL_SHRINK | F_SEAL_GROW)) die("unsealed memfd");
    ring = static_cast<uint8_t*>(mmap(nullptr, frameBytes * slots, PROT_READ, MAP_SHARED, memfd, 0));
    if (ring == MAP_FAILED) die("mmap");
    close(memfd);
  }
  std::vector<double> perFrame;
  double cpu0 = cpuMs(RUSAGE_SELF);
  auto start = Clock::now();
  uint64_t payloadTotal = 0;
  long wakeups = 0;
  for (int i = 1; i <= frames; ++i) {
    pollfd f{data[0], POLLIN, 0};
    poll(&f, 1, -1);
    auto t0 = Clock::now();
    if (shm) {
      Message m{};
      if (recv(data[0], &m, sizeof(m), 0) != ssize_t(sizeof(m)) || m.magic != 0x41584653 || m.slot >= uint32_t(slots)) die("message");
      size_t offset = size_t(m.damage[1]) * width * 4, bytes = size_t(m.damage[3]) * width * 4;
      memcpy(whole.data() + offset, ring + size_t(m.slot) * frameBytes + offset, bytes);
      payloadTotal += bytes;
      wakeups++;
    } else {
      uint32_t header[4];
      readAll(data[0], header, sizeof(header));
      size_t size = header[3], got = 0;
      // Subprocess model: each wakeup reads into a fresh buffer of the remaining size.
      // (Uninitialized like a large calloc'd ArrayBuffer's untouched pages; shrunk to what was read.)
      std::vector<std::pair<std::unique_ptr<uint8_t[]>, size_t>> chunks;
      while (got < size) {
        pollfd w{data[0], POLLIN, 0};
        poll(&w, 1, -1);
        std::unique_ptr<uint8_t[]> chunk(new uint8_t[size - got]);
        ssize_t n = read(data[0], chunk.get(), size - got);
        if (n <= 0) die("read");
        got += size_t(n);
        chunks.emplace_back(std::move(chunk), size_t(n));
        wakeups++;
      }
      size_t offset = size_t(header[1]) * width * 4;
      for (auto& [chunk, bytes] : chunks) { memcpy(whole.data() + offset, chunk.get(), bytes); offset += bytes; }
      payloadTotal += size;
    }
    perFrame.push_back(ms(Clock::now() - t0));
    uint32_t token = 1;
    writeAll(acks[1], &token, 4);
  }
  double wall = ms(Clock::now() - start), cpu = cpuMs(RUSAGE_SELF) - cpu0;
  int status = 0;
  waitpid(child, &status, 0);
  double hostCpu = cpuMs(RUSAGE_CHILDREN);
  std::sort(perFrame.begin(), perFrame.end());
  auto q = [&](double p) { return perFrame[std::min(perFrame.size() - 1, size_t(p * double(perFrame.size())))]; };
  printf("{\"mode\":\"%s\",\"width\":%u,\"height\":%u,\"frames\":%d,\"pipe_bytes\":%d,\"damage_share\":%.3f,\"inflight\":%d,"
         "\"fps\":%.1f,\"payload_mb_s\":%.1f,\"receive_ms_median\":%.3f,\"receive_ms_p95\":%.3f,"
         "\"receiver_cpu_ms_per_frame\":%.3f,\"host_cpu_ms_per_frame_incl_paint\":%.3f,\"wakeups_per_frame\":%.1f,\"host_exit\":%d}\n",
         mode.c_str(), width, height, frames, actualPipe, rect ? double(bandRows) / height : 1.0, inflight,
         frames / (wall / 1000.0), payloadTotal / (wall / 1000.0) / 1e6, q(0.5), q(0.95), cpu / frames, hostCpu / frames,
         double(wakeups) / frames, WIFEXITED(status) ? WEXITSTATUS(status) : -1);
  return 0;
}

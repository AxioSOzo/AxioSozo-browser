#pragma once
// Private inherited pipes only. The CEF UI thread never performs a pipe write.
#include <algorithm>
#include <array>
#include <atomic>
#include <cerrno>
#include <chrono>
#include <condition_variable>
#include <cstdint>
#include <cstdio>
#include <cstring>
#include <deque>
#include <map>
#include <fcntl.h>
#include <mutex>
#include <optional>
#include <set>
#include <poll.h>
#include <string>
#include <thread>
#include <unistd.h>
#ifdef __linux__
#include <sys/mman.h>
#include <sys/syscall.h>
#endif
#include <vector>
#if defined(__linux__) && !defined(F_SETPIPE_SZ)
#define F_SETPIPE_SZ 1031
#define F_GETPIPE_SZ 1032
#endif

namespace axio {
constexpr size_t MaxLine = 16384, MaxMeta = 8192, MaxFrame = 33554432;
// Requested stdout pipe capacity on Linux (the unprivileged fs.pipe-max-size default).
constexpr int PipeBytes = 1 << 20;
struct Packet {
  uint16_t kind = 1;
  std::string metadata, target;
  std::vector<uint8_t> pixels;
  uint64_t frame = 0;
  // Optional frame damage (frameWithDamage only): one physical-pixel rectangle
  // {x, y, width, height}, added to the metadata as "damage":[[x,y,w,h]] on write.
  bool damaged = false;
  uint32_t damage[4] = {0, 0, 0, 0}, size[2] = {0, 0};
};
class Transport {
  int input_ = -1, output_ = -1;
  std::atomic<bool> stop_{false}, failed_{false}, eof_{false};
  std::thread reader_, writer_;
  std::mutex mutex_;
  std::condition_variable changed_;
  std::deque<std::string> inputQueue_;
  std::deque<Packet> events_;
  // Latest undelivered frame per target; one frame is in flight at a time.
  std::map<std::string, Packet> pending_;
  std::string lastKey_;
  // Targets whose next damaged frame must be full-size: a pending frame was dropped.
  std::set<std::string> fullNext_;
  bool damageUsed_ = false;  // only frameWithDamage callers pay for fullNext_
  // hello.damage_payload: damaged frames carry only their rectangle's rows (cef-v1 "Frame damage").
  std::atomic<bool> damagePayload_{false};
  uint64_t outstanding_ = 0;
  std::string outstandingTarget_;
  bool writing_ = false;
  void (*onInput_)() = nullptr;  // Set before start(); called on the reader thread.
  // hello.frame_transport "memfd" (engine-stream-v1 §6.3, Linux): frame pixels go into a sealed
  // memfd slot instead of the pipe; the AXCF frame names the slot and carries no payload. One
  // frame is in flight, so a slot is rewritten only after Zen acknowledged the frame that used it.
  // Set once (enableMemfd, after the hello, before any frame exists); read by the writer.
  std::atomic<int> memfd_{-1};
  std::atomic<uint8_t*> ring_{nullptr};
  std::atomic<size_t> slotBytes_{0};
  std::atomic<uint32_t> slots_{0};
  uint32_t nextSlot_ = 0;
  // §6.3 fallback (frame_ack frame_transport "pipe"): Zen could not read a slot; later frames
  // travel in the pipe. The ring stays mapped until stop().
  std::atomic<bool> memfdActive_{false};

  void fail() { failed_ = true; changed_.notify_all(); }
  bool transfer(const uint8_t* data, size_t size) {
    while (size && !stop_ && !failed_) {
      pollfd fd{output_, POLLOUT, 0};
      int ready = poll(&fd, 1, 100);
      if (ready < 0) { if (errno == EINTR) continue; fail(); return false; }
      if (!ready) continue;
      if (fd.revents & (POLLERR | POLLHUP | POLLNVAL)) { fail(); return false; }
      ssize_t n = write(output_, data, size);
      if (n < 0) { if (errno == EINTR || errno == EAGAIN) continue; fail(); return false; }
      if (!n) { fail(); return false; }
      data += n; size -= size_t(n);
    }
    return size == 0;
  }
  // Moves the damage rectangle's rows to the front of the whole frame (in place; each row
  // moves to a lower or equal offset) and drops the rest: the payload is width*height*4 of
  // the rectangle. Done on the writer thread from the newest pixels, after any merge.
  static void compactToDamage(Packet& packet) {
    size_t frameWidth = packet.size[0], x = packet.damage[0], y = packet.damage[1];
    size_t rowBytes = size_t(packet.damage[2]) * 4, rows = packet.damage[3];
    if (x == 0 && y == 0 && packet.damage[2] == packet.size[0] && packet.damage[3] == packet.size[1]) return;
    uint8_t* data = packet.pixels.data();
    for (size_t row = 0; row < rows; ++row)
      memmove(data + row * rowBytes, data + ((y + row) * frameWidth + x) * 4, rowBytes);
    packet.pixels.resize(rowBytes * rows);
  }
  void readLoop() {
    std::string line;
    while (!stop_ && !failed_) {
      pollfd fd{input_, POLLIN, 0};
      int ready = poll(&fd, 1, 100);
      if (ready < 0) { if (errno == EINTR) continue; fail(); break; }
      if (!ready) continue;
      char bytes[4096]; ssize_t n = read(input_, bytes, sizeof(bytes));
      if (n < 0) { if (errno == EINTR || errno == EAGAIN) continue; fail(); break; }
      if (!n) { if (!line.empty()) fail(); eof_ = true; break; }
      for (ssize_t i = 0; i < n; ++i) {
        if (!bytes[i] || line.size() + 1 > MaxLine) { fail(); break; }
        line.push_back(bytes[i]);
        if (bytes[i] == '\n') {
          std::lock_guard lock(mutex_);
          if (inputQueue_.size() >= 256) { fail(); break; }
          inputQueue_.push_back(std::move(line)); line.clear();
        }
        // Wake the UI thread instead of waiting for its polling timer.
        if (bytes[i] == '\n' && onInput_) onInput_();
      }
    }
  }
  void writeLoop() {
    while (!stop_ && !failed_) {
      Packet packet;
      {
        std::unique_lock lock(mutex_);
        changed_.wait_for(lock, std::chrono::milliseconds(100), [&] {
          return stop_ || failed_ || !events_.empty() || (!pending_.empty() && !outstanding_);
        });
        if (stop_ || failed_) break;
        if (!events_.empty()) { packet = std::move(events_.front()); events_.pop_front(); }
        else if (!pending_.empty() && !outstanding_) {
          // Round-robin across targets so one busy page cannot starve another.
          auto next = pending_.upper_bound(lastKey_);
          if (next == pending_.end()) next = pending_.begin();
          lastKey_ = next->first; packet = std::move(next->second); pending_.erase(next);
          // Record credit before emitting any bytes: an immediate ack is valid.
          outstanding_ = packet.frame; outstandingTarget_ = packet.target;
        } else continue;
        writing_ = true;
      }
      if (packet.damaged) {
        // The metadata is a JSON object; append the damage member before its closing brace.
        char member[96];
        snprintf(member, sizeof(member), ",\"damage\":[[%u,%u,%u,%u]]}", packet.damage[0], packet.damage[1],
                 packet.damage[2], packet.damage[3]);
        packet.metadata.pop_back();
        packet.metadata += member;
        if (damagePayload_) compactToDamage(packet);
      }
      if (packet.kind == 2 && ring_ && memfdActive_) {
        if (packet.pixels.size() > slotBytes_) { fail(); break; }
        memcpy(ring_.load() + size_t(nextSlot_) * slotBytes_, packet.pixels.data(), packet.pixels.size());
        char member[64];
        snprintf(member, sizeof(member), ",\"slot\":%u,\"payload_bytes\":%zu}", nextSlot_, packet.pixels.size());
        packet.metadata.pop_back();
        packet.metadata += member;
        packet.pixels.clear();
        nextSlot_ = (nextSlot_ + 1) % slots_;
      }
      std::array<uint8_t, 16> h{'A','X','C','F',0,1,0,uint8_t(packet.kind)};
      uint32_t sizes[2] = {uint32_t(packet.metadata.size()), uint32_t(packet.pixels.size())};
      for (int j = 0; j < 2; ++j)
        for (int b = 0; b < 4; ++b) h[8 + j*4 + b] = uint8_t(sizes[j] >> (24 - b*8));
      bool ok = transfer(h.data(), h.size()) &&
        transfer(reinterpret_cast<const uint8_t*>(packet.metadata.data()), packet.metadata.size()) &&
        transfer(packet.pixels.data(), packet.pixels.size());
      { std::lock_guard lock(mutex_); writing_ = false; }
      changed_.notify_all();
      if (!ok) break;
    }
  }
public:
  Transport() = default;
  Transport(const Transport&) = delete;
  ~Transport() { stop(); }
  bool start(void (*onInput)() = nullptr) {
    onInput_ = onInput;
    // Helpers must neither read the authentication pipe nor corrupt AXCF output.
    input_ = fcntl(STDIN_FILENO, F_DUPFD_CLOEXEC, 10);
    output_ = fcntl(STDOUT_FILENO, F_DUPFD_CLOEXEC, 10);
    int null = open("/dev/null", O_RDWR | O_CLOEXEC);
    if (input_ < 0 || output_ < 0 || null < 0) return false;
    bool redirected = dup2(null, STDIN_FILENO) >= 0 && dup2(null, STDOUT_FILENO) >= 0;
    close(null);
    if (!redirected) return false;
#ifdef __linux__
    // A 2x frame is ~9 MB: with the default 64 KiB pipe every frame costs Zen's Subprocess
    // reader ~150 wakeups and worker round trips. Best effort, within fs.pipe-max-size.
    if (fcntl(output_, F_GETPIPE_SZ) > 0 && fcntl(output_, F_GETPIPE_SZ) < PipeBytes) fcntl(output_, F_SETPIPE_SZ, PipeBytes);
#endif
    int inputFlags = fcntl(input_, F_GETFL), outputFlags = fcntl(output_, F_GETFL);
    if (inputFlags < 0 || outputFlags < 0 || fcntl(input_, F_SETFL, inputFlags | O_NONBLOCK) < 0
        || fcntl(output_, F_SETFL, outputFlags | O_NONBLOCK) < 0) return false;
    reader_ = std::thread([this] { readLoop(); });
    writer_ = std::thread([this] { writeLoop(); });
    return true;
  }
  void setDamagePayload(bool enabled) { damagePayload_ = enabled; }
  // The stdout pipe's capacity now (0 where unknown or not a pipe).
  int pipeBytes() const {
#ifdef __linux__
    int size = output_ >= 0 ? fcntl(output_, F_GETPIPE_SZ) : -1;
    return size > 0 ? size : 0;
#else
    return 0;
#endif
  }
  // Linux only: creates the frame memfd (sealed against shrinking/growing, close-on-exec, so
  // helper processes never inherit it). Call before start(); returns the descriptor or -1.
  int enableMemfd(uint32_t slots, size_t slotBytes) {
#ifdef __linux__
    if (ring_.load() || !slots || slots > 4 || !slotBytes || slotBytes > MaxFrame) return -1;
    int fd = int(syscall(SYS_memfd_create, "axio-frames", 1u /* MFD_CLOEXEC */ | 2u /* MFD_ALLOW_SEALING */));
    if (fd < 0) return -1;
    void* ring = MAP_FAILED;
    if (ftruncate(fd, off_t(slotBytes * slots)) == 0 &&
        fcntl(fd, 1033 /* F_ADD_SEALS */, 0x0002 | 0x0004 | 0x0001 /* SHRINK | GROW | SEAL */) == 0)
      ring = mmap(nullptr, slotBytes * slots, PROT_READ | PROT_WRITE, MAP_SHARED, fd, 0);
    if (ring == MAP_FAILED) { close(fd); return -1; }
    slotBytes_ = slotBytes; slots_ = slots; memfd_ = fd;
    ring_ = static_cast<uint8_t*>(ring);  // last: the writer only uses a complete ring
    memfdActive_ = true;
    return fd;
#else
    (void)slots; (void)slotBytes;
    return -1;
#endif
  }
  // §6.3 fallback, before the frame_ack that asked for it releases the credit: later frames go
  // through the pipe, and pending frames become whole (Zen dropped the unreadable frame, so its
  // copy of that target is stale). False when memfd frames are not active.
  bool disableMemfd() {
    std::lock_guard lock(mutex_);
    if (!ring_ || !memfdActive_) return false;
    memfdActive_ = false;
    for (auto& item : pending_) {
      Packet& packet = item.second;
      if (!packet.damaged) continue;
      packet.damage[0] = packet.damage[1] = 0; packet.damage[2] = packet.size[0]; packet.damage[3] = packet.size[1];
    }
    return true;
  }
  int memfd() const { return memfd_; }
  bool memfdActive() const { return ring_ && memfdActive_; }
  size_t memfdSlotBytes() const { return slotBytes_; }
  uint32_t memfdSlots() const { return slots_; }
  bool failed() const { return failed_; }
  bool eof() const { return eof_; }
  void reject() { fail(); }
  std::optional<std::string> pop() {
    std::lock_guard lock(mutex_);
    if (inputQueue_.empty()) return {};
    auto line = std::move(inputQueue_.front()); inputQueue_.pop_front(); return line;
  }
  bool event(std::string metadata) {
    std::lock_guard lock(mutex_);
    if (metadata.empty() || metadata.size() > MaxMeta || events_.size() >= 512) { fail(); return false; }
    events_.push_back(Packet{1, std::move(metadata), {}, {}, 0}); changed_.notify_all(); return true;
  }
  bool frame(const std::string& key, std::string metadata, std::string target, uint64_t id, const void* pixels, size_t bytes) {
    if (metadata.empty() || metadata.size() > MaxMeta || !pixels || !bytes || bytes > MaxFrame || !id) { fail(); return false; }
    Packet packet{2, std::move(metadata), std::move(target), {}, id};
    packet.pixels.assign(static_cast<const uint8_t*>(pixels), static_cast<const uint8_t*>(pixels) + bytes);
    std::lock_guard lock(mutex_);
    pending_[key] = std::move(packet); changed_.notify_all(); return true;
  }
  // Frame damage (engine-stream-v1 §6.1 semantics): pixels outside `damage` equal the
  // previous frame delivered for this target and size. A replaced pending frame's damage
  // is merged into its replacement; after a dropped pending frame the next one is full.
  bool frameWithDamage(const std::string& key, std::string metadata, std::string target, uint64_t id,
                       const void* pixels, uint32_t width, uint32_t height, const uint32_t damage[4]) {
    size_t bytes = size_t(width) * size_t(height) * 4;
    if (metadata.size() < 2 || metadata.back() != '}' || metadata.size() + 64 > MaxMeta || !pixels || !bytes ||
        bytes > MaxFrame || !id || !damage[2] || !damage[3] || damage[0] + damage[2] > width ||
        damage[1] + damage[3] > height) {
      fail();
      return false;
    }
    Packet packet{2, std::move(metadata), std::move(target), {}, id};
    packet.pixels.assign(static_cast<const uint8_t*>(pixels), static_cast<const uint8_t*>(pixels) + bytes);
    packet.damaged = true;
    packet.size[0] = width; packet.size[1] = height;
    std::copy(damage, damage + 4, packet.damage);
    std::lock_guard lock(mutex_);
    damageUsed_ = true;
    auto replaced = pending_.find(key);
    if (fullNext_.erase(key)) {
      packet.damage[0] = packet.damage[1] = 0; packet.damage[2] = width; packet.damage[3] = height;
    } else if (replaced != pending_.end()) {
      const Packet& old = replaced->second;
      if (!old.damaged || old.size[0] != width || old.size[1] != height) {
        packet.damage[0] = packet.damage[1] = 0; packet.damage[2] = width; packet.damage[3] = height;
      } else {
        uint32_t left = std::min(old.damage[0], packet.damage[0]), top = std::min(old.damage[1], packet.damage[1]);
        uint32_t right = std::max(old.damage[0] + old.damage[2], packet.damage[0] + packet.damage[2]);
        uint32_t bottom = std::max(old.damage[1] + old.damage[3], packet.damage[1] + packet.damage[3]);
        packet.damage[0] = left; packet.damage[1] = top; packet.damage[2] = right - left; packet.damage[3] = bottom - top;
      }
    }
    pending_[key] = std::move(packet); changed_.notify_all(); return true;
  }
  void invalidatePendingFrame(const std::string& key) {
    std::lock_guard lock(mutex_);
    if (pending_.erase(key) && damageUsed_) fullNext_.insert(key);
  }
  bool acknowledge(uint64_t frame, const std::string& exactTarget) {
    std::lock_guard lock(mutex_);
    // The outstanding target may predate current navigation/resize. This exact
    // match only releases transport credit; it never authorizes browser action.
    if (!frame || frame != outstanding_ || exactTarget != outstandingTarget_) return false;
    outstanding_ = 0; outstandingTarget_.clear(); changed_.notify_all(); return true;
  }
  void finishEvents(std::chrono::milliseconds timeout) {
    std::unique_lock lock(mutex_); pending_.clear();
    changed_.wait_for(lock, timeout, [&] { return failed_ || (events_.empty() && !writing_); });
  }
  void stop() {
    stop_ = true; changed_.notify_all();
    if (reader_.joinable()) reader_.join();
    if (writer_.joinable()) writer_.join();
    if (input_ >= 0) { close(input_); input_ = -1; }
    if (output_ >= 0) { close(output_); output_ = -1; }
#ifdef __linux__
    if (uint8_t* ring = ring_.exchange(nullptr)) munmap(ring, slotBytes_ * slots_);
    if (memfd_ >= 0) { close(memfd_); memfd_ = -1; }
#endif
  }
};
} // namespace axio

#pragma once
// Private inherited pipes only. The CEF UI thread never performs a pipe write.
#include <algorithm>
#include <array>
#include <atomic>
#include <cerrno>
#include <chrono>
#include <condition_variable>
#include <cstdint>
#include <deque>
#include <map>
#include <fcntl.h>
#include <mutex>
#include <optional>
#include <poll.h>
#include <string>
#include <thread>
#include <unistd.h>
#include <vector>

namespace axio {
constexpr size_t MaxLine = 16384, MaxMeta = 8192, MaxFrame = 33554432;
struct Packet {
  uint16_t kind = 1;
  std::string metadata, target;
  std::vector<uint8_t> pixels;
  uint64_t frame = 0;
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
  uint64_t outstanding_ = 0;
  std::string outstandingTarget_;
  bool writing_ = false;
  void (*onInput_)() = nullptr;  // Set before start(); called on the reader thread.

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
    int inputFlags = fcntl(input_, F_GETFL), outputFlags = fcntl(output_, F_GETFL);
    if (inputFlags < 0 || outputFlags < 0 || fcntl(input_, F_SETFL, inputFlags | O_NONBLOCK) < 0
        || fcntl(output_, F_SETFL, outputFlags | O_NONBLOCK) < 0) return false;
    reader_ = std::thread([this] { readLoop(); });
    writer_ = std::thread([this] { writeLoop(); });
    return true;
  }
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
  void invalidatePendingFrame(const std::string& key) { std::lock_guard lock(mutex_); pending_.erase(key); }
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
  }
};
} // namespace axio

// TEST-ONLY scripted engine for the engine-neutral stream core (stream_core.hpp).
// It is never a product binary, never WebKit evidence and never built by `setup`.
// It lets core_test.py run the same stream/security harness that drives the real
// WPE host against deterministic, engine-free behaviour on any POSIX machine.
//
// usage: fake_host --stream <profile-dir> <evidence-dir>
#include "../stream_core.hpp"

#include <csignal>
#include <deque>
#include <functional>
#include <iostream>
#include <thread>

using namespace axio;
using namespace axio::stream;

namespace {
std::deque<std::function<void()>> queue;  // engine callbacks run after the command returns
Host* host = nullptr;
uint64_t nextId = 100;

class FakeView final : public EngineView {
  Tab& tab_;
  std::string id_;
  std::vector<std::string> history_;
  size_t index_ = 0;
  std::string input_;
  int scroll_ = 0, width_, height_; double scale_;
  bool visible_ = true;

  std::string page() const {
    const std::string& url = history_[index_];
    return url.size() >= 7 && url.compare(url.size() - 7, 7, "?page=2") == 0 ? "2" : "1";
  }
  void paint() {
    if (!visible_) return;
    int w = int(std::ceil(width_ * scale_)), h = int(std::ceil(height_ * scale_));
    std::vector<uint8_t> pixels(size_t(w) * size_t(h) * 4);
    // Content rows depend on document y (row + scroll) so a wheel shift is measurable.
    for (int y = 0; y < h; ++y)
      for (int x = 0; x < w; ++x) {
        uint8_t* p = &pixels[(size_t(y) * size_t(w) + size_t(x)) * 4];
        int doc = y + int(scroll_ * scale_);
        p[0] = uint8_t(doc * 7); p[1] = uint8_t(page() == "2" ? 200 : 40); p[2] = uint8_t(input_.size() * 30 + (x / 64) * 9); p[3] = 0;
      }
    host->frame(&tab_, pixels.data(), w, h, size_t(w) * 4, PixelFormat::BGRX8);
  }
  void title() { host->titleChanged(&tab_, "AxioSozo fixture | count=0 | input=" + input_ + " | page=" + page()); }
  void navigateTo(const std::string& url, bool history, bool push) {
    queue.push_back([this, url, history, push] {
      if (!history && !host->navigationPolicy(&tab_, url, "GET")) return;
      if (push) { history_.resize(index_ + 1); history_.push_back(url); index_ = history_.size() - 1; }
      input_.clear(); scroll_ = 0;
      host->loadingChanged(&tab_, true);
      host->urlChanged(&tab_, url);
      host->loadCommitted(&tab_, url);
      paint();
      host->loadFinished(&tab_, url, 200);  // WebKit reports the cached 200 on history loads
      title();
      host->loadingChanged(&tab_, false);
    });
  }
public:
  FakeView(Tab& tab, int w, int h, double s) : tab_(tab), id_(std::to_string(nextId++)), width_(w), height_(h), scale_(s) {}
  std::string nativeId() const override { return id_; }
  void load(const std::string& url) override {
    if (history_.empty()) { history_.push_back(url); index_ = 0; navigateTo(url, false, false); }
    else navigateTo(url, false, true);
  }
  bool canGoBack() override { return index_ > 0; }
  bool canGoForward() override { return index_ + 1 < history_.size(); }
  void goBack() override { index_--; navigateTo(history_[index_], true, false); }
  void goForward() override { index_++; navigateTo(history_[index_], true, false); }
  void reload() override { navigateTo(history_[index_], true, false); }
  void stop() override {}
  void resize(int w, int h, double s) override { width_ = w; height_ = h; scale_ = s; queue.push_back([this] { paint(); }); }
  void setFocus(bool) override {}
  void setVisible(bool v) override { visible_ = v; if (v) queue.push_back([this] { paint(); }); }
  void setFrameRate(int) override {}
  void key(const KeyInput& key) override {
    if (key.type == "char" && !key.text.empty()) { input_ += key.text; queue.push_back([this] { title(); paint(); }); }
  }
  void mouse(const MouseInput& m) override { if (m.type == "down") host->cursorChanged(&tab_, "pointer"); }
  void wheel(const WheelInput& w) override { scroll_ = std::max(0, scroll_ - w.deltaY); queue.push_back([this] { paint(); }); }
  void commitText(const std::string& text) override { input_ += text; queue.push_back([this] { title(); paint(); }); }
  bool edit(const std::string&) override { return true; }
  void close() override { host->viewClosed(&tab_); }
};

class FakeEngine final : public Engine {
public:
  std::unique_ptr<EngineView> createView(Tab& tab, int w, int h, double s, int) override { return std::make_unique<FakeView>(tab, w, h, s); }
  Object readyFields() override {
    return Object{{"engine", "fake"}, {"fake", "0"}, {"platform", "test"}, {"sandbox_configured", false},
                  {"render_path", "test-bgra"}, {"test_only", true}};
  }
  Object capabilities() override { return Object{}; }
  std::string engineName() override { return "fake"; }
};
}  // namespace

int main(int argc, char** argv) {
  if (argc != 4 || std::string(argv[1]) != "--stream") { fprintf(stderr, "usage: fake_host --stream profile evidence\n"); return 64; }
  signal(SIGPIPE, SIG_IGN);
  Transport transport;
  if (!transport.start()) return 64;
  FakeEngine engine;
  Host core(transport, engine);
  host = &core;
  if (!core.handshake(std::chrono::seconds(10))) return 64;
  core.ready();
  auto started = std::chrono::steady_clock::now();
  while (!core.tick()) {
    while (!queue.empty() && !core.closing()) { auto job = std::move(queue.front()); queue.pop_front(); job(); }
    if (core.closing()) queue.clear();
    std::this_thread::sleep_for(std::chrono::milliseconds(1));
    if (std::chrono::steady_clock::now() - started > std::chrono::minutes(5)) return 75;
  }
  return core.finish();
}

#pragma once
// engine-surface-v1 (contracts/engine-surface-v1.md), WebKit host side. Same Mach
// handshake, FRAME/RELEASE/BEGIN_FRAME messages and slot rules as the CEF host's
// native/chromium-host/surface_transport.mm (from which connect/drain/send are
// adapted), but frames come from CPU pixels (WKWebView snapshots, ADR 004 "macOS"):
// each frame is written into a host-owned, global ring IOSurface and only ring
// surfaces cross to Zen. Everything runs on the main thread; Zen->host messages are
// drained by a main-queue dispatch source.
#include <cstddef>
#include <cstdint>
#include <functional>
#include <string>
#include "../../chromium-host/engine_surface_v1.h"

namespace axio::wksurface {

struct Callbacks {
  std::function<void(uint64_t target, uint64_t sequence)> beginFrame;
  std::function<bool(uint64_t target, uint64_t frame)> release;  // false: protocol failure
  std::function<void(const char* reason)> failed;                // fatal channel error
};

struct Rect { int x = 0, y = 0, width = 0, height = 0; };

struct FrameMeta {
  uint64_t target = 0, documentGeneration = 0, navigationGeneration = 0;
  uint64_t frameId = 0, paintTime = 0, beginFrameSequence = 0;
  uint32_t logicalWidth = 0, logicalHeight = 0;
  double scale = 1;
  Rect dirty;  // empty = whole frame
};

enum class Result { Sent, NoFreeSlot, Failed };

class Ring;  // AXIO_SURFACE_MAX_IN_FLIGHT IOSurfaces for one target

// Looks up Zen's service, sends CONNECT with the token and waits (bounded) for CONNECTED
// from the process that spawned this host. Call before WebKit starts.
bool connect(const std::string& service, const uint8_t (&token)[AXIO_SURFACE_TOKEN_BYTES], int timeoutMs, std::string& error);
void start(Callbacks callbacks);
bool connected();
void shutdown();

Ring* createRing();
void destroyRing(Ring*);  // in-flight surfaces stay alive until Zen drops them
// Copies tight BGRA8 premultiplied pixels into a free ring surface and sends FRAME.
Result present(Ring*, const uint8_t* pixels, int width, int height, const FrameMeta& meta);
bool release(Ring*, uint64_t frameId);  // false when that frame is not in flight
size_t inFlight(Ring*);
uint64_t lastCopyNanoseconds();  // pixel copy + send of the last frame

}  // namespace axio::wksurface

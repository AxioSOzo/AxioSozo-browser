#pragma once
// Mach IOSurface frame transport (contracts/engine-surface-v1.md), host side.
// All functions run on the CEF UI (main) thread; Zen->host messages are drained
// by a main-queue dispatch source, so callbacks also arrive on that thread.
// Helpers are compiled from the same host.mm and get inert stubs: they never
// link Metal/IOSurface and never touch these ports.
#include <cstddef>
#include <cstdint>
#include <functional>
#include <string>
#include "engine_surface_v1.h"

namespace axio::surface {

struct Callbacks {
  // BEGIN_FRAME for a target id; sequence is validated strictly increasing here.
  std::function<void(uint64_t target, uint64_t sequence)> beginFrame;
  // RELEASE for a target id / frame id. Return false to reject (protocol failure).
  std::function<bool(uint64_t target, uint64_t frame)> release;
  // Fatal channel error: malformed message, wrong sender, dead Zen port.
  std::function<void(const char* reason)> failed;
};

struct Rect { int x = 0, y = 0, width = 0, height = 0; };

struct FrameMeta {
  uint64_t target = 0, documentGeneration = 0, navigationGeneration = 0;
  uint64_t frameId = 0, paintTime = 0, beginFrameSequence = 0;
  uint32_t logicalWidth = 0, logicalHeight = 0;
  double scale = 1;
  const Rect* dirty = nullptr;
  size_t dirtyCount = 0;
};

enum class Result { Sent, Cached, NoFreeSlot, Invalid, Failed };

class Target;  // Per-browser ring of host-owned IOSurfaces plus popup cache.

#ifndef AXIO_CEF_HELPER
// Looks up the Zen service, sends CONNECT with the token and waits (bounded)
// for CONNECTED from the process that spawned this host. Call before CEF starts.
bool connect(const std::string& service, const uint8_t (&token)[AXIO_SURFACE_TOKEN_BYTES],
             int timeoutMs, std::string& error);
void start(Callbacks callbacks);  // Begin draining Zen->host messages on the main queue.
bool connected();
void shutdown();

Target* createTarget();
void destroyTarget(Target*);  // In-flight IOSurfaces stay alive until Zen drops them.
// Copy CEF's pooled PET_VIEW IOSurface (must be done inside OnAcceleratedPaint),
// composite the cached popup when present, and send one frame.
Result paintView(Target*, void* cefSurface, Rect visible, int width, int height, FrameMeta meta);
// Cache CEF's pooled PET_POPUP IOSurface and, when a view is cached, send the composite.
Result paintPopup(Target*, void* cefSurface, Rect visible, int originX, int originY, FrameMeta meta);
void setPopupVisible(Target*, bool visible);
bool popupVisible(Target*);
bool release(Target*, uint64_t frameId);  // False when that frame is not in flight.
size_t inFlight(Target*);
// Duration of the last GPU copy (paint entry to GPU completion), nanoseconds.
uint64_t lastCopyNanoseconds();
#else
inline bool connect(const std::string&, const uint8_t (&)[AXIO_SURFACE_TOKEN_BYTES], int, std::string& error) { error = "helper"; return false; }
inline void start(Callbacks) {}
inline bool connected() { return false; }
inline void shutdown() {}
inline Target* createTarget() { return nullptr; }
inline void destroyTarget(Target*) {}
inline Result paintView(Target*, void*, Rect, int, int, FrameMeta) { return Result::Invalid; }
inline Result paintPopup(Target*, void*, Rect, int, int, FrameMeta) { return Result::Invalid; }
inline void setPopupVisible(Target*, bool) {}
inline bool popupVisible(Target*) { return false; }
inline bool release(Target*, uint64_t) { return false; }
inline size_t inFlight(Target*) { return 0; }
inline uint64_t lastCopyNanoseconds() { return 0; }
#endif

}  // namespace axio::surface

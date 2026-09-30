// Standalone Zen-side stand-in for contracts/engine-surface-v1.md. Not Zen, not
// E1/E2 evidence: it checks in a Mach service, spawns the real CEF host in
// stream mode, receives IOSurface (or AXCF pipe) frames from a synthetic fixture
// page, validates them and measures fps and latency.
#import <Foundation/Foundation.h>
#import <CoreGraphics/CoreGraphics.h>
#import <ImageIO/ImageIO.h>
#import <IOSurface/IOSurface.h>
#import <UniformTypeIdentifiers/UniformTypeIdentifiers.h>
#include <bsm/libbsm.h>
#include <fcntl.h>
#include <mach/mach.h>
#include <mach/mach_time.h>
#include <poll.h>
#include <servers/bootstrap.h>
#include <signal.h>
#include <spawn.h>
#include <sys/wait.h>
#include <unistd.h>
#include <algorithm>
#include <atomic>
#include <condition_variable>
#include <functional>
#include <map>
#include <mutex>
#include <string>
#include <thread>
#include <vector>
#include "../engine_surface_v1.h"

extern char** environ;

namespace {
mach_timebase_info_data_t timebase;
double ms(uint64_t ticks) { return double(ticks) * timebase.numer / timebase.denom / 1e6; }
uint64_t now() { return mach_absolute_time(); }

struct Options {
  std::string host, profile, evidence, origin, mode = "surface", beginFrames = "internal", negative;
  int rate = 60;
  double seconds = 5;
} options;

std::mutex lock;
std::condition_variable changed;
NSMutableDictionary* result;
NSMutableArray* failures;
void failCheck(NSString* text) { std::lock_guard guard(lock); [failures addObject:text]; }

// Stream state (main thread only, except where noted).
pid_t child = -1;
int toHost = -1, fromHost = -1;
NSString* token;
NSDictionary* target;
uint64_t requestCounter = 0;
NSMutableArray* events;

// Frame state shared with the Mach / pipe consumers (guarded by `lock`).
struct Sample { uint64_t arrival, paint, send, sequence; uint32_t width, height; double scale; uint32_t flags; };
std::vector<Sample> samples;
uint64_t framesTotal = 0, lastFrameId = 0;
int probeColor = 0;      // 1 red, 2 blue, 0 other
uint64_t probeChanged = 0;
std::string capturePath;  // non-empty: save next frame there
std::map<uint64_t, uint64_t> tickSent;  // BEGIN_FRAME sequence -> send time
uint64_t targetId = 0;
std::atomic<bool> ticking{false}, running{true};
mach_port_t service = MACH_PORT_NULL, hostReply = MACH_PORT_NULL;
bool connected = false;
uint32_t popupFrames = 0;
double nonEmptyFraction = -1; int distinctColors = -1;

std::string hex(const uint8_t* bytes, size_t size) {
  static const char* digits = "0123456789abcdef";
  std::string out;
  for (size_t i = 0; i < size; ++i) { out += digits[bytes[i] >> 4]; out += digits[bytes[i] & 15]; }
  return out;
}

bool writePNG(const std::string& path, const uint8_t* bgra, size_t stride, int width, int height) {
  CGColorSpaceRef space = CGColorSpaceCreateWithName(kCGColorSpaceSRGB);
  CGContextRef context = CGBitmapContextCreate((void*)bgra, width, height, 8, stride, space,
                                               uint32_t(kCGImageAlphaPremultipliedFirst) | uint32_t(kCGBitmapByteOrder32Little));
  CGImageRef image = context ? CGBitmapContextCreateImage(context) : nullptr;
  bool ok = false;
  if (image) {
    NSURL* url = [NSURL fileURLWithPath:[NSString stringWithUTF8String:path.c_str()]];
    CGImageDestinationRef destination = CGImageDestinationCreateWithURL((__bridge CFURLRef)url,
        (__bridge CFStringRef)UTTypePNG.identifier, 1, nullptr);
    if (destination) { CGImageDestinationAddImage(destination, image, nullptr); ok = CGImageDestinationFinalize(destination); CFRelease(destination); }
    CGImageRelease(image);
  }
  if (context) CGContextRelease(context);
  CGColorSpaceRelease(space);
  return ok;
}

// Pixel checks shared by both transports. Caller holds `lock`.
void inspect(const uint8_t* bgra, size_t stride, int width, int height, double scale, uint64_t arrival) {
  int x = int(100 * scale), y = int(100 * scale);
  if (x < width && y < height) {
    const uint8_t* p = bgra + size_t(y) * stride + size_t(x) * 4;
    int color = (p[2] > 200 && p[0] < 60) ? 1 : (p[0] > 200 && p[2] < 60) ? 2 : 0;
    if (color != probeColor) { probeColor = color; probeChanged = arrival; }
  }
  if (nonEmptyFraction < 0 && framesTotal >= 5) {
    size_t nonZero = 0, total = 0; std::map<uint32_t, int> colors;
    for (int yy = 0; yy < height; yy += 16) for (int xx = 0; xx < width; xx += 16) {
      uint32_t value; memcpy(&value, bgra + size_t(yy) * stride + size_t(xx) * 4, 4);
      total++; nonZero += value != 0; if (colors.size() < 4096) colors[value]++;
    }
    nonEmptyFraction = total ? double(nonZero) / total : 0; distinctColors = int(colors.size());
  }
  if (!capturePath.empty()) {
    if (!writePNG(capturePath, bgra, stride, width, height)) [failures addObject:@"png_write_failed"];
    capturePath.clear();
  }
}

// ---------- Mach side (Zen stand-in) ----------
struct Received {
  union { mach_msg_header_t header; axio_surface_connect_msg_t connect; axio_surface_frame_msg_t frame; uint8_t bytes[1024]; };
  mach_msg_audit_trailer_t trailer;
};
pid_t senderPid(const Received& buffer) {
  auto* trailer = reinterpret_cast<const mach_msg_audit_trailer_t*>(
      reinterpret_cast<const uint8_t*>(&buffer.header) + round_msg(buffer.header.msgh_size));
  return trailer->msgh_trailer_size >= sizeof(mach_msg_audit_trailer_t) ? audit_token_to_pid(trailer->msgh_audit) : -1;
}
bool sendSimple(mach_msg_header_t* header, mach_msg_size_t size, int id) {
  header->msgh_bits = MACH_MSGH_BITS_SET(MACH_MSG_TYPE_COPY_SEND, 0, 0, 0);
  header->msgh_size = size; header->msgh_remote_port = hostReply; header->msgh_local_port = MACH_PORT_NULL; header->msgh_id = id;
  return mach_msg(header, MACH_SEND_MSG | MACH_SEND_TIMEOUT, size, 0, MACH_PORT_NULL, 0, MACH_PORT_NULL) == MACH_MSG_SUCCESS;
}
bool sendRelease(uint64_t targetValue, uint64_t frame) {
  axio_surface_release_msg_t message{};
  message.magic = AXIO_SURFACE_MAGIC; message.version = AXIO_SURFACE_VERSION;
  message.native_target_id = targetValue; message.frame_id = frame;
  return sendSimple(&message.header, sizeof(message), AXIO_SURFACE_MSG_RELEASE);
}

void machLoop(const uint8_t* expectedToken) {
  struct Held { IOSurfaceRef surface = nullptr; uint64_t target = 0, frame = 0; } displayed;
  while (running) {
    Received buffer{};
    mach_msg_return_t status = mach_msg(&buffer.header,
        MACH_RCV_MSG | MACH_RCV_TIMEOUT | MACH_RCV_TRAILER_TYPE(MACH_MSG_TRAILER_FORMAT_0) |
        MACH_RCV_TRAILER_ELEMENTS(MACH_RCV_TRAILER_AUDIT), 0, sizeof(buffer), service, 100, MACH_PORT_NULL);
    if (status == MACH_RCV_TIMED_OUT) continue;
    if (status != MACH_MSG_SUCCESS) { failCheck(@"mach_receive_failed"); break; }
    uint64_t arrival = now();
    pid_t sender = senderPid(buffer);
    bool complex = buffer.header.msgh_bits & MACH_MSGH_BITS_COMPLEX;
    if (sender != child) { failCheck(@"message_from_unexpected_pid"); if (complex) mach_msg_destroy(&buffer.header); continue; }
    if (buffer.header.msgh_id == AXIO_SURFACE_MSG_CONNECT && !connected) {
      auto& m = buffer.connect;
      bool ok = complex && m.header.msgh_size == sizeof(m) && m.body.msgh_descriptor_count == 1 &&
                m.reply_port.type == MACH_MSG_PORT_DESCRIPTOR && m.reply_port.disposition == MACH_MSG_TYPE_PORT_SEND &&
                m.data.magic == AXIO_SURFACE_MAGIC && m.data.version == AXIO_SURFACE_VERSION && m.data.host_pid == uint32_t(child);
      unsigned difference = 0;
      for (unsigned i = 0; i < AXIO_SURFACE_TOKEN_BYTES; ++i) difference |= m.data.token[i] ^ expectedToken[i];
      if (!ok || difference) { failCheck(@"connect_rejected"); mach_msg_destroy(&buffer.header); continue; }
      hostReply = m.reply_port.name;
      if (options.negative == "no_connected") { std::lock_guard guard(lock); connected = true; changed.notify_all(); continue; }
      axio_surface_connected_msg_t reply{};
      reply.magic = AXIO_SURFACE_MAGIC; reply.version = AXIO_SURFACE_VERSION;
      if (!sendSimple(&reply.header, sizeof(reply), AXIO_SURFACE_MSG_CONNECTED)) failCheck(@"connected_send_failed");
      std::lock_guard guard(lock); connected = true; changed.notify_all(); continue;
    }
    if (buffer.header.msgh_id != AXIO_SURFACE_MSG_FRAME || !complex || buffer.header.msgh_size != sizeof(axio_surface_frame_msg_t)) {
      failCheck(@"unexpected_message"); if (complex) mach_msg_destroy(&buffer.header); continue;
    }
    auto& m = buffer.frame;
    if (m.body.msgh_descriptor_count != 1 || m.surface.type != MACH_MSG_PORT_DESCRIPTOR ||
        m.surface.disposition != MACH_MSG_TYPE_PORT_SEND || m.data.magic != AXIO_SURFACE_MAGIC ||
        m.data.version != AXIO_SURFACE_VERSION || m.data.dirty_count > AXIO_SURFACE_MAX_DIRTY) {
      failCheck(@"invalid_frame_message"); mach_msg_destroy(&buffer.header); continue;
    }
    IOSurfaceRef surface = IOSurfaceLookupFromMachPort(m.surface.name);
    mach_port_deallocate(mach_task_self(), m.surface.name);
    const auto& d = m.data;
    if (!surface) { failCheck(@"iosurface_lookup_failed"); continue; }
    if (IOSurfaceGetWidth(surface) != d.width || IOSurfaceGetHeight(surface) != d.height ||
        IOSurfaceGetPixelFormat(surface) != 'BGRA' || d.format != AXIO_SURFACE_FORMAT_BGRA8_PREMULTIPLIED_SRGB ||
        d.frame_id <= lastFrameId || IOSurfaceGetID(surface) != d.surface_id) failCheck(@"frame_metadata_mismatch");
    {
      std::lock_guard guard(lock);
      lastFrameId = d.frame_id; framesTotal++;
      samples.push_back({arrival, d.paint_time, d.send_time, d.begin_frame_sequence, d.width, d.height, d.device_scale, d.flags});
      if (d.flags & AXIO_SURFACE_FLAG_POPUP_COMPOSITED) popupFrames++;
      IOSurfaceLock(surface, kIOSurfaceLockReadOnly, nullptr);
      inspect(static_cast<const uint8_t*>(IOSurfaceGetBaseAddress(surface)), IOSurfaceGetBytesPerRow(surface),
              int(d.width), int(d.height), d.device_scale, arrival);
      IOSurfaceUnlock(surface, kIOSurfaceLockReadOnly, nullptr);
      changed.notify_all();
    }
    // Present-then-release: the previous frame is released once this one "displays".
    if (displayed.surface) { sendRelease(displayed.target, displayed.frame); CFRelease(displayed.surface); }
    displayed = {surface, d.native_target_id, d.frame_id};
  }
  if (displayed.surface) CFRelease(displayed.surface);
}

void tickLoop() {
  uint64_t interval = uint64_t(1e9 / options.rate) * timebase.denom / timebase.numer, next = now() + interval, sequence = 0;
  while (running) {
    mach_wait_until(next);
    next += interval;
    uint64_t id;
    { std::lock_guard guard(lock); id = targetId; }
    if (!ticking || !id || hostReply == MACH_PORT_NULL) continue;
    axio_surface_begin_frame_msg_t message{};
    message.magic = AXIO_SURFACE_MAGIC; message.version = AXIO_SURFACE_VERSION;
    message.native_target_id = id; message.sequence = ++sequence; message.frame_time = next - interval;
    message.interval_ns = uint64_t(1e9 / options.rate);
    uint64_t sent = now();
    if (!sendSimple(&message.header, sizeof(message), AXIO_SURFACE_MSG_BEGIN_FRAME)) { failCheck(@"begin_frame_send_failed"); continue; }
    std::lock_guard guard(lock); tickSent[sequence] = sent;
    if (tickSent.size() > 4096) tickSent.erase(tickSent.begin());
  }
}

// ---------- AXCF control pipe ----------
bool readExact(uint8_t* out, size_t size, uint64_t deadline) {
  while (size) {
    double left = ms(deadline > now() ? deadline - now() : 0);
    if (left <= 0) return false;
    pollfd fd{fromHost, POLLIN, 0};
    int ready = poll(&fd, 1, std::min(100, std::max(1, int(left))));
    if (ready <= 0) continue;
    ssize_t n = read(fromHost, out, size);
    if (n <= 0) return false;
    out += n; size -= size_t(n);
  }
  return true;
}
uint64_t deadlineIn(double seconds) { return now() + uint64_t(seconds * 1e9) * timebase.denom / timebase.numer; }

void write(NSDictionary* item) {
  NSMutableData* data = [[NSJSONSerialization dataWithJSONObject:item options:0 error:nil] mutableCopy];
  [data appendBytes:"\n" length:1];
  ::write(toHost, data.bytes, data.length);
}
NSString* command(NSString* method, NSDictionary* fields, NSDictionary* explicitTarget = nil) {
  NSString* id = [NSString stringWithFormat:@"request-%llu", ++requestCounter];
  NSMutableDictionary* item = [@{@"version": @1, @"method": method, @"request_id": id, @"token": token} mutableCopy];
  if (![method isEqual:@"shutdown"]) item[@"target"] = explicitTarget ?: target;
  [item addEntriesFromDictionary:fields];
  write(item);
  return id;
}

// Reads one AXCF packet (events in both modes; frames only in pipe mode).
bool pumpOnce(uint64_t deadline) {
  pollfd fd{fromHost, POLLIN, 0};
  double left = ms(deadline > now() ? deadline - now() : 0);
  if (poll(&fd, 1, std::min(10, std::max(0, int(left)))) <= 0) return true;
  uint8_t header[16];
  if (!readExact(header, 16, deadlineIn(5))) return false;
  uint32_t metaSize = (uint32_t(header[8]) << 24) | (header[9] << 16) | (header[10] << 8) | header[11];
  uint32_t size = (uint32_t(header[12]) << 24) | (header[13] << 16) | (header[14] << 8) | header[15];
  if (memcmp(header, "AXCF", 4) || metaSize == 0 || metaSize > 8192 || size > 33554432) return false;
  std::vector<uint8_t> meta(metaSize), pixels(size);
  if (!readExact(meta.data(), metaSize, deadlineIn(5)) || (size && !readExact(pixels.data(), size, deadlineIn(10)))) return false;
  uint64_t arrival = now();
  NSDictionary* item = [NSJSONSerialization JSONObjectWithData:[NSData dataWithBytes:meta.data() length:metaSize] options:0 error:nil];
  if (header[7] == 1) {
    [events addObject:item];
    NSDictionary* t = item[@"target"];
    if (t[@"native_target_id"]) { target = t; std::lock_guard guard(lock); targetId = strtoull([t[@"native_target_id"] UTF8String], nullptr, 10); }
    return true;
  }
  int width = [item[@"width"] intValue], height = [item[@"height"] intValue];
  {
    std::lock_guard guard(lock);
    framesTotal++;
    samples.push_back({arrival, 0, 0, 0, uint32_t(width), uint32_t(height), [item[@"device_scale"] doubleValue], 0});
    inspect(pixels.data(), size_t(width) * 4, width, height, [item[@"device_scale"] doubleValue], arrival);
  }
  command(@"frame_ack", @{@"frame_id": item[@"frame_id"]}, item[@"target"]);
  return true;
}
bool pumpUntil(double seconds, const std::function<bool()>& done) {
  uint64_t deadline = deadlineIn(seconds);
  while (now() < deadline) {
    if (done()) return true;
    if (!pumpOnce(deadline)) return done();
  }
  return done();
}
NSDictionary* findEvent(const std::function<bool(NSDictionary*)>& match) {
  for (NSDictionary* item in events) if (match(item)) return item;
  return nil;
}

NSDictionary* percentiles(std::vector<double> values) {
  if (values.empty()) return @{@"count": @0};
  std::sort(values.begin(), values.end());
  auto at = [&](double q) { return values[std::min(values.size() - 1, size_t(q * (values.size() - 1) + 0.5))]; };
  return @{@"count": @(values.size()), @"p50_ms": @(at(.5)), @"p95_ms": @(at(.95)), @"max_ms": @(values.back()), @"min_ms": @(values.front())};
}

NSDictionary* measure(double seconds) {
  size_t start;
  { std::lock_guard guard(lock); start = samples.size(); }
  uint64_t begin = now();
  pumpUntil(seconds, [] { return false; });
  uint64_t end = now();
  std::lock_guard guard(lock);
  std::vector<double> intervals, paintToArrival, copy, tickToArrival;
  for (size_t i = start; i < samples.size(); ++i) {
    auto& s = samples[i];
    if (i > start) intervals.push_back(ms(s.arrival - samples[i - 1].arrival));
    if (s.paint) { paintToArrival.push_back(ms(s.arrival - s.paint)); copy.push_back(ms(s.send - s.paint)); }
    auto tick = tickSent.find(s.sequence);
    if (s.sequence && tick != tickSent.end()) tickToArrival.push_back(ms(s.arrival - tick->second));
  }
  size_t count = samples.size() - start;
  return @{@"frames": @(count), @"seconds": @(ms(end - begin) / 1000), @"fps": @(count / (ms(end - begin) / 1000)),
           @"frame_interval": percentiles(intervals), @"paint_to_receive": percentiles(paintToArrival),
           @"host_copy_and_send": percentiles(copy), @"begin_frame_to_receive": percentiles(tickToArrival)};
}

int run() {
  // Zen's part: check in a random service and make a one-time token.
  uint8_t random[16], surfaceToken[AXIO_SURFACE_TOKEN_BYTES], streamToken[32];
  arc4random_buf(random, sizeof(random)); arc4random_buf(surfaceToken, sizeof(surfaceToken)); arc4random_buf(streamToken, sizeof(streamToken));
  std::string name = "dev.axiosozo.surface-test." + hex(random, sizeof(random));
  bool surface = options.mode == "surface";
  if (surface) {
    if (bootstrap_check_in(bootstrap_port, name.c_str(), &service) != KERN_SUCCESS) { failCheck(@"bootstrap_check_in_failed"); return 2; }
    mach_port_limits_t limits{MACH_PORT_QLIMIT_LARGE};
    mach_port_set_attributes(mach_task_self(), service, MACH_PORT_LIMITS_INFO, (mach_port_info_t)&limits, MACH_PORT_LIMITS_INFO_COUNT);
  }
  token = [NSString stringWithUTF8String:hex(streamToken, 32).c_str()];
  int in[2], out[2];
  if (pipe(in) || pipe(out)) return 2;
  for (int fd : {in[1], out[0]}) fcntl(fd, F_SETFD, FD_CLOEXEC);
  posix_spawn_file_actions_t actions; posix_spawn_file_actions_init(&actions);
  posix_spawn_file_actions_adddup2(&actions, in[0], 0);
  posix_spawn_file_actions_adddup2(&actions, out[1], 1);
  std::string errors = options.evidence + "/host-stderr.log";
  posix_spawn_file_actions_addopen(&actions, 2, errors.c_str(), O_WRONLY | O_CREAT | O_TRUNC, 0600);
  posix_spawnattr_t attributes; posix_spawnattr_init(&attributes);
  posix_spawnattr_setflags(&attributes, POSIX_SPAWN_CLOEXEC_DEFAULT);
  std::string tmp = "TMPDIR=" + options.profile;
  const char* env[] = {"PATH=/usr/bin:/bin:/usr/sbin:/sbin", tmp.c_str(), nullptr};
  const char* argv[] = {options.host.c_str(), "--stream", options.profile.c_str(), options.evidence.c_str(), nullptr};
  if (posix_spawn(&child, options.host.c_str(), &actions, &attributes, (char* const*)argv, (char* const*)env)) { failCheck(@"spawn_failed"); return 2; }
  close(in[0]); close(out[1]); toHost = in[1]; fromHost = out[0];
  result[@"host_pid"] = @(child);
  std::thread mach, ticker;
  if (surface) { mach = std::thread([&] { machLoop(surfaceToken); }); ticker = std::thread(tickLoop); }
  NSMutableDictionary* hello = [@{@"version": @1, @"method": @"hello", @"token": token, @"engine_instance": @"surface-test",
                                  @"fixture_origin": [NSString stringWithUTF8String:options.origin.c_str()], @"frame_rate": @(options.rate)} mutableCopy];
  if (surface) {
    hello[@"surface_service"] = [NSString stringWithUTF8String:name.c_str()];
    hello[@"surface_token"] = [NSString stringWithUTF8String:hex(surfaceToken, sizeof(surfaceToken)).c_str()];
    if (options.beginFrames == "external") hello[@"surface_begin_frames"] = @YES;
  }
  write(hello);
  auto finish = [&](int code) {
    ticking = false;  // The reply port dies with the host.
    close(toHost); toHost = -1;
    int status = 0; uint64_t deadline = deadlineIn(15); pid_t done = 0;
    uint64_t closedAt = now(); bool sampled = false;
    while (now() < deadline && !(done = waitpid(child, &status, WNOHANG))) {
      uint8_t sink[65536]; pollfd fd{fromHost, POLLIN, 0}; if (poll(&fd, 1, 50) > 0 && read(fromHost, sink, sizeof(sink)) <= 0) usleep(20000);
      if (!sampled && ms(now() - closedAt) > 4000) {
        // Diagnostic only: one bounded sample of our own child if teardown stalls.
        sampled = true;
        std::string pidText = std::to_string(child), file = options.evidence + "/host-teardown.sample.txt";
        const char* sampleArgs[] = {"/usr/bin/sample", pidText.c_str(), "2", "-file", file.c_str(), nullptr};
        pid_t sampler; if (!posix_spawn(&sampler, "/usr/bin/sample", nullptr, nullptr, (char* const*)sampleArgs, environ)) waitpid(sampler, nullptr, 0);
      }
    }
    result[@"teardown_ms"] = @(ms(now() - closedAt));
    if (!done) { kill(child, SIGTERM); waitpid(child, &status, 0); result[@"host_killed"] = @YES; }
    result[@"host_exit_code"] = @(WIFEXITED(status) ? WEXITSTATUS(status) : 128 + WTERMSIG(status));
    running = false;
    if (mach.joinable()) mach.join();
    if (ticker.joinable()) ticker.join();
    return code;
  };

  if (options.negative == "no_connected") {
    // The host must refuse to run when Zen never confirms the connection.
    int status = 0; uint64_t deadline = deadlineIn(12); pid_t done = 0;
    while (now() < deadline && !(done = waitpid(child, &status, WNOHANG))) usleep(20000);
    result[@"host_exit_code"] = done ? @(WEXITSTATUS(status)) : @(-1);
    if (!done) { kill(child, SIGTERM); waitpid(child, &status, 0); failCheck(@"host_did_not_exit_without_connected"); }
    else if (WEXITSTATUS(status) != 64) failCheck(@"unexpected_exit_code");
    running = false; if (mach.joinable()) mach.join(); if (ticker.joinable()) ticker.join();
    return 0;
  }

  uint64_t launched = now();
  if (!pumpUntil(60, [] { return findEvent([](NSDictionary* e) { return [e[@"event"] isEqual:@"ready"]; }) != nil; })) {
    failCheck(@"no_ready_event"); return finish(1);
  }
  NSDictionary* ready = findEvent([](NSDictionary* e) { return [e[@"event"] isEqual:@"ready"]; });
  result[@"ready_ms"] = @(ms(now() - launched));
  result[@"render_path"] = ready[@"render_path"];
  result[@"capabilities"] = ready[@"capabilities"];
  if (surface && ![ready[@"render_path"] isEqual:@"native-osr-iosurface"]) failCheck(@"wrong_render_path");
  if (!surface && ![ready[@"render_path"] isEqual:@"native-osr-bgra"]) failCheck(@"wrong_render_path");
  result[@"connected"] = @(connected);
  NSString* origin = [NSString stringWithUTF8String:options.origin.c_str()];
  NSDictionary* pending = @{@"tab_id": @"surface-tab", @"engine_instance": @"surface-test", @"identity": origin,
                            @"document_generation": @1, @"navigation_generation": @1, @"private_mode": @NO};
  command(@"create", @{@"url": [origin stringByAppendingString:@"/engine.html"], @"width": @900, @"height": @650, @"device_scale": @2}, pending);
  ticking = options.beginFrames == "external";
  uint64_t created = now();
  bool loaded = pumpUntil(45, [] { return findEvent([](NSDictionary* e) { return [e[@"event"] isEqual:@"load"]; }) != nil; });
  result[@"load_event"] = findEvent([](NSDictionary* e) { return [e[@"event"] isEqual:@"load"]; }) ?: [NSNull null];
  if (!loaded) {
    failCheck(@"no_load_event");
    std::lock_guard guard(lock); result[@"frames_before_load"] = @(framesTotal);
    return finish(1);
  }
  bool firstFrame = pumpUntil(10, [] { std::lock_guard guard(lock); return framesTotal > 0 && samples.back().width == 1800; });
  result[@"first_frame_ms_after_create"] = @(ms(now() - created));
  if (!firstFrame) { failCheck(@"no_frame_after_load"); return finish(1); }
  pumpUntil(1.0, [] { return false; });  // Let layout settle, then capture evidence.
  { std::lock_guard guard(lock); capturePath = options.evidence + "/frame.png"; }
  pumpUntil(3, [] { std::lock_guard guard(lock); return capturePath.empty(); });
  {
    std::lock_guard guard(lock);
    auto& last = samples.back();
    result[@"frame_size"] = @[@(last.width), @(last.height), @(last.scale)];
    if (last.width != 1800 || last.height != 1300) [failures addObject:@"unexpected_frame_size"];
  }
  if (options.negative == "bogus_release") {
    uint64_t bogus; { std::lock_guard guard(lock); bogus = lastFrameId + 1000000; }
    sendRelease(targetId, bogus);  // Never issued: the host must fail closed.
    pumpUntil(10, [] { return findEvent([](NSDictionary* e) { return [e[@"code"] isEqual:@"surface_failed"]; }) != nil; });
    NSDictionary* error = findEvent([](NSDictionary* e) { return [e[@"code"] isEqual:@"surface_failed"]; });
    result[@"surface_failed_event"] = error ?: [NSNull null];
    if (![error[@"reason"] isEqual:@"surface_invalid_release"]) failCheck(@"bogus_release_not_rejected");
    finish(0);
    if ([result[@"host_exit_code"] intValue] != 64) failCheck(@"bogus_release_exit_code");
    return 0;
  }

  result[@"animation"] = measure(options.seconds);

  // Input latency: keydown toggles a 200x200 CSS px block red/blue.
  command(@"focus", @{@"focused": @YES});
  pumpUntil(0.3, [] { return false; });
  NSMutableArray* inputLatency = [NSMutableArray array];
  for (int i = 0; i < 10; ++i) {
    int expected;
    { std::lock_guard guard(lock); expected = probeColor == 1 ? 2 : 1; }
    uint64_t sent = now();
    command(@"key", @{@"type": @"down", @"native_key_code": @0, @"windows_key_code": @65, @"modifiers": @0, @"text": @"a"});
    bool seen = pumpUntil(2, [&] { std::lock_guard guard(lock); return probeColor == expected && probeChanged > sent; });
    uint64_t changedAt; { std::lock_guard guard(lock); changedAt = probeChanged; }
    [inputLatency addObject:seen ? @(ms(changedAt - sent)) : [NSNull null]];
    command(@"key", @{@"type": @"up", @"native_key_code": @0, @"windows_key_code": @65, @"modifiers": @0, @"text": @""});
    pumpUntil(0.25, [] { return false; });
  }
  std::vector<double> seenLatency;
  for (id value in inputLatency) if (value != [NSNull null]) seenLatency.push_back([value doubleValue]);
  result[@"input_to_frame"] = percentiles(seenLatency);
  result[@"input_to_frame_samples"] = inputLatency;
  if (seenLatency.size() < 8) failCheck(@"input_latency_samples_missing");

  // Select popup (PET_POPUP) composited into the same surface.
  if (surface) {
    command(@"mouse", @{@"type": @"down", @"x": @360, @"y": @160, @"modifiers": @0, @"button": @"left", @"click_count": @1, @"mouse_leave": @NO});
    command(@"mouse", @{@"type": @"up", @"x": @360, @"y": @160, @"modifiers": @0, @"button": @"left", @"click_count": @1, @"mouse_leave": @NO});
    bool popup = pumpUntil(4, [] { std::lock_guard guard(lock); return popupFrames > 2; });
    result[@"popup_composited_frames"] = @(popupFrames);
    if (popup) {
      { std::lock_guard guard(lock); capturePath = options.evidence + "/popup.png"; }
      pumpUntil(3, [] { std::lock_guard guard(lock); return capturePath.empty(); });
    }
    command(@"key", @{@"type": @"down", @"native_key_code": @53, @"windows_key_code": @27, @"modifiers": @0, @"text": @""});
    command(@"key", @{@"type": @"up", @"native_key_code": @53, @"windows_key_code": @27, @"modifiers": @0, @"text": @""});
    pumpUntil(0.5, [] { return false; });
  }

  // Device-scale change 2x -> 1x -> 2x.
  command(@"resize", @{@"width": @900, @"height": @650, @"device_scale": @1});
  bool scaled = pumpUntil(5, [] { std::lock_guard guard(lock); return samples.back().width == 900 && samples.back().height == 650; });
  command(@"resize", @{@"width": @1000, @"height": @700, @"device_scale": @2});
  bool resized = pumpUntil(5, [] { std::lock_guard guard(lock); return samples.back().width == 2000 && samples.back().height == 1400; });
  result[@"scale_change_1x"] = @(scaled);
  result[@"resize_2x"] = @(resized);
  if (!scaled || !resized) failCheck(@"resize_or_scale_change_failed");

  // Past the 32 MiB pipe payload: 1800x1200 logical at 2x is 3600x2400 BGRA
  // (34.6 MB). Surface mode admits it (<= 4096 px/side); the pipe answers
  // unsupported surface_limit and keeps its previous size.
  NSString* large = command(@"resize", @{@"width": @1800, @"height": @1200, @"device_scale": @2});
  pumpUntil(5, [&] { return findEvent([&](NSDictionary* e) { return [e[@"request_id"] isEqual:large] && [e[@"event"] isEqual:@"completed"]; }) != nil; });
  NSDictionary* largeDone = findEvent([&](NSDictionary* e) { return [e[@"request_id"] isEqual:large] && [e[@"event"] isEqual:@"completed"]; });
  result[@"resize_over_pipe_cap"] = largeDone ? @{@"status": largeDone[@"status"] ?: @"", @"reason": largeDone[@"reason"] ?: @""} : @"no_completion";
  if (surface) {
    bool big = pumpUntil(5, [] { std::lock_guard guard(lock); return samples.back().width == 3600 && samples.back().height == 2400; });
    result[@"resize_over_pipe_cap_frame"] = @(big);
    if (![largeDone[@"status"] isEqual:@"success"] || !big) failCheck(@"surface_resize_over_pipe_cap_failed");
  } else if (![largeDone[@"status"] isEqual:@"unsupported"] || ![largeDone[@"reason"] isEqual:@"surface_limit"]) {
    failCheck(@"pipe_resize_cap_not_enforced");
  }
  // Frame-rate renegotiation (window moved to a display with another refresh rate).
  NSString* rate = command(@"frame_rate", @{@"frame_rate": @(options.rate == 120 ? 60 : 120)});
  pumpUntil(3, [&] { return findEvent([&](NSDictionary* e) { return [e[@"request_id"] isEqual:rate] && [e[@"event"] isEqual:@"completed"]; }) != nil; });
  NSDictionary* rateDone = findEvent([&](NSDictionary* e) { return [e[@"request_id"] isEqual:rate] && [e[@"event"] isEqual:@"completed"]; });
  result[@"frame_rate_command"] = rateDone[@"status"] ?: @"no_completion";
  if (![rateDone[@"status"] isEqual:@"success"]) failCheck(@"frame_rate_command_failed");
  size_t framesAtRate; { std::lock_guard guard(lock); framesAtRate = framesTotal; }
  bool framesAfterRate = pumpUntil(3, [&] { std::lock_guard guard(lock); return framesTotal > framesAtRate + 5; });
  if (!framesAfterRate) failCheck(@"no_frames_after_frame_rate");

  // Hidden targets stop producing frames.
  command(@"visibility", @{@"visible": @NO});
  pumpUntil(0.5, [] { return false; });
  size_t hiddenStart; { std::lock_guard guard(lock); hiddenStart = samples.size(); }
  pumpUntil(1.0, [] { return false; });
  { std::lock_guard guard(lock); result[@"frames_while_hidden"] = @(samples.size() - hiddenStart); }
  command(@"visibility", @{@"visible": @YES});
  pumpUntil(1.0, [] { return false; });

  ticking = false;  // A closing target gets no more ticks (Zen contract).
  NSString* close = command(@"close", @{});
  pumpUntil(8, [&] { return findEvent([&](NSDictionary* e) { return [e[@"request_id"] isEqual:close] && [e[@"event"] isEqual:@"completed"]; }) != nil; });
  finish(0);
  if ([result[@"host_exit_code"] intValue] != 0) failCheck(@"host_exit_nonzero");
  std::lock_guard guard(lock);
  result[@"frames_total"] = @(framesTotal);
  result[@"non_empty_fraction"] = @(nonEmptyFraction);
  result[@"distinct_colors_sampled"] = @(distinctColors);
  if (nonEmptyFraction < 0.9 || distinctColors < 4) [failures addObject:@"frame_pixels_empty_or_uniform"];
  return 0;
}
}  // namespace

int main(int argc, char** argv) {
  @autoreleasepool {
    mach_timebase_info(&timebase);
    signal(SIGPIPE, SIG_IGN);
    for (int i = 1; i + 1 < argc; i += 2) {
      std::string key = argv[i], value = argv[i + 1];
      if (key == "--host") options.host = value; else if (key == "--profile") options.profile = value;
      else if (key == "--evidence") options.evidence = value; else if (key == "--origin") options.origin = value;
      else if (key == "--mode") options.mode = value; else if (key == "--begin-frames") options.beginFrames = value;
      else if (key == "--rate") options.rate = std::stoi(value); else if (key == "--seconds") options.seconds = std::stod(value);
      else if (key == "--negative") options.negative = value;
    }
    result = [@{@"mode": @(options.mode.c_str()), @"begin_frames": @(options.beginFrames.c_str()), @"rate": @(options.rate),
                @"negative": @(options.negative.c_str())} mutableCopy];
    failures = [NSMutableArray array];
    events = [NSMutableArray array];
    int code = run();
    result[@"failures"] = failures;
    result[@"status"] = (code == 0 && failures.count == 0) ? @"PASS" : @"FAIL";
    NSMutableArray* summary = [NSMutableArray array];
    for (NSDictionary* e in events) if (![e[@"event"] isEqual:@"cursor"] && ![e[@"event"] isEqual:@"loading"]) [summary addObject:e];
    result[@"events"] = summary.count > 60 ? [summary subarrayWithRange:NSMakeRange(0, 60)] : summary;
    NSData* data = [NSJSONSerialization dataWithJSONObject:result options:NSJSONWritingPrettyPrinted | NSJSONWritingSortedKeys error:nil];
    fwrite(data.bytes, 1, data.length, stdout); fputc('\n', stdout);
    return [result[@"status"] isEqual:@"PASS"] ? 0 : 1;
  }
}

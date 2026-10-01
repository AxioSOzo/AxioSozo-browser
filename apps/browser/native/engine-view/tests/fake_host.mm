// Minimal engine-surface-v1 host for the engine-view smoke (not CEF, not
// E1/E2 evidence). Spawned by xpcshell_smoke.js as a direct child:
//   fake_host SERVICE TOKEN_HEX
// Waits for one stdin line (so the parent can call expectHostPid first),
// CONNECTs, waits for CONNECTED, then sends three 64x64 FRAMEs for target 7:
//   1: global surface, AXIO_SURFACE_FLAG_GLOBAL_SURFACE  -> zero-copy
//   2: non-global surface, no flag                        -> copy mode
//   3: non-global surface, flag set (lying host)          -> lookup check, copy
// and prints one JSON line per event (connected, release) until killed.
#import <Foundation/Foundation.h>
#import <IOSurface/IOSurface.h>
#include <mach/mach.h>
#include <mach/mach_time.h>
#include <servers/bootstrap.h>
#include <unistd.h>
#include <cstdio>
#include <cstring>
#include "../engine_surface_v1.h"

static mach_port_t zen = MACH_PORT_NULL, reply = MACH_PORT_NULL;

static IOSurfaceRef makeSurface(bool global) {
  NSMutableDictionary* p = [@{
    (id)kIOSurfaceWidth: @64, (id)kIOSurfaceHeight: @64, (id)kIOSurfaceBytesPerElement: @4,
    (id)kIOSurfaceBytesPerRow: @(IOSurfaceAlignProperty(kIOSurfaceBytesPerRow, 256)),
    (id)kIOSurfacePixelFormat: @((uint32_t)'BGRA'),
  } mutableCopy];
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"
  if (global) p[(__bridge id)kIOSurfaceIsGlobal] = @YES;
#pragma clang diagnostic pop
  return IOSurfaceCreate((__bridge CFDictionaryRef)p);
}

static bool sendFrame(IOSurfaceRef surface, uint64_t frame, uint32_t flags) {
  axio_surface_frame_msg_t m{};
  m.header.msgh_bits = MACH_MSGH_BITS_SET(MACH_MSG_TYPE_COPY_SEND, 0, 0, MACH_MSGH_BITS_COMPLEX);
  m.header.msgh_size = sizeof(m);
  m.header.msgh_remote_port = zen;
  m.header.msgh_id = AXIO_SURFACE_MSG_FRAME;
  m.body.msgh_descriptor_count = 1;
  m.surface.name = IOSurfaceCreateMachPort(surface);
  m.surface.disposition = MACH_MSG_TYPE_MOVE_SEND;
  m.surface.type = MACH_MSG_PORT_DESCRIPTOR;
  auto& d = m.data;
  d.magic = AXIO_SURFACE_MAGIC; d.version = AXIO_SURFACE_VERSION;
  d.native_target_id = 7; d.document_generation = 1; d.navigation_generation = 1;
  d.frame_id = frame; d.paint_time = mach_absolute_time();
  d.width = 64; d.height = 64; d.logical_width = 32; d.logical_height = 32; d.device_scale = 2;
  d.format = AXIO_SURFACE_FORMAT_BGRA8_PREMULTIPLIED_SRGB;
  d.surface_id = IOSurfaceGetID(surface); d.flags = flags;
  d.send_time = mach_absolute_time();
  return mach_msg(&m.header, MACH_SEND_MSG | MACH_SEND_TIMEOUT, sizeof(m), 0, MACH_PORT_NULL, 1000,
                  MACH_PORT_NULL) == MACH_MSG_SUCCESS;
}

int main(int argc, char** argv) {
  @autoreleasepool {
    setvbuf(stdout, nullptr, _IOLBF, 0);
    if (argc != 3 || strlen(argv[2]) != 64) return 64;
    uint8_t token[AXIO_SURFACE_TOKEN_BYTES];
    for (int i = 0; i < 32; ++i) sscanf(argv[2] + 2 * i, "%2hhx", &token[i]);
    char line[16];
    if (!fgets(line, sizeof(line), stdin)) return 65;
    if (bootstrap_look_up(bootstrap_port, argv[1], &zen) != KERN_SUCCESS) { puts("{\"event\":\"lookup_failed\"}"); return 66; }
    mach_port_allocate(mach_task_self(), MACH_PORT_RIGHT_RECEIVE, &reply);
    axio_surface_connect_msg_t c{};
    c.header.msgh_bits = MACH_MSGH_BITS_SET(MACH_MSG_TYPE_COPY_SEND, 0, 0, MACH_MSGH_BITS_COMPLEX);
    c.header.msgh_size = sizeof(c); c.header.msgh_remote_port = zen; c.header.msgh_id = AXIO_SURFACE_MSG_CONNECT;
    c.body.msgh_descriptor_count = 1;
    c.reply_port.name = reply; c.reply_port.disposition = MACH_MSG_TYPE_MAKE_SEND; c.reply_port.type = MACH_MSG_PORT_DESCRIPTOR;
    c.data.magic = AXIO_SURFACE_MAGIC; c.data.version = AXIO_SURFACE_VERSION;
    memcpy(c.data.token, token, sizeof(token)); c.data.host_pid = uint32_t(getpid());
    if (mach_msg(&c.header, MACH_SEND_MSG | MACH_SEND_TIMEOUT, sizeof(c), 0, MACH_PORT_NULL, 2000, MACH_PORT_NULL))
      return 67;
    struct { union { mach_msg_header_t header; axio_surface_release_msg_t release; uint8_t bytes[256]; }; mach_msg_trailer_t t; } in{};
    if (mach_msg(&in.header, MACH_RCV_MSG | MACH_RCV_TIMEOUT, 0, sizeof(in), reply, 5000, MACH_PORT_NULL) ||
        in.header.msgh_id != AXIO_SURFACE_MSG_CONNECTED) { puts("{\"event\":\"no_connected\"}"); return 68; }
    puts("{\"event\":\"connected\"}");
    IOSurfaceRef global = makeSurface(true), plain = makeSurface(false);
    bool sent = sendFrame(global, 1, AXIO_SURFACE_FLAG_GLOBAL_SURFACE) && sendFrame(plain, 2, 0) &&
                sendFrame(plain, 3, AXIO_SURFACE_FLAG_GLOBAL_SURFACE);
    printf("{\"event\":\"frames_sent\",\"ok\":%s}\n", sent ? "true" : "false");
    for (;;) {
      memset(&in, 0, sizeof(in));
      if (mach_msg(&in.header, MACH_RCV_MSG, 0, sizeof(in), reply, MACH_MSG_TIMEOUT_NONE, MACH_PORT_NULL)) return 69;
      if (in.header.msgh_id == AXIO_SURFACE_MSG_RELEASE)
        printf("{\"event\":\"release\",\"target\":%llu,\"frame\":%llu}\n", in.release.native_target_id,
               in.release.frame_id);
    }
  }
}

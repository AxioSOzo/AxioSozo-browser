// Engine-neutral Mach IOSurface frame protocol, version 1.
// Normative text: contracts/engine-surface-v1.md. Shared by the CEF host, its
// standalone test receiver and (mirrored) the Zen/Gecko native receiver.
// All integers are native little-endian: both ends run on the same arm64 Mac.
#pragma once
#include <stdint.h>
#include <mach/message.h>

#ifdef __cplusplus
extern "C" {
#endif

#define AXIO_SURFACE_MAGIC 0x46535841u /* bytes 'A','X','S','F' */
#define AXIO_SURFACE_VERSION 1u
#define AXIO_SURFACE_TOKEN_BYTES 32u
#define AXIO_SURFACE_MAX_DIRTY 8u
#define AXIO_SURFACE_MAX_IN_FLIGHT 3u   /* per target; host never exceeds */
#define AXIO_SURFACE_FORMAT_BGRA8_PREMULTIPLIED_SRGB 1u

/* msgh_id values. */
#define AXIO_SURFACE_MSG_CONNECT     0x41585301 /* host -> Zen service port */
#define AXIO_SURFACE_MSG_CONNECTED   0x41585302 /* Zen  -> host reply port */
#define AXIO_SURFACE_MSG_FRAME       0x41585310 /* host -> Zen service port */
#define AXIO_SURFACE_MSG_RELEASE     0x41585320 /* Zen  -> host reply port */
#define AXIO_SURFACE_MSG_BEGIN_FRAME 0x41585321 /* Zen  -> host reply port */

/* FRAME flags. */
#define AXIO_SURFACE_FLAG_POPUP_COMPOSITED 1u

typedef struct {
  int32_t x, y, width, height; /* physical pixels, origin top-left */
} axio_surface_rect_t;

/* CONNECT: complex, exactly one port descriptor = send right to the host's
   reply port (disposition received: MACH_MSG_TYPE_PORT_SEND). */
typedef struct {
  uint32_t magic;
  uint16_t version;
  uint16_t reserved0;
  uint8_t token[AXIO_SURFACE_TOKEN_BYTES]; /* raw bytes of hello.surface_token */
  uint32_t host_pid;
  uint32_t reserved1;
} axio_surface_connect_body_t;

typedef struct {
  mach_msg_header_t header;
  mach_msg_body_t body;
  mach_msg_port_descriptor_t reply_port;
  axio_surface_connect_body_t data;
} axio_surface_connect_msg_t;

/* CONNECTED: simple message, no descriptors. */
typedef struct {
  mach_msg_header_t header;
  uint32_t magic;
  uint16_t version;
  uint16_t reserved0;
  uint32_t reserved1;
  uint32_t reserved2;
} axio_surface_connected_msg_t;

/* FRAME: complex, exactly one port descriptor = IOSurface send right
   (IOSurfaceCreateMachPort, sent MOVE_SEND). */
typedef struct {
  uint32_t magic;
  uint16_t version;
  uint16_t reserved0;
  uint64_t native_target_id;      /* CEF browser identifier == JSON native_target_id */
  uint64_t document_generation;   /* target generations at paint time */
  uint64_t navigation_generation;
  uint64_t frame_id;              /* host-global, strictly increasing, never 0 */
  uint64_t paint_time;            /* mach_absolute_time at OnAcceleratedPaint entry */
  uint64_t send_time;             /* mach_absolute_time just before mach_msg */
  uint64_t begin_frame_sequence;  /* last BEGIN_FRAME.sequence applied to target; 0 = internal pacing */
  uint32_t width, height;         /* physical pixels == IOSurface width/height */
  uint32_t logical_width, logical_height; /* points */
  double device_scale;
  uint32_t format;                /* AXIO_SURFACE_FORMAT_* */
  uint32_t surface_id;            /* IOSurfaceGetID, diagnostics only */
  uint32_t flags;                 /* AXIO_SURFACE_FLAG_* */
  uint32_t dirty_count;           /* 0..AXIO_SURFACE_MAX_DIRTY; 0 = whole frame */
  axio_surface_rect_t dirty[AXIO_SURFACE_MAX_DIRTY];
} axio_surface_frame_body_t;

typedef struct {
  mach_msg_header_t header;
  mach_msg_body_t body;
  mach_msg_port_descriptor_t surface;
  axio_surface_frame_body_t data;
} axio_surface_frame_msg_t;

/* RELEASE: simple. The host may reuse the IOSurface after receiving it. */
typedef struct {
  mach_msg_header_t header;
  uint32_t magic;
  uint16_t version;
  uint16_t reserved0;
  uint64_t native_target_id;
  uint64_t frame_id;
} axio_surface_release_msg_t;

/* BEGIN_FRAME: simple. One vsync-aligned tick for one visible target. */
typedef struct {
  mach_msg_header_t header;
  uint32_t magic;
  uint16_t version;
  uint16_t reserved0;
  uint64_t native_target_id;
  uint64_t sequence;     /* strictly increasing per target, never 0 */
  uint64_t frame_time;   /* mach_absolute_time of the vsync */
  uint64_t interval_ns;  /* display refresh interval */
} axio_surface_begin_frame_msg_t;

#ifdef __cplusplus
}
static_assert(sizeof(axio_surface_frame_body_t) == 4 + 2 + 2 + 8 * 7 + 4 * 4 + 8 + 4 * 4 + 16 * 8,
              "FRAME body layout is part of the wire protocol");
static_assert(sizeof(axio_surface_connect_body_t) == 48, "CONNECT body layout");
static_assert(sizeof(axio_surface_release_msg_t) == sizeof(mach_msg_header_t) + 24, "RELEASE layout");
static_assert(sizeof(axio_surface_begin_frame_msg_t) == sizeof(mach_msg_header_t) + 40, "BEGIN_FRAME layout");
#endif

#pragma once
// CEF C API plumbing shared by the portable host core and its platform layers.
// The core calls CEF only through the p_* pointers below, so a platform may bind
// them by direct linking (Linux: libcef.so) or dlsym (macOS framework).
#include <atomic>
#include <cstdio>
#include <cstdlib>
#include <functional>
#include <string>
#include "json.hpp"
#include "include/capi/cef_app_capi.h"
#include "include/capi/cef_browser_capi.h"
#include "include/capi/cef_client_capi.h"
#include "include/capi/cef_process_message_capi.h"
#include "include/capi/cef_request_context_capi.h"
#include "include/capi/cef_task_capi.h"
#include "include/cef_api_hash.h"
#include "include/cef_version.h"
#include "include/cef_version_info.h"

#define AXIO_CEF_FUNCTIONS(X) \
  X(cef_initialize) X(cef_execute_process) X(cef_shutdown) X(cef_run_message_loop) \
  X(cef_quit_message_loop) X(cef_browser_host_create_browser) X(cef_api_hash) X(cef_version_info) \
  X(cef_string_userfree_utf16_free) X(cef_request_context_create_context) X(cef_string_list_alloc) \
  X(cef_string_list_size) X(cef_string_list_value) X(cef_string_list_append) X(cef_string_list_free) \
  X(cef_post_task) X(cef_post_delayed_task) X(cef_process_message_create)

namespace axio::cef {
#define AXIO_CEF_DECLARE(name) inline decltype(&::name) p_##name = nullptr;
AXIO_CEF_FUNCTIONS(AXIO_CEF_DECLARE)
#undef AXIO_CEF_DECLARE

// The pinned header and the loaded runtime must agree exactly (API hash and versions).
inline bool runtimeMatchesHeaders() {
  const char* hash = p_cef_api_hash(CEF_API_VERSION, 0);
  return hash && std::string(hash) == CEF_API_HASH_PLATFORM && p_cef_version_info(0) == CEF_VERSION_MAJOR &&
         p_cef_version_info(1) == CEF_VERSION_MINOR && p_cef_version_info(2) == CEF_VERSION_PATCH &&
         p_cef_version_info(4) == CHROME_VERSION_MAJOR && p_cef_version_info(5) == CHROME_VERSION_MINOR &&
         p_cef_version_info(6) == CHROME_VERSION_BUILD && p_cef_version_info(7) == CHROME_VERSION_PATCH;
}

// ---- Reference counting --------------------------------------------------------------
// Static handler structs: the owner holds one reference for the process lifetime and
// CEF owns every extra one (the same model as host.mm).
template <class T>
struct Ref {
  T api{};
  std::atomic<int> refs{1};
  Ref() {
    api.base.size = sizeof(T);
    api.base.add_ref = [](cef_base_ref_counted_t* b) { reinterpret_cast<Ref*>(b)->refs++; };
    api.base.release = [](cef_base_ref_counted_t* b) { reinterpret_cast<Ref*>(b)->refs--; return 0; };
    api.base.has_one_ref = [](cef_base_ref_counted_t* b) { return int(reinterpret_cast<Ref*>(b)->refs == 1); };
    api.base.has_at_least_one_ref = [](cef_base_ref_counted_t* b) { return int(reinterpret_cast<Ref*>(b)->refs > 0); };
  }
  T* retain() { api.base.add_ref(&api.base); return &api; }
};

// CEF adds one reference to every ref-counted struct it passes into a C callback;
// the callback owns and must release it. Passing a struct into CEF transfers one.
struct Held {
  cef_base_ref_counted_t* base;
  ~Held() { if (base) base->release(base); }
};
#define AXIO_HOLD(value) ::axio::cef::Held held_##value{(value) ? &(value)->base : nullptr}

// ---- Strings ------------------------------------------------------------------------------
inline cef_string_t view(const std::u16string& s) { return {const_cast<char16_t*>(s.data()), s.size(), nullptr}; }
inline std::string utf8(const cef_string_t* s) { return s && s->str ? json::fromUtf16(s->str, s->length) : std::string(); }
// CEF returns NULL (not an empty userfree string) for an empty value; freeing NULL faults.
inline std::string take(cef_string_userfree_t value) {
  if (!value) return std::string();
  std::string result = utf8(value);
  p_cef_string_userfree_utf16_free(value);
  return result;
}

// ---- Tasks on CEF threads -----------------------------------------------------------------
struct FunctionTask {
  cef_task_t api{};
  std::atomic<int> refs{1};
  std::function<void()> run;
  explicit FunctionTask(std::function<void()> fn) : run(std::move(fn)) {
    api.base.size = sizeof(cef_task_t);
    api.base.add_ref = [](cef_base_ref_counted_t* b) { reinterpret_cast<FunctionTask*>(b)->refs++; };
    api.base.release = [](cef_base_ref_counted_t* b) {
      auto* self = reinterpret_cast<FunctionTask*>(b);
      if (--self->refs == 0) { delete self; return 1; }
      return 0;
    };
    api.base.has_one_ref = [](cef_base_ref_counted_t* b) { return int(reinterpret_cast<FunctionTask*>(b)->refs == 1); };
    api.base.has_at_least_one_ref = [](cef_base_ref_counted_t* b) { return int(reinterpret_cast<FunctionTask*>(b)->refs > 0); };
    api.execute = [](cef_task_t* self) { auto* task = reinterpret_cast<FunctionTask*>(self); if (task->run) task->run(); };
  }
};
// Runs `fn` on the CEF UI thread (after `delayMs`). False when CEF has no UI thread
// (before initialization or after shutdown); `fn` is then dropped.
inline bool postUI(std::function<void()> fn, int64_t delayMs = 0) {
  auto* task = new FunctionTask(std::move(fn));
  // cef_post_*_task takes the one reference we created.
  int posted = delayMs > 0 ? p_cef_post_delayed_task(TID_UI, &task->api, delayMs) : p_cef_post_task(TID_UI, &task->api);
  return posted != 0;
}

}  // namespace axio::cef

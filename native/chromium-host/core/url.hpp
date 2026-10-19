#pragma once
// Minimal RFC 3986 splitter for the host's URL allowlists (portable core).
// It never canonicalizes: callers compare the raw components, so anything
// unusual is rejected rather than reinterpreted. Policy decisions (fixture
// origin, credential-free HTTP(S), data:/blob: subresources) live in the core.
// Deliberately strict where a parser differential could matter:
//   * no bytes <= 0x20 or 0x7F anywhere (control characters, spaces);
//   * any '@' or '\' in the authority is user info / ambiguous and is reported
//     as user info, which every policy rejects;
//   * a port must be all digits (an empty port means "no port", as NSURL).
#include <cstdint>
#include <string>
#include <string_view>

namespace axio::url {

struct Url {
  std::string scheme;
  bool hasAuthority = false;
  bool hasUserInfo = false;
  std::string host;  // IPv6 without brackets
  bool hasPort = false;
  uint64_t port = 0;
  std::string path;
  bool hasQuery = false;
  std::string query;
  bool hasFragment = false;
  std::string fragment;
};

inline bool parse(std::string_view s, Url& u) {
  u = Url();
  if (s.empty()) return false;
  for (char c : s) if (uint8_t(c) <= 0x20 || uint8_t(c) == 0x7F) return false;
  size_t colon = s.find(':');
  if (colon == std::string_view::npos || colon == 0) return false;
  for (size_t i = 0; i < colon; ++i) {
    char c = s[i];
    bool alpha = (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z');
    if (i == 0 ? !alpha : !(alpha || (c >= '0' && c <= '9') || c == '+' || c == '-' || c == '.')) return false;
  }
  u.scheme = std::string(s.substr(0, colon));
  std::string_view rest = s.substr(colon + 1);
  size_t hash = rest.find('#');
  if (hash != std::string_view::npos) { u.hasFragment = true; u.fragment = std::string(rest.substr(hash + 1)); rest = rest.substr(0, hash); }
  size_t question = rest.find('?');
  if (question != std::string_view::npos) { u.hasQuery = true; u.query = std::string(rest.substr(question + 1)); rest = rest.substr(0, question); }
  if (rest.substr(0, 2) == "//") {
    u.hasAuthority = true;
    rest = rest.substr(2);
    size_t slash = rest.find('/');
    std::string_view authority = rest.substr(0, slash);
    u.path = slash == std::string_view::npos ? std::string() : std::string(rest.substr(slash));
    if (authority.find('@') != std::string_view::npos || authority.find('\\') != std::string_view::npos) {
      u.hasUserInfo = true;
      return true;
    }
    std::string_view port;
    if (!authority.empty() && authority[0] == '[') {
      size_t close = authority.find(']');
      if (close == std::string_view::npos) return false;
      u.host = std::string(authority.substr(1, close - 1));
      std::string_view after = authority.substr(close + 1);
      if (!after.empty()) { if (after[0] != ':') return false; port = after.substr(1); }
    } else {
      size_t last = authority.rfind(':');
      if (last != std::string_view::npos) { port = authority.substr(last + 1); authority = authority.substr(0, last); }
      u.host = std::string(authority);
      if (u.host.find('[') != std::string::npos || u.host.find(']') != std::string::npos) return false;
    }
    if (!port.empty()) {
      if (port.size() > 10) return false;
      uint64_t value = 0;
      for (char c : port) { if (c < '0' || c > '9') return false; value = value * 10 + uint64_t(c - '0'); }
      u.hasPort = true; u.port = value;
    }
  } else {
    u.path = std::string(rest);
  }
  return true;
}

// The URL without its fragment, as NSURLComponents with fragment = nil would print it.
inline std::string withoutFragment(std::string_view s) {
  size_t hash = s.find('#');
  return std::string(hash == std::string_view::npos ? s : s.substr(0, hash));
}

// Last path component of a file name hint (NSString lastPathComponent semantics).
inline std::string lastPathComponent(std::string value) {
  while (value.size() > 1 && value.back() == '/') value.pop_back();
  if (value == "/") return value;
  size_t slash = value.rfind('/');
  return slash == std::string::npos ? value : value.substr(slash + 1);
}
// Parent directory (NSString stringByDeletingLastPathComponent semantics for absolute paths).
inline std::string deletingLastPathComponent(std::string value) {
  while (value.size() > 1 && value.back() == '/') value.pop_back();
  size_t slash = value.rfind('/');
  if (slash == std::string::npos) return std::string();
  if (slash == 0) return "/";
  return value.substr(0, slash);
}

}  // namespace axio::url

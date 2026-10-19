#pragma once
// Strict, bounded JSON for the private engine-stream pipe (contracts/engine-stream-v1.md).
// No engine, platform or allocation-heavy dependency: the same parser is unit-tested
// on any POSIX host. Rejects duplicate keys, lone surrogates, invalid UTF-8, raw
// control characters, leading zeros, trailing garbage and nesting deeper than 16.
// Output is canonical: object keys sorted (std::map), integers without exponent, so
// two equal values always serialize to the same bytes (frame_ack compares bytes).
#include <charconv>
#include <cmath>
#include <cstdint>
#include <cstring>
#include <map>
#include <memory>
#include <optional>
#include <string>
#include <string_view>
#include <vector>

namespace axio::json {

struct Value;
using Object = std::map<std::string, Value>;
using Array = std::vector<Value>;

struct Value {
  enum class Type { Null, Bool, Number, String, Array, Object };
  Type type = Type::Null;
  bool boolean = false;
  double number = 0;
  std::string string;
  std::shared_ptr<json::Array> array;
  std::shared_ptr<json::Object> object;

  Value() = default;
  Value(std::nullptr_t) {}
  Value(bool b) : type(Type::Bool), boolean(b) {}
  Value(int v) : type(Type::Number), number(v) {}
  Value(unsigned v) : type(Type::Number), number(v) {}
  Value(long v) : type(Type::Number), number(double(v)) {}
  Value(unsigned long v) : type(Type::Number), number(double(v)) {}
  Value(long long v) : type(Type::Number), number(double(v)) {}
  Value(unsigned long long v) : type(Type::Number), number(double(v)) {}
  Value(double v) : type(Type::Number), number(v) {}
  Value(const char* s) : type(Type::String), string(s) {}
  Value(std::string s) : type(Type::String), string(std::move(s)) {}
  Value(json::Array a) : type(Type::Array), array(std::make_shared<json::Array>(std::move(a))) {}
  Value(json::Object o) : type(Type::Object), object(std::make_shared<json::Object>(std::move(o))) {}

  bool isNull() const { return type == Type::Null; }
  bool isBool() const { return type == Type::Bool; }
  bool isNumber() const { return type == Type::Number; }
  bool isString() const { return type == Type::String; }
  bool isArray() const { return type == Type::Array; }
  bool isObject() const { return type == Type::Object; }

  // Object member lookup; nullptr when absent or not an object.
  const Value* get(const std::string& key) const {
    if (!isObject()) return nullptr;
    auto found = object->find(key);
    return found == object->end() ? nullptr : &found->second;
  }
  bool has(const std::string& key) const { return get(key) != nullptr; }
  size_t size() const { return isObject() ? object->size() : isArray() ? array->size() : 0; }

  friend bool operator==(const Value& a, const Value& b) {
    if (a.type != b.type) return false;
    switch (a.type) {
      case Type::Null: return true;
      case Type::Bool: return a.boolean == b.boolean;
      case Type::Number: return a.number == b.number;
      case Type::String: return a.string == b.string;
      case Type::Array: return *a.array == *b.array;
      case Type::Object: return *a.object == *b.object;
    }
    return false;
  }
  friend bool operator!=(const Value& a, const Value& b) { return !(a == b); }
};

// Mutable object builder: copy-on-write so stored targets are never aliased.
inline Value with(const Value& base, const std::string& key, Value value) {
  json::Object copy = base.isObject() ? *base.object : json::Object{};
  copy[key] = std::move(value);
  return Value(std::move(copy));
}

namespace detail {
class Parser {
  std::string_view in_;
  size_t at_ = 0;
  int depth_ = 0;
  static constexpr int MaxDepth = 16;

  void ws() { while (at_ < in_.size() && (in_[at_] == ' ' || in_[at_] == '\t' || in_[at_] == '\n' || in_[at_] == '\r')) ++at_; }
  bool eat(char c) { if (at_ < in_.size() && in_[at_] == c) { ++at_; return true; } return false; }
  bool literal(const char* word) {
    size_t n = strlen(word);
    if (in_.substr(at_, n) != word) return false;
    at_ += n; return true;
  }
  static void append(std::string& out, uint32_t cp) {
    if (cp < 0x80) out.push_back(char(cp));
    else if (cp < 0x800) { out.push_back(char(0xC0 | (cp >> 6))); out.push_back(char(0x80 | (cp & 0x3F))); }
    else if (cp < 0x10000) { out.push_back(char(0xE0 | (cp >> 12))); out.push_back(char(0x80 | ((cp >> 6) & 0x3F))); out.push_back(char(0x80 | (cp & 0x3F))); }
    else { out.push_back(char(0xF0 | (cp >> 18))); out.push_back(char(0x80 | ((cp >> 12) & 0x3F))); out.push_back(char(0x80 | ((cp >> 6) & 0x3F))); out.push_back(char(0x80 | (cp & 0x3F))); }
  }
  bool hex4(uint32_t& v) {
    if (at_ + 4 > in_.size()) return false;
    v = 0;
    for (int i = 0; i < 4; ++i) {
      char c = in_[at_++]; v <<= 4;
      if (c >= '0' && c <= '9') v |= uint32_t(c - '0');
      else if (c >= 'a' && c <= 'f') v |= uint32_t(c - 'a' + 10);
      else if (c >= 'A' && c <= 'F') v |= uint32_t(c - 'A' + 10);
      else return false;
    }
    return true;
  }
  // One raw UTF-8 sequence, validated (no overlongs, surrogates or > U+10FFFF).
  bool utf8(std::string& out) {
    auto b = uint8_t(in_[at_]);
    int extra = b >= 0xF5 ? -1 : b >= 0xF0 ? 3 : b >= 0xE0 ? 2 : b >= 0xC2 ? 1 : -1;
    if (extra < 0 || at_ + size_t(extra) >= in_.size()) return false;
    uint32_t cp = b & (0x3F >> extra);
    for (int i = 1; i <= extra; ++i) {
      auto c = uint8_t(in_[at_ + size_t(i)]);
      if ((c & 0xC0) != 0x80) return false;
      cp = (cp << 6) | (c & 0x3F);
    }
    if ((extra == 2 && (cp < 0x800 || (cp >= 0xD800 && cp <= 0xDFFF))) || (extra == 3 && (cp < 0x10000 || cp > 0x10FFFF))) return false;
    out.append(in_.substr(at_, size_t(extra) + 1));
    at_ += size_t(extra) + 1;
    return true;
  }
  bool string(std::string& out) {
    if (!eat('"')) return false;
    while (at_ < in_.size()) {
      auto c = uint8_t(in_[at_]);
      if (c == '"') { ++at_; return true; }
      if (c < 0x20) return false;
      if (c == '\\') {
        if (++at_ >= in_.size()) return false;
        char e = in_[at_++];
        switch (e) {
          case '"': out.push_back('"'); break; case '\\': out.push_back('\\'); break; case '/': out.push_back('/'); break;
          case 'b': out.push_back('\b'); break; case 'f': out.push_back('\f'); break; case 'n': out.push_back('\n'); break;
          case 'r': out.push_back('\r'); break; case 't': out.push_back('\t'); break;
          case 'u': {
            uint32_t cp; if (!hex4(cp)) return false;
            if (cp >= 0xDC00 && cp <= 0xDFFF) return false;
            if (cp >= 0xD800 && cp <= 0xDBFF) {
              uint32_t low; if (!eat('\\') || !eat('u') || !hex4(low) || low < 0xDC00 || low > 0xDFFF) return false;
              cp = 0x10000 + ((cp - 0xD800) << 10) + (low - 0xDC00);
            }
            append(out, cp); break;
          }
          default: return false;
        }
        continue;
      }
      if (c < 0x80) { out.push_back(char(c)); ++at_; continue; }
      if (!utf8(out)) return false;
    }
    return false;
  }
  bool number(double& out) {
    size_t start = at_;
    eat('-');
    if (eat('0')) {} else {
      if (at_ >= in_.size() || in_[at_] < '1' || in_[at_] > '9') return false;
      while (at_ < in_.size() && in_[at_] >= '0' && in_[at_] <= '9') ++at_;
    }
    if (eat('.')) {
      size_t digits = at_;
      while (at_ < in_.size() && in_[at_] >= '0' && in_[at_] <= '9') ++at_;
      if (at_ == digits) return false;
    }
    if (at_ < in_.size() && (in_[at_] == 'e' || in_[at_] == 'E')) {
      ++at_; if (!eat('+')) eat('-');
      size_t digits = at_;
      while (at_ < in_.size() && in_[at_] >= '0' && in_[at_] <= '9') ++at_;
      if (at_ == digits) return false;
    }
    std::string text(in_.substr(start, at_ - start));
    char* end = nullptr; out = strtod(text.c_str(), &end);
    return end && *end == 0 && std::isfinite(out);
  }
  bool value(Value& out) {
    ws();
    if (at_ >= in_.size()) return false;
    char c = in_[at_];
    if (c == '{') {
      if (++depth_ > MaxDepth) return false;
      ++at_; json::Object object; ws();
      if (!eat('}')) {
        for (;;) {
          ws(); std::string key; if (!string(key)) return false;
          ws(); if (!eat(':')) return false;
          Value member; if (!value(member)) return false;
          if (!object.emplace(std::move(key), std::move(member)).second) return false;  // duplicate key
          ws(); if (eat('}')) break; if (!eat(',')) return false;
        }
      }
      --depth_; out = Value(std::move(object)); return true;
    }
    if (c == '[') {
      if (++depth_ > MaxDepth) return false;
      ++at_; json::Array array; ws();
      if (!eat(']')) {
        for (;;) {
          Value item; if (!value(item)) return false;
          array.push_back(std::move(item));
          ws(); if (eat(']')) break; if (!eat(',')) return false;
        }
      }
      --depth_; out = Value(std::move(array)); return true;
    }
    if (c == '"') { std::string s; if (!string(s)) return false; out = Value(std::move(s)); return true; }
    if (literal("true")) { out = Value(true); return true; }
    if (literal("false")) { out = Value(false); return true; }
    if (literal("null")) { out = Value(nullptr); return true; }
    double n; if (!number(n)) return false;
    out = Value(n); return true;
  }
public:
  explicit Parser(std::string_view in) : in_(in) {}
  std::optional<Value> parse() {
    Value out;
    if (!value(out)) return std::nullopt;
    ws();
    if (at_ != in_.size()) return std::nullopt;
    return out;
  }
};

inline void quote(std::string& out, const std::string& s) {
  out.push_back('"');
  for (unsigned char c : s) {
    switch (c) {
      case '"': out += "\\\""; break; case '\\': out += "\\\\"; break;
      case '\n': out += "\\n"; break; case '\r': out += "\\r"; break; case '\t': out += "\\t"; break;
      case '\b': out += "\\b"; break; case '\f': out += "\\f"; break;
      default:
        if (c < 0x20) { char buf[8]; snprintf(buf, sizeof buf, "\\u%04x", c); out += buf; }
        else out.push_back(char(c));
    }
  }
  out.push_back('"');
}
inline void dump(std::string& out, const Value& v) {
  switch (v.type) {
    case Value::Type::Null: out += "null"; break;
    case Value::Type::Bool: out += v.boolean ? "true" : "false"; break;
    case Value::Type::Number: {
      char buf[32];
      if (std::isfinite(v.number) && std::floor(v.number) == v.number && std::fabs(v.number) <= 9007199254740991.0)
        snprintf(buf, sizeof buf, "%lld", (long long)v.number);
      else if (!std::isfinite(v.number)) snprintf(buf, sizeof buf, "null");
      else { auto r = std::to_chars(buf, buf + sizeof buf - 1, v.number); *r.ptr = 0; }
      out += buf; break;
    }
    case Value::Type::String: quote(out, v.string); break;
    case Value::Type::Array: {
      out.push_back('[');
      bool first = true;
      for (auto& item : *v.array) { if (!first) out.push_back(','); first = false; dump(out, item); }
      out.push_back(']'); break;
    }
    case Value::Type::Object: {
      out.push_back('{');
      bool first = true;
      for (auto& [key, item] : *v.object) { if (!first) out.push_back(','); first = false; quote(out, key); out.push_back(':'); dump(out, item); }
      out.push_back('}'); break;
    }
  }
}
}  // namespace detail

inline std::optional<Value> parse(std::string_view text) { return detail::Parser(text).parse(); }
inline std::string dump(const Value& v) { std::string out; detail::dump(out, v); return out; }

// Number of UTF-16 code units of valid UTF-8 (contract limits are UTF-16, like JS).
inline size_t utf16Length(const std::string& s) {
  size_t n = 0;
  for (size_t i = 0; i < s.size();) {
    auto b = uint8_t(s[i]);
    int len = b < 0x80 ? 1 : b < 0xE0 ? 2 : b < 0xF0 ? 3 : 4;
    n += len == 4 ? 2 : 1; i += size_t(len);
  }
  return n;
}
// Prefix of at most `units` UTF-16 code units, never splitting a code point.
inline std::string utf16Prefix(const std::string& s, size_t units) {
  size_t n = 0, i = 0;
  while (i < s.size()) {
    auto b = uint8_t(s[i]);
    int len = b < 0x80 ? 1 : b < 0xE0 ? 2 : b < 0xF0 ? 3 : 4;
    size_t cost = len == 4 ? 2 : 1;
    if (n + cost > units) break;
    n += cost; i += size_t(len);
  }
  return s.substr(0, i);
}
// Decode valid UTF-8 into code points (input already validated by the parser).
inline std::vector<uint32_t> codepoints(const std::string& s) {
  std::vector<uint32_t> out;
  for (size_t i = 0; i < s.size();) {
    auto b = uint8_t(s[i]);
    int len = b < 0x80 ? 1 : b < 0xE0 ? 2 : b < 0xF0 ? 3 : 4;
    uint32_t cp = len == 1 ? b : b & (0x3F >> (len - 1));
    for (int k = 1; k < len && i + size_t(k) < s.size(); ++k) cp = (cp << 6) | (uint8_t(s[i + size_t(k)]) & 0x3F);
    out.push_back(cp); i += size_t(len);
  }
  return out;
}

}  // namespace axio::json

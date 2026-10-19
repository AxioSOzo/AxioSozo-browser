#pragma once
// Strict, bounded JSON for the cef-v1 private pipe (portable C++20, no exceptions,
// no RTTI). Replaces NSJSONSerialization in the portable host core:
//   * parse(): RFC 8259 only (no comments, trailing commas, NaN, leading zeros or
//     control characters in strings), valid UTF-8 only, no lone surrogates, no
//     duplicate object keys, nesting depth <= MaxDepth. Anything else fails.
//   * write(): compact output with object keys in byte order (the macOS host uses
//     NSJSONWritingSortedKeys; all protocol keys are ASCII so the order is equal),
//     integral numbers without a fraction, others in their shortest round-trip form.
// Strings stay UTF-8; length limits of the protocol count UTF-16 code units
// (utf16Length), exactly like NSString.length on the macOS host.
#include <cmath>
#include <cstdint>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <map>
#include <string>
#include <string_view>
#include <utility>
#include <vector>

namespace axio::json {

constexpr int MaxDepth = 32;

struct Value {
  enum class Type { Null, Bool, Number, String, Array, Object };
  Type type = Type::Null;
  bool boolean = false;
  double number = 0;
  std::string text;
  std::vector<Value> items;
  std::map<std::string, Value> fields;

  Value() = default;
  Value(std::nullptr_t) {}
  Value(bool value) : type(Type::Bool), boolean(value) {}
  Value(int value) : type(Type::Number), number(double(value)) {}
  Value(unsigned value) : type(Type::Number), number(double(value)) {}
  Value(long value) : type(Type::Number), number(double(value)) {}
  Value(unsigned long value) : type(Type::Number), number(double(value)) {}
  Value(long long value) : type(Type::Number), number(double(value)) {}
  Value(unsigned long long value) : type(Type::Number), number(double(value)) {}
  Value(double value) : type(Type::Number), number(value) {}
  Value(const char* value) : type(Type::String), text(value ? value : "") {}
  Value(std::string value) : type(Type::String), text(std::move(value)) {}
  Value(std::string_view value) : type(Type::String), text(value) {}

  bool isNull() const { return type == Type::Null; }
  bool isBool() const { return type == Type::Bool; }
  bool isNumber() const { return type == Type::Number; }
  bool isString() const { return type == Type::String; }
  bool isArray() const { return type == Type::Array; }
  bool isObject() const { return type == Type::Object; }

  // Object member or nullptr (also for non-objects).
  const Value* get(const std::string& key) const {
    if (type != Type::Object) return nullptr;
    auto found = fields.find(key);
    return found == fields.end() ? nullptr : &found->second;
  }
  bool has(const std::string& key) const { return get(key) != nullptr; }
  Value& operator[](const std::string& key) { type = Type::Object; return fields[key]; }
  // Convenience accessors for already validated values.
  const std::string& str(const std::string& key) const {
    static const std::string empty;
    const Value* v = get(key);
    return v && v->isString() ? v->text : empty;
  }
  double num(const std::string& key) const { const Value* v = get(key); return v && v->isNumber() ? v->number : 0; }
  bool flag(const std::string& key) const { const Value* v = get(key); return v && v->isBool() && v->boolean; }

  bool operator==(const Value& other) const {
    if (type != other.type) return false;
    switch (type) {
      case Type::Null: return true;
      case Type::Bool: return boolean == other.boolean;
      case Type::Number: return number == other.number;
      case Type::String: return text == other.text;
      case Type::Array: return items == other.items;
      case Type::Object: return fields == other.fields;
    }
    return false;
  }
  bool operator!=(const Value& other) const { return !(*this == other); }
};

inline Value object(std::initializer_list<std::pair<const std::string, Value>> members) {
  Value v; v.type = Value::Type::Object; v.fields = std::map<std::string, Value>(members); return v;
}
inline Value array(std::initializer_list<Value> items = {}) {
  Value v; v.type = Value::Type::Array; v.items = std::vector<Value>(items); return v;
}
inline Value array(std::vector<Value> items) {
  Value v; v.type = Value::Type::Array; v.items = std::move(items); return v;
}
inline Value emptyObject() { Value v; v.type = Value::Type::Object; return v; }

// ---- UTF-8 / UTF-16 ------------------------------------------------------------------
inline void appendUtf8(std::string& out, uint32_t cp) {
  if (cp < 0x80) out.push_back(char(cp));
  else if (cp < 0x800) { out.push_back(char(0xC0 | (cp >> 6))); out.push_back(char(0x80 | (cp & 0x3F))); }
  else if (cp < 0x10000) {
    out.push_back(char(0xE0 | (cp >> 12))); out.push_back(char(0x80 | ((cp >> 6) & 0x3F)));
    out.push_back(char(0x80 | (cp & 0x3F)));
  } else {
    out.push_back(char(0xF0 | (cp >> 18))); out.push_back(char(0x80 | ((cp >> 12) & 0x3F)));
    out.push_back(char(0x80 | ((cp >> 6) & 0x3F))); out.push_back(char(0x80 | (cp & 0x3F)));
  }
}
// Decodes one code point at `i` (advancing it). Returns false for invalid UTF-8
// (overlong, surrogate, > U+10FFFF, truncated).
inline bool decodeUtf8(std::string_view s, size_t& i, uint32_t& cp) {
  auto byte = [&](size_t k) { return uint8_t(s[k]); };
  uint8_t b0 = byte(i);
  if (b0 < 0x80) { cp = b0; i += 1; return true; }
  int extra; uint32_t min;
  if ((b0 & 0xE0) == 0xC0) { extra = 1; cp = b0 & 0x1F; min = 0x80; }
  else if ((b0 & 0xF0) == 0xE0) { extra = 2; cp = b0 & 0x0F; min = 0x800; }
  else if ((b0 & 0xF8) == 0xF0) { extra = 3; cp = b0 & 0x07; min = 0x10000; }
  else return false;
  if (i + size_t(extra) >= s.size()) return false;  // truncated sequence
  for (int k = 1; k <= extra; ++k) {
    uint8_t b = byte(i + size_t(k));
    if ((b & 0xC0) != 0x80) return false;
    cp = (cp << 6) | (b & 0x3F);
  }
  if (cp < min || cp > 0x10FFFF || (cp >= 0xD800 && cp <= 0xDFFF)) return false;
  i += size_t(extra) + 1;
  return true;
}
inline bool validUtf8(std::string_view s) {
  for (size_t i = 0; i < s.size();) { uint32_t cp = 0; if (!decodeUtf8(s, i, cp)) return false; }
  return true;
}
// NSString.length of a valid UTF-8 string: supplementary characters count twice.
inline size_t utf16Length(std::string_view s) {
  size_t n = 0;
  for (size_t i = 0; i < s.size();) {
    uint32_t cp = 0;
    if (!decodeUtf8(s, i, cp)) { ++i; ++n; continue; }
    n += cp >= 0x10000 ? 2 : 1;
  }
  return n;
}
inline std::u16string toUtf16(std::string_view s) {
  std::u16string out; out.reserve(s.size());
  for (size_t i = 0; i < s.size();) {
    uint32_t cp = 0;
    if (!decodeUtf8(s, i, cp)) { ++i; cp = 0xFFFD; }
    if (cp >= 0x10000) { cp -= 0x10000; out.push_back(char16_t(0xD800 + (cp >> 10))); out.push_back(char16_t(0xDC00 + (cp & 0x3FF))); }
    else out.push_back(char16_t(cp));
  }
  return out;
}
inline std::string fromUtf16(const char16_t* text, size_t length) {
  std::string out; out.reserve(length);
  for (size_t i = 0; i < length; ++i) {
    uint32_t cp = text[i];
    if (cp >= 0xD800 && cp <= 0xDBFF && i + 1 < length && text[i + 1] >= 0xDC00 && text[i + 1] <= 0xDFFF) {
      cp = 0x10000 + ((cp - 0xD800) << 10) + (uint32_t(text[i + 1]) - 0xDC00); ++i;
    } else if (cp >= 0xD800 && cp <= 0xDFFF) cp = 0xFFFD;  // unpaired surrogate
    appendUtf8(out, cp);
  }
  return out;
}
inline std::string fromUtf16(const std::u16string& s) { return fromUtf16(s.data(), s.size()); }

// ---- Parser ------------------------------------------------------------------------------
class Parser {
  std::string_view s_;
  size_t i_ = 0;

  void ws() { while (i_ < s_.size() && (s_[i_] == ' ' || s_[i_] == '\t' || s_[i_] == '\n' || s_[i_] == '\r')) ++i_; }
  bool lit(const char* word) {
    size_t n = strlen(word);
    if (s_.substr(i_, n) != word) return false;
    i_ += n; return true;
  }
  bool hex4(uint32_t& out) {
    if (i_ + 4 > s_.size()) return false;
    out = 0;
    for (int k = 0; k < 4; ++k) {
      char c = s_[i_++]; out <<= 4;
      if (c >= '0' && c <= '9') out |= uint32_t(c - '0');
      else if (c >= 'a' && c <= 'f') out |= uint32_t(c - 'a' + 10);
      else if (c >= 'A' && c <= 'F') out |= uint32_t(c - 'A' + 10);
      else return false;
    }
    return true;
  }
  bool string(std::string& out) {
    if (i_ >= s_.size() || s_[i_] != '"') return false;
    ++i_;
    while (i_ < s_.size()) {
      char c = s_[i_];
      if (c == '"') { ++i_; return true; }
      if (uint8_t(c) < 0x20) return false;
      if (c == '\\') {
        if (++i_ >= s_.size()) return false;
        char e = s_[i_++];
        switch (e) {
          case '"': out.push_back('"'); break;
          case '\\': out.push_back('\\'); break;
          case '/': out.push_back('/'); break;
          case 'b': out.push_back('\b'); break;
          case 'f': out.push_back('\f'); break;
          case 'n': out.push_back('\n'); break;
          case 'r': out.push_back('\r'); break;
          case 't': out.push_back('\t'); break;
          case 'u': {
            uint32_t cp = 0;
            if (!hex4(cp)) return false;
            if (cp >= 0xD800 && cp <= 0xDBFF) {
              uint32_t low;
              if (i_ + 2 > s_.size() || s_[i_] != '\\' || s_[i_ + 1] != 'u') return false;
              i_ += 2;
              if (!hex4(low) || low < 0xDC00 || low > 0xDFFF) return false;
              cp = 0x10000 + ((cp - 0xD800) << 10) + (low - 0xDC00);
            } else if (cp >= 0xDC00 && cp <= 0xDFFF) return false;
            appendUtf8(out, cp);
            break;
          }
          default: return false;
        }
        continue;
      }
      size_t start = i_; uint32_t cp = 0;
      if (!decodeUtf8(s_, i_, cp)) return false;
      out.append(s_.substr(start, i_ - start));
    }
    return false;
  }
  bool number(double& out) {
    size_t start = i_;
    if (i_ < s_.size() && s_[i_] == '-') ++i_;
    if (i_ >= s_.size()) return false;
    if (s_[i_] == '0') ++i_;
    else if (s_[i_] >= '1' && s_[i_] <= '9') { while (i_ < s_.size() && s_[i_] >= '0' && s_[i_] <= '9') ++i_; }
    else return false;
    if (i_ < s_.size() && s_[i_] == '.') {
      ++i_; size_t digits = i_;
      while (i_ < s_.size() && s_[i_] >= '0' && s_[i_] <= '9') ++i_;
      if (i_ == digits) return false;
    }
    if (i_ < s_.size() && (s_[i_] == 'e' || s_[i_] == 'E')) {
      ++i_;
      if (i_ < s_.size() && (s_[i_] == '+' || s_[i_] == '-')) ++i_;
      size_t digits = i_;
      while (i_ < s_.size() && s_[i_] >= '0' && s_[i_] <= '9') ++i_;
      if (i_ == digits) return false;
    }
    if (i_ - start > 64) return false;
    char buffer[72]; memcpy(buffer, s_.data() + start, i_ - start); buffer[i_ - start] = 0;
    char* end = nullptr; out = strtod(buffer, &end);
    return end == buffer + (i_ - start) && std::isfinite(out);
  }
  bool value(Value& out, int depth) {
    if (depth > MaxDepth) return false;
    ws();
    if (i_ >= s_.size()) return false;
    char c = s_[i_];
    if (c == '{') {
      ++i_; out.type = Value::Type::Object; ws();
      if (i_ < s_.size() && s_[i_] == '}') { ++i_; return true; }
      while (true) {
        ws(); std::string key;
        if (!string(key)) return false;
        ws();
        if (i_ >= s_.size() || s_[i_] != ':') return false;
        ++i_;
        Value member;
        if (!value(member, depth + 1)) return false;
        if (!out.fields.emplace(std::move(key), std::move(member)).second) return false;  // duplicate key
        ws();
        if (i_ < s_.size() && s_[i_] == ',') { ++i_; continue; }
        if (i_ < s_.size() && s_[i_] == '}') { ++i_; return true; }
        return false;
      }
    }
    if (c == '[') {
      ++i_; out.type = Value::Type::Array; ws();
      if (i_ < s_.size() && s_[i_] == ']') { ++i_; return true; }
      while (true) {
        Value item;
        if (!value(item, depth + 1)) return false;
        out.items.push_back(std::move(item));
        ws();
        if (i_ < s_.size() && s_[i_] == ',') { ++i_; continue; }
        if (i_ < s_.size() && s_[i_] == ']') { ++i_; return true; }
        return false;
      }
    }
    if (c == '"') { out.type = Value::Type::String; return string(out.text); }
    if (lit("true")) { out = Value(true); return true; }
    if (lit("false")) { out = Value(false); return true; }
    if (lit("null")) { out = Value(); return true; }
    out.type = Value::Type::Number;
    return number(out.number);
  }

 public:
  explicit Parser(std::string_view s) : s_(s) {}
  bool parse(Value& out) {
    if (!value(out, 0)) return false;
    ws();
    return i_ == s_.size();
  }
};

// Parses one complete JSON text. A trailing newline (the pipe's line terminator) is allowed.
inline bool parse(std::string_view text, Value& out) {
  out = Value();
  return Parser(text).parse(out);
}

// ---- Writer ------------------------------------------------------------------------------
inline void writeNumber(std::string& out, double v) {
  if (!std::isfinite(v)) { out += "null"; return; }
  if (v == std::floor(v) && std::fabs(v) < 9007199254740992.0) {
    char buffer[32]; snprintf(buffer, sizeof(buffer), "%lld", (long long)v); out += buffer; return;
  }
  char buffer[40];
  for (int precision = 1; precision <= 17; ++precision) {
    snprintf(buffer, sizeof(buffer), "%.*g", precision, v);
    if (strtod(buffer, nullptr) == v) break;
  }
  out += buffer;
}
inline void writeString(std::string& out, const std::string& s) {
  out.push_back('"');
  for (char c : s) {
    switch (c) {
      case '"': out += "\\\""; break;
      case '\\': out += "\\\\"; break;
      case '\n': out += "\\n"; break;
      case '\r': out += "\\r"; break;
      case '\t': out += "\\t"; break;
      case '\b': out += "\\b"; break;
      case '\f': out += "\\f"; break;
      default:
        if (uint8_t(c) < 0x20) { char buffer[8]; snprintf(buffer, sizeof(buffer), "\\u%04x", unsigned(uint8_t(c))); out += buffer; }
        else out.push_back(c);
    }
  }
  out.push_back('"');
}
inline void write(std::string& out, const Value& v) {
  switch (v.type) {
    case Value::Type::Null: out += "null"; break;
    case Value::Type::Bool: out += v.boolean ? "true" : "false"; break;
    case Value::Type::Number: writeNumber(out, v.number); break;
    case Value::Type::String: writeString(out, v.text); break;
    case Value::Type::Array: {
      out.push_back('[');
      bool first = true;
      for (const auto& item : v.items) { if (!first) out.push_back(','); first = false; write(out, item); }
      out.push_back(']');
      break;
    }
    case Value::Type::Object: {
      out.push_back('{');
      bool first = true;
      for (const auto& [key, item] : v.fields) {
        if (!first) out.push_back(',');
        first = false; writeString(out, key); out.push_back(':'); write(out, item);
      }
      out.push_back('}');
      break;
    }
  }
}
inline std::string write(const Value& v) { std::string out; write(out, v); return out; }

}  // namespace axio::json

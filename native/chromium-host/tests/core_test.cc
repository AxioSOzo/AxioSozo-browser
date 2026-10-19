// Portable-core unit test (core/json.hpp, core/url.hpp). No CEF, no network.
// Build: c++ -std=c++20 -Wall -Wextra -I native/chromium-host native/chromium-host/tests/core_test.cc
#include <cassert>
#include <cstdio>
#include <string>
#include "core/json.hpp"
#include "core/url.hpp"

using axio::json::Value;

static bool parses(const std::string& text) { Value v; return axio::json::parse(text, v); }

int main() {
  // Strict RFC 8259 parsing.
  Value v;
  assert(axio::json::parse("{\"a\":1,\"b\":[true,false,null],\"c\":\"x\\u00e9\\ud83d\\ude00\"}\n", v));
  assert(v.isObject() && v.num("a") == 1 && v.get("b")->items.size() == 3 && v.str("c") == "x\xc3\xa9\xf0\x9f\x98\x80");
  assert(axio::json::utf16Length(v.str("c")) == 4);  // x, e-acute, surrogate pair
  for (const char* bad : {"", "{", "{\"a\":1,}", "[1,]", "{\"a\":01}", "{\"a\":1.}", "{\"a\":NaN}", "{'a':1}",
                          "{\"a\":1}{", "{\"a\":\"\\ud800\"}", "{\"a\":\"\\udc00\"}", "{\"a\":\"\x01\"}",
                          "{\"a\":1,\"a\":2}", "{\"a\":\"\xc0\xaf\"}", "{\"a\":\"\xed\xa0\x80\"}", "{\"a\":\"\xf4\x90\x80\x80\"}",
                          "{\"a\":\"\xe2\x82\"}", "// c\n{}", "{\"a\":tru}", "{\"a\":1e}", "{\"a\":-}"})
    assert(!parses(bad));
  std::string deep(40, '[');
  deep += std::string(40, ']');
  assert(!parses(deep));
  assert(parses("[1e2,-0.5,0,1E+3]"));
  assert(parses("\"top level string\""));  // callers require an object separately

  // Canonical writer: sorted keys, integral numbers without fraction, escapes.
  Value w = axio::json::object({{"z", 1}, {"a", 2.5}, {"m", "q\"\\\n\x01"}, {"b", true}, {"n", nullptr},
                                {"arr", axio::json::array({1, 2.0, 9007199254740991.0})}});
  std::string text = axio::json::write(w);
  assert(text == "{\"a\":2.5,\"arr\":[1,2,9007199254740991],\"b\":true,\"m\":\"q\\\"\\\\\\n\\u0001\",\"n\":null,\"z\":1}");
  Value round;
  assert(axio::json::parse(text, round) && round == w && axio::json::write(round) == text);
  assert(axio::json::write(Value(0.1)) == "0.1" && axio::json::write(Value(1.5)) == "1.5" && axio::json::write(Value(-3.0)) == "-3");
  // A target written twice (as frame metadata and as an ack) compares byte-equal.
  Value target = axio::json::object({{"tab_id", "t"}, {"document_generation", 3}, {"private_mode", false}});
  Value reparsed;
  assert(axio::json::parse(axio::json::write(target), reparsed) && axio::json::write(reparsed) == axio::json::write(target));
  // UTF-16 round trip.
  std::u16string wide = axio::json::toUtf16("a\xf0\x9f\x98\x80");
  assert(wide.size() == 3 && axio::json::fromUtf16(wide) == "a\xf0\x9f\x98\x80");

  // URL splitter.
  axio::url::Url u;
  assert(axio::url::parse("http://127.0.0.1:8080/engine.html?page=2", u) && u.scheme == "http" && u.host == "127.0.0.1" &&
         u.hasPort && u.port == 8080 && u.path == "/engine.html" && u.hasQuery && u.query == "page=2" && !u.hasFragment);
  assert(axio::url::parse("https://example.com", u) && u.path.empty() && !u.hasPort && !u.hasQuery);
  assert(axio::url::parse("https://example.com/", u) && u.path == "/");
  assert(axio::url::parse("https://[::1]:443/x#f", u) && u.host == "::1" && u.port == 443 && u.hasFragment && u.fragment == "f");
  assert(axio::url::parse("http://h:/x", u) && !u.hasPort);
  assert(axio::url::parse("http://user@h/", u) && u.hasUserInfo);
  assert(axio::url::parse("http://127.0.0.1:1\\@evil/engine.html", u) && u.hasUserInfo);
  assert(axio::url::parse("about:blank", u) && u.scheme == "about" && u.path == "blank" && !u.hasAuthority);
  assert(axio::url::parse("data:text/plain,hi", u) && u.scheme == "data");
  assert(axio::url::parse("http://h/engine.html?", u) && u.hasQuery && u.query.empty());
  for (const char* bad : {"", ":x", "1http://h", "http://h /", "http://h\t/", "http://h:8x/", "http://[::1/", "http://h:12345678901/",
                          "ht tp://h", "http://h\x7f/"})
    assert(!axio::url::parse(bad, u));
  assert(axio::url::withoutFragment("https://a/b?c#d#e") == "https://a/b?c");
  assert(axio::url::lastPathComponent("/a/b/c.txt") == "c.txt" && axio::url::lastPathComponent("dir/") == "dir" &&
         axio::url::lastPathComponent("plain") == "plain");
  assert(axio::url::deletingLastPathComponent("/a/b") == "/a" && axio::url::deletingLastPathComponent("/a") == "/" &&
         axio::url::deletingLastPathComponent("/a/b/") == "/a");
  printf("PASS: strict JSON (UTF-8, surrogates, duplicates, depth), canonical sorted writer, URL splitter and path helpers\n");
  return 0;
}

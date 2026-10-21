// Deterministic strict-JSON test for the engine-stream pipe parser (json.hpp).
#include "../json.hpp"
#include <cassert>
#include <iostream>

using axio::json::parse;
using axio::json::dump;
using axio::json::Value;

int main() {
  // Accepted values and canonical output (sorted keys, integral numbers without exponent).
  auto v = parse("{\"b\":1,\"a\":[true,false,null,-0.5,1e3,\"x\\u00e9\\ud83d\\ude00\"]}\n");
  assert(v && v->isObject());
  assert(dump(*v) == "{\"a\":[true,false,null,-0.5,1000,\"x\xc3\xa9\xf0\x9f\x98\x80\"],\"b\":1}");
  assert(dump(Value(9007199254740991.0)) == "9007199254740991" && dump(Value(1.5)) == "1.5");
  assert(dump(Value(std::string("q\"\\\n\x01"))) == "\"q\\\"\\\\\\n\\u0001\"");
  // Equal values serialize identically (frame_ack compares serialized targets).
  assert(dump(*parse("{\"y\":2,\"x\":1}")) == dump(*parse("{ \"x\" : 1 , \"y\" : 2 }")));
  assert(*parse("{\"x\":1}") == *parse("{\"x\":1.0}"));
  // Rejected input.
  const char* bad[] = {
    "", "{", "{\"a\":1,}", "{\"a\":1}{}", "{\"a\":1} x", "[01]", "[1.]", "[.5]", "[1e]", "[+1]", "[NaN]", "[1e999]",
    "{\"a\":1,\"a\":2}",                 // duplicate key
    "[\"\\ud800\"]", "[\"\\udc00\"]",     // lone surrogates
    "[\"\x80\"]", "[\"\xc0\xaf\"]", "[\"\xed\xa0\x80\"]", "[\"\xf5\x80\x80\x80\"]", "[\"\xe2\x82\"]",  // invalid UTF-8
    "[\"a\tb\"]", "[\"\\x\"]", "[tru]", "{1:2}",
    "[[[[[[[[[[[[[[[[[1]]]]]]]]]]]]]]]]]",  // depth 17
  };
  for (auto* text : bad) { if (parse(text)) { std::cerr << "accepted: " << text << "\n"; return 1; } }
  assert(parse("[[[[[[[[[[[[[[[[1]]]]]]]]]]]]]]]]"));  // depth 16
  assert(axio::json::utf16Length("a\xf0\x9f\x98\x80") == 3);
  assert(axio::json::utf16Prefix("ab\xf0\x9f\x98\x80", 3) == "ab");
  std::cout << "PASS: strict JSON (duplicates, surrogates, UTF-8, numbers, depth, canonical output)\n";
  return 0;
}

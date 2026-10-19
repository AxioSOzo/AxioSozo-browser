#pragma once
// Lossless PNG of actual CEF OnPaint BGRA bytes (E0 evidence), using zlib.
// Mirrors host.mm saveFrame: channels are reordered, nothing is generated.
#include <zlib.h>
#include <cstdint>
#include <cstdio>
#include <string>
#include <vector>

namespace axio::png {

inline void put32(std::vector<uint8_t>& out, uint32_t v) {
  out.push_back(uint8_t(v >> 24)); out.push_back(uint8_t(v >> 16)); out.push_back(uint8_t(v >> 8)); out.push_back(uint8_t(v));
}
inline void chunk(std::vector<uint8_t>& out, const char* type, const std::vector<uint8_t>& data) {
  put32(out, uint32_t(data.size()));
  size_t start = out.size();
  out.insert(out.end(), type, type + 4);
  out.insert(out.end(), data.begin(), data.end());
  uLong crc = crc32(0L, Z_NULL, 0);
  crc = crc32(crc, out.data() + start, uInt(out.size() - start));
  put32(out, uint32_t(crc));
}
// Encodes w*h BGRA pixels (stride w*4) as RGBA PNG. Empty on failure.
inline std::vector<uint8_t> encodeBGRA(const void* pixels, int w, int h) {
  std::vector<uint8_t> out;
  if (!pixels || w <= 0 || h <= 0 || w > 4096 || h > 4096) return out;
  const auto* src = static_cast<const uint8_t*>(pixels);
  std::vector<uint8_t> raw(size_t(h) * (size_t(w) * 4 + 1));
  for (int y = 0; y < h; ++y) {
    uint8_t* row = raw.data() + size_t(y) * (size_t(w) * 4 + 1);
    row[0] = 0;  // filter: none
    for (int x = 0; x < w; ++x) {
      const uint8_t* p = src + (size_t(y) * size_t(w) + size_t(x)) * 4;
      row[1 + x * 4] = p[2]; row[2 + x * 4] = p[1]; row[3 + x * 4] = p[0]; row[4 + x * 4] = p[3];
    }
  }
  uLongf size = compressBound(uLong(raw.size()));
  std::vector<uint8_t> compressed(size);
  if (compress2(compressed.data(), &size, raw.data(), uLong(raw.size()), 6) != Z_OK) return out;
  compressed.resize(size);
  static const uint8_t signature[8] = {0x89, 'P', 'N', 'G', '\r', '\n', 0x1A, '\n'};
  out.insert(out.end(), signature, signature + 8);
  std::vector<uint8_t> header;
  put32(header, uint32_t(w)); put32(header, uint32_t(h));
  header.push_back(8); header.push_back(6); header.push_back(0); header.push_back(0); header.push_back(0);
  chunk(out, "IHDR", header);
  chunk(out, "IDAT", compressed);
  chunk(out, "IEND", {});
  return out;
}
inline bool writeFile(const std::string& path, const std::vector<uint8_t>& data) {
  if (data.empty()) return false;
  std::string temporary = path + ".partial";
  FILE* f = fopen(temporary.c_str(), "wb");
  if (!f) return false;
  bool ok = fwrite(data.data(), 1, data.size(), f) == data.size();
  ok = fclose(f) == 0 && ok;
  if (ok) ok = rename(temporary.c_str(), path.c_str()) == 0;
  if (!ok) remove(temporary.c_str());
  return ok;
}

}  // namespace axio::png

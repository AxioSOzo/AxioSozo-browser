"""gui_test.view_pixels: the pixel-content gate of the engine GUI harnesses (final-review)."""
import struct
import sys
import tempfile
import unittest
import zlib
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
import gui_test  # noqa: E402


def png(width, height, pixel):
    rows = bytearray()
    for y in range(height):
        rows.append(0)
        for x in range(width):
            rows += bytes(pixel(x, y))

    def chunk(kind, body):
        return struct.pack('>I', len(body)) + kind + body + struct.pack('>I', zlib.crc32(kind + body) & 0xffffffff)
    return (b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0))
            + chunk(b'IDAT', zlib.compress(bytes(rows))) + chunk(b'IEND', b''))


class ViewPixelsTest(unittest.TestCase):
    def measure(self, pixel, box=(0, 0, 200, 120)):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / 'shot.png'
            path.write_bytes(png(200, 120, pixel))
            return gui_test.view_pixels(path, box)

    def test_black_view_has_no_content(self):
        out = self.measure(lambda x, y: (0, 0, 0))
        self.assertEqual(out['black'], 1.0)
        self.assertFalse(out['content'])

    def test_text_on_light_page_is_content(self):
        # Dark one-pixel "strokes" on four text lines of a light page.
        def page(x, y):
            return (22, 50, 71) if (y % 24) in (10, 11) and x % 3 == 0 else (237, 242, 245)
        out = self.measure(page)
        self.assertTrue(out['content'], out)
        self.assertGreaterEqual(out['text_rows'], 3)

    def test_blank_light_page_has_no_text(self):
        self.assertFalse(self.measure(lambda x, y: (237, 242, 245))['content'])

    def test_box_is_clipped_to_the_image(self):
        out = self.measure(lambda x, y: (0, 0, 0), box=(150, 100, 500, 500))
        self.assertEqual(out['box'], [150, 100, 50, 20])


if __name__ == '__main__':
    unittest.main()

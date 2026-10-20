# Pixel-path soak: PASS (memfd)

30 cycles over 10.0 min; test prefs: {"axiosozo.engines.linux.memfd_frames": true}; RSS growth (cycle 2 -> last): 234.0 MB; host fds: {"webkit": {"min": 38, "max": 38, "last": 38}, "chromium": {"min": 333, "max": 339, "last": 333}}

| Engine tab (median over cycles) | rAF fps | rAF p99 ms | rAF CPU % | parent CPU % | draw ms | scroll fps | scroll p99 ms | static nav->visible ms | key->frame ms | transport |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| webkit | 56.42 | 34.88 | 195.35 | 130.9 | 0.99 | 51.55 | 38.91 | 60.85 | 21.58 | memfd |
| chromium | 57.52 | 34.3 | 164.75 | 142.3 | 1.06 | 55.48 | 35.41 | 39.05 | 16.61 | memfd |
| gecko (in-page) | 58.99 | 17.13 | | | | | | | | |

Problems: none

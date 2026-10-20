# Pixel-path soak: FAIL (native)

30 cycles over 10.0 min; test prefs: {"axiosozo.engines.linux.memfd_frames": true}; RSS growth (cycle 2 -> last): 3.0 MB; host fds: {"webkit": {"min": 38, "max": 38, "last": 38}, "chromium": {"min": 335, "max": 368, "last": 335}}

| Engine tab (median over cycles) | rAF fps | rAF p99 ms | rAF CPU % | parent CPU % | draw ms | scroll fps | scroll p99 ms | static nav->visible ms | key->frame ms | transport |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| webkit | 56.71 | 30.57 | 201.0 | 125.85 | 0.01 | 55.7 | 35.25 | 59.65 | 19.41 | memfd native |
| chromium | 59.05 | 26.84 | 157.85 | 134.5 | 0.01 | 59.6 | 23.17 | 30.35 | 12.68 | memfd native |
| gecko (in-page) | 58.99 | 17.12 | | | | | | | | |

Problems: chromium host descriptors 335 -> 368

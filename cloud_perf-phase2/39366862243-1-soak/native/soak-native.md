# Pixel-path soak: PASS (native)

30 cycles over 10.0 min; test prefs: {"axiosozo.engines.linux.memfd_frames": true}; RSS growth (cycle 2 -> last): 41.7 MB; host fds: {"webkit": {"min": 38, "max": 38, "last": 38}, "chromium": {"min": 332, "max": 342, "last": 333}}

| Engine tab (median over cycles) | rAF fps | rAF p99 ms | rAF CPU % | parent CPU % | draw ms | scroll fps | scroll p99 ms | static nav->visible ms | key->frame ms | transport |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| webkit | 56.09 | 31.9 | 201.05 | 131.6 | 0.01 | 52.43 | 47.17 | 55.7 | 15.73 | memfd native |
| chromium | 59.95 | 20.73 | 164.9 | 143.0 | 0.01 | 59.83 | 24.2 | 27.65 | 10.95 | memfd native |
| gecko (in-page) | 58.99 | 17.12 | | | | | | | | |

Problems: none

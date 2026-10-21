# Pixel-path soak: PASS (native)

30 cycles over 10.0 min; test prefs: {"axiosozo.engines.linux.memfd_frames": true}; RSS growth (cycle 2 -> last): 58.0 MB; host fds: {"webkit": {"min": 38, "max": 38, "last": 38}, "chromium": {"min": 334, "max": 340, "last": 334}}

| Engine tab (median over cycles) | rAF fps | rAF p99 ms | rAF CPU % | parent CPU % | draw ms | scroll fps | scroll p99 ms | static nav->visible ms | key->frame ms | transport |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| webkit | 57.64 | 24.09 | 189.85 | 118.95 | 0.02 | 56.74 | 34.92 | 57.75 | 18.59 | memfd native |
| chromium | 59.92 | 23.84 | 155.55 | 133.85 | 0.01 | 59.28 | 27.44 | 37.95 | 12.88 | memfd native |
| gecko (in-page) | 59.0 | 17.17 | | | | | | | | |

Problems: none

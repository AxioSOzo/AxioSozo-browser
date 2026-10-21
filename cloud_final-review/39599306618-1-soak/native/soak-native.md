# Pixel-path soak: PASS (native)

30 cycles over 10.0 min; test prefs: {"axiosozo.engines.linux.memfd_frames": true}; RSS growth (cycle 2 -> last): 44.2 MB; host fds: {"webkit": {"min": 38, "max": 38, "last": 38}, "chromium": {"min": 334, "max": 339, "last": 334}}

| Engine tab (median over cycles) | rAF fps | rAF p99 ms | rAF CPU % | parent CPU % | draw ms | scroll fps | scroll p99 ms | static nav->visible ms | key->frame ms | transport |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| webkit | 57.34 | 25.35 | 184.5 | 113.0 | 0.02 | 55.81 | 35.71 | 58.8 | 18.83 | memfd native |
| chromium | 59.93 | 22.79 | 150.6 | 128.2 | 0.01 | 59.08 | 29.17 | 31.75 | 12.87 | memfd native |
| gecko (in-page) | 58.99 | 17.15 | | | | | | | | |

Problems: none

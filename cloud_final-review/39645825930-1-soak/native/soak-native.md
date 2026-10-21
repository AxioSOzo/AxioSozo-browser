# Pixel-path soak: PASS (native)

30 cycles over 10.0 min; test prefs: {"axiosozo.engines.linux.memfd_frames": true}; RSS growth (cycle 2 -> last): 119.2 MB; host fds: {"webkit": {"min": 38, "max": 38, "last": 38}, "chromium": {"min": 333, "max": 338, "last": 333}}

| Engine tab (median over cycles) | rAF fps | rAF p99 ms | rAF CPU % | parent CPU % | draw ms | scroll fps | scroll p99 ms | static nav->visible ms | key->frame ms | transport |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| webkit | 57.33 | 22.6 | 183.35 | 113.8 | 0.02 | 55.95 | 35.31 | 60.25 | 18.38 | memfd native |
| chromium | 59.94 | 21.05 | 148.75 | 128.0 | 0.01 | 59.01 | 29.83 | 32.15 | 12.71 | memfd native |
| gecko (in-page) | 58.99 | 17.14 | | | | | | | | |

Problems: none

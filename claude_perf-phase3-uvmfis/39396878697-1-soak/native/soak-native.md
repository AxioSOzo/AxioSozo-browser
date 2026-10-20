# Pixel-path soak: PASS (native)

30 cycles over 10.0 min; test prefs: {"axiosozo.engines.linux.memfd_frames": true}; RSS growth (cycle 2 -> last): 142.5 MB; host fds: {"webkit": {"min": 38, "max": 38, "last": 38}, "chromium": {"min": 334, "max": 340, "last": 334}}

| Engine tab (median over cycles) | rAF fps | rAF p99 ms | rAF CPU % | parent CPU % | draw ms | scroll fps | scroll p99 ms | static nav->visible ms | key->frame ms | transport |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| webkit | 57.66 | 22.8 | 185.5 | 113.5 | 0.02 | 56.06 | 35.17 | 58.25 | 18.94 | memfd native |
| chromium | 59.5 | 24.21 | 151.2 | 128.8 | 0.01 | 59.48 | 26.09 | 34.4 | 13.15 | memfd native |
| gecko (in-page) | 58.99 | 17.15 | | | | | | | | |

Problems: none

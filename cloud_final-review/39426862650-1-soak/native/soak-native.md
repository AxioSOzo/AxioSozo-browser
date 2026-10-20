# Pixel-path soak: PASS (native)

30 cycles over 10.0 min; test prefs: {"axiosozo.engines.linux.memfd_frames": true}; RSS growth (cycle 2 -> last): -4.7 MB; host fds: {"webkit": {"min": 38, "max": 38, "last": 38}, "chromium": {"min": 334, "max": 339, "last": 334}}

| Engine tab (median over cycles) | rAF fps | rAF p99 ms | rAF CPU % | parent CPU % | draw ms | scroll fps | scroll p99 ms | static nav->visible ms | key->frame ms | transport |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| webkit | 57.63 | 23.39 | 191.5 | 119.0 | 0.02 | 56.21 | 35.37 | 59.15 | 18.4 | memfd native |
| chromium | 59.94 | 21.49 | 156.7 | 133.75 | 0.01 | 59.74 | 25.43 | 37.4 | 12.98 | memfd native |
| gecko (in-page) | 58.99 | 17.18 | | | | | | | | |

Problems: none

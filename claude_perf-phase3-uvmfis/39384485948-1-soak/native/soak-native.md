# Pixel-path soak: PASS (native)

30 cycles over 10.0 min; test prefs: {"axiosozo.engines.linux.memfd_frames": true}; RSS growth (cycle 2 -> last): 27.0 MB; host fds: {"webkit": {"min": 38, "max": 38, "last": 38}, "chromium": {"min": 334, "max": 339, "last": 334}}

| Engine tab (median over cycles) | rAF fps | rAF p99 ms | rAF CPU % | parent CPU % | draw ms | scroll fps | scroll p99 ms | static nav->visible ms | key->frame ms | transport |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| webkit | 56.42 | 30.24 | 184.85 | 126.5 | 0.01 | 53.72 | 38.34 | 56.6 | 17.13 | memfd native |
| chromium | 58.38 | 26.19 | 150.45 | 133.3 | 0.01 | 57.99 | 35.76 | 25.55 | 10.98 | memfd native |
| gecko (in-page) | 58.99 | 17.1 | | | | | | | | |

Problems: none

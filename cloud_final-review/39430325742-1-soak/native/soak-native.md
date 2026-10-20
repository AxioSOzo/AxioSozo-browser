# Pixel-path soak: PASS (native)

5 cycles over 10.0 min; test prefs: {"axiosozo.engines.linux.memfd_frames": true}; RSS growth (cycle 2 -> last): 7.5 MB; host fds: {"webkit": {"min": 38, "max": 38, "last": 38}, "chromium": {"min": 331, "max": 334, "last": 331}}

| Engine tab (median over cycles) | rAF fps | rAF p99 ms | rAF CPU % | parent CPU % | draw ms | scroll fps | scroll p99 ms | static nav->visible ms | key->frame ms | transport |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| webkit | 57.91 | 24.77 | 203.7 | 113.9 | 0.02 | 55.09 | 35.4 | 53.0 | 20.29 | memfd native |
| chromium | 59.62 | 21.3 | 157.3 | 131.0 | 0.01 | 59.46 | 25.41 | 30.1 | 13.09 | memfd native |
| gecko (in-page) | 58.99 | 17.16 | | | | | | | | |

Problems: none

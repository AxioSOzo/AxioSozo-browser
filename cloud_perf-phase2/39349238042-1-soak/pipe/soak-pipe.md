# Pixel-path soak: PASS (pipe)

13 cycles over 4.0 min; test prefs: {"axiosozo.engines.linux.memfd_frames": false}; RSS growth (cycle 2 -> last): -96.1 MB; host fds: {"webkit": {"min": 37, "max": 37, "last": 37}, "chromium": {"min": 335, "max": 338, "last": 335}}

| Engine tab (median over cycles) | rAF fps | rAF p99 ms | rAF CPU % | parent CPU % | draw ms | scroll fps | scroll p99 ms | static nav->visible ms | key->frame ms | transport |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| webkit | 56.72 | 35.23 | 200.6 | 133.4 | 0.97 | 48.04 | 53.34 | 64.4 | 20.46 | pipe |
| chromium | 58.35 | 33.33 | 169.3 | 146.0 | 1.05 | 50.91 | 42.32 | 44.6 | 15.84 | pipe |
| gecko (in-page) | 59.0 | 17.12 | | | | | | | | |

Problems: none

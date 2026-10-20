# Pixel-path soak: PASS (cand)

30 cycles over 10.0 min; test prefs: {"axiosozo.engines.linux.memfd_frames": true}; RSS growth (cycle 2 -> last): -2.8 MB; host fds: {"webkit": {"min": 38, "max": 38, "last": 38}, "chromium": {"min": 333, "max": 340, "last": 333}}

| Engine tab (median over cycles) | rAF fps | rAF p99 ms | rAF CPU % | parent CPU % | draw ms | scroll fps | scroll p99 ms | static nav->visible ms | key->frame ms | transport |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| webkit | 57.77 | 23.43 | 225.4 | 149.9 | 2.98 | 55.95 | 35.82 | 63.65 | 21.05 | memfd worker |
| chromium | 59.98 | 21.41 | 169.1 | 143.5 | 1.67 | 58.95 | 31.01 | 40.25 | 12.85 | memfd worker |
| gecko (in-page) | 58.99 | 17.16 | | | | | | | | |

Problems: none

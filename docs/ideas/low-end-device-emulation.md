# Idea (later): low-end device emulation for humans and agents

Status: parked idea, 14 October 2026. Not scheduled, nothing implemented.
Needs integration-lead sign-off (new contract, agent-bridge surface) before work
starts. Owners when picked up: Zen (Gecko patch, UI), CEF (Chromium side),
integration lead (contract, agent tools, reports).

## The idea

A developer on an M4 MacBook with plenty of RAM should be able to ask: "what does
this page feel like on a cheap laptop from a few years ago?" They or an agent pick
a device profile for a tab, such as 2 slow cores, 4 GB RAM, weak GPU and a slow
network. The browser then makes the tab behave as closely to that device as the
host allows. It reports what broke: long tasks, janky frames, slow first paint
and memory over budget.

Second half of the idea: sites, including our own, should adapt to the device
they run on. Light, standard and rich component tiers would be chosen from both
specifications and the live load on the machine. The emulation is what makes
that adaptation testable.

## Honest framing

Emulation is directional, not a device. An M4 slowed down is still an M4: different
cache sizes, memory bandwidth, branch predictor, JIT target (ARM vs x86), GPU,
storage, OS, fonts and drivers. We can make a page *proportionally* slower and
*budget* its memory. We cannot reproduce a specific Celeron laptop. Every result
must be labelled `emulated` and never presented as a measurement on real
hardware. This follows the evidence rules in `AGENTS.md`.

## What is technically feasible (macOS host)

Quick probes on this M4 (4 performance + 6 efficiency cores) on 14 October 2026.
Load average was about 13, so the timings are **unverified and noisy**:

| Probe | Result |
| --- | --- |
| Single-thread Python loop, default | ~1.7–1.8 s |
| Same, `taskpolicy -c utility` | ~4.4 s (~2.5× slower) |
| Same, `taskpolicy -c background` | ~10.4 s (~6× slower) |
| `taskpolicy -m 100` (memory limit 100 MiB), allocate 600 MiB | **Not enforced**: allocation succeeded, exit normal. Same with `-P throttle` |

### CPU

| Lever | Feasible? | Notes |
| --- | --- | --- |
| Change clock speed | **No** | No user-space DVFS control on Apple Silicon. Low Power Mode (`pmset`) is system-wide, needs admin and slows everything, including the developer's tools. Possible manual option only. |
| Limit number of cores | **Partly** | macOS has no cgroups and no hard CPU affinity (affinity is a hint and is ignored on Apple Silicon). We *can* report fewer cores to the page (`navigator.hardwareConcurrency`; Gecko already has `dom.maxHardwareConcurrency`) and cap our own worker or thread pools. |
| Pin a tab's process to efficiency cores | **Yes, coarse** | `setpriority(PRIO_DARWIN_PROCESS, pid, PRIO_DARWIN_BG)` / QoS clamp on that tab's content or renderer process. Real slowdown (probe: 2.5–6×), but it depends on system load, also throttles disk I/O and cannot be tuned to a target. Good as a "slow tier" preset, not as a calibrated profile. |
| Main-thread slowdown factor (Chromium) | **Yes** | CDP `Emulation.setCPUThrottlingRate`, reachable from CEF via `CefBrowserHost::ExecuteDevToolsMethod`. Per tab, tunable (2×, 4×, 6×…). Mainly the page's main thread; verify how it treats workers, raster and GPU. |
| Main-thread slowdown factor (Gecko) | **Needs a Gecko patch** | Firefox DevTools has no CPU throttling. Proposed approach: in a throttled content process, after each main-thread task, sleep `(factor − 1) × task duration`, so every task takes N× as long. Optional extension to DOM workers. Requires the test tab to get its own content process (see open questions). |
| SIGSTOP/SIGCONT duty cycling (`cpulimit` style) | Possible, **not recommended** | Very jittery and breaks frame timing and IPC timeouts. |

### Memory

| Lever | Feasible? | Notes |
| --- | --- | --- |
| Hard RAM cap per process on macOS | **No (as a normal app)** | `setrlimit` is not reliable on Darwin. The probe above shows `taskpolicy -m` is not enforced for an ordinary process. Jetsam limits are private API or need root. Do not build on them. |
| In-engine budgets | **Yes** | Gecko: JS heap max (`javascript.options.mem.max`), smaller image and media caches, bfcache off, fewer content processes. Chromium: V8 `--max-old-space-size` via `--js-flags`, but that is process-global in CEF, not per tab. |
| Simulated memory pressure | **Yes** | Gecko `memory-pressure` notification (what about:memory "Minimize memory usage" uses). Chromium CDP `Memory.simulatePressureNotification`. Shows whether a page survives cache eviction, discarded tabs and so on. |
| Budget reporting | **Yes, most useful** | Measure the footprint of the tab's processes and compare it with the profile budget. Example: "a 4 GB device leaves roughly X for this tab; you peaked at Y". Report instead of enforcing. The X per profile needs research, not guesses. |

### GPU, network, display

- **GPU:** we cannot slow the GPU. We *can* disable hardware acceleration and WebGL, or force software rendering (Gecko `gfx.webrender.software`; Chromium SwiftShader or `--disable-gpu`, global per CEF launch). That roughly approximates a weak or integrated GPU.
- **Network:** both engines already have throttling (Firefox DevTools presets; CDP `Network.emulateNetworkConditions`). Cheap devices often have bad networks too, so profiles should bundle both.
- **Display:** viewport, DPR and `prefers-reduced-motion` from responsive design mode or CDP.

### The strong option: a VM device lab

For real hard limits, run the page in a VM. Virtualization.framework sets an exact
vCPU count and memory size. A Linux guest adds cgroups v2 (`cpu.max` for a CPU
quota, `cpuset.cpus`, `memory.max` for a real OOM at 4 GB). This is the only way to
actually test "random Linux machine with 4 GB". It also gives real Linux fonts,
GPU paths and the page cache. Cost: VM images, a Linux build or stock
Firefox/Chromium in the guest, automation into the guest, and storage on
`/Volumes/DevStorage` per the storage rules. Later tier, not first.

## Proposed design

### Device profiles

A small contract, e.g. `contracts/device-profile-v1.schema.json` (integration lead
owns contracts):

```jsonc
{
  "id": "budget-laptop-2019",
  "label": "Budget laptop (≈2019)",
  "cpu": { "logicalCores": 4, "slowdown": "calibrated", "targetScore": null },
  "memory": { "deviceGiB": 4, "tabBudgetMiB": null },
  "gpu": { "mode": "software" },
  "network": { "preset": "slow-4g" },
  "signals": { "hardwareConcurrency": 4, "deviceMemory": 4, "saveData": false }
}
```

Presets (desktop and mobile classes): current mid-range, budget laptop, old
low-end Android, Chromebook-class. Fill in `targetScore` and `tabBudgetMiB` from
published benchmark data, not invented numbers.

### Calibration

A fixed slowdown factor means different things on different hosts and under
different load. Lighthouse solves this with a benchmark index; we should do the
same:

1. Run a short, offline, pinned benchmark fixture (no network) in the tab.
2. Compare it with the profile's `targetScore`.
3. Pick the slowdown factor that gets closest, and re-check if host load changes a lot.

Store the factor in the report so a result is reproducible.

### Scope: per tab, not per machine

Only the tab under test is slowed down. The browser UI, devtools and the agent stay
fast. Testing *our own browser UI* on a slow machine is a separate use case: launch
a second instance under a QoS clamp, or use the VM lab.

### Consistent signals

Inside an emulated tab, every hint a site can read should agree with the profile:
`hardwareConcurrency`, `deviceMemory` / `Device-Memory` client hint,
`navigator.connection`, `Save-Data`, and Compute Pressure state where the engine
supports it. Otherwise adaptive code takes the "fast device" path while the page
is actually slowed down.

Privacy: Gecko intentionally does not ship `deviceMemory`, the Network Information
API or Compute Pressure (fingerprinting). Expose any spoofed or extra signals in
**emulation tabs only**. Normal browsing in Gecko stays unchanged.

### Human UI (keep Zen calm)

- A "Device" entry in the developer menu or tab context menu: pick a profile per tab.
- While a profile is active, show a small badge on the tab/URL bar (like the
  non-default engine badge in `multi-engine-lineup.md`). Click it for live meters:
  main-thread busy %, long animation frames, memory against budget.
- One click back to "This Mac".

### Agent interface

Through `packages/agent-bridge`, roughly:

- `device.listProfiles()`
- `device.apply(tabId, profileId)` → returns the calibration result
- `device.runScenario(tabId, scenario)` → load, interactions, idle
- `device.report(tabId)` → LCP, INP, long tasks / LoAF, dropped frames, peak
  memory against budget, slowdown factor used, host load at run time, and
  `"emulated": true`

Agents can then do "build feature → check on budget-laptop profile → fix the long
task" without a human. A run during high host load is marked unverified, matching
the shared-Mac rules.

## Adaptive apps (the second half)

Pattern for sites, including the AxioSozo website and our own UI:

- **Tiers, not forks:** light, standard and rich versions of heavy components
  (3D/WebGL hero, big animations, large client-side editors, heavy charts). Tiers
  change richness, never functionality.
- **Start light, upgrade:** pick the initial tier from cheap hints (cores, device
  memory, Save-Data, reduced motion). Upgrade after first paint only if live
  signals look healthy.
- **Live signals:** Compute Pressure (`PressureObserver`, Chromium), long
  animation frames / long tasks, measured frame rate, slow interactions. Downgrade
  with hysteresis, so tiers don't flip-flop.
- **User override:** a visible "lighter experience" option always wins.

The browser's job here: make those signals emulatable and consistent (above). It
could also show a **tier inspector** listing which hints the page read and which
tier it chose, so a developer can see the adaptation working under each profile.

## Phases (if picked up)

1. Profiles contract, consistent signals, network presets, GPU-off toggle. Cheap,
   both engines, no Gecko core patch.
2. Chromium tab CPU slowdown via CEF/CDP; Gecko main-thread slowdown patch;
   offline calibration fixture; agent `apply/report`.
3. Memory: budgets, pressure simulation, budget reports. Optional QoS-clamp "slow
   tier" per tab process.
4. VM device lab (Linux guest, cgroups) for hard CPU and RAM limits.
5. Tier inspector and adaptive-component guidance for our own products.

## Open questions

- Gecko process isolation: can a test tab reliably get its own content process
  (Fission shares same-site processes), so slowdown and QoS clamps don't leak into
  other tabs?
- Does CDP CPU throttling slow workers and raster? Should the Gecko patch match
  that behaviour exactly, so both engines are comparable?
- Which public benchmark data do we trust for preset targets (Speedometer,
  Geekbench single-core)? It must be data we can cite.
- Per-tab V8 heap limits are not possible in one CEF instance. Accept a global
  flag in emulation sessions, or start a separate CEF instance?
- VM lab: stock Firefox/Chromium in the guest, or a Linux build of our browser?
  Which automation channel (WebDriver BiDi)?
- Real-device spot checks: a cheap reference laptop on the desk? Cloud device
  farms are an external provider and need separate authorization.

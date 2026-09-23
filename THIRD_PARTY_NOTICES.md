# Third-party notices

Zen/Firefox source and the chrome modifications carry MPL-2.0 notices. The complete
upstream license remains in the pinned Zen checkout; maintain it with all covered
source when redistributing. T3-derived TypeScript includes the original MIT notice
at `packages/provider-host/vendor/t3/LICENSE` and exact provenance in
`docs/provider-provenance.json`.

The CEF binary package contains its BSD notice and Chromium third-party notices.
They must remain with the framework/helper bundles. See
`native/chromium-host` for any locally retained API-wrapper notices and checksum
provenance. Do not infer third-party license coverage from this summary alone.

Rust dependencies are version/checksum locked in Cargo.lock; retain their published
license notices before any binary distribution. No Helium source was imported.
The source repository is public under MPL-2.0 for original AxioSozo code.
Upstream files are not relicensed, and no binary release or commercial agreement
acceptance was performed in this development handoff.

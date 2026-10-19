#!/bin/bash
# Builds the macOS WKWebView engine host (system WebKit; nothing is downloaded).
#   native/webkit-host/mac/build.sh [output-dir]     default: $AXIOSOZO_BUILD_ROOT/webkit
# Zen expects it at <build root>/webkit/AxioWebKitMacHost (WebKitEngineAdapter.webkitBinaryPath).
# The binary is ad-hoc signed; WebKit's own XPC services keep Apple's sandbox.
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
out="${1:-${AXIOSOZO_BUILD_ROOT:?set AXIOSOZO_BUILD_ROOT or pass an output directory}/webkit}"
[ "$(uname -s)" = Darwin ] || { echo "BLOCKED_ENV: the WKWebView host builds on macOS only" >&2; exit 2; }
[ "$(uname -m)" = arm64 ] || { echo "BLOCKED_ENV: the WKWebView host is built and tested for Apple silicon only" >&2; exit 2; }
mkdir -p "$out"
xcrun clang++ -std=c++20 -fobjc-arc -O2 -g -arch arm64 -mmacosx-version-min=14.5 -Wall -Wextra -Wno-unused-parameter \
  "$here/host_mac.mm" "$here/surface_host.mm" -o "$out/AxioWebKitMacHost" \
  -framework Cocoa -framework WebKit -framework IOSurface -framework CoreGraphics -lbsm
codesign --force --sign - "$out/AxioWebKitMacHost"
echo "{\"component\":\"webkit-mac-host\",\"status\":\"PASS\",\"binary\":\"$out/AxioWebKitMacHost\"}"

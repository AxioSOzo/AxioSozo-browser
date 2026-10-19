#!/usr/bin/env python3
"""The Ubuntu 24.04 (noble) packages each Linux task needs; one source of truth
for docs/LINUX.md and .github/workflows/. Prints names only; installs nothing.

    sudo apt-get install -y --no-install-recommends $(python3 scripts/linux_packages.py build gui)
"""
import sys

GROUPS = {
    # ./dev check and ./dev test (coordinator, Node/Python suites, provider
    # host native fixtures: Secret Service helper and bubblewrap launcher).
    'test': ['build-essential', 'pkg-config', 'git', 'curl', 'xz-utils', 'libsecret-1-dev', 'bubblewrap',
             'dbus', 'gnome-keyring', 'openssl', 'procps'],
    # Zen/Firefox from source (scripts/zen.py setup) with system clang/lld.
    # Firefox 156 needs clang/LLVM >= 19; noble's default clang is 18, so the
    # versioned LLVM 19 packages are used (scripts/zen_toolchain.linux_llvm).
    'build': ['build-essential', 'clang-19', 'lld-19', 'llvm-19', 'libclang-19-dev', 'nasm', 'm4', 'unzip', 'zip', 'xz-utils',
              'pkg-config', 'curl', 'git', 'patch', 'libgtk-3-dev', 'libx11-xcb-dev', 'libxt-dev', 'libdbus-1-dev',
              'libdbus-glib-1-dev', 'libpulse-dev', 'libasound2-dev', 'libdrm-dev', 'libxkbcommon-dev',
              'libxrandr-dev', 'libxcomposite-dev', 'libxdamage-dev', 'libxfixes-dev', 'libxcursor-dev',
              'libxi-dev', 'libxss-dev', 'libcurl4-openssl-dev', 'libfontconfig-dev', 'libfreetype-dev'],
    # ./dev gui-test: Xvfb display, X11 inspection and input, screenshots,
    # a private D-Bus bus, fonts, and the runtime libraries of the packaged app.
    'gui': ['xvfb', 'xauth', 'xdotool', 'x11-utils', 'x11-apps', 'dbus', 'fonts-dejavu-core', 'fonts-liberation',
            'libgtk-3-0t64', 'libdbus-glib-1-2', 'libasound2t64', 'libx11-xcb1', 'libxtst6', 'libpci3',
            'libegl1', 'libgl1', 'libgbm1'],
}


def main(argv):
    groups = argv or ['test']
    unknown = [name for name in groups if name not in GROUPS]
    if unknown:
        print('unknown group(s): ' + ', '.join(unknown) + '; choose from ' + ', '.join(GROUPS), file=sys.stderr)
        return 64
    seen = []
    for group in groups:
        seen += [name for name in GROUPS[group] if name not in seen]
    print(' '.join(seen))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))

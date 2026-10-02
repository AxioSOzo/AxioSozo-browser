"""Owned test launcher which places an inherited sentinel pipe on FD3."""
import os
import sys

sentinel = int(sys.argv[1])
os.dup2(sentinel, 3)
if sentinel != 3:
    os.close(sentinel)
os.set_inheritable(3, True)
os.execv(sys.executable, [sys.executable, "-I", "-S", "-B", sys.argv[2], *sys.argv[3:]])

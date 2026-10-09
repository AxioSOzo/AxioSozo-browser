# Try the Lab

```sh
cd /Volumes/T9/axiosozo/.local/worktrees/browser-ux-overnight
./dev
```

The app is already built for this branch (`ux/lab`). It runs next to your
normal AxioSozo Dev, with the same name and icon; this one has a **Lab** tab
in about:axiosozo.

1. about:axiosozo → **Lab**. Press **Check again** to see your assistants.
2. Turn on, for the full loop: *What's wrong here: it looks right away*,
   *Start the task here*, *Agents on the project rows*, *To verify*,
   *Today strip*, *Errands*.
3. Open a page of one of your projects (add one under Projects if needed).
   Hold the right mouse button and drag over something that looks wrong (on
   a trackpad: hold Control, press and drag).
4. Pick a proposal (or type a task), press Return. Watch the bar, then the
   project's tab ("To verify"): Reload, check, Looks right.
5. Try the other halves of each family; they switch over without a restart.

Agent tasks really edit your project folder (only files; your own git shows
everything). Each one-shot answer costs about a tenth of a cent; an agent
task a few cents.

To throw it away: delete the branch `ux/lab` (and `ux/overnight-zen-agent`),
remove the worktree folder above, and remove `/Volumes/AxioSozoBuild/ux-overnight`.

#!/bin/bash
# Publish $SRC to the ci-results branch (same layout as .github/actions/publish-ci-results,
# which needs GNU cp --parents and so fails on macOS runners).
set -euo pipefail
[ -d "$SRC" ] || exit 0
work="$(mktemp -d)"; dest="${REF//\//_}/${RUN}-${NAME}"
git -C "$work" init -q
git -C "$work" remote add origin "https://x-access-token:${TOKEN}@github.com/${REPO}.git"
git -C "$work" config user.name "github-actions[bot]"
git -C "$work" config user.email "41898282+github-actions[bot]@users.noreply.github.com"
if git -C "$work" fetch -q --depth 1 origin ci-results 2>/dev/null; then git -C "$work" checkout -q -B ci-results FETCH_HEAD
else git -C "$work" checkout -q --orphan ci-results; fi
mkdir -p "$work/$dest"
(cd "$SRC" && find . -type f -size -5120k -print0 | tar --null -cf - -T - | tar -xf - -C "$work/$dest/")
printf '{"ref":"%s","sha":"%s","run":"%s","job":"%s","published_at":"%s"}\n' "$REF" "$SHA" "$RUN" "$NAME" "$(date -u +%FT%TZ)" > "$work/$dest/_run.json"
git -C "$work" add -A -- "$dest"
git -C "$work" commit -qm "ci-results: $dest"
for attempt in 1 2 3 4 5 6; do
  if git -C "$work" push -q origin HEAD:ci-results; then echo "published ci-results:$dest"; exit 0; fi
  sleep $((attempt * 4)); git -C "$work" fetch -q --depth 1 origin ci-results; git -C "$work" rebase -q FETCH_HEAD
done
exit 1

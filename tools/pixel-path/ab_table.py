#!/usr/bin/env python3
"""Same-job A/B table for the pixel path (docs/perf/pixel-path.md).

usage: ab_table.py RESULTS_DIR [--out ab.md] [--json ab.json]

RESULTS_DIR holds one folder per bench run, named `<variant>-r<round>-<scale>x` (variant =
base | cand), each with a zen-bench-<label>.json (tools/engine-bench/zen_bench.py). Base and
candidate ran in the same job on the same machine, alternating per round, so their ratio is
the measurement; cross-run numbers are not (docs/PERFORMANCE.md "Machines and bias").
"""
import argparse
import json
from pathlib import Path
import re

METRICS = [
    ('raf.window.fps', 'rAF page: presented fps', +1),
    ('raf.window.interval_p99_ms', 'rAF page: frame interval p99 (ms)', -1),
    ('raf.window.long_intervals_share', 'rAF page: intervals > 25 ms (share)', -1),
    ('raf.window.usage.cpu_percent', 'rAF page: CPU, whole browser (%)', -1),
    ('raf.window.presenter.meanDrawMilliseconds', 'presenter draw per frame (ms)', -1),
    ('raf.window.presenter.uploadedPixelShare', 'presenter uploaded pixel share', -1),
    ('scroll.window.fps', 'wheel scroll: fps (rep 1 windows valid, see PERFORMANCE.md)', +1),
    ('scroll.window.usage.cpu_percent', 'wheel scroll: CPU (%)', -1),
    ('key.keydown_to_presented_frame_ms.median', 'key -> presented frame (ms)', -1),
    ('switch.gecko_to_engine_switch_ms', 'Gecko -> engine switch (ms)', -1),
    ('static.timing.navigate_to_visible_ms', 'static page: navigate -> visible (ms)', -1),
    ('memory_all_processes.rss_mb', 'RSS, whole browser (MB)', -1),
]
NAME = re.compile(r'^(base|cand|memfd)-r(\d+)-([0-9.]+)x$')


def load(directory):
    runs = {}
    for folder in sorted(Path(directory).iterdir()):
        match = NAME.match(folder.name)
        if not match or not folder.is_dir():
            continue
        files = sorted(folder.glob('zen-bench-*.json'))
        if not files:
            continue
        data = json.loads(files[0].read_text())
        runs[(match[1], int(match[2]), match[3])] = data
    return runs


def median(data, key):
    value = data.get('summary', {}).get(key)
    return value.get('median') if isinstance(value, dict) else None


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('results')
    parser.add_argument('--out')
    parser.add_argument('--json')
    args = parser.parse_args()
    runs = load(args.results)
    scales = sorted({scale for _, _, scale in runs}, key=float)
    rounds = sorted({r for _, r, _ in runs})
    lines, table = [], {}
    engine = next((d.get('label') for d in runs.values()), '?')
    cpu = sorted({(d.get('machine') or {}).get('cpu_model') for d in runs.values()} - {None})
    lines.append(f'# Pixel-path A/B in one job: {engine} tabs in Zen')
    lines.append('')
    lines.append(f'CPU: {", ".join(cpu) or "?"}. base = cloud/integration chrome JS + host, cand = this branch, '
                 f'memfd = this branch with the EXPERIMENTAL memfd frame pref (TEST-ONLY); rounds alternate. '
                 f'Medians over repetitions; Δ = variant/base − 1.')
    lines.append('')
    for scale in scales:
        lines.append(f'## {scale}×')
        lines.append('')
        variants = [v for v in ('cand', 'memfd') if any((v, r, scale) in runs for r in rounds)]
        header = '| Metric | ' + ' | '.join(f'base r{r} | ' + ' | '.join(f'{v} r{r} | Δ{v} r{r}' for v in variants) for r in rounds) + ' |'
        lines += [header, '|' + ' --- |' * (1 + (1 + 2 * len(variants)) * len(rounds))]
        for key, label, sign in METRICS:
            cells, row = [], {}
            for r in rounds:
                base = runs.get(('base', r, scale))
                b = median(base, key) if base else None
                row[f'r{r}'] = dict(base=b)
                cells.append(f'{b}' if b is not None else '—')
                for v in variants:
                    run = runs.get((v, r, scale))
                    c = median(run, key) if run else None
                    delta = (c / b - 1) if (b and c is not None) else None
                    row[f'r{r}'][v] = c
                    row[f'r{r}'][f'delta_{v}'] = None if delta is None else round(delta, 4)
                    mark = ''
                    if delta is not None and abs(delta) >= 0.05:
                        mark = ' ✅' if delta * sign > 0 else ' ⚠️'
                    cells += [f'{c}' if c is not None else '—', f'{delta:+.1%}{mark}' if delta is not None else '—']
            if any(value is not None for v in row.values() for k, value in v.items() if not k.startswith('delta')):
                table.setdefault(scale, {})[key] = row
                lines.append(f'| {label} | ' + ' | '.join(cells) + ' |')
        statuses = {f'{v}-r{r}': runs[(v, r, scale)].get('status') for v, r, s in sorted(runs) if s == scale}
        lines += ['', 'Status: ' + ', '.join(f'{k} {v}' for k, v in statuses.items()), '']
    text = '\n'.join(lines) + '\n'
    if args.out:
        Path(args.out).write_text(text)
    if args.json:
        Path(args.json).write_text(json.dumps(dict(engine=engine, cpu=cpu, table=table), indent=1) + '\n')
    print(text)


if __name__ == '__main__':
    main()

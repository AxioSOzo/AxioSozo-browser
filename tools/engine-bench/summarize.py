#!/usr/bin/env python3
"""Summarize engine-bench results (bench-*.json, presenter-*.json) into one markdown table + JSON.

usage: summarize.py --out summary.md [--json summary.json] [--run-id ID] FILE_OR_DIR...
Values are the median over repetitions, with p95 (nearest rank) in brackets; input
latencies are pooled over every sample of every repetition.
"""
import argparse
import json
from pathlib import Path


def find(paths):
    files = []
    for path in map(Path, paths):
        files += sorted(path.rglob('*.json')) if path.is_dir() else [path]
    return files


def fmt(entry, unit='', digits=1):
    if not entry or not entry.get('n'):
        return '—'
    m, p = entry.get('median'), entry.get('p95')
    if m is None:
        return '—'
    text = f'{m:.{digits}f}{unit}'
    if p is not None and entry['n'] > 1 and round(p, digits) != round(m, digits):
        text += f' [{p:.{digits}f}]'
    return text


ROWS = [
    ('Spawn → ready', 'spawn_to_ready_ms', ' ms', 0),
    ('Create → first frame (1×)', 'create.create_to_first_frame_ms', ' ms', 0),
    ('Create → painted frame (1×)', 'create.create_to_painted_frame_ms', ' ms', 0),
    ('Navigate → painted frame (static, 1×)', 'navigation.navigate_to_painted_frame_ms', ' ms', 0),
    ('Idle frames/s (static page)', 'static_idle.idle_fps', '', 2),
    ('Processes after create', 'after_create_usage.processes', '', 0),
    ('RSS after create (host+helpers)', 'after_create_usage.rss_mb', ' MB', 0),
    ('PSS after create (host+helpers)', 'after_create_usage.pss_mb', ' MB', 0),
    ('Close → host exit', 'teardown.close_to_exit_ms', ' ms', 0),
    ('Close → no helper left', 'teardown.close_to_no_helpers_ms', ' ms', 0),
]
SCALE_ROWS = [
    ('rAF fps', 'raf.fps', '', 1), ('rAF frame interval median', 'raf.interval_ms.median', ' ms', 1),
    ('rAF frame interval p99', 'raf.interval_p99_ms', ' ms', 1), ('rAF intervals > 25 ms', 'raf.long_intervals_share', '', 3),
    ('rAF pipe throughput', 'raf.pipe_mb_s', ' MB/s', 0), ('rAF bytes/frame', 'raf.bytes_per_frame', ' B', 0),
    ('rAF client read time/frame', 'raf.read_ms.median', ' ms', 2),
    ('rAF changed-row band (share of frame)', 'raf.changed_row_band_share.median', '', 3),
    ('rAF host damage share (damage run)', 'raf.damage_bytes_share', '', 3),
    ('rAF CPU host+helpers', 'raf.usage.cpu_percent', ' %', 0), ('rAF RSS host+helpers', 'raf.usage.rss_mb', ' MB', 0),
    ('Scroll fps (wheel 60 Hz)', 'scroll.fps', '', 1), ('Scroll frame interval p99', 'scroll.interval_p99_ms', ' ms', 1),
    ('Scroll pipe throughput', 'scroll.pipe_mb_s', ' MB/s', 0), ('Scroll CPU host+helpers', 'scroll.usage.cpu_percent', ' %', 0),
    ('Scroll host damage share (damage run)', 'scroll.damage_bytes_share', '', 3),
    ('Image page scroll fps', 'image_scroll.fps', '', 1), ('DOM page scroll fps', 'dom_scroll.fps', '', 1),
    ('Key → changed frame (pooled)', 'key.pooled_latency_ms', ' ms', 1),
    ('Key → title event (median of reps)', 'key.title_latency_ms.median', ' ms', 1),
    ('Wheel → changed frame (pooled)', 'wheel.pooled_latency_ms', ' ms', 1),
    ('Image page navigate → painted', 'image.navigate_to_painted_frame_ms', ' ms', 0),
    ('DOM page navigate → painted', 'dom.navigate_to_painted_frame_ms', ' ms', 0),
    ('Resize → frame at new size', 'resize_to_frame_ms', ' ms', 0),
]
PIPE_ROWS = [('rAF fps, 1 MiB pipe', 'pipe_1mib.raf.fps', '', 1), ('rAF client read/frame, 1 MiB pipe', 'pipe_1mib.raf.read_ms.median', ' ms', 2),
             ('Scroll fps, 1 MiB pipe', 'pipe_1mib.scroll.fps', '', 1), ('Scroll CPU, 1 MiB pipe', 'pipe_1mib.scroll.usage.cpu_percent', ' %', 0)]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('paths', nargs='+')
    parser.add_argument('--out', required=True)
    parser.add_argument('--json')
    parser.add_argument('--run-id', default='')
    args = parser.parse_args()
    benches, presenters, zens = {}, [], []
    for path in find(args.paths):
        try:
            data = json.loads(path.read_text())
        except (ValueError, OSError):
            continue
        if data.get('schema') == 'axiosozo-engine-bench-v1':
            args = data.get('args', {})
            key = data['engine'] + ('+damage' if args.get('frame_damage') else '') + \
                ('+payload' if args.get('frame_damage') and args.get('damage_payload') else '')
            benches[key] = data
        elif str(data.get('schema', '')).startswith('axiosozo-presenter-'):
            presenters.append(data)
        elif data.get('schema') == 'axiosozo-zen-bench-v1':
            zens.append(data)
    columns = sorted(benches)
    lines = [f'# Engine bench summary{" — run " + args.run_id if args.run_id else ""}', '',
             'Component benchmark over the AXCF pipe (tools/engine-bench). Median over repetitions, [p95]. '
             'Never Zen E1/E2 evidence. GitHub-hosted runners have no GPU: every engine renders in software.', '']
    for name in columns:
        d = benches[name]
        m = d.get('machine', {})
        ready = d.get('ready') or {}
        version = ready.get('webkit') or ready.get('chromium') or ready.get('cef') or '?'
        lines.append(f'- **{name}**: status {d["status"]} ({d.get("passed_repetitions")}/{d["args"]["reps"]} reps), '
                     f'engine {version}, render_path {ready.get("render_path")}, {m.get("cpu_model")} × {m.get("nproc")}, '
                     f'{m.get("mem_total_mb")} MB, {m.get("os")}, GPU nodes {m.get("gpu_dri") or "none"}'
                     + (f' — error: {d["error"]}' if d.get('error') else ''))
    if columns:
        header = '| Metric | ' + ' | '.join(columns) + ' |'
        rule = '| --- |' + ' --- |' * len(columns)
        lines += ['', header, rule]
        for label, key, unit, digits in ROWS:
            lines.append(f'| {label} | ' + ' | '.join(fmt(benches[c].get('summary', {}).get(key), unit, digits) for c in columns) + ' |')
        scales = sorted({s for c in columns for s in benches[c]['args'].get('scales', [])})
        for scale in scales:
            lines.append(f'| **{scale:g}× (900×650 CSS px → {int(900 * scale)}×{int(650 * scale)} px)** |' + ' |' * len(columns))
            for label, key, unit, digits in SCALE_ROWS:
                full = f'scales.{scale:g}x.{key}'
                lines.append(f'| {label} | ' + ' | '.join(fmt(benches[c].get('summary', {}).get(full), unit, digits) for c in columns) + ' |')
        if any(benches[c].get('args', {}).get('pipe_experiment') for c in columns):
            lines.append('| **A/B: stdout pipe enlarged to 1 MiB (2×)** |' + ' |' * len(columns))
            for label, key, unit, digits in PIPE_ROWS:
                lines.append(f'| {label} | ' + ' | '.join(fmt(benches[c].get('summary', {}).get(key), unit, digits) for c in columns) + ' |')
    for p in presenters:
        lines += ['', f'## Presenter pixel path — {p.get("browser") or p.get("engine")} {p.get("browser_version", "")}'.rstrip(), '',
                  f'Status {p.get("status", "PASS")}; ms per frame, median [p95]; source `{p.get("source")}`'
                  + (f'; WebGL renderer: {p["results"][0].get("webgl_renderer")}' if p.get('results') and 'webgl_renderer' in p['results'][0] else ''), '']
        results = p.get('results') or []
        keys = [k for k in (results[0] if results else {}) if k.endswith('_ms')]
        if results:
            lines.append('| Step | ' + ' | '.join(f'{r["width"]}×{r["height"]}' + (f' ({int(r["translucent_share"] * 100)}% translucent)'
                                                          if r.get('translucent_share') else '') for r in results) + ' |')
            lines.append('| --- |' + ' --- |' * len(results))
            for key in keys:
                lines.append(f'| {key[:-3]} | ' + ' | '.join(fmt(r.get(key), '', 2) for r in results) + ' |')
        if p.get('error'):
            lines.append(f'Error: {p["error"]}')
    for z in zens:
        lines += ['', f'## Integrated (Zen app) — {z.get("label") or z.get("engine")}: {z.get("status")}', '']
        if z.get('reason'):
            lines.append(f'Reason: {z["reason"]}')
        app = z.get('app') or {}
        if app:
            lines.append(f'App: {app.get("source")} run {app.get("run_id")}, commit {app.get("repository_commit")}'
                         + (f'; TEST-ONLY chrome-overlay: apps/browser/chrome of {z["chrome_overlay"].get("overlay_commit")} '
                            f'({z["chrome_overlay"].get("replaced")} replaced, {z["chrome_overlay"].get("added")} added)'
                            if z.get('chrome_overlay') else ''))
        m = z.get('machine') or {}
        if m:
            lines.append(f'Machine: {m.get("cpu_model")} × {m.get("nproc")}, {m.get("mem_total_mb")} MB, {m.get("os")}')
        reps = (z.get('bench') or {}).get('repetitions') or []
        if reps:
            lines.append('Repetitions: ' + ', '.join(r.get('status', '?') + (f' ({r["reason"][:160]})' if r.get('reason') else '') for r in reps))
        summary = z.get('summary') or {}
        if summary:
            lines += ['', '| Metric | median [p95] |', '| --- | --- |']
            lines += [f'| {key} | {fmt(value, "", 2)} |' for key, value in summary.items()]
    Path(args.out).write_text('\n'.join(lines) + '\n')
    if args.json:
        Path(args.json).write_text(json.dumps(dict(run_id=args.run_id, benches={k: dict(status=v['status'], summary=v.get('summary'),
                                                    machine=v.get('machine'), ready=v.get('ready')) for k, v in benches.items()},
                                                    presenters=presenters, zen=[dict(engine=z.get('engine'), label=z.get('label') or z.get('engine'), machine=z.get('machine'), status=z.get('status'), reason=z.get('reason'), summary=z.get('summary')) for z in zens]), indent=1) + '\n')
    print('\n'.join(lines))


if __name__ == '__main__':
    main()

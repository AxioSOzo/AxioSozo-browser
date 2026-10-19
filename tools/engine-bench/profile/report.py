#!/usr/bin/env python3
"""Post-process zen_profile.py results and combine them into one report.

  report.py process DIR      for each zen-profile-<label>.json in DIR: summarize every
                             window's Gecko profile (gecko_profile.py, restricted to the
                             window), write <profile>.summary.json/.md and a trimmed
                             <profile>.trimmed.json.gz (<= 4.5 MiB), remove the raw profile,
                             and write report-<label>.json/.md
  report.py combine DIR...   one profile-report.md/.json over every report-*.json found
"""
import argparse
import importlib.util
import json
from pathlib import Path
import sys

HERE = Path(__file__).resolve().parent
_spec = importlib.util.spec_from_file_location('gecko_profile', HERE / 'gecko_profile.py')
gp = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(gp)

THREAD_GROUPS = [('GeckoMain', 'main'), ('DOM Worker', 'DOM Worker'), ('Renderer', 'Renderer'), ('WRSceneBuilder', 'WRSceneBuilder'),
                 ('WRRenderBackend', 'WRRenderBackend'), ('WRWorker', 'WRWorker'), ('SwComposite', 'SwComposite'),
                 ('Compositor', 'Compositor'), ('IPC I/O', 'IPC I/O'), ('Socket', 'Socket'), ('Canvas', 'Canvas'), ('ImageIO', 'ImageIO')]


def group(name):
    for prefix, label in THREAD_GROUPS:
        if (name or '').startswith(prefix):
            return label
    return 'other'


def profile_digest(summary):
    """The parent's per-thread-group CPU and its main thread's categories/buckets/top frames."""
    out = {}
    for proc in summary.get('processes') or []:
        key = 'parent' if proc['is_parent'] else f"{proc.get('process_type')}:{proc.get('pid')}"
        groups = {}
        for t in proc['threads']:
            g = group(t['name'])
            item = groups.setdefault(g, dict(cpu_ms=0.0, threads=0))
            item['cpu_ms'] = round(item['cpu_ms'] + t['cpu_ms'], 1)
            item['threads'] += 1
        main = next((t for t in proc['threads'] if t['name'] == 'GeckoMain'), None)
        workers = [t for t in proc['threads'] if (t['name'] or '').startswith('DOM Worker')]
        entry = dict(cpu_ms=proc['cpu_ms'], thread_groups=dict(sorted(groups.items(), key=lambda kv: -kv[1]['cpu_ms'])))
        if main:
            entry['main'] = dict(cpu_ms=main['cpu_ms'], span_ms=main['span_ms'], cpu_percent_of_span=main['cpu_percent_of_span'],
                                 categories=main['categories'], js_split=main['js_split'],
                                 buckets_inclusive_ms=main['buckets_inclusive_ms'],
                                 top_self=main['top_self'][:12], top_total=main['top_total'][:20],
                                 markers={k: v for k, v in main['markers'].items() if k.startswith(('GC', 'CC', 'AxioSozo'))})
        if workers:
            busiest = max(workers, key=lambda t: t['cpu_ms'])
            entry['busiest_worker'] = dict(cpu_ms=busiest['cpu_ms'], cpu_percent_of_span=busiest['cpu_percent_of_span'],
                                           categories=busiest['categories'], js_split=busiest['js_split'],
                                           buckets_inclusive_ms=busiest['buckets_inclusive_ms'], top_self=busiest['top_self'][:10],
                                           top_total=busiest['top_total'][:15])
        render = [t for t in proc['threads'] if group(t['name']) in ('Renderer', 'WRSceneBuilder', 'WRRenderBackend', 'WRWorker', 'SwComposite')]
        if render:
            entry['webrender'] = {t['name']: dict(cpu_ms=t['cpu_ms'], top_self=t['top_self'][:5]) for t in render[:6]}
        out[key] = entry
        if len(out) >= 4:
            break
    return out


def process(directory):
    directory = Path(directory)
    for result_path in sorted(directory.glob('zen-profile-*.json')):
        result = json.loads(result_path.read_text())
        label = result.get('label') or result_path.stem.replace('zen-profile-', '')
        windows = []
        for w in result.get('windows') or []:
            row = dict(pass_=w.get('pass_'), window=w.get('window'))
            prof = w.get('profiler') or {}
            path = directory / prof['file'] if prof.get('file') else None
            if path and path.is_file():
                try:
                    profile = gp.load(path)
                    summary = gp.summarize(profile, w.get('window_epoch_ms'), prof.get('parent_pid'))
                    summary['trimmed'] = gp.trim(profile, w.get('window_epoch_ms'), prof.get('parent_pid'),
                                                 path.with_suffix('.trimmed.json.gz'), 4.5)
                    summary['raw_mib'] = round(path.stat().st_size / 1048576, 1)
                    path.with_suffix('.summary.json').write_text(json.dumps(summary, indent=1) + '\n')
                    path.with_suffix('.summary.md').write_text(gp.markdown(summary, f'{label} {w.get("window")} (profile pass)'))
                    row['profile'] = profile_digest(summary)
                    row['profile_files'] = dict(summary=str(path.with_suffix('.summary.json').relative_to(directory)),
                                                trimmed=summary['trimmed'].get('file') and str(Path(summary['trimmed']['file']).relative_to(directory)))
                    path.unlink()
                except (OSError, ValueError, KeyError, TypeError, IndexError) as error:
                    row['profile_error'] = f'{type(error).__name__}: {error}'
            elif prof:
                row['profile_error'] = str(prof.get('dump') or prof.get('error') or 'no profile file')
            windows.append(row)
        compact = {(c['pass_'], c['window']): c for c in result.get('compact') or []}
        for row in windows:
            row['metrics'] = compact.get((row['pass_'], row['window']))
        report = dict(schema='axiosozo-zen-profile-report-v1', label=label, engine=result.get('engine'), status=result.get('status'),
                      passes=[{k: p.get(k) for k in ('pass_', 'status', 'reason')} for p in result.get('passes') or []],
                      machine=result.get('machine'), chrome_overlay=result.get('chrome_overlay'), hooks=result.get('hooks'),
                      windows=windows)
        (directory / f'report-{label}.json').write_text(json.dumps(report, indent=1) + '\n')
        (directory / f'report-{label}.md').write_text(render([report]))
        print(f'report-{label}: {len(windows)} windows, {sum(1 for r in windows if "profile" in r)} profiles summarized')


def fmt(value, digits=1):
    if value is None:
        return '—'
    if isinstance(value, float):
        return f'{value:.{digits}f}'
    return str(value)


def render(reports):
    lines = ['# Zen parent-process profile report (tools/engine-bench/profile)', '',
             'Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. '
             'Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.', '']
    for report in reports:
        machine = report.get('machine') or {}
        lines += [f"## {report['label']} ({report.get('status')})", '',
                  f"CPU: {machine.get('cpu_model') or machine.get('cpu') or '?'}; passes: "
                  + ', '.join(f"{p['pass_']} {p['status']}" for p in report.get('passes') or []), '']
        lines += ['| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |',
                  '| --- | --- | ---: | ---: | --- | --- | ---: | ---: |']
        for row in report['windows']:
            m = row.get('metrics') or {}
            procs = dict(m.get('cpu_by_process') or {})
            parent = procs.pop('zen-parent', None)
            threads = ', '.join(f'{k} {v}' for k, v in list((m.get('zen_parent_top_threads') or {}).items())[:5])
            others = ', '.join(f'{k} {v}' for k, v in list(procs.items())[:4])
            key = m.get('keydown_to_presented_frame_ms') or m.get('keydown_to_second_raf_ms')
            switch = m.get('gecko_to_engine_switch_ms') or m.get('engine_to_gecko_switch_ms')
            lines.append(f"| {row['pass_']} | {row['window']} | {fmt(m.get('fps'))} | {fmt(m.get('interval_p99_ms'))} | "
                         f"**{fmt(parent)}** ({threads}) | {others} | {fmt(key)} | {fmt(switch)} |")
        lines.append('')
        traced = [r for r in report['windows'] if (r.get('metrics') or {}).get('frames')]
        if traced:
            lines += ['Frame path per frame (median ms; hooks): header wait = idle until the next frame header; pixel read = '
                      'Subprocess read(size) call → resolve; convert = pixels → ImageData; put = putImageData.', '',
                      '| pass | window | recv fps | MB/s | stdout reads | header wait | pixel read | convert | put | put→chrome paint | main-thread share |',
                      '| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |']
            for row in traced:
                f = row['metrics']['frames']
                lines.append(f"| {row['pass_']} | {row['window']} | {fmt(f.get('received_fps'))} | {fmt(f.get('received_mb_per_s'))} | "
                             f"{fmt(f.get('stdout_reads'))} | {fmt(f.get('header_wait_ms'))} | {fmt(f.get('pixel_read_ms'))} | "
                             f"{fmt(f.get('convert_ms'))} | {fmt(f.get('put_ms'))} | {fmt(f.get('put_to_chrome_paint_ms'))} | "
                             f"{fmt(f.get('main_thread_pipeline_share'), 3)} |")
            lines.append('')
        keyed = [r for r in report['windows'] if (r.get('metrics') or {}).get('key_breakdown_median')]
        if keyed:
            lines += ['Key → paint breakdown (median ms; hooks):', '',
                      '| pass | keydown→send | send→frame header (host) | pixel transport | convert | put | put→chrome paint | keydown→put end | keydown→chrome paint |',
                      '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |']
            for row in keyed:
                k = row['metrics']['key_breakdown_median']
                lines.append(f"| {row['pass_']} | {fmt(k.get('keydown_to_send_ms'))} | {fmt(k.get('send_to_frame_header_ms'))} | "
                             f"{fmt(k.get('pixel_transport_ms'))} | {fmt(k.get('convert_ms'))} | {fmt(k.get('put_ms'))} | "
                             f"{fmt(k.get('put_to_chrome_paint_ms'))} | {fmt(k.get('keydown_to_put_end_ms'))} | {fmt(k.get('keydown_to_chrome_paint_ms'))} |")
            lines.append('')
        for row in report['windows']:
            timeline = (row.get('metrics') or {}).get('switch_timeline')
            if timeline:
                lines.append(f"Switch timeline ({row['pass_']}, {row['window']}, ms after the window start): "
                             + '; '.join(f'{k} {v}' for k, v in list(timeline.items())[:16]))
                lines.append('')
        for row in report['windows']:
            prof = row.get('profile')
            if not prof:
                if row.get('profile_error'):
                    lines += [f"Profile {row['window']}: {row['profile_error']}", '']
                continue
            lines.append(f"### Profile: {report['label']} / {row['window']}")
            lines.append('')
            for proc, entry in prof.items():
                groups = ', '.join(f"{k} {v['cpu_ms']:.0f}" for k, v in entry['thread_groups'].items())
                lines.append(f"- **{proc}** CPU ms by thread group: {groups}")
                main = entry.get('main')
                if main:
                    cats = ', '.join(f'{k} {v:.0f}' for k, v in list(main['categories'].items())[:6])
                    js = main['js_split']
                    buckets = ', '.join(f'{k} {v:.0f}' for k, v in list(main['buckets_inclusive_ms'].items())[:8])
                    lines.append(f"  - main thread {main['cpu_ms']:.0f} ms ({main['cpu_percent_of_span']}% of span): {cats}")
                    lines.append(f"  - JS leaf {js['js_leaf']:.0f} / native under JS {js['native_under_js']:.0f} / native {js['native_no_js']:.0f}; buckets: {buckets}")
                    lines.append('  - top self: ' + '; '.join(f"`{f['frame'][:60]}` {f['ms']:.0f}" for f in main['top_self'][:6]))
                    js_total = [f for f in main['top_total'] if gp.JS_LOCATION.search(f['frame'])][:6]
                    if js_total:
                        lines.append('  - top JS (total): ' + '; '.join(f"`{f['frame'][:70]}` {f['ms']:.0f}" for f in js_total))
                    gc = {k: v for k, v in main.get('markers', {}).items() if k.startswith(('GC', 'CC'))}
                    if gc:
                        lines.append('  - GC/CC markers: ' + ', '.join(f"{k} {v['count']}× {v['total_ms']:.0f} ms" for k, v in list(gc.items())[:5]))
                worker = entry.get('busiest_worker')
                if worker:
                    buckets = ', '.join(f'{k} {v:.0f}' for k, v in list(worker['buckets_inclusive_ms'].items())[:6])
                    lines.append(f"  - busiest DOM Worker {worker['cpu_ms']:.0f} ms: buckets {buckets}; top self: "
                                 + '; '.join(f"`{f['frame'][:50]}` {f['ms']:.0f}" for f in worker['top_self'][:5]))
            lines.append('')
    return '\n'.join(lines) + '\n'


def combine(directories, out):
    reports = []
    for directory in directories:
        for path in sorted(Path(directory).rglob('report-*.json')):
            reports.append(json.loads(path.read_text()))
    order = {'gecko': 0, 'chromium': 1, 'gecko-debian': 2, 'webkit': 3}
    reports.sort(key=lambda r: order.get(r['label'], 9))
    Path(out).mkdir(parents=True, exist_ok=True)
    (Path(out) / 'profile-report.md').write_text(render(reports))
    (Path(out) / 'profile-report.json').write_text(json.dumps(reports, indent=1) + '\n')
    print(render(reports))


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest='command', required=True)
    p = sub.add_parser('process')
    p.add_argument('directory')
    c = sub.add_parser('combine')
    c.add_argument('directories', nargs='+')
    c.add_argument('--out', required=True)
    args = parser.parse_args()
    if args.command == 'process':
        process(args.directory)
    else:
        combine(args.directories, args.out)
    return 0


if __name__ == '__main__':
    sys.exit(main())

#!/usr/bin/env python3
"""Regression gate: compare two engine-bench summaries (baseline vs candidate).

usage:
  compare.py BASELINE CANDIDATE [--out compare.md] [--json compare.json]
             [--rel 0.05] [--k 2] [--fail-on-regression] [--only PREFIX ...]

BASELINE / CANDIDATE are any of
  - a summary.json written by `summarize.py --json` (the `summary` job of linux-engine-bench.yml),
  - a directory of raw results (bench-*.json, presenter-*.json, zen-bench-*.json), searched recursively,
  - `ci-results:<folder>` — read from the ci-results branch with `git show` (run `git fetch origin
    ci-results` first), e.g. `ci-results:cloud_engine-bench/39303324088-1-summary`,
  - a bare run id of this workstream's summary job, e.g. `39303324088` (= ci-results:cloud_engine-bench/<id>-1-summary).

Every metric is the median over repetitions, with the repetition-to-repetition stdev the
summaries carry. A difference counts only when it exceeds the noise threshold

    max(rel × |baseline|, k × max(stdev_baseline, stdev_candidate), absolute floor of the unit)

(defaults rel = 5 %, k = 2; floors: 0.5 ms, 1 fps, 3 CPU-%, 10 MB, 0.02 share). When the two
results of a group ran on different CPU models, rel is raised to --cross-machine-rel (default
25 %): two runs of identical code on an Intel Xeon 8573C and an AMD EPYC 9V74 runner differed by
up to ~20 % in CPU% and memory (runs 39301948003 vs 39303324088, docs/PERFORMANCE.md). Direction
comes from the metric (fps and throughput: higher is better; time, CPU, memory, bytes:
lower is better; a few descriptive metrics are reported without a verdict). Results from
different CPU models are flagged: GitHub-hosted runners vary between runs, so small
differences across runs are less trustworthy than an A/B inside one job.

Exit status: 0, or 1 with --fail-on-regression when any metric regressed beyond its threshold.
"""
import argparse
import json
import math
from pathlib import Path
import subprocess
import sys

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(HERE))
import summarize  # noqa: E402  (find(): the same file discovery as the summary)

WORKSTREAM_FOLDER = 'cloud_engine-bench'

# (substring of the metric key, direction): first match wins. +1 higher is better, -1 lower is
# better, 0 descriptive (no verdict).
DIRECTIONS = [
    ('idle_fps', -1), ('idle_raf', 0), ('processes', 0), ('bytes_per_frame', 0), ('changed_row_band_share', 0), ('damage_bytes_share', -1),
    ('scrolled_css_px', 0), ('elements', 0), ('frames_after_navigate', 0), ('canvas_updates', 0),
    ('uploadedPixelShare', -1), ('multi_frame_updates', -1), ('long_intervals_share', -1),
    ('pipe_mb_s', +1), ('throughput', +1), ('fps', +1),
    ('cpu_percent', -1), ('rss_mb', -1), ('pss_mb', -1), ('_ms', -1), ('Milliseconds', -1), ('interval', -1),
    ('latency', -1), ('read_ms', -1),
]
FLOORS = [('share', 0.02), ('fps', 1.0), ('cpu_percent', 3.0), ('_mb', 10.0), ('pipe_mb_s', 10.0), ('', 0.5)]


def direction(key):
    for needle, sign in DIRECTIONS:
        if needle in key:
            return sign
    return 0


def floor(key):
    if 'pipe_mb_s' in key:
        return 10.0
    for needle, value in FLOORS:
        if needle in key:
            return value
    return 0.5


def read_source(spec):
    """{'metrics': {key: describe-dict}, 'machines': {group: cpu model}, 'label': str}."""
    text = str(spec)
    if text.isdigit():
        text = f'ci-results:{WORKSTREAM_FOLDER}/{text}-1-summary'
    if text.startswith('ci-results:'):
        folder = text.split(':', 1)[1].rstrip('/')
        listed = subprocess.run(['git', '-C', str(ROOT), 'ls-tree', '-r', '--name-only', 'origin/ci-results', '--', folder],
                                capture_output=True, text=True)
        names = [name for name in listed.stdout.split() if name.endswith('.json') and not name.endswith('/_run.json')]
        if listed.returncode or not names:
            raise SystemExit(f'compare: no JSON under {folder} on origin/ci-results (git fetch origin ci-results?) '
                             + listed.stderr.strip())
        def show(name):
            return json.loads(subprocess.run(['git', '-C', str(ROOT), 'show', 'origin/ci-results:' + name],
                                             capture_output=True, text=True, check=True).stdout)
        summary = [name for name in names if name.endswith('/summary.json') or name == folder]
        if summary:
            return flatten_summary(show(summary[0]), text)
        return flatten_parsed([show(name) for name in names], text)
    path = Path(text)
    if path.is_file() and path.suffix == '.json':
        data = json.loads(path.read_text())
        if 'benches' in data or 'presenters' in data:
            return flatten_summary(data, text)
        return flatten_raw([path], text)
    if path.is_dir():
        summary = path / 'summary.json'
        if summary.is_file():
            return flatten_summary(json.loads(summary.read_text()), text)
        return flatten_raw(summarize.find([path]), text)
    raise SystemExit(f'compare: {spec}: not a summary.json, results directory, ci-results:<folder> or run id')


def flatten_summary(data, label):
    metrics, machines = {}, {}
    for name, bench in (data.get('benches') or {}).items():
        for key, value in (bench.get('summary') or {}).items():
            metrics[f'{name}/{key}'] = value
        machines[name] = (bench.get('machine') or {}).get('cpu_model')
    for presenter in data.get('presenters') or []:
        add_presenter(metrics, machines, presenter)
    for zen in data.get('zen') or []:
        add_zen(metrics, machines, zen)
    return dict(metrics=metrics, machines=machines, label=label + (f' (run {data["run_id"]})' if data.get('run_id') else ''))


def flatten_raw(files, label):
    parsed = []
    for path in files:
        try:
            parsed.append(json.loads(Path(path).read_text()))
        except (ValueError, OSError):
            continue
    return flatten_parsed(parsed, label)


def flatten_parsed(documents, label):
    metrics, machines = {}, {}
    for data in documents:
        if not isinstance(data, dict):
            continue
        schema = str(data.get('schema', ''))
        if schema == 'axiosozo-engine-bench-v1':
            name = data['engine'] + ('+damage' if data.get('args', {}).get('frame_damage') else '')
            for key, value in (data.get('summary') or {}).items():
                metrics[f'{name}/{key}'] = value
            machines[name] = (data.get('machine') or {}).get('cpu_model')
        elif schema.startswith('axiosozo-presenter-'):
            add_presenter(metrics, machines, data)
        elif schema == 'axiosozo-zen-bench-v1':
            add_zen(metrics, machines, data)
    return dict(metrics=metrics, machines=machines, label=label)


def add_presenter(metrics, machines, presenter):
    name = 'presenter-' + str(presenter.get('browser') or presenter.get('engine') or '?')
    for result in presenter.get('results') or []:
        size = f'{result.get("width")}x{result.get("height")}'
        if result.get('translucent_share'):
            size += f'-translucent{int(result["translucent_share"] * 100)}'
        for key, value in result.items():
            if key.endswith('_ms') and isinstance(value, dict):
                metrics[f'{name}/{size}/{key}'] = value
    machines[name] = (presenter.get('machine') or {}).get('cpu_model')


def add_zen(metrics, machines, zen):
    name = 'zen-' + str(zen.get('label') or zen.get('engine') or '?')
    for key, value in (zen.get('summary') or {}).items():
        metrics[f'{name}/{key}'] = value
    machines[name] = (zen.get('machine') or {}).get('cpu_model')


def judge(key, base, cand, rel, k, cross_machine=False):
    if not base or not cand or base.get('median') is None or cand.get('median') is None:
        return None
    b, c = base['median'], cand['median']
    noise = max(base.get('stdev') or 0, cand.get('stdev') or 0)
    threshold = max(rel * abs(b), k * noise, floor(key))
    machine_note = 'different CPU' if cross_machine else ''

    delta = c - b
    sign = direction(key)
    if sign == 0:
        verdict = 'info'
    elif abs(delta) <= threshold:
        verdict = 'same'
    else:
        verdict = 'better' if delta * sign > 0 else 'REGRESSION'
    relative = (delta / abs(b)) if b else (math.inf if delta else 0.0)
    return dict(key=key, baseline=b, candidate=c, delta=round(delta, 3), relative=round(relative, 4) if math.isfinite(relative) else None,
                threshold=round(threshold, 3), noise=round(noise, 3), n=[base.get('n'), cand.get('n')], verdict=verdict,
                note=machine_note)


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('baseline')
    parser.add_argument('candidate')
    parser.add_argument('--out')
    parser.add_argument('--json')
    parser.add_argument('--rel', type=float, default=0.05, help='relative threshold (default 0.05 = 5 %%)')
    parser.add_argument('--cross-machine-rel', type=float, default=0.25,
                        help='relative threshold when the two results ran on different CPU models (default 0.25)')
    parser.add_argument('--k', type=float, default=2.0, help='stdev multiplier (default 2)')
    parser.add_argument('--only', nargs='*', default=[], help='only metrics whose key starts with one of these prefixes')
    parser.add_argument('--all', action='store_true', help='also list metrics within noise')
    parser.add_argument('--fail-on-regression', action='store_true')
    args = parser.parse_args()
    base, cand = read_source(args.baseline), read_source(args.candidate)
    keys = sorted(set(base['metrics']) & set(cand['metrics']))
    if args.only:
        keys = [key for key in keys if key.startswith(tuple(args.only))]
    def crossed(key):
        group = key.split('/', 1)[0]
        a, b = base['machines'].get(group), cand['machines'].get(group)
        return bool(a and b and a != b)
    rows = [row for row in (judge(key, base['metrics'][key], cand['metrics'][key],
                                  max(args.rel, args.cross_machine_rel) if crossed(key) else args.rel, args.k, crossed(key))
                            for key in keys) if row]
    counts = {verdict: sum(1 for row in rows if row['verdict'] == verdict) for verdict in ('REGRESSION', 'better', 'same', 'info')}
    lines = ['# Engine bench comparison', '',
             f'- baseline: `{base["label"]}`', f'- candidate: `{cand["label"]}`',
             f'- threshold: max({args.rel:.0%} of baseline, {args.k:g} × stdev, unit floor); medians over repetitions',
             f'- {len(rows)} shared metrics: **{counts["REGRESSION"]} regressions**, {counts["better"]} improvements, '
             f'{counts["same"]} within noise, {counts["info"]} descriptive']
    only_base = sorted(set(base['metrics']) - set(cand['metrics']))
    only_cand = sorted(set(cand['metrics']) - set(base['metrics']))
    if only_base or only_cand:
        lines.append(f'- not compared: {len(only_base)} metrics only in the baseline, {len(only_cand)} only in the candidate')
    for group in sorted(set(base['machines']) & set(cand['machines'])):
        if base['machines'][group] and cand['machines'][group] and base['machines'][group] != cand['machines'][group]:
            lines.append(f'- ⚠ `{group}`: different CPU models ({base["machines"][group]} → {cand["machines"][group]}); '
                         f'relative threshold raised to {args.cross_machine_rel:.0%}')
    lines += ['', '| Metric | Baseline | Candidate | Δ | Δ % | Threshold | Verdict |', '| --- | --- | --- | --- | --- | --- | --- |']
    order = {'REGRESSION': 0, 'better': 1, 'same': 2, 'info': 3}
    for row in sorted(rows, key=lambda r: (order[r['verdict']], r['key'])):
        if row['verdict'] in ('same', 'info') and not args.all:
            continue
        rel = f'{row["relative"] * 100:+.1f} %' if row['relative'] is not None else '—'
        lines.append(f'| `{row["key"]}` | {row["baseline"]:g} | {row["candidate"]:g} | {row["delta"]:+g} | {rel} | '
                     f'{row["threshold"]:g} | {"**REGRESSION**" if row["verdict"] == "REGRESSION" else row["verdict"]}'
                     f'{" (" + row["note"] + ")" if row["note"] else ""} |')
    text = '\n'.join(lines) + '\n'
    if args.out:
        Path(args.out).write_text(text)
    if args.json:
        Path(args.json).write_text(json.dumps(dict(baseline=base['label'], candidate=cand['label'], rel=args.rel, k=args.k,
                                                   counts=counts, rows=rows), indent=1) + '\n')
    print(text)
    return 1 if args.fail_on_regression and counts['REGRESSION'] else 0


if __name__ == '__main__':
    sys.exit(main())

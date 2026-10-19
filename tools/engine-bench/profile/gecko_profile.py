#!/usr/bin/env python3
"""Summarize a Gecko profiler profile (the raw "Gecko profile format" that
nsIProfiler.dumpProfileToFileAsync writes) offline, and write a trimmed copy.

Per process and thread, over an optional wall-clock window (epoch ms, the
`window_epoch_ms` zen_profile.py records):

- CPU time (the `cpu` feature's threadCPUDelta; sample count x interval otherwise)
- category split (Idle, JavaScript, GC / CC, Layout, Graphics, DOM, IPC, Network, Other...)
- JS vs native split: leaf frame is JS / native under JS / native without any JS frame
- top self and total (inclusive) frames, native addresses symbolicated with `nm` against the
  profiled libraries (their paths in the profile's `libs`) when they exist on this machine;
  unsymbolicated addresses aggregate per library (`[libxul.so]`)
- buckets: Subprocess pipe I/O, the engine stream readers, BGRA->RGBA conversion,
  putImageData/drawImage, ArrayBuffer/structured-clone copies, memcpy/memset, js-ctypes,
  WebRender (scene building, rendering, software rasterization), paint/layout, GC/CC
- markers: GC/CC durations, AxioSozo* hook markers, IPC message counts

usage: gecko_profile.py PROFILE.json[.gz] [--window EPOCH0 EPOCH1] [--parent-pid PID]
         [--out summary.json] [--md summary.md] [--trim trimmed.json.gz] [--max-mb 4.5]
"""
import argparse
import bisect
import gzip
import json
from pathlib import Path
import re
import shutil
import subprocess
import sys

TOP = 20

# (name, regex over frame names in the stack; matched inclusively once per sample)
BUCKETS = [
    ('subprocess_pipe_io', r'subprocess_(common|unix|worker)|Subprocess\.sys|readBuffer|checkPendingReads|fillBuffer|onInput|InputPipe|Pipe\.read'),
    ('engine_stream_read', r'readStreamPacket|readPacket|EngineStreamClient|CEFEngineAdapter.*#read|#read \('),
    ('bgra_to_rgba', r'bgraToRGBA|bgraRegionToRGBA'),
    ('put_image_data', r'putImageData|PutImageData'),
    ('draw_image', r'drawImage|DrawImage'),
    ('canvas_2d', r'CanvasRenderingContext2D|DrawTarget|CanvasRenderingContext'),
    ('array_buffer_copy', r'ArrayBuffer|ArrayBuffer_transfer|TypedArray|Uint8Array|\.set \(|slice|StructuredClone|postMessage|PostMessage|JSStructuredClone'),
    ('memcpy_memset', r'\bmem(cpy|move|set)|__memmove|__memset|__memcpy|calloc|malloc|free\b|mmap|munmap|madvise|je_|arena_'),
    ('js_ctypes', r'ctypes|CType|FunctionType::Call|ffi_call'),
    ('worker_messaging', r'WorkerRunnable|MessageEventRunnable|WorkerPrivate|DOM Worker|onmessage|dispatchMessage|handleMessage'),
    ('webrender_scene', r'SceneBuilder|scene_build|build_scene|SceneBuilderThread'),
    ('webrender_render', r'Renderer::render|RenderThread|webrender::renderer|render_impl|composite|Composite'),
    ('webrender_sw_raster', r'swgl|SwCompositor|SoftwareCompositor|rasterize|draw_quad|blit|commit_span|draw_span'),
    ('paint_layout', r'PresShell::Paint|nsRefreshDriver|RefreshDriverTick|PaintFrame|DisplayList|Reflow|nsViewManager|WebRenderLayerManager'),
    ('mozafterpaint_events', r'MozAfterPaint|nsPresContext::NotifyDidPaint|FireDOMPaintEvent'),
    ('gc_cc', r'GC|CycleCollect|nsCycleCollector|js::gc|Minor GC|Major GC|GCMajor|GCMinor'),
    ('ipc', r'IPC|MessageChannel|ipc::|IPDL'),
    ('poll_wait', r'\bpoll\b|epoll|__poll|futex|pthread_cond|nanosleep|g_main_context|ppoll'),
]
BUCKET_RE = [(name, re.compile(rx)) for name, rx in BUCKETS]
HEX = re.compile(r'^0x[0-9a-fA-F]+$')
JS_LOCATION = re.compile(r'\((?:resource|chrome|moz-extension|https?|file|jar|blob|data|about):|\.m?js:\d+')


def load(path):
    raw = Path(path).read_bytes()
    if raw[:2] == b'\x1f\x8b':
        raw = gzip.decompress(raw)
    return json.loads(raw)


def processes(profile):
    """The parent profile and every sub-process profile (recursively)."""
    yield profile
    for child in profile.get('processes') or []:
        yield from processes(child)


def table(obj):
    schema = obj.get('schema') or {}
    return schema, obj.get('data') or []


# ---- Symbolication (nm) -----------------------------------------------------------
class Symbols:
    def __init__(self, enabled=True):
        self.enabled = enabled and shutil.which('nm') is not None
        self.cache = {}
        self.report = {}

    def table(self, path):
        if path in self.cache:
            return self.cache[path]
        entries = []
        if self.enabled and path and Path(path).is_file():
            for extra in (['-D'], []):
                try:
                    out = subprocess.run(['nm', '-C', '-S', '--defined-only', *extra, path], capture_output=True, text=True, timeout=300).stdout
                except (OSError, subprocess.SubprocessError):
                    continue
                for line in out.splitlines():
                    parts = line.split(' ', 3)
                    if len(parts) == 4 and parts[2] in 'tTwWiI':
                        try:
                            entries.append((int(parts[0], 16), int(parts[1], 16), parts[3]))
                        except ValueError:
                            pass
        entries = sorted(set(entries))
        self.cache[path] = ([e[0] for e in entries], entries)
        self.report[Path(path).name if path else '?'] = len(entries)
        return self.cache[path]

    @staticmethod
    def debug_file(path, code_id):
        """Separate debug symbols by ELF build-id (e.g. libc6-dbg), else the library itself."""
        if code_id and len(code_id) > 2:
            candidate = Path('/usr/lib/debug/.build-id') / code_id[:2].lower() / (code_id[2:].lower() + '.debug')
            if candidate.is_file():
                return str(candidate)
        return path

    def lookup(self, path, relative, code_id=None):
        path = self.debug_file(path, code_id)
        starts, entries = self.table(path)
        i = bisect.bisect_right(starts, relative) - 1
        if i >= 0:
            start, size, name = entries[i]
            if relative < start + max(size, 1) or (size == 0 and relative - start < 4096):
                return name
        return None


class Libs:
    def __init__(self, libs):
        self.libs = sorted(libs or [], key=lambda l: l.get('start', 0))
        self.starts = [l.get('start', 0) for l in self.libs]

    def find(self, address):
        i = bisect.bisect_right(self.starts, address) - 1
        if i >= 0 and address < self.libs[i].get('end', 0):
            return self.libs[i]
        return None


# ---- Thread analysis -----------------------------------------------------------------
def analyze_thread(thread, meta, libs, symbols, window=None):
    strings = thread.get('stringTable') or thread.get('stringArray') or []
    fschema, frames = table(thread.get('frameTable') or {})
    sschema, stacks = table(thread.get('stackTable') or {})
    pschema, samples = table(thread.get('samples') or {})
    if not samples:
        return None
    categories = [c.get('name', '?') for c in meta.get('categories') or []]
    f_loc, f_cat, f_impl = fschema.get('location', 0), fschema.get('category'), fschema.get('implementation')
    s_prefix, s_frame = sschema.get('prefix', 0), sschema.get('frame', 1)
    t_stack, t_time = pschema.get('stack', 0), pschema.get('time', 1)
    t_cpu, t_weight = pschema.get('threadCPUDelta'), pschema.get('weight')
    units = (meta.get('sampleUnits') or {}).get('threadCPUDelta')
    cpu_scale = {'ns': 1e-6, 'µs': 1e-3, 'us': 1e-3, 'ms': 1.0}.get(units)
    interval = meta.get('interval') or 1.0
    start = meta.get('startTime') or 0

    # Frame names (symbolicated), JS flag
    names, is_js = [], []
    for row in frames:
        loc = row[f_loc] if f_loc < len(row) else None
        text = strings[loc] if isinstance(loc, int) and 0 <= loc < len(strings) else str(loc)
        js = bool(JS_LOCATION.search(text)) or (f_impl is not None and f_impl < len(row) and row[f_impl] is not None)
        if HEX.match(text):
            address = int(text, 16)
            lib = libs.find(address)
            if lib:
                relative = address - lib.get('start', 0) + lib.get('offset', 0)
                name = symbols.lookup(lib.get('path') or lib.get('debugPath'), relative, lib.get('codeId'))
                text = f'{name} [{lib.get("name")}]' if name else f'[{lib.get("name")}]'
            else:
                text = '[unknown]'
        names.append(text)
        is_js.append(js)
    frame_cat = [row[f_cat] if f_cat is not None and f_cat < len(row) else None for row in frames]

    # Stack -> (category, leaf frame); walked lazily with memo
    stack_cat = [None] * len(stacks)
    for i, row in enumerate(stacks):
        frame = row[s_frame]
        prefix = row[s_prefix]
        cat = frame_cat[frame] if frame is not None and frame < len(frame_cat) else None
        if cat is None and prefix is not None and prefix < i:
            cat = stack_cat[prefix]
        stack_cat[i] = cat

    def chain(stack):
        seen = []
        while stack is not None:
            row = stacks[stack]
            seen.append(row[s_frame])
            stack = row[s_prefix]
        return seen  # leaf first

    chain_cache = {}
    total_w = 0.0
    n = 0
    by_cat, self_w, incl_w, buckets = {}, {}, {}, {}
    js_split = {'js_leaf': 0.0, 'native_under_js': 0.0, 'native_no_js': 0.0, 'no_stack': 0.0}
    first_t = last_t = None
    for row in samples:
        t = row[t_time] if t_time < len(row) else None
        if t is None:
            continue
        if window and not (window[0] <= start + t <= window[1]):
            continue
        if t_cpu is not None and cpu_scale is not None:
            delta = row[t_cpu] if t_cpu < len(row) else None
            w = (delta or 0) * cpu_scale
        else:
            w = interval * ((row[t_weight] if t_weight is not None and t_weight < len(row) and row[t_weight] else 1))
        n += 1
        first_t = t if first_t is None else first_t
        last_t = t
        total_w += w
        stack = row[t_stack] if t_stack < len(row) else None
        if stack is None:
            js_split['no_stack'] += w
            by_cat['(no stack)'] = by_cat.get('(no stack)', 0) + w
            continue
        cat = stack_cat[stack]
        cname = categories[cat] if isinstance(cat, int) and cat < len(categories) else 'Other'
        by_cat[cname] = by_cat.get(cname, 0) + w
        frames_in = chain_cache.get(stack)
        if frames_in is None:
            frames_in = chain_cache[stack] = chain(stack)
        leaf = frames_in[0]
        self_w[names[leaf]] = self_w.get(names[leaf], 0) + w
        any_js = any(is_js[f] for f in frames_in)
        js_split['js_leaf' if is_js[leaf] else 'native_under_js' if any_js else 'native_no_js'] += w
        unique = {names[f] for f in frames_in}
        for name in unique:
            incl_w[name] = incl_w.get(name, 0) + w
        text = '\n'.join(unique) + '\n' + cname
        for bname, rx in BUCKET_RE:
            if rx.search(text):
                buckets[bname] = buckets.get(bname, 0) + w

    if not n:
        return None
    span = (last_t - first_t) if first_t is not None and last_t is not None and last_t > first_t else 0
    def top(d, k=TOP):
        return [dict(frame=name[:200], ms=round(v, 2), share=round(v / total_w, 4) if total_w else None)
                for name, v in sorted(d.items(), key=lambda kv: -kv[1])[:k]]
    return dict(samples=n, span_ms=round(span, 1), weight='cpu_ms (threadCPUDelta)' if (t_cpu is not None and cpu_scale) else 'sample_ms',
                cpu_ms=round(total_w, 2), cpu_percent_of_span=round(100 * total_w / span, 1) if span else None,
                categories={k: round(v, 2) for k, v in sorted(by_cat.items(), key=lambda kv: -kv[1])},
                js_split={k: round(v, 2) for k, v in js_split.items()},
                buckets_inclusive_ms={k: round(v, 2) for k, v in sorted(buckets.items(), key=lambda kv: -kv[1])},
                top_self=top(self_w), top_total=top(incl_w, TOP + 10))


def analyze_markers(thread, meta, window=None):
    strings = thread.get('stringTable') or thread.get('stringArray') or []
    schema, data = table(thread.get('markers') or {})
    if not data:
        return {}
    i_name, i_start, i_end, i_phase = schema.get('name', 0), schema.get('startTime', 1), schema.get('endTime', 2), schema.get('phase', 3)
    i_data = schema.get('data', 5)
    start = meta.get('startTime') or 0
    out = {}
    for row in data:
        name_i = row[i_name]
        name = strings[name_i] if isinstance(name_i, int) and name_i < len(strings) else str(name_i)
        s, e, phase = row[i_start], row[i_end], row[i_phase]
        t = s if s is not None else e
        if window and t is not None and not (window[0] <= start + t <= window[1]):
            continue
        payload = row[i_data] if i_data < len(row) else None
        kind = payload.get('type') if isinstance(payload, dict) else None
        if not (name.startswith(('GC', 'CC', 'AxioSozo')) or kind in ('GCMajor', 'GCMinor', 'GCSlice', 'CC', 'IPC')
                or name in ('IPC', 'Paint', 'Composite', 'RefreshDriverTick', 'Styles', 'Reflow', 'DOMEvent', 'Jank',
                            'CSS animation', 'Rasterize', 'NotifyDidPaint', 'Awake', 'Runnable')):
            continue
        key = name if name != 'IPC' else 'IPC ' + str((payload or {}).get('messageType', ''))[:40]
        item = out.setdefault(key, dict(count=0, total_ms=0.0, max_ms=0.0))
        item['count'] += 1
        if phase == 1 and s is not None and e is not None:
            item['total_ms'] += e - s
            item['max_ms'] = max(item['max_ms'], e - s)
    for item in out.values():
        item['total_ms'] = round(item['total_ms'], 2)
        item['max_ms'] = round(item['max_ms'], 2)
    return dict(sorted(out.items(), key=lambda kv: (-kv[1]['total_ms'], -kv[1]['count']))[:40])


def summarize(profile, window=None, parent_pid=None, symbolicate=True):
    symbols = Symbols(symbolicate)
    out = dict(schema='axiosozo-gecko-profile-summary-v1', window_epoch_ms=window, processes=[])
    meta0 = profile.get('meta') or {}
    out['meta'] = {k: meta0.get(k) for k in ('version', 'preprocessedProfileVersion', 'product', 'interval', 'stackwalk',
                                              'startTime', 'sampleUnits', 'configuration', 'oscpu', 'misc', 'platform',
                                              'appBuildID', 'sourceURL', 'physicalCPUs', 'logicalCPUs')}
    out['meta']['categories'] = [c.get('name') for c in meta0.get('categories') or []]
    for proc in processes(profile):
        meta = {**meta0, **(proc.get('meta') or {})}
        if 'categories' not in (proc.get('meta') or {}):
            meta['categories'] = meta0.get('categories')
        libs = Libs(proc.get('libs'))
        threads = []
        for thread in proc.get('threads') or []:
            stats = analyze_thread(thread, meta, libs, symbols, window)
            if not stats:
                continue
            stats.update(name=thread.get('name'), tid=thread.get('tid'), markers=analyze_markers(thread, meta, window))
            threads.append(stats)
        if not threads:
            continue
        first = (proc.get('threads') or [{}])[0]
        pid = first.get('pid')
        threads.sort(key=lambda t: -t['cpu_ms'])
        out['processes'].append(dict(pid=pid, process_type=first.get('processType'), process_name=first.get('processName'),
                                     is_parent=(str(pid) == str(parent_pid)) if parent_pid else first.get('processType') == 'default',
                                     cpu_ms=round(sum(t['cpu_ms'] for t in threads), 2), threads=threads))
    out['processes'].sort(key=lambda p: (not p['is_parent'], -p['cpu_ms']))
    out['symbolication'] = dict(tool='nm' if symbols.enabled else None, symbols_per_library=symbols.report)
    return out


# ---- Trimmed copy ---------------------------------------------------------------------
def trim(profile, window, parent_pid, path, max_mb):
    """gzip; then drop samples outside the window, markers, child processes until it fits."""
    def size(p):
        return len(gzip.compress(json.dumps(p, separators=(',', ':')).encode(), 6))

    def cut_samples(p):
        for proc in processes(p):
            meta = {**(profile.get('meta') or {}), **(proc.get('meta') or {})}
            start = meta.get('startTime') or 0
            for thread in proc.get('threads') or []:
                schema, data = table(thread.get('samples') or {})
                ti = schema.get('time', 1)
                if window and data:
                    thread['samples']['data'] = [r for r in data if r[ti] is not None and window[0] - 50 <= start + r[ti] <= window[1] + 50]
        return p

    def no_markers(p):
        for proc in processes(p):
            for thread in proc.get('threads') or []:
                if 'markers' in thread:
                    keep = [r for r in thread['markers'].get('data') or []
                            if isinstance(r[0], int) and r[0] < len(thread.get('stringTable') or []) and
                            str(thread['stringTable'][r[0]]).startswith(('AxioSozo', 'GC', 'CC'))]
                    thread['markers']['data'] = keep
        return p

    def keep_children(p, k):
        children = p.get('processes') or []
        def cpu(c):
            return sum(len((t.get('samples') or {}).get('data') or []) for t in c.get('threads') or [])
        p['processes'] = sorted(children, key=cpu, reverse=True)[:k]
        return p

    steps = [('full', lambda p: p), ('window-only samples', cut_samples), ('few markers', no_markers),
             ('3 child processes', lambda p: keep_children(p, 3)), ('1 child process', lambda p: keep_children(p, 1)),
             ('parent only', lambda p: keep_children(p, 0))]
    current = profile
    applied = []
    for label, step in steps:
        current = step(current)
        applied.append(label)
        if size(current) <= max_mb * 1024 * 1024:
            Path(path).write_bytes(gzip.compress(json.dumps(current, separators=(',', ':')).encode(), 6))
            return dict(file=str(path), steps=applied, mib=round(Path(path).stat().st_size / 1048576, 2))
    return dict(file=None, steps=applied, reason=f'still above {max_mb} MiB after trimming')


# ---- Markdown -----------------------------------------------------------------------------
def markdown(summary, title):
    lines = [f'### {title}', '']
    for proc in summary['processes'][:4]:
        lines.append(f"**{'parent' if proc['is_parent'] else proc['process_type']} pid {proc['pid']}** — "
                     f"{proc['cpu_ms']:.0f} ms CPU in the window")
        lines.append('')
        lines.append('| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |')
        lines.append('| --- | ---: | ---: | --- | --- | --- |')
        for t in proc['threads'][:8]:
            cats = ', '.join(f'{k} {v:.0f}' for k, v in list(t['categories'].items())[:4])
            js = t['js_split']
            bucket = ', '.join(f'{k} {v:.0f}' for k, v in list(t['buckets_inclusive_ms'].items())[:4])
            lines.append(f"| {t['name']} | {t['cpu_ms']:.0f} | {t['cpu_percent_of_span']} | {cats} | "
                         f"{js['js_leaf']:.0f} / {js['native_under_js']:.0f} / {js['native_no_js']:.0f} | {bucket} |")
        lines.append('')
        main = next((t for t in proc['threads'] if t['name'] == 'GeckoMain'), None)
        if main:
            lines.append('Main thread, top self: ' + '; '.join(f"`{f['frame'][:70]}` {f['ms']:.0f}" for f in main['top_self'][:8]))
            lines.append('')
    return '\n'.join(lines) + '\n'


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('profile')
    parser.add_argument('--window', nargs=2, type=float)
    parser.add_argument('--parent-pid')
    parser.add_argument('--out')
    parser.add_argument('--md')
    parser.add_argument('--title', default='Gecko profile')
    parser.add_argument('--trim')
    parser.add_argument('--max-mb', type=float, default=4.5)
    parser.add_argument('--no-symbols', action='store_true')
    args = parser.parse_args()
    profile = load(args.profile)
    summary = summarize(profile, args.window, args.parent_pid, not args.no_symbols)
    if args.trim:
        summary['trimmed'] = trim(profile, args.window, args.parent_pid, args.trim, args.max_mb)
    text = json.dumps(summary, indent=1) + '\n'
    if args.out:
        Path(args.out).write_text(text)
    if args.md:
        Path(args.md).write_text(markdown(summary, args.title))
    if not args.out and not args.md:
        sys.stdout.write(text)
    return 0


if __name__ == '__main__':
    sys.exit(main())

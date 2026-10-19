#!/usr/bin/env python3
"""Real CEF frame damage on the AXCF pipe (hello `frame_damage:true`, Linux host).

A fixture page animates one small square. The test keeps its own copy of the view and
applies only each frame's damage rectangle to it; that copy must equal every full
payload byte for byte, which proves that no pixel outside a damage rectangle changed.
It also checks that the first frame, and the first after a resize, are whole, and that
the animated frames are small. A PASS proves the native host only, never E1/E2.
"""
import http.server
import importlib.util
import json
from pathlib import Path
import signal
import tempfile
import threading
import time

spec = importlib.util.spec_from_file_location('stream', Path(__file__).with_name('stream_test.py'))
stream = importlib.util.module_from_spec(spec)
spec.loader.exec_module(stream)
probe = stream.probe

PAGE = b'''<!doctype html><html lang="en"><meta charset="utf-8"><title>damage fixture</title>
<style>html,body{margin:0;background:#edf2f5;font:16px system-ui;color:#163247}
#box{position:absolute;left:300px;top:200px;width:40px;height:40px;background:#c0392b}
p{margin:40px}</style><p>SYNTHETIC LOCAL DAMAGE FIXTURE - NO ACCOUNTS</p><div id="box"></div>
<script>let n=0;setInterval(()=>{document.querySelector('#box').style.background=n++%2?'#c0392b':'#2471a3';},50);</script>
</html>'''


class Fixture(http.server.BaseHTTPRequestHandler):
    def log_message(self, *_):
        pass

    def do_GET(self):
        if self.headers.get_all('Host', []) != [f'127.0.0.1:{self.server.server_port}'] or self.path != '/engine.html':
            self.send_error(404)
            return
        self.send_response(200)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_header('Content-Length', str(len(PAGE)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(PAGE)


def apply(view, width, damage, pixels):
    x, y, w, h = damage
    for row in range(y, y + h):
        start = (row * width + x) * 4
        view[start:start + w * 4] = pixels[start:start + w * 4]


def run():
    probe.check()
    directory = Path(tempfile.mkdtemp(prefix='cef-damage-', dir=probe.EVIDENCE))
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), Fixture)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    session = None
    result = dict(status='FAIL', E1='NOT_TESTED', E2='NOT_TESTED', started_at=time.time())
    previous_term = signal.signal(signal.SIGTERM, lambda *_: (_ for _ in ()).throw(KeyboardInterrupt()))
    try:
        origin = f'http://127.0.0.1:{server.server_port}'
        session = stream.Session(origin, directory, hello_fields=dict(frame_damage=True))
        ready = session.until(lambda kind, item: item.get('event') == 'ready', 60)
        assert ready['capabilities'].get('frame_damage') is True, ready['capabilities']
        pending = dict(tab_id='damage-tab', engine_instance=session.instance, identity=origin,
                       document_generation=1, navigation_generation=1, private_mode=False)
        session.command('create', target=pending, url=origin + '/engine.html', width=900, height=650, device_scale=2)
        frames = []

        def collect(kind, item):
            if kind == 2:
                frames.append((item, bytes(session.pixels)))
            return kind == 2 and len(frames) >= 40
        session.until(collect, 30)
        # Whole first frame of the document (and of every new size), then damage only.
        first_of_size, view, mismatches, partial, areas = {}, None, 0, 0, []
        for item, pixels in frames:
            width, height = item['width'], item['height']
            damage = item['damage'][0]
            assert len(item['damage']) == 1 and damage[2] > 0 and damage[3] > 0
            assert damage[0] + damage[2] <= width and damage[1] + damage[3] <= height, item
            key = (width, height, item['target']['document_generation'])
            if key not in first_of_size:
                first_of_size[key] = damage
                view = bytearray(pixels)
                continue
            apply(view, width, damage, pixels)
            if view != pixels:
                mismatches += 1
                view = bytearray(pixels)
            if damage != [0, 0, width, height]:
                partial += 1
                areas.append(damage[2] * damage[3] / (width * height))
        result['first_frames'] = {f'{w}x{h}@doc{d}': value for (w, h, d), value in first_of_size.items()}
        result['frames'] = len(frames)
        result['partial_frames'] = partial
        result['reconstruction_mismatches'] = mismatches
        result['max_damage_area_share'] = round(max(areas), 4) if areas else None
        stream.png(directory / 'damage-last.png', frames[-1][0]['width'], frames[-1][0]['height'], frames[-1][1])
        assert all(value[:2] == [0, 0] for value in first_of_size.values()), first_of_size
        assert all(value[2:] == [w, h] for (w, h, _), value in first_of_size.items()), first_of_size
        assert mismatches == 0 and partial >= 10, result
        # The square is 40x40 points (80x80 px at 2x): its frames are a small share of the view.
        assert result['max_damage_area_share'] < 0.05, result

        # A resize makes the next frame whole again.
        session.command('resize', width=800, height=600, device_scale=2)
        resized = session.until(lambda kind, item: kind == 2 and item['width'] == 1600, 15)
        result['first_after_resize'] = resized['damage']
        assert resized['damage'] == [[0, 0, 1600, 1200]], resized
        result['status'] = 'PASS'
        result['platform'] = ready['platform']
        close = session.command('close')
        session.until(lambda kind, item: item.get('event') == 'completed' and item.get('request_id') == close)
    except (Exception, KeyboardInterrupt) as exc:
        result['error'] = type(exc).__name__ + ': ' + str(exc)[:2000]
    finally:
        signal.signal(signal.SIGTERM, signal.SIG_IGN)
        if session:
            session.close()
            result['profile_removed'] = session.profile_removed
        server.shutdown()
        server.server_close()
        thread.join(timeout=3)
        signal.signal(signal.SIGTERM, previous_term)
        result['finished_at'] = time.time()
        (directory / 'result.json').write_text(json.dumps(result, indent=2) + '\n')
        print(json.dumps(dict(result, evidence=str(directory))), flush=True)
    return 0 if result['status'] == 'PASS' else 1


if __name__ == '__main__':
    if not probe.IS_LINUX:
        # The macOS host (host.mm) has no frame damage; surface mode has its own dirty rects.
        print(json.dumps(dict(status='SKIPPED', reason='frame_damage is implemented by the portable (Linux) core')))
        raise SystemExit(0)
    raise SystemExit(run())

#!/usr/bin/env python3
"""Real isolated CEF HTTP/TLS/input/visibility checks; not Zen E1/E2 evidence."""
import contextlib
import argparse
import http.server
import importlib.util
import json
from pathlib import Path
import select
import signal
import ssl
import subprocess
import tempfile
import threading
import time

spec = importlib.util.spec_from_file_location('stream', Path(__file__).with_name('stream_test.py'))
stream = importlib.util.module_from_spec(spec)
spec.loader.exec_module(stream)
probe = stream.probe


class WebFixture(http.server.BaseHTTPRequestHandler):
    def log_message(self, *_):
        pass

    def reply(self, status, body, content='text/html; charset=utf-8', **headers):
        self.server.requests.append((self.command, self.path, status))
        data = body.encode()
        self.send_response(status)
        self.send_header('Content-Type', content)
        self.send_header('Content-Length', str(len(data)))
        for key, value in headers.items():
            self.send_header(key.replace('_', '-'), value)
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        if self.path == '/redirect':
            return self.reply(302, '', Location='/page?redirected=1')
        if self.path == '/data':
            return self.reply(200, 'cross-origin-data', 'text/plain', Access_Control_Allow_Origin='*')
        if self.path == '/style.css':
            return self.reply(200, 'body{background:#12384a;color:white;font:20px sans-serif}button,input,select{font:20px sans-serif}', 'text/css')
        if self.path == '/missing':
            return self.reply(404, '<title>actual 404</title><h1>Native HTTP 404 document</h1>')
        if self.path == '/download':
            return self.reply(200, 'synthetic-download', 'application/octet-stream', Content_Disposition='attachment; filename="synthetic.txt"')
        if self.path == '/animate':
            return self.reply(200, '<title>animation</title><body style="background:#12384a"><script>let n=0;setInterval(()=>document.body.style.background=`rgb(${n++%255},60,80)`,30)</script>')
        if self.path.startswith('/page'):
            return self.reply(200, f'''<!doctype html><title>web fixture</title><link rel="stylesheet" href="/style.css">
                <h1>Real CEF web mode</h1><form method="POST" action="/submit"><input name="value" autofocus value=""><button>Send</button></form>
                <p><select onchange="document.title='selected='+this.value"><option>One</option><option>Two</option><option>Three</option></select></p>
                <button onclick="window.open('/page')">Popup</button>
                <button onclick="location.href='/download'">Download</button>
                <script>fetch('http://127.0.0.1:{self.server.peer_port}/data').then(r=>r.text()).then(t=>document.title='web '+t);</script>''')
        return self.reply(404, '<title>missing</title>')

    def do_POST(self):
        length = int(self.headers.get('Content-Length', '0'))
        if self.path != '/submit' or not 0 <= length <= 1024:
            return self.reply(400, 'invalid fixture request')
        body = self.rfile.read(length).decode()
        self.server.submitted.append(body)
        self.reply(200, '<title>post received</title><h1>Form submitted in Chromium</h1>')


def serve(tls=None):
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), WebFixture)
    server.requests, server.submitted, server.peer_port = [], [], 0
    if tls:
        server.socket = tls.wrap_socket(server.socket, server_side=True)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server, thread


def run(interaction_timeout=15):
    probe.check()
    directory = Path(tempfile.mkdtemp(prefix='cef-web-stream-', dir=probe.EVIDENCE))
    session, servers = None, []
    result = dict(status='FAIL', E1='NOT_TESTED', E2='NOT_TESTED', tests=[], started_at=time.time())
    def interrupted(*_):
        raise KeyboardInterrupt
    previous = signal.signal(signal.SIGTERM, interrupted)
    try:
        # Owned one-day synthetic certificate; never trusted by the OS or CEF.
        with tempfile.TemporaryDirectory(prefix='cef-web-tls-', dir=probe.BASE) as cert_dir:
            key, cert = Path(cert_dir) / 'key.pem', Path(cert_dir) / 'cert.pem'
            subprocess.run(['/usr/bin/openssl', 'req', '-x509', '-newkey', 'rsa:2048', '-nodes',
                            '-keyout', str(key), '-out', str(cert), '-days', '1', '-subj', '/CN=localhost'],
                           check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            tls = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
            tls.load_cert_chain(cert, key)
            servers = [serve(), serve(), serve(tls)]
            main, peer, secure = [entry[0] for entry in servers]
            main.peer_port = peer.server_port
            origin = f'http://127.0.0.1:{main.server_port}'
            session = stream.Session(origin, directory, browsing_mode='web', timeout=interaction_timeout)
            ready = session.until(lambda _, item: item.get('event') == 'ready')
            assert ready['capabilities']['fixture_only'] is False
            assert ready['capabilities']['edit'] is True and ready['capabilities']['visibility'] is True
            assert ready['sandbox_configured'] is True
            pending = dict(tab_id='web-test', engine_instance=session.instance, identity=origin,
                           document_generation=1, navigation_generation=1, private_mode=False)
            session.command('create', target=pending, url='about:blank', width=900, height=650, device_scale=2)
            session.until(lambda kind, _: kind == 2)
            result['tests'].append('inert_about_blank_real_frame')

            def completed(method, **fields):
                request = session.command(method, **fields)
                return session.until(lambda _, item: item.get('event') == 'completed' and item.get('request_id') == request)

            def navigate(url, capture=None):
                answer = completed('navigate', url=url)
                assert answer['status'] == 'success', answer
                return session.until(lambda kind, _: kind == 2, capture=capture)

            navigate(origin + '/page', directory / 'web-page.png')
            session.until(lambda _, item: item.get('event') == 'title' and item.get('title') == 'web cross-origin-data') if not any(item.get('title') == 'web cross-origin-data' for item in session.events) else None
            assert ('GET', '/style.css', 200) in main.requests and ('GET', '/data', 200) in peer.requests
            result['tests'].append('HTTP_page_CSS_cross_origin_fetch_native_frame')
            completed('focus', focused=True)
            completed('key', type='char', native_key_code=0, windows_key_code=0, modifiers=0, text='CEF')
            completed('edit', action='select_all')
            completed('key', type='char', native_key_code=0, windows_key_code=0, modifiers=0, text='WEB')
            completed('key', type='down', native_key_code=36, windows_key_code=13, modifiers=0, text='')
            session.until(lambda _, item: item.get('title') == 'post received')
            session.until(lambda kind, _: kind == 2, capture=directory / 'post.png')
            assert main.submitted == ['value=WEB'], main.submitted
            result['tests'].append('native_input_edit_select_all_user_POST')
            navigate(origin + '/redirect')
            assert any(item.get('url') == origin + '/page?redirected=1' for item in session.events)
            result['tests'].append('HTTP_redirect_with_query')
            before = dict(session.target)
            navigate(origin + '/page?redirected=1#fragment')
            assert session.target['document_generation'] > before['document_generation']
            assert any(item.get('same_document') is True for item in session.events)
            result['tests'].append('fragment_navigation_generation_and_frame')
            navigate(origin + '/missing', directory / 'http-404.png')
            assert any(item.get('http_status') == 404 for item in session.events)
            result['tests'].append('HTTP404_rendered_as_document')
            completed('navigate', url=f'https://127.0.0.1:{secure.server_port}/page')
            assert any(item.get('code') == 'certificate_error' for item in session.events)
            assert not secure.requests, secure.requests
            navigate(origin + '/page')
            result['tests'].append('invalid_TLS_denied_and_explicit_navigation_recovery')
            # More than the former session lifetime, without generating100k events.
            session.counter = 100001
            assert completed('focus', focused=True)['status'] == 'success'
            result['tests'].append('web_monotonic_sequence_beyond100000')
            navigate(origin + '/animate')
            completed('visibility', visible=False)
            # Drain a paint already outstanding at hide, then measure new traffic.
            limit = time.monotonic() + .2
            while time.monotonic() < limit and select.select([session.process.stdout], [], [], .05)[0]:
                session.until(lambda *_: True, seconds=1)
            start_frames = session.frames
            until = time.monotonic() + .6
            while time.monotonic() < until and select.select([session.process.stdout], [], [], .1)[0]:
                session.until(lambda *_: True, seconds=1)
            result['hidden_frames_600ms'] = session.frames - start_frames
            assert result['hidden_frames_600ms'] <= 1
            completed('visibility', visible=True)
            session.until(lambda kind, _: kind == 2)
            result['tests'].append('hidden_OSR_suspended_and_visible_resumed')
            assert completed('close')['status'] == 'success'
            session.process.wait(timeout=10)
            assert session.process.returncode == 0
            result.update(status='PASS', native_exit_code=0, frames=session.frames,
                          cef=ready['cef'], chromium=ready['chromium'], requests=main.requests,
                          peer_requests=peer.requests, rejected_tls_requests=secure.requests)
    except (Exception, KeyboardInterrupt) as error:
        result['error'] = type(error).__name__ + ': ' + str(error)
    finally:
        signal.signal(signal.SIGTERM, signal.SIG_IGN)
        if session:
            session.close()
            result['profile_removed'] = session.profile_removed
            if not session.profile_removed:
                result.update(status='FAIL', cleanup_error=session.cleanup_error or 'owned profile retained')
        if servers:
            result['requests'] = servers[0][0].requests
        for server, thread in servers:
            server.shutdown()
            server.server_close()
            thread.join(timeout=3)
        signal.signal(signal.SIGTERM, previous)
        result.update(finished_at=time.time(), evidence=str(directory))
        (directory / 'result.json').write_text(json.dumps(result, indent=2) + '\n')
        print(json.dumps(result), flush=True)
    return 0 if result['status'] == 'PASS' else 1


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--interaction-timeout', type=int, choices=[15, 60], default=15,
                        help='Use60 only for a separately authorized manual macOS prompt response.')
    raise SystemExit(run(parser.parse_args().interaction_timeout))

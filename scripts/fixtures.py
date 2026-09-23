"""Owned loopback HTTP/TLS fixtures. No filesystem browsing or privileged API."""
import hashlib
import http.server
from pathlib import Path
import ssl
import subprocess
import threading
import urllib.parse

ROOT = Path(__file__).resolve().parents[1]
FIXTURE = ROOT / 'tests/fixtures/engine.html'


class FixtureServer:
    def __init__(self, certificate_directory=None):
        self.tls = certificate_directory is not None
        self.thread = None
        self.payload = FIXTURE.read_bytes()
        self.ssl_context = None
        if self.tls:
            directory = Path(certificate_directory)
            directory.mkdir(parents=True, mode=0o700, exist_ok=True)
            self.certificate = directory / 'fixture-cert.pem'
            key = directory / 'fixture-key.pem'
            if self.certificate.exists() or key.exists():
                raise RuntimeError('TLS fixture requires a new, owned certificate directory')
            configuration = directory / 'openssl.cnf'
            configuration.write_text('[req]\nprompt=no\ndistinguished_name=dn\nx509_extensions=v3\n'
                                     '[dn]\nCN=AxioSozo synthetic fixture\n[v3]\n'
                                     'subjectAltName=IP:127.0.0.1\nbasicConstraints=critical,CA:false\n'
                                     'keyUsage=critical,digitalSignature,keyEncipherment\n'
                                     'extendedKeyUsage=serverAuth\n')
            subprocess.run(['/usr/bin/openssl', 'req', '-x509', '-nodes', '-newkey', 'rsa:2048',
                            '-days', '1', '-config', str(configuration), '-keyout', str(key),
                            '-out', str(self.certificate)], check=True, capture_output=True, timeout=30)
            key.chmod(0o600)
            self.ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
            self.ssl_context.minimum_version = ssl.TLSVersion.TLSv1_2
            self.ssl_context.load_cert_chain(str(self.certificate), str(key))
        fixture = self

        class Server(http.server.ThreadingHTTPServer):
            daemon_threads = False
            block_on_close = True
            request_queue_size = 16

            def get_request(self):
                sock, address = super().get_request()
                sock.settimeout(2)
                if fixture.ssl_context:
                    try:
                        sock = fixture.ssl_context.wrap_socket(sock, server_side=True)
                    except (OSError, ssl.SSLError):
                        sock.close()
                        raise
                return sock, address

        class Handler(http.server.BaseHTTPRequestHandler):
            protocol_version = 'HTTP/1.0'

            def log_message(self, *_):
                pass

            def reply(self, code, payload=b'', content_type='text/plain; charset=utf-8'):
                self.send_response(code)
                self.send_header('Content-Type', content_type)
                self.send_header('Content-Length', str(len(payload)))
                self.send_header('Cache-Control', 'no-store')
                self.send_header('X-Content-Type-Options', 'nosniff')
                self.send_header('Referrer-Policy', 'no-referrer')
                self.send_header('Content-Security-Policy', "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src 'self' data:; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'")
                self.end_headers()
                if self.command != 'HEAD':
                    self.wfile.write(payload)
                self.close_connection = True

            def do_GET(self):
                # Protect even the synthetic fixture from DNS rebinding/absolute
                # proxy requests. There are no control, file, shell or model APIs.
                hosts = self.headers.get_all('Host', [])
                if hosts != [f'127.0.0.1:{self.server.server_port}']:
                    return self.reply(400)
                url = urllib.parse.urlsplit(self.path)
                if url.scheme or url.netloc or url.fragment:
                    return self.reply(400)
                if url.path == '/engine.html' and url.query in ('', 'page=2'):
                    return self.reply(200, fixture.payload, 'text/html; charset=utf-8')
                if url.path == '/favicon.ico' and not url.query:
                    return self.reply(204)
                return self.reply(404)

            def do_HEAD(self):
                self.reply(405)

            def do_POST(self):
                self.reply(405)

            do_PUT = do_POST
            do_DELETE = do_POST
            do_OPTIONS = do_POST

        self.server = Server(('127.0.0.1', 0), Handler)
        self.origin = f'{"https" if self.tls else "http"}://127.0.0.1:{self.server.server_port}'
        self.url = self.origin + '/engine.html'

    def __enter__(self):
        self.thread = threading.Thread(target=self.server.serve_forever, kwargs={'poll_interval': .05},
                                       name='axiosozo-owned-fixture')
        self.thread.start()
        return self

    def __exit__(self, *_):
        self.server.shutdown()
        self.server.server_close()
        if self.thread:
            self.thread.join(timeout=5)
            if self.thread.is_alive():
                raise RuntimeError('Owned fixture server failed to stop')

    def identity(self):
        return {'origin': self.origin, 'url': self.url, 'tls': self.tls,
                'fixture_sha256': hashlib.sha256(self.payload).hexdigest(),
                'privileged_endpoints': False}

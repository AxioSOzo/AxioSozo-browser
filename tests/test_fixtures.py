"""Fixture-server checks only; TLS rejection here is not browser-warning evidence."""
import http.client
from pathlib import Path
import ssl
import socket
import sys
import tempfile
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from fixtures import FixtureServer


class Fixtures(unittest.TestCase):
    def request(self, fixture, method='GET', path='/engine.html', headers=None):
        connection = http.client.HTTPConnection('127.0.0.1', fixture.server.server_port, timeout=3)
        try:
            connection.request(method, path, headers=headers or {})
            response = connection.getresponse()
            return response.status, response.read(), dict(response.getheaders())
        finally:
            connection.close()

    def test_exact_fixture_origin_and_no_privileged_endpoints(self):
        with FixtureServer() as fixture:
            status, body, headers = self.request(fixture)
            self.assertEqual(status, 200)
            self.assertEqual(body, fixture.payload)
            self.assertNotIn('Access-Control-Allow-Origin', headers)
            self.assertEqual(self.request(fixture, path='/engine.html?page=2')[0], 200)
            for path in ('/../Cargo.toml', '/%2e%2e/Cargo.toml', '/api', '/engine.html?command=shell'):
                self.assertEqual(self.request(fixture, path=path)[0], 404)
            self.assertEqual(self.request(fixture, headers={'Host': 'attacker.invalid'})[0], 400)
            self.assertEqual(self.request(fixture, method='HEAD')[0], 405)
            self.assertEqual(self.request(fixture, method='POST')[0], 405)

    def test_owned_fixture_port_closes(self):
        with FixtureServer() as fixture:
            port = fixture.server.server_port
            self.assertEqual(self.request(fixture)[0], 200)
        with self.assertRaises(OSError):
            socket.create_connection(('127.0.0.1', port), timeout=.2)

    def test_generated_certificate_is_not_trusted(self):
        with tempfile.TemporaryDirectory(prefix='axiosozo-tls-fixture-') as directory:
            with FixtureServer(certificate_directory=directory) as fixture:
                context = ssl.create_default_context()
                connection = http.client.HTTPSConnection('127.0.0.1', fixture.server.server_port, context=context, timeout=3)
                try:
                    with self.assertRaises(ssl.SSLCertVerificationError):
                        connection.request('GET', '/engine.html')
                finally:
                    connection.close()
                self.assertTrue(fixture.certificate.is_file())


if __name__ == '__main__':
    unittest.main(verbosity=2)

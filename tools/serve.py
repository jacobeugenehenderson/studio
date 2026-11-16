"""Static preview server that tells the browser never to keep a copy.

python3 -m http.server sends Last-Modified and no Cache-Control, so Chrome keeps pages by
its own heuristic and reuses them without asking. A framed page is cached separately per
embedding site and loaded lazily after a hard reload, so it stayed stale for an hour on
2026-11-15 (README section 7). This sends Cache-Control: no-store on everything.

usage: python3 tools/serve.py [dir] [port]     (defaults: . 8787)
"""
import functools
import http.server
import sys

directory = sys.argv[1] if len(sys.argv) > 1 else '.'
port = int(sys.argv[2]) if len(sys.argv) > 2 else 8787


class NoStore(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


handler = functools.partial(NoStore, directory=directory)
http.server.ThreadingHTTPServer(("127.0.0.1", port), handler).serve_forever()

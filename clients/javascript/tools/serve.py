"""Local-only static server for the standalone portrait kit."""
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from pathlib import Path
import argparse,os,threading,webbrowser
p=argparse.ArgumentParser();p.add_argument('--port',type=int,default=8927);p.add_argument('--open',action='store_true');args=p.parse_args()
os.chdir(Path(__file__).resolve().parents[1])
class PreviewHandler(SimpleHTTPRequestHandler):
 def end_headers(self):
  self.send_header('Cache-Control','no-store')
  super().end_headers()
server=ThreadingHTTPServer(('127.0.0.1',args.port),PreviewHandler)
print(f'Portrait Workshop: http://127.0.0.1:{args.port}/',flush=True)
if args.open:threading.Timer(.6,lambda:webbrowser.open(f'http://127.0.0.1:{args.port}/')).start()
try:server.serve_forever()
except KeyboardInterrupt:pass
finally:server.server_close()

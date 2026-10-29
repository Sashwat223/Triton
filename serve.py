import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Enable caching for static image assets
        if self.path.endswith(('.jpg', '.png', '.webp', '.css', '.js')):
            self.send_header('Cache-Control', 'public, max-age=86400')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

def main():
    global PORT
    for attempt in range(10):
        try:
            with socketserver.TCPServer(("", PORT), Handler) as httpd:
                url = f"http://localhost:{PORT}"
                print("\n" + "="*60)
                print(f"  TRITON — Hear Beyond.")
                print(f"  Apple-Level Scrollytelling Experience")
                print("="*60)
                print(f"  Local Server:  {url}")
                print(f"  Serving Dir:   {DIRECTORY}")
                print("="*60)
                print("  Press Ctrl+C to terminate server.\n")
                
                try:
                    webbrowser.open(url)
                except Exception:
                    pass

                httpd.serve_forever()
                break
        except OSError:
            PORT += 1

if __name__ == '__main__':
    main()

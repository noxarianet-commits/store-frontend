import http.server
import socketserver
import os

PORT = 3400
DIRECTORY = "/root/store-frontend/dist"

class SPAHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Tentukan path file yang diminta
        requested_path = self.translate_path(self.path)
        
        # Jika file tidak ada atau itu adalah direktori, arahkan ke index.html
        if not os.path.exists(requested_path) or os.path.isdir(requested_path):
            self.path = '/index.html'
            
        return super().do_GET()

os.chdir(DIRECTORY)
with socketserver.TCPServer(("", PORT), SPAHandler) as httpd:
    print(f"Serving SPA at port {PORT}")
    httpd.serve_forever()

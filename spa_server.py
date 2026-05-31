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

    def log_message(self, format, *args):
        
        real_ip = self.headers.get('CF-Connecting-IP', self.client_address[0])
        
        # Menampilkan log ke terminal dengan format: IP_ASLI - - [WAKTU] "REQUEST"
        import sys
        sys.stderr.write("%s - - [%s] %s\n" %
                         (real_ip,
                          self.log_date_time_string(),
                          format % args))

# Berpindah ke direktori target
os.chdir(DIRECTORY)

# Menggunakan bind ke "127.0.0.1" lebih aman jika hanya ingin diakses via Tunnel
with socketserver.TCPServer(("127.0.0.1", PORT), SPAHandler) as httpd:
    print(f"Serving SPA at port {PORT}")
    print("Logging IP asli via Cloudflare Tunnel aktif.")
    httpd.serve_forever()
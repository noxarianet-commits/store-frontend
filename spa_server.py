import http.server
import socketserver
import os
import sys

# Lokasi project
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_FILE = os.path.join(BASE_DIR, ".env")


# Membaca konfigurasi .env tanpa dependency tambahan
def load_env(path):
    if not os.path.isfile(path):
        return

    with open(path, "r", encoding="utf-8") as file:
        for line in file:
            line = line.strip()

            # Abaikan baris kosong dan komentar
            if not line or line.startswith("#"):
                continue

            if "=" not in line:
                continue

            key, value = line.split("=", 1)

            key = key.strip()
            value = value.strip().strip('"').strip("'")

            if key:
                os.environ[key] = value


# Load .env
load_env(ENV_FILE)


# Konfigurasi server
PORT = int(os.getenv("PORT", "3400"))
DIRECTORY = os.getenv("DIRECTORY", "./dist")

# Resolve relative path berdasarkan lokasi server.py
if not os.path.isabs(DIRECTORY):
    DIRECTORY = os.path.join(BASE_DIR, DIRECTORY)

DIRECTORY = os.path.abspath(DIRECTORY)


class SPAHandler(http.server.SimpleHTTPRequestHandler):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        # Tentukan path file yang diminta
        requested_path = self.translate_path(self.path)

        # SPA fallback ke index.html
        if not os.path.exists(requested_path) or os.path.isdir(requested_path):
            self.path = "/index.html"

        return super().do_GET()

    def log_message(self, format, *args):
        # Ambil IP asli dari Cloudflare Tunnel
        real_ip = self.headers.get(
            "CF-Connecting-IP",
            self.client_address[0]
        )

        sys.stdout.write(
            "%s - - [%s] %s\n" % (
                real_ip,
                self.log_date_time_string(),
                format % args
            )
        )


# Validasi directory
if not os.path.isdir(DIRECTORY):
    raise FileNotFoundError(
        f"Directory tidak ditemukan: {DIRECTORY}"
    )

# TCP Server
class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True


# Jalankan server
with ReusableTCPServer(("127.0.0.1", PORT), SPAHandler) as httpd:
    print("=" * 45)
    print("SPA Server Started")
    print("=" * 45)
    print(f"Port      : {PORT}")
    print(f"Directory : {DIRECTORY}")
    print("Host      : 127.0.0.1")
    print("Cloudflare Tunnel logging: enabled")
    print("=" * 45)

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")

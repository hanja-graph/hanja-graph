#!/usr/bin/env python3
from http import server
import ssl
import os
import subprocess

PORT = 3001
DIRECTORY = "dist"

class MyHTTPRequestHandler(server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_my_headers()
        server.SimpleHTTPRequestHandler.end_headers(self)

    def send_my_headers(self):
        self.send_header("Cross-Origin-Embedder-Policy", "require-corp");
        self.send_header("Cross-Origin-Opener-Policy", "same-origin");


if __name__ == '__main__':
    this_script_dir = os.path.dirname(os.path.realpath(__file__))
    cert_dir = os.path.join(this_script_dir, "cert")
    cert_path = os.path.join(cert_dir, "server.pem")
    if not os.path.exists(cert_path):
        try:
            cmd = ["openssl", 
                        "req", 
                        "-new", 
                        "-x509", 
                        "-keyout", 
                        cert_path, 
                        "-out", 
                        cert_path, 
                        "-days", 
                        "365",
                        "-nodes",
                        "-subj",
                        "/C=US/ST=California/L=SF/O=Hanja Graph /OU=IT Department/CN=localhost:3001"]
            subprocess.run(
                    cmd, 
                    check=True)
        except:
            raise RuntimeError("Could not generate SSL certificate. Maybe you don't have openssl instaled.")
    else:
        print(f"Using existing certificate at {cert_path}, if you get certificate errors try deleting this certificate before running this server.")
    httpd = server.HTTPServer(('127.0.0.1', PORT), MyHTTPRequestHandler,)
    httpd.socket = ssl.wrap_socket (httpd.socket, certfile=cert_path, server_side=True)
    httpd.serve_forever()

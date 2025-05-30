from http.server import BaseHTTPRequestHandler, HTTPServer
import urllib.request
import json
from urllib.parse import urlparse, parse_qs
from bs4 import BeautifulSoup

class ProxyHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200, "ok")
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header("Access-Control-Allow-Headers", "X-Requested-With, Content-type")
        self.end_headers()

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data)
        
        if 'url' not in data:
            self.send_error(400, "URL is required")
            return
            
        try:
            # Fetch the URL
            req = urllib.request.Request(
                data['url'],
                headers={
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
                }
            )
            
            with urllib.request.urlopen(req) as response:
                html = response.read().decode('utf-8')
                
            # Parse with BeautifulSoup
            soup = BeautifulSoup(html, 'html.parser')
            
            # Remove unwanted elements
            for element in soup(['script', 'style', 'iframe', 'noscript', 'nav', 'footer', 'header', 'aside']):
                element.decompose()
                
            # Get the main content
            article = soup.find('article') or soup.find('main') or soup.find('div', class_=lambda x: x and 'content' in x.lower())
            
            if not article:
                article = soup.find('body')
                
            # Prepare response
            response_data = {
                'title': soup.title.string if soup.title else 'No title',
                'content': str(article) if article else str(soup),
                'text': article.get_text(separator='\n', strip=True) if article else soup.get_text(separator='\n', strip=True)
            }
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response_data).encode('utf-8'))
            
        except Exception as e:
            self.send_error(500, str(e))

def run(server_class=HTTPServer, handler_class=ProxyHandler, port=3000):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f'Starting proxy server on port {port}...')
    httpd.serve_forever()

if __name__ == '__main__':
    run()

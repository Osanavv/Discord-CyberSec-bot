import sys
import json
import requests
from urllib.parse import urlparse

def analyze_http_headers(url):
    """
    Analyze semua HTTP headers dari website
    """
    try:
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
        
        parsed = urlparse(url)
        base_url = f"{parsed.scheme}://{parsed.netloc}"
        
        response = requests.get(base_url, timeout=10, allow_redirects=True, verify=False)
        
        headers = dict(response.headers)
        
        security_headers = {}
        caching_headers = {}
        server_headers = {}
        content_headers = {}
        other_headers = {}
        
        security_keys = [
            'Strict-Transport-Security', 'Content-Security-Policy', 'X-Frame-Options',
            'X-Content-Type-Options', 'X-XSS-Protection', 'Referrer-Policy',
            'Permissions-Policy', 'Cross-Origin-Embedder-Policy', 'Cross-Origin-Opener-Policy',
            'Cross-Origin-Resource-Policy'
        ]
        
        caching_keys = [
            'Cache-Control', 'Expires', 'ETag', 'Last-Modified', 'Age', 'Pragma'
        ]
        
        server_keys = [
            'Server', 'X-Powered-By', 'X-AspNet-Version', 'X-AspNetMvc-Version',
            'X-Runtime', 'X-Version'
        ]
        
        content_keys = [
            'Content-Type', 'Content-Length', 'Content-Encoding', 'Content-Language',
            'Content-Location', 'Transfer-Encoding'
        ]
        
        for key, value in headers.items():
            if key in security_keys:
                security_headers[key] = value
            elif key in caching_keys:
                caching_headers[key] = value
            elif key in server_keys:
                server_headers[key] = value
            elif key in content_keys:
                content_headers[key] = value
            else:
                other_headers[key] = value
        
        info_disclosure = []
        
        if 'Server' in headers:
            info_disclosure.append(f"Server info exposed: {headers['Server']}")
        if 'X-Powered-By' in headers:
            info_disclosure.append(f"Technology exposed: {headers['X-Powered-By']}")
        if 'X-AspNet-Version' in headers:
            info_disclosure.append(f"ASP.NET version exposed: {headers['X-AspNet-Version']}")
        
        cookies = []
        if 'Set-Cookie' in response.headers:
            cookie_header = response.headers['Set-Cookie']
            cookies.append({
                'raw': cookie_header[:200],  # <<Limit length
                'has_httponly': 'HttpOnly' in cookie_header,
                'has_secure': 'Secure' in cookie_header,
                'has_samesite': 'SameSite' in cookie_header
            })
        
        result = {
            'url': base_url,
            'status_code': response.status_code,
            'final_url': response.url,
            'redirected': base_url != response.url,
            'total_headers': len(headers),
            'security_headers': security_headers,
            'caching_headers': caching_headers,
            'server_headers': server_headers,
            'content_headers': content_headers,
            'other_headers': other_headers,
            'info_disclosure': info_disclosure,
            'cookies': cookies,
            'response_time_ms': int(response.elapsed.total_seconds() * 1000)
        }
        
        print(json.dumps(result, indent=2))
        return 0
        
    except requests.exceptions.Timeout:
        error = {"error": "Request timeout - Website tidak merespon"}
        print(json.dumps(error))
        return 1
    except requests.exceptions.SSLError:
        error = {"error": "SSL Certificate error"}
        print(json.dumps(error))
        return 1
    except requests.exceptions.ConnectionError:
        error = {"error": "Connection error - Website tidak dapat diakses"}
        print(json.dumps(error))
        return 1
    except Exception as e:
        error = {"error": f"Error: {str(e)}"}
        print(json.dumps(error))
        return 1

if __name__ == "__main__":
    if len(sys.argv) < 2:
        error = {"error": "Usage: python http_headers.py <URL>"}
        print(json.dumps(error))
        sys.exit(1)
    
    url = sys.argv[1]
    sys.exit(analyze_http_headers(url))
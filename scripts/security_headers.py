import sys
import json
import requests
from urllib.parse import urlparse

def check_security_headers(url):
    """
    Check security headers dari website
    """
    try:
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
        
        parsed = urlparse(url)
        base_url = f"{parsed.scheme}://{parsed.netloc}"
        
        response = requests.get(base_url, timeout=10, allow_redirects=True, verify=False)
        headers = response.headers
        
        security_headers = {
            'Strict-Transport-Security': {
                'description': 'HSTS - Force HTTPS',
                'severity': 'high',
                'recommendation': 'Enforce HTTPS untuk prevent MITM attacks'
            },
            'Content-Security-Policy': {
                'description': 'CSP - Prevent XSS',
                'severity': 'high',
                'recommendation': 'Define trusted content sources'
            },
            'X-Frame-Options': {
                'description': 'Clickjacking Protection',
                'severity': 'medium',
                'recommendation': 'Prevent iframe embedding'
            },
            'X-Content-Type-Options': {
                'description': 'MIME Sniffing Protection',
                'severity': 'medium',
                'recommendation': 'Set to "nosniff"'
            },
            'Referrer-Policy': {
                'description': 'Control Referrer Info',
                'severity': 'low',
                'recommendation': 'Protect user privacy'
            },
            'Permissions-Policy': {
                'description': 'Feature Policy',
                'severity': 'low',
                'recommendation': 'Control browser features'
            },
            'X-XSS-Protection': {
                'description': 'XSS Filter (Deprecated)',
                'severity': 'low',
                'recommendation': 'Use CSP instead (legacy browsers)'
            }
        }
        
        results = {
            'url': base_url,
            'status_code': response.status_code,
            'headers_found': {},
            'headers_missing': {},
            'score': 0,
            'grade': '',
            'server': headers.get('Server', 'Unknown'),
            'powered_by': headers.get('X-Powered-By', 'Unknown')
        }
        
        total_headers = len(security_headers)
        found_count = 0
        
        for header_name, header_info in security_headers.items():
            if header_name in headers:
                found_count += 1
                results['headers_found'][header_name] = {
                    'value': headers[header_name],
                    'description': header_info['description'],
                    'severity': header_info['severity']
                }
            else:
                results['headers_missing'][header_name] = {
                    'description': header_info['description'],
                    'severity': header_info['severity'],
                    'recommendation': header_info['recommendation']
                }
        
        results['score'] = int((found_count / total_headers) * 100)
        
        if results['score'] >= 90:
            results['grade'] = 'A+'
        elif results['score'] >= 80:
            results['grade'] = 'A'
        elif results['score'] >= 70:
            results['grade'] = 'B'
        elif results['score'] >= 60:
            results['grade'] = 'C'
        elif results['score'] >= 50:
            results['grade'] = 'D'
        else:
            results['grade'] = 'F'
        
        print(json.dumps(results, indent=2))
        return 0
        
    except requests.exceptions.Timeout:
        error = {"error": "Request timeout - Website tidak merespon"}
        print(json.dumps(error))
        return 1
    except requests.exceptions.SSLError:
        error = {"error": "SSL Certificate error - Invalid/expired certificate"}
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
        error = {"error": "Usage: python security_headers.py <URL>"}
        print(json.dumps(error))
        sys.exit(1)
    
    url = sys.argv[1]
    sys.exit(check_security_headers(url))
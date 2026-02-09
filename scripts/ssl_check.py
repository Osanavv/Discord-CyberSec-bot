import sys
import json
import ssl
import socket
from datetime import datetime
from urllib.parse import urlparse

def check_ssl_certificate(domain):
    """
    Check SSL/TLS certificate info
    """
    try:
        domain = domain.replace('https://', '').replace('http://', '').split('/')[0]
        
        port = 443
        
        if ':' in domain:
            domain, port = domain.split(':')
            port = int(port)
        
        context = ssl.create_default_context()
        
        with socket.create_connection((domain, port), timeout=10) as sock:
            with context.wrap_socket(sock, server_hostname=domain) as ssock:
                cert = ssock.getpeercert()
                
                cipher = ssock.cipher()
                version = ssock.version()
                
                subject = dict(x[0] for x in cert['subject'])
                issued_to = subject.get('commonName', 'N/A')
                
                issuer = dict(x[0] for x in cert['issuer'])
                issued_by = issuer.get('commonName', 'N/A')
                
                not_before = datetime.strptime(cert['notBefore'], '%b %d %H:%M:%S %Y %Z')
                not_after = datetime.strptime(cert['notAfter'], '%b %d %H:%M:%S %Y %Z')
                
                days_remaining = (not_after - datetime.now()).days
                
                san_list = []
                if 'subjectAltName' in cert:
                    san_list = [x[1] for x in cert['subjectAltName']]
                
                if days_remaining < 0:
                    status = 'EXPIRED'
                    status_emoji = '🔴'
                elif days_remaining < 30:
                    status = 'EXPIRING SOON'
                    status_emoji = '🟠'
                else:
                    status = 'VALID'
                    status_emoji = '🟢'
                
                result = {
                    'domain': domain,
                    'port': port,
                    'status': status,
                    'status_emoji': status_emoji,
                    'issued_to': issued_to,
                    'issued_by': issued_by,
                    'valid_from': not_before.strftime('%Y-%m-%d %H:%M:%S UTC'),
                    'valid_until': not_after.strftime('%Y-%m-%d %H:%M:%S UTC'),
                    'days_remaining': days_remaining,
                    'serial_number': cert.get('serialNumber', 'N/A'),
                    'version': cert.get('version', 'N/A'),
                    'signature_algorithm': cert.get('signatureAlgorithm', 'N/A'),
                    'san': san_list,
                    'san_count': len(san_list),
                    'cipher_suite': cipher[0] if cipher else 'N/A',
                    'cipher_version': cipher[1] if cipher else 'N/A',
                    'cipher_bits': cipher[2] if cipher else 'N/A',
                    'tls_version': version or 'N/A'
                }
                
                print(json.dumps(result, indent=2))
                return 0
                
    except socket.timeout:
        error = {"error": "Connection timeout - Server tidak merespon"}
        print(json.dumps(error))
        return 1
    except socket.gaierror:
        error = {"error": "Domain tidak dapat di-resolve"}
        print(json.dumps(error))
        return 1
    except ssl.SSLError as e:
        error = {"error": f"SSL Error: {str(e)}"}
        print(json.dumps(error))
        return 1
    except Exception as e:
        error = {"error": f"Error: {str(e)}"}
        print(json.dumps(error))
        return 1

if __name__ == "__main__":
    if len(sys.argv) < 2:
        error = {"error": "Usage: python ssl_check.py <DOMAIN>"}
        print(json.dumps(error))
        sys.exit(1)
    
    domain = sys.argv[1]
    sys.exit(check_ssl_certificate(domain))
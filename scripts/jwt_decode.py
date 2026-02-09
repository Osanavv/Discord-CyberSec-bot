import sys
import json
import base64
from datetime import datetime

def decode_jwt(token):
    """
    Decode JWT token (doesn't verify signature!)
    """
    try:
        parts = token.split('.')
        
        if len(parts) != 3:
            error = {"error": "Invalid JWT format. Expected 3 parts separated by dots."}
            print(json.dumps(error))
            return 1
        
        header_b64, payload_b64, signature_b64 = parts
        
        header_padding = header_b64 + '=' * (4 - len(header_b64) % 4)
        header_json = base64.urlsafe_b64decode(header_padding).decode('utf-8')
        header = json.loads(header_json)
        
        payload_padding = payload_b64 + '=' * (4 - len(payload_b64) % 4)
        payload_json = base64.urlsafe_b64decode(payload_padding).decode('utf-8')
        payload = json.loads(payload_json)
        
        claims_analysis = {}
        
        if 'exp' in payload:
            exp_timestamp = payload['exp']
            exp_date = datetime.fromtimestamp(exp_timestamp)
            is_expired = datetime.now() > exp_date
            claims_analysis['expiration'] = {
                'timestamp': exp_timestamp,
                'datetime': exp_date.strftime('%Y-%m-%d %H:%M:%S'),
                'is_expired': is_expired
            }
        
        if 'iat' in payload:
            iat_timestamp = payload['iat']
            iat_date = datetime.fromtimestamp(iat_timestamp)
            claims_analysis['issued_at'] = {
                'timestamp': iat_timestamp,
                'datetime': iat_date.strftime('%Y-%m-%d %H:%M:%S')
            }
        
        if 'nbf' in payload:
            nbf_timestamp = payload['nbf']
            nbf_date = datetime.fromtimestamp(nbf_timestamp)
            claims_analysis['not_before'] = {
                'timestamp': nbf_timestamp,
                'datetime': nbf_date.strftime('%Y-%m-%d %H:%M:%S')
            }
        
        security_issues = []
        
        alg = header.get('alg', 'unknown')
        if alg == 'none':
            security_issues.append("⚠️ CRITICAL: Algorithm is 'none' - No signature verification!")
        elif alg.startswith('HS'):
            security_issues.append("⚠️ Using HMAC (symmetric). Ensure secret is strong.")
        
        sensitive_keys = ['password', 'secret', 'api_key', 'token', 'private_key']
        for key in payload.keys():
            if any(sens in key.lower() for sens in sensitive_keys):
                security_issues.append(f"⚠️ Potentially sensitive data in payload: '{key}'")
        
        result = {
            'valid_format': True,
            'header': header,
            'payload': payload,
            'signature': signature_b64[:20] + '...' if len(signature_b64) > 20 else signature_b64,
            'claims_analysis': claims_analysis,
            'security_issues': security_issues,
            'algorithm': alg,
            'token_type': header.get('typ', 'unknown')
        }
        
        print(json.dumps(result, indent=2))
        return 0
        
    except Exception as e:
        error = {"error": f"Failed to decode JWT: {str(e)}"}
        print(json.dumps(error))
        return 1

if __name__ == "__main__":
    if len(sys.argv) < 2:
        error = {"error": "Usage: python jwt_decode.py <JWT_TOKEN>"}
        print(json.dumps(error))
        sys.exit(1)
    
    token = sys.argv[1]
    sys.exit(decode_jwt(token))
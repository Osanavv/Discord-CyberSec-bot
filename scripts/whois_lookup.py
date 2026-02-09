import sys
import json
import whois
from datetime import datetime

def format_date(date_obj):
    """Convert datetime object to string"""
    if isinstance(date_obj, datetime):
        return date_obj.strftime("%Y-%m-%d %H:%M:%S")
    elif isinstance(date_obj, list) and len(date_obj) > 0:
        return format_date(date_obj[0])
    return str(date_obj) if date_obj else "N/A"

def whois_lookup(domain):
    """
    WHOIS lookup untuk domain
    """
    try:
        w = whois.whois(domain)
        
        result = {
            "domain_name": w.domain_name[0] if isinstance(w.domain_name, list) else w.domain_name or "N/A",
            "registrar": w.registrar or "N/A",
            "whois_server": w.whois_server or "N/A",
            "creation_date": format_date(w.creation_date),
            "expiration_date": format_date(w.expiration_date),
            "updated_date": format_date(w.updated_date),
            "status": w.status[0] if isinstance(w.status, list) else w.status or "N/A",
            "name_servers": ", ".join(w.name_servers) if w.name_servers else "N/A",
            "dnssec": w.dnssec or "N/A",
            "registrant": w.name or "N/A",
            "org": w.org or "N/A",
            "country": w.country or "N/A",
            "emails": ", ".join(w.emails) if w.emails else "N/A"
        }
        
        print(json.dumps(result, indent=2))
        return 0
        
    except whois.parser.PywhoisError as e:
        error = {"error": f"Domain tidak ditemukan atau tidak valid"}
        print(json.dumps(error))
        return 1
    except Exception as e:
        error = {"error": f"Error: {str(e)}"}
        print(json.dumps(error))
        return 1

if __name__ == "__main__":
    if len(sys.argv) < 2:
        error = {"error": "Usage: python whois_lookup.py <DOMAIN>"}
        print(json.dumps(error))
        sys.exit(1)
    
    domain = sys.argv[1]
    sys.exit(whois_lookup(domain))
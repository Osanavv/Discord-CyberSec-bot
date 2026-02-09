import sys
import json
import dns.resolver
from dns.exception import DNSException

def dns_lookup(domain, record_type='ALL'):
    """
    DNS lookup untuk berbagai record types
    """
    results = {}
    
    record_types = {
        'A': 'IPv4 Address',
        'AAAA': 'IPv6 Address',
        'MX': 'Mail Exchange',
        'NS': 'Name Server',
        'TXT': 'Text Records',
        'CNAME': 'Canonical Name',
        'SOA': 'Start of Authority',
        'PTR': 'Pointer Record'
    }
    
    if record_type.upper() == 'ALL':
        types_to_query = record_types.keys()
    else:
        types_to_query = [record_type.upper()]
    
    try:
        for rtype in types_to_query:
            try:
                answers = dns.resolver.resolve(domain, rtype)
                records = []
                
                for rdata in answers:
                    if rtype == 'MX':
                        records.append(f"{rdata.preference} {rdata.exchange}")
                    elif rtype == 'SOA':
                        records.append(f"Primary NS: {rdata.mname}, Admin: {rdata.rname}")
                    elif rtype == 'TXT':
                        records.append(' '.join([s.decode() if isinstance(s, bytes) else str(s) for s in rdata.strings]))
                    else:
                        records.append(str(rdata))
                
                results[rtype] = {
                    'description': record_types.get(rtype, rtype),
                    'records': records,
                    'count': len(records)
                }
                
            except dns.resolver.NoAnswer:
                continue
            except dns.resolver.NXDOMAIN:
                results['error'] = f"Domain {domain} tidak ditemukan"
                return results
            except Exception as e:
                continue
        
        if not results:
            results['error'] = "Tidak ada DNS records ditemukan"
        
        print(json.dumps(results, indent=2))
        return 0
        
    except DNSException as e:
        error = {"error": f"DNS Error: {str(e)}"}
        print(json.dumps(error))
        return 1
    except Exception as e:
        error = {"error": f"Error: {str(e)}"}
        print(json.dumps(error))
        return 1

if __name__ == "__main__":
    if len(sys.argv) < 2:
        error = {"error": "Usage: python dns_lookup.py <DOMAIN> [RECORD_TYPE]"}
        print(json.dumps(error))
        sys.exit(1)
    
    domain = sys.argv[1]
    record_type = sys.argv[2] if len(sys.argv) > 2 else 'ALL'
    
    sys.exit(dns_lookup(domain, record_type))
import sys
import json
import dns.resolver
import concurrent.futures

COMMON_SUBDOMAINS = [
    'www', 'mail', 'ftp', 'localhost', 'webmail', 'smtp', 'pop', 'ns1', 'webdisk',
    'ns2', 'cpanel', 'whm', 'autodiscover', 'autoconfig', 'm', 'imap', 'test',
    'ns', 'blog', 'pop3', 'dev', 'www2', 'admin', 'forum', 'news', 'vpn',
    'ns3', 'mail2', 'new', 'mysql', 'old', 'lists', 'support', 'mobile', 'mx',
    'static', 'docs', 'beta', 'shop', 'sql', 'secure', 'demo', 'cp', 'calendar',
    'wiki', 'web', 'media', 'email', 'images', 'img', 'www1', 'intranet',
    'portal', 'video', 'sip', 'dns2', 'api', 'cdn', 'stats', 'dns1', 'ns4',
    'www3', 'dns', 'search', 'staging', 'server', 'mx1', 'chat', 'wap', 'my',
    'svn', 'mail1', 'sites', 'proxy', 'ads', 'host', 'crm', 'cms', 'backup',
    'mx2', 'lyncdiscover', 'info', 'apps', 'download', 'remote', 'db', 'forums',
    'store', 'relay', 'files', 'newsletter', 'app', 'live', 'owa', 'en', 'start',
    'sms', 'office', 'exchange', 'ipv4'
]

def check_subdomain(subdomain, domain):
    """
    Check apakah subdomain exist dengan DNS lookup
    """
    full_domain = f"{subdomain}.{domain}"
    try:
        resolver = dns.resolver.Resolver()
        resolver.timeout = 2
        resolver.lifetime = 2
        
        answers = resolver.resolve(full_domain, 'A')
        ips = [str(rdata) for rdata in answers]
        
        return {
            "subdomain": full_domain,
            "ips": ips,
            "found": True
        }
    except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer, dns.resolver.Timeout):
        return None
    except Exception as e:
        return None

def enumerate_subdomains(domain, max_workers=20):
    """
    Enumerate subdomains menggunakan wordlist
    """
    found_subdomains = []
    
    print(json.dumps({"status": "starting", "total": len(COMMON_SUBDOMAINS)}), flush=True)
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {
            executor.submit(check_subdomain, sub, domain): sub 
            for sub in COMMON_SUBDOMAINS
        }
        
        for future in concurrent.futures.as_completed(futures):
            result = future.result()
            if result and result['found']:
                found_subdomains.append(result)
                print(json.dumps({
                    "status": "found",
                    "subdomain": result['subdomain'],
                    "ips": result['ips']
                }), flush=True)
    
    final_result = {
        "status": "completed",
        "domain": domain,
        "found_count": len(found_subdomains),
        "subdomains": found_subdomains
    }
    
    print(json.dumps(final_result, indent=2), flush=True)
    return 0

if __name__ == "__main__":
    if len(sys.argv) < 2:
        error = {"error": "Usage: python subdomain_enum.py <DOMAIN>"}
        print(json.dumps(error))
        sys.exit(1)
    
    domain = sys.argv[1]
    sys.exit(enumerate_subdomains(domain))
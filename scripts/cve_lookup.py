import sys
import json
import requests

def search_cve(query):
    """
    Search CVE database menggunakan NVD API
    """
    try:
        base_url = "https://services.nvd.nist.gov/rest/json/cves/2.0"
        
        if query.upper().startswith('CVE-'):
            params = {
                'cveId': query.upper()
            }
        else:
            params = {
                'keywordSearch': query,
                'resultsPerPage': 5 
            }
        
        response = requests.get(base_url, params=params, timeout=15)
        
        if response.status_code == 200:
            data = response.json()
            
            if 'vulnerabilities' not in data or len(data['vulnerabilities']) == 0:
                result = {
                    'found': False,
                    'query': query,
                    'message': 'No CVE found for this query'
                }
                print(json.dumps(result, indent=2))
                return 0
            
            cves = []
            for vuln in data['vulnerabilities'][:5]: 
                cve_data = vuln['cve']
                
                cve_id = cve_data['id']
                description = 'No description available'
                
                if 'descriptions' in cve_data:
                    for desc in cve_data['descriptions']:
                        if desc['lang'] == 'en':
                            description = desc['value']
                            break
                
                cvss_v3_score = 'N/A'
                cvss_v3_severity = 'N/A'
                
                if 'metrics' in cve_data:
                    if 'cvssMetricV31' in cve_data['metrics']:
                        cvss = cve_data['metrics']['cvssMetricV31'][0]['cvssData']
                        cvss_v3_score = cvss.get('baseScore', 'N/A')
                        cvss_v3_severity = cvss.get('baseSeverity', 'N/A')
                    elif 'cvssMetricV30' in cve_data['metrics']:
                        cvss = cve_data['metrics']['cvssMetricV30'][0]['cvssData']
                        cvss_v3_score = cvss.get('baseScore', 'N/A')
                        cvss_v3_severity = cvss.get('baseSeverity', 'N/A')
                
                published = cve_data.get('published', 'Unknown')[:10]
                
                references = []
                if 'references' in cve_data:
                    references = [ref['url'] for ref in cve_data['references'][:3]]
                
                cves.append({
                    'id': cve_id,
                    'description': description[:500],  
                    'cvss_score': cvss_v3_score,
                    'severity': cvss_v3_severity,
                    'published': published,
                    'references': references
                })
            
            result = {
                'found': True,
                'query': query,
                'total_results': data.get('totalResults', len(cves)),
                'returned': len(cves),
                'cves': cves
            }
            
            print(json.dumps(result, indent=2))
            return 0
            
        elif response.status_code == 403:
            error = {"error": "Rate limit exceeded. Try again in a few seconds."}
            print(json.dumps(error))
            return 1
        else:
            error = {"error": f"API returned status code {response.status_code}"}
            print(json.dumps(error))
            return 1
            
    except requests.exceptions.Timeout:
        error = {"error": "Request timeout - NVD API tidak merespon"}
        print(json.dumps(error))
        return 1
    except Exception as e:
        error = {"error": f"Error: {str(e)}"}
        print(json.dumps(error))
        return 1

if __name__ == "__main__":
    if len(sys.argv) < 2:
        error = {"error": "Usage: python cve_lookup.py <CVE-ID or KEYWORD>"}
        print(json.dumps(error))
        sys.exit(1)
    
    query = ' '.join(sys.argv[1:]) 
    sys.exit(search_cve(query))
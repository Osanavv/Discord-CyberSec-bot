import sys
import json
import requests

def lookup_ip(ip_address):
    """
    Lookup informasi IP menggunakan ip-api.com
    Free tier: Unlimited (45 requests/minute)
    """
    try:
        url = "http://ip-api.com/json/" + ip_address + "?fields=66846719"
        
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
        
            if data.get("status") == "fail":
                error = {"error": data.get("message", "Invalid IP or private IP")}
                print(json.dumps(error))
                return 1

            result = {
                "ip": data.get("query", "N/A"),
                "city": data.get("city", "N/A"),
                "region": data.get("regionName", "N/A"),
                "country": data.get("country", "N/A"),
                "country_code": data.get("countryCode", "N/A"),
                "continent": data.get("continent", "N/A"),
                "postal": data.get("zip", "N/A"),
                "latitude": data.get("lat", "N/A"),
                "longitude": data.get("lon", "N/A"),
                "timezone": data.get("timezone", "N/A"),
                "utc_offset": str(data.get("offset", "N/A")),
                "currency": data.get("currency", "N/A"),
                "calling_code": "+" + str(data.get("callingCode", "N/A")) if data.get("callingCode") else "N/A",
                "languages": "N/A",
                "asn": data.get("as", "N/A"),
                "org": data.get("org", "N/A"),
                "isp": data.get("isp", "N/A"),
            }
            
            print(json.dumps(result, indent=2))
            return 0
        else:
            error = {"error": "API returned status code " + str(response.status_code)}
            print(json.dumps(error))
            return 1
            
    except requests.exceptions.Timeout:
        error = {"error": "Request timeout - API tidak merespon"}
        print(json.dumps(error))
        return 1
    except requests.exceptions.RequestException as e:
        error = {"error": "Network error: " + str(e)}
        print(json.dumps(error))
        return 1
    except Exception as e:
        error = {"error": "Unexpected error: " + str(e)}
        print(json.dumps(error))
        return 1

if __name__ == "__main__":
    if len(sys.argv) < 2:
        error = {"error": "Usage: python ip_lookup.py <IP_ADDRESS>"}
        print(json.dumps(error))
        sys.exit(1)
    
    ip = sys.argv[1]
    sys.exit(lookup_ip(ip))
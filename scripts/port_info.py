import sys
import json

#port database list by AI
PORT_DATABASE = {
    20: {"service": "FTP Data Transfer", "protocol": "TCP", "risk": "medium", "description": "File Transfer Protocol - Data channel"},
    21: {"service": "FTP Control", "protocol": "TCP", "risk": "medium", "description": "File Transfer Protocol - Control channel"},
    22: {"service": "SSH", "protocol": "TCP", "risk": "low", "description": "Secure Shell - Encrypted remote login"},
    23: {"service": "Telnet", "protocol": "TCP", "risk": "high", "description": "Unencrypted remote login (INSECURE!)"},
    25: {"service": "SMTP", "protocol": "TCP", "risk": "medium", "description": "Simple Mail Transfer Protocol"},
    53: {"service": "DNS", "protocol": "TCP/UDP", "risk": "low", "description": "Domain Name System"},
    80: {"service": "HTTP", "protocol": "TCP", "risk": "medium", "description": "Hypertext Transfer Protocol (unencrypted)"},
    110: {"service": "POP3", "protocol": "TCP", "risk": "medium", "description": "Post Office Protocol v3"},
    143: {"service": "IMAP", "protocol": "TCP", "risk": "medium", "description": "Internet Message Access Protocol"},
    443: {"service": "HTTPS", "protocol": "TCP", "risk": "low", "description": "HTTP Secure (encrypted)"},
    445: {"service": "SMB", "protocol": "TCP", "risk": "high", "description": "Server Message Block (often exploited)"},
    3306: {"service": "MySQL", "protocol": "TCP", "risk": "high", "description": "MySQL Database Server"},
    3389: {"service": "RDP", "protocol": "TCP", "risk": "high", "description": "Remote Desktop Protocol"},
    5432: {"service": "PostgreSQL", "protocol": "TCP", "risk": "high", "description": "PostgreSQL Database"},
    5900: {"service": "VNC", "protocol": "TCP", "risk": "high", "description": "Virtual Network Computing"},
    6379: {"service": "Redis", "protocol": "TCP", "risk": "high", "description": "Redis Database (often misconfigured)"},
    8080: {"service": "HTTP Proxy", "protocol": "TCP", "risk": "medium", "description": "Alternative HTTP port"},
    8443: {"service": "HTTPS Alt", "protocol": "TCP", "risk": "medium", "description": "Alternative HTTPS port"},
    27017: {"service": "MongoDB", "protocol": "TCP", "risk": "high", "description": "MongoDB Database"},
    
    1337: {"service": "CTF/Custom", "protocol": "TCP", "risk": "low", "description": "Commonly used in CTF challenges"},
    31337: {"service": "Elite/Hacker", "protocol": "TCP", "risk": "low", "description": "\"Elite\" port, often in CTFs"},
    4444: {"service": "Metasploit", "protocol": "TCP", "risk": "high", "description": "Default Metasploit payload port"},
    5555: {"service": "Android Debug", "protocol": "TCP", "risk": "medium", "description": "Android Debug Bridge (ADB)"},
    
    514: {"service": "Syslog", "protocol": "UDP", "risk": "low", "description": "System Logging Protocol"},
    161: {"service": "SNMP", "protocol": "UDP", "risk": "medium", "description": "Simple Network Management Protocol"},
    162: {"service": "SNMP Trap", "protocol": "UDP", "risk": "medium", "description": "SNMP Trap"},
    389: {"service": "LDAP", "protocol": "TCP", "risk": "medium", "description": "Lightweight Directory Access Protocol"},
    636: {"service": "LDAPS", "protocol": "TCP", "risk": "low", "description": "LDAP over SSL"},
    1433: {"service": "MSSQL", "protocol": "TCP", "risk": "high", "description": "Microsoft SQL Server"},
    1521: {"service": "Oracle DB", "protocol": "TCP", "risk": "high", "description": "Oracle Database"},
    2049: {"service": "NFS", "protocol": "TCP/UDP", "risk": "high", "description": "Network File System"},
    2375: {"service": "Docker", "protocol": "TCP", "risk": "high", "description": "Docker REST API (unencrypted)"},
    2376: {"service": "Docker TLS", "protocol": "TCP", "risk": "medium", "description": "Docker REST API (TLS)"},
    8000: {"service": "HTTP Dev", "protocol": "TCP", "risk": "low", "description": "Common development server port"},
    8888: {"service": "HTTP Alt", "protocol": "TCP", "risk": "low", "description": "Alternative HTTP port"},
    9000: {"service": "PHP-FPM", "protocol": "TCP", "risk": "medium", "description": "PHP FastCGI Process Manager"},
}

def port_lookup(port):
    """
    Lookup port information
    """
    try:
        port = int(port)
        
        if port < 1 or port > 65535:
            error = {"error": "Port number must be between 1-65535"}
            print(json.dumps(error))
            return 1
        
        if port in PORT_DATABASE:
            info = PORT_DATABASE[port]
            result = {
                'port': port,
                'found': True,
                'service': info['service'],
                'protocol': info['protocol'],
                'risk_level': info['risk'],
                'description': info['description'],
                'common_exploits': get_common_exploits(port),
                'security_notes': get_security_notes(port)
            }
        else:
            # Port tidak dalam database
            result = {
                'port': port,
                'found': False,
                'service': 'Unknown',
                'protocol': 'Unknown',
                'risk_level': 'unknown',
                'description': f'Port {port} tidak ada dalam database common ports.',
                'port_range': get_port_range_info(port)
            }
        
        print(json.dumps(result, indent=2))
        return 0
        
    except ValueError:
        error = {"error": "Invalid port number"}
        print(json.dumps(error))
        return 1
    except Exception as e:
        error = {"error": f"Error: {str(e)}"}
        print(json.dumps(error))
        return 1

def get_common_exploits(port):
    exploits = {
        21: ["Anonymous FTP login", "FTP bounce attack"],
        22: ["SSH brute force", "Weak key algorithms"],
        23: ["Credential sniffing (unencrypted)", "Telnet brute force"],
        25: ["SMTP relay abuse", "Email spoofing"],
        80: ["SQL injection", "XSS", "Directory traversal"],
        443: ["SSL/TLS vulnerabilities", "Heartbleed (old OpenSSL)"],
        445: ["EternalBlue (MS17-010)", "SMB relay attacks"],
        3306: ["MySQL injection", "Weak root password"],
        3389: ["BlueKeep (CVE-2019-0708)", "RDP brute force"],
        6379: ["Unauthenticated access", "Redis RCE"],
        27017: ["MongoDB no-auth", "NoSQL injection"],
    }
    return exploits.get(port, ["Check CVE database for specific vulnerabilities"])

def get_security_notes(port):
    notes = {
        23: "⚠️ CRITICAL: Telnet is UNENCRYPTED! Use SSH (port 22) instead.",
        21: "⚠️ Consider using SFTP (port 22) instead of FTP.",
        445: "⚠️ HIGH RISK: SMB has been target of major exploits (WannaCry, NotPetya).",
        3389: "⚠️ HIGH RISK: RDP should not be exposed to internet. Use VPN.",
        3306: "⚠️ Database should not be publicly accessible!",
        6379: "⚠️ Redis should require authentication and not be public!",
        27017: "⚠️ MongoDB should require authentication!",
    }
    return notes.get(port, "Follow security best practices for this service.")

def get_port_range_info(port):
    if port < 1024:
        return "Well-known ports (0-1023) - System/privileged services"
    elif port < 49152:
        return "Registered ports (1024-49151) - User/application services"
    else:
        return "Dynamic/Private ports (49152-65535) - Temporary/ephemeral"

if __name__ == "__main__":
    if len(sys.argv) < 2:
        error = {"error": "Usage: python port_info.py <PORT>"}
        print(json.dumps(error))
        sys.exit(1)
    
    port = sys.argv[1]
    sys.exit(port_lookup(port))
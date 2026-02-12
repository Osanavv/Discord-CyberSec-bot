# What's New?
## Added:
- **Security Headers Checker**
- **SSL Certificate Inspector**
- **HTTP Headers Analyzer**
- **SQL Injection Payloads**
- **XSS Payloads**
- **JWT Decoder**

## Fixed:
- **DNS Lookup**


# 🔐 Discord CyberSec Bot

All-in-one Discord bot for cybersecurity toolkit. Reconnaissance, analysis, and security testing directly from Discord without opening a browser or installing tools!

![Discord.js](https://img.shields.io/badge/discord.js-v14-blue)
![Python](https://img.shields.io/badge/python-3.8+-green)
![Node.js](https://img.shields.io/badge/node.js-v16+-brightgreen)

---

## ✨ Main Features

### 🔒 Cryptography & Encoding
- **Hash Generator** - Generate MD5, SHA-1, SHA-256, SHA-512 hashes from text
- **Base64 Encoder/Decoder** - Encode and decode Base64 strings

### 🌐 Network & Domain Analysis
- **IP Lookup** - Geolocation, ISP, timezone, currency, and complete IP address information
- **WHOIS Lookup** - Domain registration info, registrar, creation/expiry dates, nameservers
- **DNS Lookup** - Query DNS records (A, AAAA, MX, NS, TXT, CNAME, SOA, PTR)
- **Subdomain Enumeration** - Discover subdomains with parallel scanning (multi-threaded)

### 🛡️ Web Security Analysis
- **Security Headers Checker** - Analyze website security headers (HSTS, CSP, X-Frame-Options, etc.)
- **SSL Certificate Inspector** - Detailed certificate information, expiry date, cipher suites
- **HTTP Headers Analyzer** - Complete analysis of all HTTP headers from websites

### ⚔️ Web Exploitation Tools
- **SQL Injection Payloads** - Generate various types of SQLi payloads (auth bypass, UNION, blind, etc.)
- **XSS Payloads** - Generate XSS payloads with various bypass techniques
- **JWT Decoder** - Decode and analyze JSON Web Tokens
- **CVE Lookup** - Search vulnerability database (NVD API)

### 📊 Utilities
- **Ping** - Check bot latency and API response time

---

## 🚀 Quick Start

### Prerequisites

Make sure you have installed:
- **Node.js** v16+ ([Download](https://nodejs.org/))
- **Python** 3.8+ ([Download](https://www.python.org/))
- **Discord Bot Token** ([How to create a bot](https://discord.com/developers/applications))

### Installation

**1. Clone repository**
```bash
git clone https://github.com/username/discord-cybersec-bot.git
cd discord-cybersec-bot
```

**2. Install Node.js dependencies**
```bash
npm install
```

**3. Install Python dependencies**
```bash
pip install -r requirements.txt
# or if using pip3:
pip3 install -r requirements.txt
```

**4. Setup environment variables**

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit the `.env` file and fill in your bot token:
```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=application_client_id_here
```

**How to get your token:**
1. Open [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" or select an existing application
3. Go to the **"Bot"** tab
4. Copy the **Token** (click "Reset Token" if needed)
5. Copy the **Application ID** from the **"General Information"** tab
6. **Important:** Enable **Message Content Intent** in the Bot tab

**5. Deploy slash commands**
```bash
node deploy-commands.js
```

**6. Invite bot to Discord server**

Generate invite link with required permissions:
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=2048&scope=bot%20applications.commands
```

Replace `YOUR_CLIENT_ID` with your bot's Client ID.

**7. Run the bot**
```bash
node bot.js
```
---

## 📝 Command List

### Cryptography & Encoding

| Command | Description | Example |
|---------|-----------|--------|
| `/hash` | Generate hash from text | `/hash text:HelloWorld algorithm:sha256` |
| `/base64 encode` | Encode text to Base64 | `/base64 encode text:SecretMessage` |
| `/base64 decode` | Decode Base64 to text | `/base64 decode base64:U2VjcmV0TWVzc2FnZQ==` |

### Network Analysis

| Command | Description | Example |
|---------|-----------|--------|
| `/iplookup` | Lookup IP address information | `/iplookup ip:8.8.8.8` |
| `/whois` | WHOIS domain lookup | `/whois domain:google.com` |
| `/dns` | DNS records lookup | `/dns domain:github.com type:MX` |
| `/subdomain` | Enumerate subdomains | `/subdomain domain:example.com` |

### Web Security

| Command | Description | Example |
|---------|-----------|--------|
| `/secheaders` | Analyze security headers | `/secheaders url:google.com` |
| `/ssl` | SSL certificate information | `/ssl domain:github.com` |
| `/headers` | Complete HTTP headers analysis | `/headers url:example.com` |

### Web Exploitation

| Command | Description | Example |
|---------|-----------|--------|
| `/sqli` | Generate SQL injection payloads | `/sqli type:Auth Bypass` |
| `/xss` | Generate XSS payloads | `/xss type:Basic XSS` |
| `/jwt` | Decode JWT token | `/jwt token:eyJhbGc...` |
| `/cve` | Search CVE database | `/cve query:log4j` |

### Utilities

| Command | Description | Example |
|---------|-----------|--------|
| `/ping` | Check bot latency | `/ping` |

---

## 🏗️ Project Structure
```
discord-cybersec-bot/
├── bot.js                      # Main bot file
├── deploy-commands.js          # Command registration script
├── .env.example                # Environment template
├── package.json                # Node.js dependencies
├── package-lock.json           # Lock file
├── requirements.txt            # Python dependencies
├── .gitignore                  # Git ignore rules
├── README.md                   # Documentation (this file)
│
├── commands/                   # Discord slash commands
│   ├── ping.js                 # Latency checker
│   ├── hash.js                 # Hash generator
│   ├── base64.js               # Base64 encoder/decoder
│   ├── iplookup.js             # IP geolocation
│   ├── whois.js                # WHOIS domain lookup
│   ├── dns.js                  # DNS records lookup
│   ├── subdomain.js            # Subdomain enumeration
│   ├── secheaders.js           # Security headers checker
│   ├── ssl.js                  # SSL certificate info
│   ├── headers.js              # HTTP headers analyzer
│   ├── sqli.js                 # SQL injection payloads
│   ├── xss.js                  # XSS payloads
│   ├── jwt.js                  # JWT decoder
│   ├── portinfo.js             # Port information
│   └── cve.js                  # CVE lookup
│
└── scripts/                    # Python security scripts
    ├── ip_lookup.py            # IP geolocation API handler
    ├── whois_lookup.py         # WHOIS query handler
    ├── dns_lookup.py           # DNS resolver
    ├── subdomain_enum.py       # Subdomain enumeration engine
    ├── security_headers.py     # Security headers checker
    ├── ssl_check.py            # SSL certificate inspector
    ├── http_headers.py         # HTTP headers analyzer
    ├── sqli_payloads.py        # SQL injection payload generator
    ├── xss_payloads.py         # XSS payload generator
    ├── jwt_decode.py           # JWT decoder
    ├── port_info.py            # Port information database
    └── cve_lookup.py           # CVE database search (NVD API)
```

---

## ⚙️ Configuration

### API Rate Limits

- **IP Lookup:** 1,000 requests/day (ipapi.co free tier)
- **WHOIS:** Unlimited (direct WHOIS server queries)
- **DNS:** Unlimited (direct DNS queries)
- **Subdomain Enum:** Unlimited (DNS-based enumeration)
- **CVE Lookup:** 5 requests/30 seconds without API key (NVD)

### Customization

**Subdomain Wordlist:**

Edit the `COMMON_SUBDOMAINS` list in `scripts/subdomain_enum.py`:
```python
COMMON_SUBDOMAINS = [
    'www', 'mail', 'ftp', 'api', 'dev', 'staging',
    # Add more subdomains here
]
```

**Thread Count for Subdomain Scan:**

Adjust the `max_workers` parameter in `scripts/subdomain_enum.py`:
```python
def enumerate_subdomains(domain, max_workers=20, wordlist=None):
    # Increase for faster scanning
    # Decrease for stability
```

**Timeout Settings:**

Edit timeout in command files, example `commands/subdomain.js`:
```javascript
const { stdout, stderr } = await execPromise(
    `python3 scripts/subdomain_enum.py ${domain}`,
    { timeout: 60000 }  // 60 seconds
);
```

---

## 🛡️ Security & Legal

### ⚠️ IMPORTANT DISCLAIMER

**This tool is ONLY for:**
- ✅ Authorized penetration testing with written permission
- ✅ Bug bounty programs (within scope)
- ✅ Testing YOUR OWN applications
- ✅ Educational and learning purposes
- ✅ CTF (Capture The Flag) competitions

**DO NOT use for:**
- ❌ Scanning domains without permission
- ❌ Unauthorized testing or hacking
- ❌ Violating terms of service
- ❌ Any illegal activities

### ⚖️ Legal Notice

- Always obtain **WRITTEN PERMISSION** before conducting testing
- The author is **NOT RESPONSIBLE** for misuse of this tool
- Users are fully responsible for their use of the tool

### 🔒 Best Practices

1. **Only test your own infrastructure** or with written authorization
2. **Respect rate limits** - don't overwhelm target systems
3. **Be transparent** - identify yourself when conducting security research
4. **Follow responsible disclosure** if you find vulnerabilities
5. **Stay updated** with local laws regarding cybersecurity

### 🚨 Web Exploitation Features

SQL Injection and XSS payload generator features have a **confirmation system**:
- Users must react with ✅ to confirm
- Displays legal disclaimer
- Response is set to ephemeral (only the user can see)
- 60 second timeout if not confirmed

---

## 🙏 Acknowledgments

### Libraries & APIs

- [discord.js](https://discord.js.org/) - Powerful Discord API wrapper for Node.js
- [ipapi.co](https://ipapi.co/) - IP geolocation API
- [python-whois](https://github.com/richardpenman/pywhois) - WHOIS library for Python
- [dnspython](https://www.dnspython.org/) - DNS toolkit for Python
- [NVD API](https://nvd.nist.gov/developers) - National Vulnerability Database API
- [requests](https://requests.readthedocs.io/) - HTTP library for Python
<div align="center">
</div>

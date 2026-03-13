import urllib.request
import urllib.parse
import json
import sys

BASE_URL = "http://127.0.0.1:8000/api"

def request_api(method, url, data=None, token=None):
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    if data is not None:
        data = json.dumps(data).encode('utf-8')
        headers["Content-Type"] = "application/json"
    
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            return response.getcode(), json.loads(response.read().decode())
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        return e.code, body
    except Exception as e:
        return 500, str(e)

print("--- Starting API Tests ---")

# 1. Login
code, res = request_api("POST", f"{BASE_URL}/login/", {"email": "venustendikumana2003@gmail.com", "password": "Venuste !!@1"})
if code == 200:
    print("[PASS] Login successful.")
    token = res['tokens']['access']
else:
    print("[FAIL] Login failed:", code, res)
    sys.exit(1)

# 2. Get PCs
code, res = request_api("GET", f"{BASE_URL}/pcs/", token=token)
if code == 200:
    print("[PASS] PCs GET successful (Count: {})".format(res.get('count', 0)))
else:
    print("[FAIL] PCs GET failed:", code, res)

# 3. Get Dashboard
code, res = request_api("GET", f"{BASE_URL}/dashboard/", token=token)
if code == 200:
    print("[PASS] Dashboard GET successful.")
else:
    print("[FAIL] Dashboard GET failed:", code, res)

# 4. Create Request
req_data = {
    "first_name": "Test", 
    "last_name": "User", 
    "email": "test@test.com", 
    "telephone": "123", 
    "unit": "IT", 
    "request_type": "OS repair", 
    "description": "Help"
}
code, res = request_api("POST", f"{BASE_URL}/requests/", data=req_data)
if code == 201:
    print("[PASS] Request POST successful.")
    req_id = res['request_id']
    # Cleanup
    code, _ = request_api("DELETE", f"{BASE_URL}/requests/{req_id}/", token=token)
    if code == 200:
        print("[PASS] Request DELETE successful.")
    else:
        print("[FAIL] Request DELETE failed:", code, res)
else:
    print("[FAIL] Request POST failed:", code, res)

print("--- All Tests Finished ---")

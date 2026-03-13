import os
import django
import traceback

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.test import Client
client = Client()

try:
    response = client.get('/api/schema/')
    print(f"Status Code: {response.status_code}")
    if response.status_code == 500:
        print("Response Content:")
        print(response.content.decode('utf-8')[:2000]) # First 2000 chars of HTML trace
except Exception as e:
    traceback.print_exc()

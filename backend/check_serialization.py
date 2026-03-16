import os
import django
import sys
import json

# Add the backend directory to sys.path
sys.path.append('c:/Users/cyberguard/Desktop/PCMS/backend')

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from requests_app.models import Request
from requests_app.serializers import RequestSerializer

def check_serialization():
    print("--- CHECKING REQUEST SERIALIZATION ---")
    reqs = Request.objects.all()
    serializer = RequestSerializer(reqs, many=True)
    print(json.dumps(serializer.data, indent=2))

if __name__ == "__main__":
    check_serialization()

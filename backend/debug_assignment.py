import os
import django
import sys

# Add the backend directory to sys.path
sys.path.append('c:/Users/cyberguard/Desktop/PCMS/backend')

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from requests_app.models import Request

User = get_user_model()

def debug():
    print("--- DEBUGGING USERS ---")
    users = User.objects.all()
    for u in users:
        print(f"ID: {u.id} | Email: {u.email} | Role: {u.role} | Status: {u.status} | IsAdmin: {u.is_admin}")

    print("\n--- DEBUGGING REQUESTS ---")
    reqs = Request.objects.all()
    for r in reqs:
        print(f"ID: {r.id} | Status: {r.status} | Tech: {r.assigned_technician}")

    print("\n--- TESTING ASSIGNMENT LOGIC ---")
    admin = User.objects.filter(role__iexact='Administrator').first()
    tech = User.objects.filter(role__iexact='Technician').first()
    pending_req = Request.objects.filter(status='Pending').first()

    if not admin or not tech or not pending_req:
        print("Missing required data (Admin, Tech, or Pending Request)")
        return

    print(f"Attempting to assign Tech({tech.id}) to Request({pending_req.id}) as Admin({admin.id})")
    
    # Simulate View logic
    try:
        pending_req.assigned_technician = tech
        pending_req.status = 'Technician Assigned'
        pending_req.save()
        
        tech.status = 'Busy'
        tech.save()
        
        print(f"SUCCESS: Assigned {tech.full_name} to Request #{pending_req.id}")
        
        # Re-check
        updated_req = Request.objects.get(pk=pending_req.id)
        print(f"Verification: Request Status: {updated_req.status}, Assigned Tech: {updated_req.assigned_technician.full_name}")
        
    except Exception as e:
        print(f"FAILURE: {str(e)}")

if __name__ == "__main__":
    debug()

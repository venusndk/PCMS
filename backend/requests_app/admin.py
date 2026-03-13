from django.contrib import admin
from .models import Request

@admin.register(Request)
class RequestAdmin(admin.ModelAdmin):
    list_display = ['id', 'full_name', 'request_type', 'unit', 'status', 'date', 'assigned_technician']
    list_filter = ['status', 'request_type']
    search_fields = ['first_name', 'last_name', 'email']

from django.contrib import admin
from .models import Report

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ['id', 'device_type', 'device_id', 'status', 'technician', 'report_date']
    list_filter = ['device_type', 'status']

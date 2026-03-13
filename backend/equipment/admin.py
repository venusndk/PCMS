from django.contrib import admin
from .models import PC, Accessory, NetworkDevice

@admin.register(PC)
class PCAdmin(admin.ModelAdmin):
    list_display = ['brand', 'ram', 'operating_system', 'location', 'status', 'technician_assigned']
    list_filter = ['location', 'status']
    search_fields = ['brand', 'operating_system']

@admin.register(Accessory)
class AccessoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'brand', 'location', 'status', 'technician_assigned']
    list_filter = ['name', 'status']

@admin.register(NetworkDevice)
class NetworkDeviceAdmin(admin.ModelAdmin):
    list_display = ['name', 'brand', 'ip_address', 'location', 'status']
    list_filter = ['name', 'status']

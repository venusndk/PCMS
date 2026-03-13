"""
Equipment App - Serializers
============================
Serializers for PC, Accessory, and NetworkDevice models.
"""

from rest_framework import serializers
from .models import PC, Accessory, NetworkDevice
from users.serializers import UserSerializer


# ─────────────────────────────────────────────────────────────
# PC SERIALIZERS
# ─────────────────────────────────────────────────────────────
class PCSerializer(serializers.ModelSerializer):
    """
    Serializer for reading PC data.
    Shows technician details as a nested object.
    """
    technician_assigned = UserSerializer(read_only=True)

    class Meta:
        model = PC
        fields = ['id', 'brand', 'ram', 'hdd', 'operating_system',
                  'registration_year', 'location', 'status',
                  'technician_assigned', 'created_at']
        read_only_fields = ['id', 'created_at']


class PCWriteSerializer(serializers.ModelSerializer):
    """
    Serializer for creating/updating a PC.
    Accepts technician_assigned as an ID (integer).
    """
    class Meta:
        model = PC
        fields = ['id', 'brand', 'ram', 'hdd', 'operating_system',
                  'registration_year', 'location', 'status', 'technician_assigned']


# ─────────────────────────────────────────────────────────────
# ACCESSORY SERIALIZERS
# ─────────────────────────────────────────────────────────────
class AccessorySerializer(serializers.ModelSerializer):
    """Serializer for reading Accessory data."""
    technician_assigned = UserSerializer(read_only=True)

    class Meta:
        model = Accessory
        fields = ['id', 'name', 'brand', 'location', 'status',
                  'technician_assigned', 'created_at']
        read_only_fields = ['id', 'created_at']


class AccessoryWriteSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating an Accessory."""
    class Meta:
        model = Accessory
        fields = ['id', 'name', 'brand', 'location', 'status', 'technician_assigned']


# ─────────────────────────────────────────────────────────────
# NETWORK DEVICE SERIALIZERS
# ─────────────────────────────────────────────────────────────
class NetworkDeviceSerializer(serializers.ModelSerializer):
    """Serializer for reading NetworkDevice data."""
    technician_assigned = UserSerializer(read_only=True)

    class Meta:
        model = NetworkDevice
        fields = ['id', 'name', 'brand', 'ip_address', 'location', 'status',
                  'technician_assigned', 'created_at']
        read_only_fields = ['id', 'created_at']


class NetworkDeviceWriteSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating a NetworkDevice."""
    class Meta:
        model = NetworkDevice
        fields = ['id', 'name', 'brand', 'ip_address', 'location', 'status', 'technician_assigned']

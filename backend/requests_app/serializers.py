from rest_framework import serializers
from .models import Request
from users.serializers import UserSerializer


class RequestSerializer(serializers.ModelSerializer):
    """For reading request data - shows technician details."""
    assigned_technician = UserSerializer(read_only=True)

    class Meta:
        model = Request
        fields = ['id', 'first_name', 'last_name', 'email', 'telephone',
                  'unit', 'request_type', 'description', 'date',
                  'status', 'assigned_technician']
        read_only_fields = ['id', 'date', 'status', 'assigned_technician']


class RequestCreateSerializer(serializers.ModelSerializer):
    """For creating a new request (submitted by anyone - no login needed)."""
    class Meta:
        model = Request
        fields = ['first_name', 'last_name', 'email', 'telephone',
                  'unit', 'request_type', 'description']


class AssignTechnicianSerializer(serializers.Serializer):
    """For assigning a technician to a request (Admin only)."""
    technician_id = serializers.IntegerField(help_text="The ID of the technician to assign")


class UpdateRequestStatusSerializer(serializers.Serializer):
    """For updating request status (Technician)."""
    STATUS_CHOICES = [('Fixed', 'Fixed'), ('Not Fixed', 'Not Fixed')]
    status = serializers.ChoiceField(choices=STATUS_CHOICES)


class RequestNotificationSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for the notifications dropdown.
    Keep this small to make frequent polling cheap.
    """

    class Meta:
        model = Request
        fields = ['id', 'first_name', 'last_name', 'unit', 'request_type', 'date', 'status']
        read_only_fields = fields

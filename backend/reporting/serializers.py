from rest_framework import serializers
from .models import Report
from users.serializers import UserSerializer


class ReportSerializer(serializers.ModelSerializer):
    technician = UserSerializer(read_only=True)

    class Meta:
        model = Report
        fields = ['id', 'device_type', 'device_id', 'status', 'technician',
                  'location', 'report_date', 'description']
        read_only_fields = ['id', 'report_date', 'technician']


class ReportCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ['device_type', 'device_id', 'status', 'location', 'description']

"""
Reporting App - Models
=======================
Stores maintenance reports created by technicians.
"""

from django.db import models
from django.conf import settings


class Report(models.Model):
    """
    A maintenance report for any type of device.
    """

    DEVICE_TYPE_CHOICES = [
        ('PC', 'PC'),
        ('Accessory', 'Accessory'),
        ('NetworkDevice', 'Network Device'),
    ]

    STATUS_CHOICES = [
        ('Working', 'Working'),
        ('Not Working', 'Not Working'),
        ('Damaged', 'Damaged'),
        ('Old', 'Old'),
        ('Repaired', 'Repaired'),
        ('Replaced', 'Replaced'),
    ]

    device_type  = models.CharField(max_length=20, choices=DEVICE_TYPE_CHOICES)
    device_id    = models.IntegerField(help_text="The ID of the PC, Accessory, or Network Device")
    status       = models.CharField(max_length=20, choices=STATUS_CHOICES)
    technician   = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='reports'
    )
    location     = models.CharField(max_length=100)
    report_date  = models.DateField(auto_now_add=True)
    description  = models.TextField(help_text="Describe what was done or what the problem is")

    class Meta:
        db_table = 'reports'
        ordering = ['-report_date']

    def __str__(self):
        return f"Report #{self.pk} - {self.device_type} #{self.device_id} ({self.status})"

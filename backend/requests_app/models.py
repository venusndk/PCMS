"""
Requests App - Models
======================
Stores ICT support requests submitted by employees.
Employees don't need to log in — they just submit a request form.
"""

from django.db import models
from django.conf import settings


class Request(models.Model):
    """
    An ICT support request submitted by an employee.
    """

    # Request type choices
    REQUEST_TYPE_CHOICES = [
        ('Internet cable installation', 'Internet cable installation'),
        ('OS repair', 'OS repair'),
        ('Antivirus installation', 'Antivirus installation'),
        ('Hardware repair', 'Hardware repair'),
        ('Software installation', 'Software installation'),
        ('Network troubleshooting', 'Network troubleshooting'),
        ('Data recovery', 'Data recovery'),
        ('Other ICT services', 'Other ICT services'),
    ]

    # Status choices
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Technician Assigned', 'Technician Assigned'),
        ('Fixed', 'Fixed'),
        ('Not Fixed', 'Not Fixed'),
    ]

    # Employee information (no login required)
    first_name           = models.CharField(max_length=100)
    last_name            = models.CharField(max_length=100)
    email                = models.EmailField()
    telephone            = models.CharField(max_length=20)
    unit                 = models.CharField(max_length=100, help_text="Department or Unit name")

    # Request details
    request_type         = models.CharField(max_length=100, choices=REQUEST_TYPE_CHOICES)
    description          = models.TextField(help_text="Describe the issue in detail")
    date                 = models.DateTimeField(auto_now_add=True)


    # Status tracking
    status               = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Pending')
    assigned_technician  = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        limit_choices_to={'role': 'Technician'},
        related_name='assigned_requests'
    )

    # Tracking updates (Who fixed it and when)
    updated_by           = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='updated_requests'
    )
    updated_at           = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'requests'
        ordering = ['-date']  # Newest first

    def __str__(self):
        return f"Request #{self.pk} - {self.request_type} ({self.status})"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

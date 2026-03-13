"""
Equipment App - Models
=======================
This file defines three models:
1. PC - Desktop computers
2. Accessory - Peripheral devices (Mouse, Keyboard, etc.)
3. NetworkDevice - Network equipment (Router, Switch, etc.)
"""

from django.db import models
from django.conf import settings


# Shared status choices used across all equipment types
EQUIPMENT_STATUS_CHOICES = [
    ('Working', 'Working'),
    ('Not Working', 'Not Working'),
    ('Damaged', 'Damaged'),
    ('Old', 'Old'),
]

# Shared location choices
LOCATION_CHOICES = [
    ('Lab', 'Lab'),
    ('Office', 'Office'),
]


# ─────────────────────────────────────────────────────────────
# PC MODEL
# ─────────────────────────────────────────────────────────────
class PC(models.Model):
    """
    Represents a desktop computer in the organization.
    """
    brand               = models.CharField(max_length=100, help_text="e.g., Dell, HP, Lenovo")
    ram                 = models.CharField(max_length=50, help_text="e.g., 8GB, 16GB")
    hdd                 = models.CharField(max_length=50, help_text="e.g., 500GB HDD, 256GB SSD")
    operating_system    = models.CharField(max_length=100, help_text="e.g., Windows 10, Ubuntu 22")
    registration_year   = models.IntegerField(help_text="Year this PC was registered")
    location            = models.CharField(max_length=20, choices=LOCATION_CHOICES, default='Office')
    status              = models.CharField(max_length=20, choices=EQUIPMENT_STATUS_CHOICES, default='Working')
    technician_assigned = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        limit_choices_to={'role': 'Technician'},  # Only allow Technicians to be assigned
        related_name='assigned_pcs'
    )
    created_at          = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'pcs'
        ordering = ['-created_at']  # Newest first

    def __str__(self):
        return f"{self.brand} PC - {self.location} ({self.status})"


# ─────────────────────────────────────────────────────────────
# ACCESSORY MODEL
# ─────────────────────────────────────────────────────────────
class Accessory(models.Model):
    """
    Represents a peripheral device (Mouse, Keyboard, Monitor, Projector, etc.)
    """
    ACCESSORY_TYPE_CHOICES = [
        ('Mouse', 'Mouse'),
        ('Keyboard', 'Keyboard'),
        ('Monitor', 'Monitor'),
        ('Projector', 'Projector'),
        ('Printer', 'Printer'),
        ('Scanner', 'Scanner'),
        ('UPS', 'UPS'),
        ('Other', 'Other'),
    ]

    name                = models.CharField(max_length=100, choices=ACCESSORY_TYPE_CHOICES)
    brand               = models.CharField(max_length=100)
    location            = models.CharField(max_length=100)
    status              = models.CharField(max_length=20, choices=EQUIPMENT_STATUS_CHOICES, default='Working')
    technician_assigned = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        limit_choices_to={'role': 'Technician'},
        related_name='assigned_accessories'
    )
    created_at          = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'accessories'
        verbose_name_plural = 'Accessories'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.brand} {self.name} - {self.location} ({self.status})"


# ─────────────────────────────────────────────────────────────
# NETWORK DEVICE MODEL
# ─────────────────────────────────────────────────────────────
class NetworkDevice(models.Model):
    """
    Represents a network device (Access Point, Switch, Router, etc.)
    """
    NETWORK_DEVICE_CHOICES = [
        ('Access Point', 'Access Point'),
        ('Switch', 'Switch'),
        ('Router', 'Router'),
        ('Modem', 'Modem'),
        ('Firewall', 'Firewall'),
        ('Other', 'Other'),
    ]

    name                = models.CharField(max_length=100, choices=NETWORK_DEVICE_CHOICES)
    brand               = models.CharField(max_length=100)
    ip_address          = models.GenericIPAddressField(null=True, blank=True, help_text="e.g., 192.168.1.1")
    location            = models.CharField(max_length=100)
    status              = models.CharField(max_length=20, choices=EQUIPMENT_STATUS_CHOICES, default='Working')
    technician_assigned = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        limit_choices_to={'role': 'Technician'},
        related_name='assigned_network_devices'
    )
    created_at          = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'network_devices'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.brand} {self.name} - {self.ip_address} ({self.status})"

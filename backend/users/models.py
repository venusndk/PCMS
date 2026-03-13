"""
Users App - Models
==================
This file defines our custom User model that replaces Django's default User.

Why a custom User model?
- We need extra fields like 'role', 'phone', 'status'
- We use 'email' as the login field instead of 'username'
"""

from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin


# ─────────────────────────────────────────────────────────────
# USER MANAGER
# ─────────────────────────────────────────────────────────────
class UserManager(BaseUserManager):
    """
    Custom manager for our User model.
    Tells Django how to create users and superusers.
    """

    def create_user(self, email, password=None, **extra_fields):
        """Create a regular user."""
        if not email:
            raise ValueError('Email address is required')
        email = self.normalize_email(email)  # lowercase the domain part
        user = self.model(email=email, **extra_fields)
        user.set_password(password)          # hash the password
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """Create a superuser (for Django admin panel)."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'Administrator')
        return self.create_user(email, password, **extra_fields)


# ─────────────────────────────────────────────────────────────
# USER MODEL
# ─────────────────────────────────────────────────────────────
class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom User model for PCM System.
    
    Roles:
    - Administrator: Can manage everything
    - Technician: Can manage equipment and requests assigned to them
    """

    # Role choices
    ROLE_CHOICES = [
        ('Administrator', 'Administrator'),
        ('Technician', 'Technician'),
    ]

    # Status choices
    STATUS_CHOICES = [
        ('Available', 'Available'),
        ('Busy', 'Busy'),
        ('Not Available', 'Not Available'),
    ]

    # Fields
    first_name   = models.CharField(max_length=100)
    last_name    = models.CharField(max_length=100)
    email        = models.EmailField(unique=True)   # Used as username
    role         = models.CharField(max_length=20, choices=ROLE_CHOICES, default='Technician')
    phone        = models.CharField(max_length=20, blank=True, null=True)
    status       = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Available')
    is_active    = models.BooleanField(default=True)
    is_staff     = models.BooleanField(default=False)  # Can access admin panel
    created_at   = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    # Use email as the login field (instead of username)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.role})"

    @property
    def full_name(self):
        """Returns the user's full name."""
        return f"{self.first_name} {self.last_name}"

    @property
    def is_admin(self):
        """Check if user is an Administrator."""
        return self.role == 'Administrator'

    @property
    def is_technician(self):
        """Check if user is a Technician."""
        return self.role == 'Technician'

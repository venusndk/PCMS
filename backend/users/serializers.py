"""
Users App - Serializers
========================
Serializers convert complex data (like Django models) into JSON format,
and also validate incoming data from API requests.

Think of serializers as a "translator" between Python objects and JSON.
"""

from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User


# ─────────────────────────────────────────────────────────────
# REGISTER SERIALIZER
# ─────────────────────────────────────────────────────────────
class RegisterSerializer(serializers.ModelSerializer):
    """
    Used when creating a new user (Admin only).
    - 'password' is write_only: it will never be sent back in responses
    - 'confirm_password' is just for validation, not saved to DB
    - 'role' is accepted so Admins can set Technician or Administrator
    - Password is validated against Django's AUTH_PASSWORD_VALIDATORS
    """
    password         = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'password',
                  'confirm_password', 'role', 'phone']

    def validate(self, data):
        """Check that passwords match and meet strength requirements."""
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        # Run Django's built-in password validators (min length, common passwords, etc.)
        validate_password(data['password'])
        return data

    def create(self, validated_data):
        """Remove confirm_password before saving, then create user."""
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)  # Hash the password before saving
        user.save()
        return user



# ─────────────────────────────────────────────────────────────
# LOGIN SERIALIZER
# ─────────────────────────────────────────────────────────────
class LoginSerializer(serializers.Serializer):
    """
    Used when a user logs in with email and password.
    Returns the authenticated user object.
    """
    email    = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        """Check that email and password are correct."""
        email    = data.get('email', '').strip()
        password = data.get('password')
        
        user = authenticate(username=email, password=password)
        
        if not user:
            raise serializers.ValidationError("Invalid email or password.")
        if not user.is_active:
            raise serializers.ValidationError("This account has been deactivated.")
            
        data['user'] = user
        return data


# ─────────────────────────────────────────────────────────────
# USER SERIALIZER (for reading user data)
# ─────────────────────────────────────────────────────────────
class UserSerializer(serializers.ModelSerializer):
    """
    Used to display user information in API responses.
    Password is excluded for security.
    """
    full_name = serializers.CharField(read_only=True)  # Uses the property from the model

    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'full_name', 'email',
                  'role', 'phone', 'status', 'created_at']
        read_only_fields = ['id', 'created_at']


# ─────────────────────────────────────────────────────────────
# UPDATE USER SERIALIZER
# ─────────────────────────────────────────────────────────────
class UpdateUserSerializer(serializers.ModelSerializer):
    """
    Used when updating a user's profile.
    Email and role cannot be changed through this serializer.
    """
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'phone', 'status']


# ─────────────────────────────────────────────────────────────
class ChangePasswordSerializer(serializers.Serializer):
    """Used when a user wants to change their password."""
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=6)
# ─────────────────────────────────────────────────────────────
# PASSWORD RESET SERIALIZERS
# ─────────────────────────────────────────────────────────────
class PasswordResetRequestSerializer(serializers.Serializer):
    """Validates email for password reset request."""
    email = serializers.EmailField()


class OTPVerifySerializer(serializers.Serializer):
    """Validates OTP code."""
    email = serializers.EmailField()
    otp   = serializers.CharField(max_length=6, min_length=6)


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Updates password."""
    email        = serializers.EmailField()
    otp          = serializers.CharField(max_length=6, min_length=6)
    new_password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match.")
        return data

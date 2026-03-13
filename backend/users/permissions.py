"""
Users App - Permissions
========================
Custom permissions to control who can access what.

Django REST Framework uses permission classes to check if a user
is allowed to perform an action.
"""

from rest_framework.permissions import BasePermission


class IsAdministrator(BasePermission):
    """
    Only Administrators can access this endpoint.
    """
    message = "Access denied. Only Administrators can perform this action."

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == 'Administrator'
        )


class IsTechnician(BasePermission):
    """
    Only Technicians can access this endpoint.
    """
    message = "Access denied. Only Technicians can perform this action."

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == 'Technician'
        )


class IsAdminOrTechnician(BasePermission):
    """
    Both Administrators and Technicians can access this endpoint.
    (Any authenticated user with a valid role)
    """
    message = "Access denied. You must be logged in."

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role in ['Administrator', 'Technician']
        )

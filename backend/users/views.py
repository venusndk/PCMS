"""
Users App - Views
==================
Views handle incoming API requests and return responses.

Each view:
1. Receives a request (GET, POST, PUT, DELETE)
2. Validates data using serializers
3. Performs database operations
4. Returns a JSON response
"""

from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken
from drf_spectacular.utils import extend_schema, OpenApiExample
from django.contrib.auth import get_user_model

from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer,
    UpdateUserSerializer, ChangePasswordSerializer
)
from .permissions import IsAdministrator

User = get_user_model()


def get_tokens_for_user(user):
    """
    Generate JWT access and refresh tokens for a user.
    
    Returns a dict with:
    - refresh: long-lived token to get new access tokens
    - access: short-lived token used in API requests
    """
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


# ─────────────────────────────────────────────────────────────
# REGISTER VIEW
# ─────────────────────────────────────────────────────────────
@extend_schema(tags=['Authentication'])
class RegisterView(APIView):
    """
    Register a new user (Administrator or Technician).
    [Admin Only] — Only Administrators can create new accounts.
    """
    permission_classes = [IsAdministrator]
    serializer_class = RegisterSerializer

    @extend_schema(
        summary="Register a new user (Admin only)",
        description="Create a new Administrator or Technician account. Requires Administrator JWT.",
        request=RegisterSerializer,
        examples=[
            OpenApiExample(
                'Example Request',
                value={
                    "first_name": "John",
                    "last_name": "Doe",
                    "email": "john.doe@example.com",
                    "password": "securepass123",
                    "confirm_password": "securepass123",
                    "role": "Technician",
                    "phone": "+1234567890",
                }
            )
        ]
    )
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            tokens = get_tokens_for_user(user)
            return Response({
                'message': 'User registered successfully.',
                'user': UserSerializer(user).data,
                'tokens': tokens
            }, status=status.HTTP_201_CREATED)

        # Return validation errors
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────────────────────────
# LOGIN VIEW
# ─────────────────────────────────────────────────────────────
@extend_schema(tags=['Authentication'])
class LoginView(APIView):
    """
    Login with email and password. Returns JWT tokens.
    Throttled to 10 attempts/minute per IP to prevent brute-force.
    """
    permission_classes = [AllowAny]
    # throttle_classes = [AnonRateThrottle]
    serializer_class = LoginSerializer


    @extend_schema(
        summary="Login",
        description="Authenticate with email and password. Copy the 'access' token and use it in Swagger's Authorize button as: Bearer <token>",
        request=LoginSerializer,
        examples=[
            OpenApiExample(
                'Example Request',
                value={"email": "john.doe@example.com", "password": "securepass123"}
            )
        ]
    )
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            tokens = get_tokens_for_user(user)
            return Response({
                'message': f'Welcome back, {user.full_name}!',
                'user': UserSerializer(user).data,
                'tokens': tokens
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────────────────────────
# LOGOUT VIEW
# ─────────────────────────────────────────────────────────────
@extend_schema(tags=['Authentication'])
class LogoutView(APIView):
    """
    Logout by blacklisting the refresh token.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = None  # No serializer needed; handled inline

    @extend_schema(
        summary="Logout",
        description="Logout by providing your refresh token.",
        request={'application/json': {'type': 'object', 'properties': {'refresh': {'type': 'string'}}}}
    )
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)
        except Exception:
            return Response({'error': 'Invalid token or already logged out.'}, status=status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────────────────────────
# MY PROFILE VIEW
# ─────────────────────────────────────────────────────────────
@extend_schema(tags=['Authentication'])
class MyProfileView(APIView):
    """
    Get or update the currently logged-in user's profile.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    @extend_schema(summary="Get my profile")
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    @extend_schema(summary="Update my profile", request=UpdateUserSerializer)
    def put(self, request):
        serializer = UpdateUserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Profile updated.', 'user': UserSerializer(request.user).data})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────────────────────────
# TECHNICIAN MANAGEMENT (Admin Only)
# ─────────────────────────────────────────────────────────────
@extend_schema(tags=['Technician Management (Admin Only)'])
class TechnicianListView(generics.ListAPIView):
    """
    [Admin Only] List all technicians.
    """
    permission_classes = [IsAdministrator]
    serializer_class = UserSerializer

    def get_queryset(self):
        return User.objects.filter(role='Technician').order_by('first_name')

    @extend_schema(summary="List all technicians")
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


@extend_schema(tags=['Technician Management (Admin Only)'])
class TechnicianDetailView(APIView):
    """
    [Admin Only] Get, update, or delete a specific technician.
    """
    permission_classes = [IsAdministrator]
    serializer_class = UserSerializer

    def get_object(self, pk):
        try:
            return User.objects.get(pk=pk, role='Technician')
        except User.DoesNotExist:
            return None

    @extend_schema(summary="Get technician details")
    def get(self, request, pk):
        user = self.get_object(pk)
        if not user:
            return Response({'error': 'Technician not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(UserSerializer(user).data)

    @extend_schema(summary="Update technician", request=UpdateUserSerializer)
    def put(self, request, pk):
        user = self.get_object(pk)
        if not user:
            return Response({'error': 'Technician not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = UpdateUserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Technician updated.', 'user': UserSerializer(user).data})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(summary="Delete technician")
    def delete(self, request, pk):
        user = self.get_object(pk)
        if not user:
            return Response({'error': 'Technician not found.'}, status=status.HTTP_404_NOT_FOUND)
        name = user.full_name
        user.delete()
        return Response({'message': f'Technician {name} deleted successfully.'})


# ─────────────────────────────────────────────────────────────
# CHANGE PASSWORD
# ─────────────────────────────────────────────────────────────
@extend_schema(tags=['Authentication'])
class ChangePasswordView(APIView):
    """Change the currently logged-in user's password."""
    serializer_class = ChangePasswordSerializer
    permission_classes = [IsAuthenticated]

    @extend_schema(summary="Change password", request=ChangePasswordSerializer)
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data['old_password']):
                return Response({'error': 'Old password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({'message': 'Password changed successfully.'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

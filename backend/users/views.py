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
from django.conf import settings
from django.contrib.auth import get_user_model

from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer,
    UpdateUserSerializer, ChangePasswordSerializer,
    PasswordResetRequestSerializer, OTPVerifySerializer, 
    PasswordResetConfirmSerializer
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


# ─────────────────────────────────────────────────────────────
# SYSTEM TESTING / HEALTH CHECK
# ─────────────────────────────────────────────────────────────
@extend_schema(tags=['System'])
class TestingView(APIView):
    """
    Simple health check endpoint to verify API and Database status.
    Accessible to anyone (no auth required).
    """
    permission_classes = [AllowAny]

    @extend_schema(
        summary="API Health Check",
        description="Check if the API and Database are running correctly.",
        responses={200: {'type': 'object', 'properties': {'status': {'type': 'string'}, 'database': {'type': 'string'}, 'timestamp': {'type': 'string'}}}}
    )
    def get(self, request):
        from django.db import connection
        from django.utils import timezone
        
        db_status = "Connected"
        try:
            connection.ensure_connection()
        except Exception as e:
            db_status = f"Error: {str(e)}"

        return Response({
            "status": "API is running",
            "database": db_status,
            "timestamp": timezone.now().isoformat(),
            "environment": "Development" if connection.settings_dict['NAME'] == 'PCM' else "Production"
        }, status=status.HTTP_200_OK)
# ─────────────────────────────────────────────────────────────
# PASSWORD RESET SYSTEM
# ─────────────────────────────────────────────────────────────
import uuid
import random
from django.core.mail import send_mail
from .models import PasswordReset

@extend_schema(tags=['Authentication'])
class PasswordResetRequestView(APIView):
    """
    Step 1: Request a password reset. Sends a 6-digit OTP to the user's email.
    """
    permission_classes = [AllowAny]
    serializer_class = PasswordResetRequestSerializer

    @extend_schema(summary="Request OTP")
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user = User.objects.filter(email=email).first()
            
            if user:
                # Generate 6-digit OTP
                otp = ''.join([str(random.randint(0, 9)) for _ in range(6)])
                
                # Save to database (Invalidate old ones)
                PasswordReset.objects.filter(user=user, is_used=False).update(is_used=True)
                PasswordReset.objects.create(user=user, otp=otp)
                
                # Send Email
                message = (
                    f"Hello {user.first_name},\n\n"
                    f"Your PCMS password reset OTP is: {otp}\n\n"
                    f"This code will expire in 10 minutes.\n"
                    f"If you did not request this, please ignore this email."
                )
                
                try:
                    send_mail(
                        'PCMS - Password Reset OTP',
                        message,
                        settings.DEFAULT_FROM_EMAIL,
                        [email],
                        fail_silently=False,
                    )
                    print(f"DEBUG: OTP sent to {email}")
                except Exception as e:
                    print(f"ERROR Sending OTP to {email}: {str(e)}")

            return Response({
                "message": "If an account exists, an OTP has been sent."
            }, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(tags=['Authentication'])
class PasswordResetVerifyView(APIView):
    """
    Step 2: Verify the OTP code.
    """
    permission_classes = [AllowAny]
    serializer_class = OTPVerifySerializer

    @extend_schema(summary="Verify OTP")
    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            otp   = serializer.validated_data['otp']
            
            # Find latest unused/unverified reset request
            reset_req = PasswordReset.objects.filter(
                user__email=email, is_used=False, is_verified=False
            ).first()
            
            if not reset_req or reset_req.is_expired():
                return Response({"error": "OTP expired or not found. Please request a new one."}, status=status.HTTP_400_BAD_REQUEST)
                
            # Check attempts
            if reset_req.attempts >= 5:
                reset_req.is_used = True
                reset_req.save()
                return Response({"error": "Too many failed attempts. Please request a new OTP."}, status=status.HTTP_400_BAD_REQUEST)
                
            if reset_req.otp != otp:
                reset_req.attempts += 1
                reset_req.save()
                return Response({"error": "Invalid OTP code."}, status=status.HTTP_400_BAD_REQUEST)
                
            # Success!
            reset_req.is_verified = True
            reset_req.save()
            
            return Response({"message": "OTP verified successfully."}, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(tags=['Authentication'])
class PasswordResetConfirmView(APIView):
    """
    Step 3: Reset password after verifying OTP.
    """
    permission_classes = [AllowAny]
    serializer_class = PasswordResetConfirmSerializer

    @extend_schema(summary="Reset Password")
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            email        = serializer.validated_data['email']
            otp          = serializer.validated_data['otp']
            new_password = serializer.validated_data['new_password']
            
            # Find the verified reset request
            reset_req = PasswordReset.objects.filter(
                user__email=email, otp=otp, is_verified=True, is_used=False
            ).first()
            
            if not reset_req or reset_req.is_expired():
                return Response({"error": "Invalid session or expired OTP."}, status=status.HTTP_400_BAD_REQUEST)
                
            # Success! Update password
            user = reset_req.user
            user.set_password(new_password)
            user.save()
            
            # Mark as used (Consume OTP)
            reset_req.is_used = True
            reset_req.save()
            
            return Response({"message": "Password has been reset successfully. You can now login."}, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

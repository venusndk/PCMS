"""
Users App - URL Patterns
=========================
Maps URL paths to view functions.
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # ── Authentication ──────────────────────────────────────────
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('me/', views.MyProfileView.as_view(), name='my-profile'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change-password'),

    # ── System / Health Check ───────────────────────────────────
    path('testing/', views.TestingView.as_view(), name='testing'),

    # ── Password Reset (OTP Flow) ──────────────────────────────
    path('password-reset/request/', views.PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('password-reset/verify/',  views.PasswordResetVerifyView.as_view(),  name='password-reset-verify'),
    path('password-reset/confirm/', views.PasswordResetConfirmView.as_view(), name='password-reset-confirm'),

    # ── Technician Management (Admin Only) ──────────────────────
    path('technicians/', views.TechnicianListView.as_view(), name='technician-list'),
    path('technicians/<int:pk>/', views.TechnicianDetailView.as_view(), name='technician-detail'),
]

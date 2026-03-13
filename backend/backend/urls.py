"""
Main URL Configuration for PCM System
======================================
This file connects all app URLs together.
"""

from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

urlpatterns = [
    # ── Django Admin Panel ──────────────────────────────────
    path('admin/', admin.site.urls),

    # ── API Documentation (Swagger) ─────────────────────────
    # Download the OpenAPI schema as JSON/YAML
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    # Swagger UI - interactive testing
    path('api/swagger/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    # ReDoc UI - alternative documentation viewer
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # ── App URLs ────────────────────────────────────────────
    path('api/', include('users.urls')),          # /api/login, /api/register, etc.
    path('api/', include('equipment.urls')),      # /api/pcs, /api/accessories, etc.
    path('api/', include('requests_app.urls')),   # /api/requests, etc.
    path('api/', include('reporting.urls')),      # /api/reports, etc.
    path('api/', include('dashboard.urls')),      # /api/dashboard/, etc.
]

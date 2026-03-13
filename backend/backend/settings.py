"""
Django Settings for PCM System (Personal Computer Maintenance)
==============================================================
This file contains all configuration for the Django project.
"""

from pathlib import Path
from decouple import config
from datetime import timedelta

# ─────────────────────────────────────────────
# BASE DIRECTORY
# ─────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent


# ─────────────────────────────────────────────
# SECURITY SETTINGS
# ─────────────────────────────────────────────
# SECRET_KEY is loaded from .env file (keep it secret!)
SECRET_KEY = config('SECRET_KEY', default='django-insecure-change-me-in-production')

# DEBUG should be False in production
DEBUG = config('DEBUG', default=True, cast=bool)

ALLOWED_HOSTS = ['*']  # Allow all hosts during development


# ─────────────────────────────────────────────
# INSTALLED APPS
# ─────────────────────────────────────────────
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party packages
    'rest_framework',                          # Django REST Framework
    'rest_framework_simplejwt',                # JWT Authentication
    'rest_framework_simplejwt.token_blacklist', # Required for logout (token blacklisting)
    'corsheaders',                             # Allow frontend to connect
    'drf_spectacular',                         # Swagger documentation

    # Our custom apps
    'users',
    'equipment',
    'requests_app',
    'reporting',
    'dashboard',
]

# ─────────────────────────────────────────────
# MIDDLEWARE
# ─────────────────────────────────────────────
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Must be at the top
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'


# ─────────────────────────────────────────────
# DATABASE (MySQL)
# ─────────────────────────────────────────────
# We use MySQL as our database. 
# Settings are loaded from .env file for security.
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': config('DB_NAME', default='PCM'),
        'USER': config('DB_USER', default='root'),
        'PASSWORD': config('DB_PASSWORD', default=''),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='3306'),
        'OPTIONS': {
            'charset': 'utf8mb4',          # Support all Unicode characters
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",  # Strict mode
            'connect_timeout': 10,         # Fail fast if MySQL is down
        },
    }
}


# ─────────────────────────────────────────────
# CUSTOM USER MODEL
# ─────────────────────────────────────────────
# We replace Django's default User with our custom User model
AUTH_USER_MODEL = 'users.User'


# ─────────────────────────────────────────────
# PASSWORD VALIDATION
# ─────────────────────────────────────────────
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]


# ─────────────────────────────────────────────
# DJANGO REST FRAMEWORK SETTINGS
# ─────────────────────────────────────────────
REST_FRAMEWORK = {
    # Use JWT tokens for authentication
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    # By default, require users to be logged in
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    # Use drf-spectacular for API documentation
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}


# ─────────────────────────────────────────────
# JWT SETTINGS (Token Configuration)
# ─────────────────────────────────────────────
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=8),    # Token valid for 8 hours
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),    # Refresh token valid for 7 days
    'ROTATE_REFRESH_TOKENS': True,                  # Get new refresh token on each refresh
    'BLACKLIST_AFTER_ROTATION': True,                  # Blacklist old refresh tokens after rotation
    'AUTH_HEADER_TYPES': ('Bearer',),               # Use "Bearer <token>" in headers
}


# ─────────────────────────────────────────────
# SWAGGER / API DOCUMENTATION SETTINGS
# ─────────────────────────────────────────────
SPECTACULAR_SETTINGS = {
    'TITLE': 'PCM System API',
    'DESCRIPTION': 'Personal Computer Maintenance System API',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'ENUM_NAME_OVERRIDES': {
        'UserStatusEnum': 'users.models.User.STATUS_CHOICES',
        'UserRoleEnum': 'users.models.User.ROLE_CHOICES',
        'EquipmentStatusEnum': 'equipment.models.EQUIPMENT_STATUS_CHOICES',
        'LocationEnum': 'equipment.models.LOCATION_CHOICES',
        'AccessoryTypeEnum': 'equipment.models.Accessory.ACCESSORY_TYPE_CHOICES',
        'NetworkDeviceTypeEnum': 'equipment.models.NetworkDevice.NETWORK_DEVICE_CHOICES',
        'RequestTypeEnum': 'requests_app.models.Request.REQUEST_TYPE_CHOICES',
        'RequestStatusEnum': 'requests_app.models.Request.STATUS_CHOICES',
        'ReportDeviceTypeEnum': 'reporting.models.Report.DEVICE_TYPE_CHOICES',
        'ReportStatusEnum': 'reporting.models.Report.STATUS_CHOICES',
    },
}


# ─────────────────────────────────────────────
# CORS SETTINGS (Allow Frontend to Connect)
# ─────────────────────────────────────────────
CORS_ALLOW_ALL_ORIGINS = True  # In production, list specific allowed origins


# ─────────────────────────────────────────────
# INTERNATIONALIZATION
# ─────────────────────────────────────────────
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True


# ─────────────────────────────────────────────
# STATIC FILES
# ─────────────────────────────────────────────
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ─────────────────────────────────────────────
# SUPPRESS DRF_SPECTACULAR WARNINGS (Windows OSError Bug Fix)
# ─────────────────────────────────────────────
# Suppress warnings from drf_spectacular because printing them to the
# Windows terminal (sys.stderr) via django runserver occasionally causes
# an OSError: [Errno 22] Invalid argument, resulting in a 500 error on the Schema view.
import warnings
warnings.filterwarnings("ignore", module="drf_spectacular")
warnings.filterwarnings("ignore", category=UserWarning, module="drf_spectacular")

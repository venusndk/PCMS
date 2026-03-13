# 🖥️ PCM System — Personal Computer Maintenance Management System

A full-featured REST API backend built with **Django + Django REST Framework**, using **MySQL** for the database and **Swagger** for API documentation and testing.

---

## 📁 Project Structure

```
pcm_system/
│
├── pcm_system/              ← Main project config
│   ├── __init__.py
│   ├── settings.py          ← All settings (DB, JWT, Swagger, etc.)
│   ├── urls.py              ← Root URL router
│   └── wsgi.py
│
├── users/                   ← Authentication & User Management
│   ├── models.py            ← Custom User model (email login, roles)
│   ├── serializers.py       ← Input/output data formatting
│   ├── views.py             ← API logic (register, login, technicians)
│   ├── urls.py              ← URL routes for users
│   ├── permissions.py       ← IsAdministrator, IsTechnician, etc.
│   └── admin.py
│
├── equipment/               ← PCs, Accessories, Network Devices
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   └── admin.py
│
├── requests_app/            ← ICT Support Requests
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   └── admin.py
│
├── reporting/               ← Maintenance Reports
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   └── admin.py
│
├── dashboard/               ← Statistics & Analytics
│   ├── views.py
│   ├── urls.py
│   └── apps.py
│
├── manage.py                ← Django management commands
├── requirements.txt         ← All Python packages needed
└── .env.example             ← Environment variable template
```

---

## ✅ Step-by-Step Installation Guide

### Prerequisites
Make sure you have installed:
- Python 3.10 or newer → https://www.python.org/downloads/
- MySQL 8.0 or newer → https://dev.mysql.com/downloads/
- pip (comes with Python)

---

### Step 1 — Clone or Download the Project

```bash
# If using Git:
git clone <your-repo-url>
cd pcm_system

# Or just navigate to the folder:
cd pcm_system
```

---

### Step 2 — Create a Virtual Environment

A virtual environment keeps your project's packages separate from other projects.

```bash
# Create the virtual environment
python -m venv venv

# Activate it:
# On Windows:
venv\Scripts\activate

# On Mac/Linux:
source venv/bin/activate

# You should see (venv) at the start of your terminal line ✅
```

---

### Step 3 — Install Required Packages

```bash
pip install -r requirements.txt
```

This installs: Django, Django REST Framework, JWT, Swagger, MySQL connector, CORS headers, and more.

---

### Step 4 — Create the MySQL Database

Open MySQL and run this command:

```sql
CREATE DATABASE PCM CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

You can do this in:
- MySQL Workbench (GUI tool)
- phpMyAdmin
- Or the MySQL command line: `mysql -u root -p`

---

### Step 5 — Configure Environment Variables

```bash
# Copy the example .env file
cp .env.example .env

# Open .env and fill in your details:
```

Edit the `.env` file:

```env
SECRET_KEY=my-super-secret-key-change-this-123!
DEBUG=True
DB_NAME=PCM
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_HOST=localhost
DB_PORT=3306
```

> 💡 **Tip:** The SECRET_KEY can be any long random string. For production, use: `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`

---

### Step 6 — Run Database Migrations

Migrations create all the database tables automatically.

```bash
# Create migration files (tells Django what tables to create)
python manage.py makemigrations

# Apply migrations (actually creates the tables in MySQL)
python manage.py migrate
```

After this, you should see these tables in your `PCM` database:
- `users`
- `pcs`
- `accessories`
- `network_devices`
- `requests`
- `reports`
- And several Django internal tables

---

### Step 7 — Create a Superuser (Admin Account)

```bash
python manage.py createsuperuser
```

You'll be prompted to enter:
- Email: `admin@pcm.com`
- First name: `Admin`
- Last name: `User`
- Password: (choose a secure password)

---

### Step 8 — Start the Development Server

```bash
python manage.py runserver
```

You should see:
```
Starting development server at http://127.0.0.1:8000/
```

---

### Step 9 — Open Swagger and Test APIs

Open your browser and go to:

| URL | Description |
|-----|-------------|
| http://127.0.0.1:8000/swagger/ | ✅ Swagger UI (Interactive Testing) |
| http://127.0.0.1:8000/redoc/ | 📖 ReDoc (Alternative Documentation) |
| http://127.0.0.1:8000/admin/ | 🔧 Django Admin Panel |

---

## 🔐 How to Use JWT Authentication in Swagger

1. **Open** http://127.0.0.1:8000/swagger/
2. **Call** `POST /api/login/` with your email and password
3. **Copy** the `access` token from the response
4. **Click** the green **Authorize** button (🔒) at the top of Swagger
5. **Enter:** `Bearer YOUR_ACCESS_TOKEN_HERE`
6. **Click Authorize** → Now all your requests will include the token!

---

## 📋 Complete API Reference

### 🔐 Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/register/` | Register new user | No |
| POST | `/api/login/` | Login, get JWT tokens | No |
| POST | `/api/logout/` | Logout | Yes |
| POST | `/api/token/refresh/` | Refresh access token | No |
| GET/PUT | `/api/me/` | My profile | Yes |
| POST | `/api/change-password/` | Change password | Yes |

### 👨‍💼 Technician Management (Admin Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/technicians/` | List all technicians |
| GET | `/api/technicians/{id}/` | Get technician details |
| PUT | `/api/technicians/{id}/` | Update technician |
| DELETE | `/api/technicians/{id}/` | Delete technician |

### 💻 PCs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/pcs/` | List all PCs (filter: ?location=Lab&status=Working) |
| POST | `/api/pcs/` | Register new PC |
| GET | `/api/pcs/{id}/` | Get PC details |
| PUT | `/api/pcs/{id}/` | Update PC |
| DELETE | `/api/pcs/{id}/` | Delete PC (Admin only) |

### 🖱️ Accessories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/accessories/` | List accessories (filter: ?name=Mouse&status=Working) |
| POST | `/api/accessories/` | Register new accessory |
| GET | `/api/accessories/{id}/` | Get accessory details |
| PUT | `/api/accessories/{id}/` | Update accessory |
| DELETE | `/api/accessories/{id}/` | Delete accessory |

### 🌐 Network Devices

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/network-devices/` | List network devices |
| POST | `/api/network-devices/` | Register new device |
| GET | `/api/network-devices/{id}/` | Get device details |
| PUT | `/api/network-devices/{id}/` | Update device |
| DELETE | `/api/network-devices/{id}/` | Delete device |

### 🔧 My Equipment (Technician)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/my-equipment/` | All equipment assigned to me |

### 📋 ICT Support Requests

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/requests/` | List requests | Yes |
| POST | `/api/requests/` | Submit a request | **No** (anyone) |
| GET | `/api/requests/{id}/` | Get request details | Yes |
| DELETE | `/api/requests/{id}/` | Delete request | Admin only |
| POST | `/api/assign-technician/{id}/` | Assign technician | Admin only |
| POST | `/api/requests/{id}/update-status/` | Mark Fixed/Not Fixed | Yes |

### 📊 Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/` | List maintenance reports |
| POST | `/api/reports/` | Create a report |
| GET | `/api/reports/{id}/` | Get report details |
| DELETE | `/api/reports/{id}/` | Delete report (Admin) |

### 📈 Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/` | Complete overview |
| GET | `/api/dashboard/devices/` | Device statistics |
| GET | `/api/dashboard/technicians/` | Technician statistics |
| GET | `/api/dashboard/requests/` | Request statistics |

---

## 📨 Example API Requests & Responses

### Register a User
**Request:**
```http
POST /api/register/
Content-Type: application/json

{
    "first_name": "John",
    "last_name": "Smith",
    "email": "john.smith@company.com",
    "password": "secure123",
    "confirm_password": "secure123",
    "role": "Technician",
    "phone": "+1234567890",
    "status": "Available"
}
```

**Response (201 Created):**
```json
{
    "message": "User registered successfully.",
    "user": {
        "id": 2,
        "first_name": "John",
        "last_name": "Smith",
        "full_name": "John Smith",
        "email": "john.smith@company.com",
        "role": "Technician",
        "phone": "+1234567890",
        "status": "Available",
        "created_at": "2024-01-15T10:30:00Z"
    },
    "tokens": {
        "refresh": "eyJ0eXAiOiJKV1Qi...",
        "access": "eyJ0eXAiOiJKV1Qi..."
    }
}
```

---

### Login
**Request:**
```http
POST /api/login/
Content-Type: application/json

{
    "email": "john.smith@company.com",
    "password": "secure123"
}
```

**Response (200 OK):**
```json
{
    "message": "Welcome back, John Smith!",
    "user": { ... },
    "tokens": {
        "refresh": "eyJ0eXAiOiJKV1Qi...",
        "access": "eyJ0eXAiOiJKV1Qi..."
    }
}
```

---

### Register a PC
**Request:**
```http
POST /api/pcs/
Authorization: Bearer eyJ0eXAiOiJKV1Qi...
Content-Type: application/json

{
    "brand": "Dell OptiPlex",
    "ram": "16GB",
    "hdd": "512GB SSD",
    "operating_system": "Windows 11",
    "registration_year": 2023,
    "location": "Lab",
    "status": "Working",
    "technician_assigned": 2
}
```

**Response (201 Created):**
```json
{
    "message": "PC registered successfully.",
    "pc": {
        "id": 1,
        "brand": "Dell OptiPlex",
        "ram": "16GB",
        "hdd": "512GB SSD",
        "operating_system": "Windows 11",
        "registration_year": 2023,
        "location": "Lab",
        "status": "Working",
        "technician_assigned": {
            "id": 2,
            "full_name": "John Smith",
            "email": "john.smith@company.com",
            "role": "Technician"
        },
        "created_at": "2024-01-15T10:35:00Z"
    }
}
```

---

### Submit an ICT Request (No Login Needed)
**Request:**
```http
POST /api/requests/
Content-Type: application/json

{
    "first_name": "Alice",
    "last_name": "Johnson",
    "email": "alice@company.com",
    "telephone": "+9876543210",
    "unit": "Finance Department",
    "request_type": "OS repair",
    "description": "My computer won't boot. It shows a blue screen."
}
```

**Response (201 Created):**
```json
{
    "message": "Your request has been submitted successfully. We will contact you soon.",
    "request_id": 1,
    "request": {
        "id": 1,
        "first_name": "Alice",
        "last_name": "Johnson",
        "email": "alice@company.com",
        "status": "Pending",
        "assigned_technician": null,
        ...
    }
}
```

---

### Dashboard Overview
**Request:**
```http
GET /api/dashboard/
Authorization: Bearer eyJ0eXAiOiJKV1Qi...
```

**Response:**
```json
{
    "devices": {
        "pcs": 15,
        "accessories": 42,
        "network_devices": 8,
        "total": 65
    },
    "requests": {
        "total": 23,
        "pending": 5,
        "assigned": 3,
        "fixed": 15
    },
    "technicians": {
        "total": 4,
        "available": 2,
        "busy": 1,
        "not_available": 1
    },
    "reports": {
        "total": 18
    }
}
```

---

## 🏃 Quick Start Commands Summary

```bash
# 1. Navigate to project
cd pcm_system

# 2. Activate virtual environment
source venv/bin/activate      # Mac/Linux
venv\Scripts\activate         # Windows

# 3. Install packages
pip install -r requirements.txt

# 4. Configure database in .env file
cp .env.example .env
# Edit .env with your MySQL credentials

# 5. Run migrations
python manage.py makemigrations
python manage.py migrate

# 6. Create admin account
python manage.py createsuperuser

# 7. Start server
python manage.py runserver

# 8. Open Swagger: http://127.0.0.1:8000/swagger/
```

---

## 🐛 Troubleshooting

### "django.db.utils.OperationalError: (2003, Can't connect to MySQL)"
→ Make sure MySQL is running and your `.env` DB credentials are correct.

### "Table 'PCM.users' doesn't exist"
→ Run `python manage.py migrate` again.

### "ModuleNotFoundError: No module named 'mysqlclient'"
→ Install: `pip install mysqlclient`
→ On Windows you may need: `pip install mysqlclient-binary`

### JWT Token expired
→ Call `POST /api/token/refresh/` with your refresh token to get a new access token.

---

## 🔒 User Roles & What They Can Do

| Feature | Administrator | Technician |
|---------|:---:|:---:|
| Register/Login | ✅ | ✅ |
| Manage Technicians | ✅ | ❌ |
| View All Equipment | ✅ | ✅ |
| Register Equipment | ✅ | ✅ |
| Delete Equipment | ✅ | ❌ |
| View All Requests | ✅ | Only assigned |
| Assign Technician | ✅ | ❌ |
| Update Request Status | ✅ | Only assigned |
| Create Reports | ✅ | ✅ |
| View Dashboard | ✅ | ✅ |

---

## 🔗 Connecting to Bootstrap Frontend (Later)

When you build a Bootstrap frontend, configure your API base URL:

```javascript
const API_BASE = 'http://127.0.0.1:8000/api';

// Login example with fetch:
const response = await fetch(`${API_BASE}/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@pcm.com', password: 'password' })
});
const data = await response.json();
const token = data.tokens.access;

// Use token in subsequent requests:
const pcs = await fetch(`${API_BASE}/pcs/`, {
    headers: { 'Authorization': `Bearer ${token}` }
});
```

CORS is already enabled in settings.py, so your frontend can connect from any origin during development.

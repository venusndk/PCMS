# PCM System — React Frontend

A complete, modern frontend for the Personal Computer Maintenance Management System.

---

## 🚀 Installation (Step by Step)

### Prerequisites
- Node.js 18+ installed → https://nodejs.org/
- Your Django backend running at http://127.0.0.1:8000

---

### Step 1 — Open Terminal in this folder
```
cd pcm-frontend
```

### Step 2 — Install all dependencies
```
npm install
```
Wait for it to finish (downloads React, Tailwind, Axios, Recharts, etc.)

### Step 3 — Start the development server
```
npm run dev
```

### Step 4 — Open in browser
```
http://localhost:3000
```

---

## 📋 Available Pages

| URL | Description | Auth |
|-----|-------------|------|
| `/login` | Login page | Public |
| `/register` | Register new account | Public |
| `/submit-request` | Submit ICT support request | Public |
| `/dashboard` | Statistics and charts | Login required |
| `/pcs` | PC management | Login required |
| `/accessories` | Accessory management | Login required |
| `/network` | Network device management | Login required |
| `/requests` | ICT support requests | Login required |
| `/reports` | Maintenance reports | Login required |
| `/technicians` | Technician management | Admin only |
| `/profile` | My profile & password | Login required |

---

## 🔐 Default Login

Use the admin account you created during backend setup:
- Email: `venustendikumana2003@gmail.com`
- Password: your password

---

## 🔧 Configuration

The API base URL is configured in two places:
- `src/api/axios.js` → change `baseURL` if your backend runs on a different port
- `vite.config.js` → the proxy setting for development

---

## 📁 Project Structure

```
src/
  api/              ← All API calls (one file per resource)
  components/       ← Shared UI components (Modal, Sidebar, etc.)
  context/          ← AuthContext (global user state + JWT)
  layouts/          ← DashboardLayout (sidebar + navbar wrapper)
  pages/            ← One folder per feature
  routes/           ← AppRouter (all URL→component mappings)
  utils/            ← tokenManager (localStorage JWT handling)
```

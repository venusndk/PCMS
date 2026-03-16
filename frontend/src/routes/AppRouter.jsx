// routes/AppRouter.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';

// Auth pages
import Login          from '../pages/auth/Login';
import Register       from '../pages/auth/Register';

// Landing
import Landing        from '../pages/Landing';

// Public
import CreateRequest  from '../pages/requests/CreateRequest';

// Protected pages
import Dashboard      from '../pages/dashboard/Dashboard';
import PCList         from '../pages/pcs/PCList';
import AccessoryList  from '../pages/accessories/AccessoryList';
import NetworkDeviceList from '../pages/network/NetworkDeviceList';
import RequestList    from '../pages/requests/RequestList';
import ReportList     from '../pages/reports/ReportList';
import TechnicianList from '../pages/technicians/TechnicianList';
import MyProfile      from '../pages/profile/MyProfile';
import Settings       from '../pages/settings/Settings';

export default function AppRouter() {
  return (
    <Routes>
      {/* Landing */}
      <Route path="/" element={<Landing />} />

      {/* Public routes */}
      <Route path="/login"          element={<Login />} />
      <Route path="/register"       element={<Register />} />
      <Route path="/submit-request" element={<CreateRequest />} />

      {/* Protected routes inside Dashboard layout */}
      <Route element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard"    element={<Dashboard />} />
        <Route path="pcs"          element={<PCList />} />
        <Route path="accessories"  element={<AccessoryList />} />
        <Route path="network"      element={<NetworkDeviceList />} />
        <Route path="requests"     element={<RequestList />} />
        <Route path="reports"      element={<ReportList />} />
        <Route path="technicians"  element={
          <ProtectedRoute adminOnly>
            <TechnicianList />
          </ProtectedRoute>
        } />
        <Route path="profile"      element={<MyProfile />} />
        <Route path="settings"     element={<Settings />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

// layouts/DashboardLayout.jsx
import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { X } from 'lucide-react';

const titles = {
  '/dashboard':   'Dashboard',
  '/pcs':         'PC Management',
  '/accessories': 'Accessories',
  '/network':     'Network Devices',
  '/requests':    'ICT Requests',
  '/reports':     'Maintenance Reports',
  '/technicians': 'Technicians',
  '/profile':     'My Profile',
};

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const title = Object.entries(titles).find(([k]) => pathname.startsWith(k))?.[1] || 'PCM System';

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50 dark:bg-surface-950 transition-colors duration-300">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-50 h-full animate-slide-in">
            <Sidebar mobile onClose={() => setSidebarOpen(false)} />
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="flex-1 overflow-y-auto p-5 lg:p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

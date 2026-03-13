// components/Sidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Monitor, Mouse, Network, ClipboardList,
  FileText, Users, User, LogOut, Shield, ChevronRight
} from 'lucide-react';

const adminLinks = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/pcs',          icon: Monitor,         label: 'PCs' },
  { to: '/accessories',  icon: Mouse,           label: 'Accessories' },
  { to: '/network',      icon: Network,         label: 'Network Devices' },
  { to: '/requests',     icon: ClipboardList,   label: 'Requests' },
  { to: '/reports',      icon: FileText,        label: 'Reports' },
  { to: '/technicians',  icon: Users,           label: 'Technicians' },
  { to: '/profile',      icon: User,            label: 'My Profile' },
];

const techLinks = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/pcs',         icon: Monitor,         label: 'Equipment' },
  { to: '/requests',    icon: ClipboardList,   label: 'My Requests' },
  { to: '/reports',     icon: FileText,        label: 'Reports' },
  { to: '/profile',     icon: User,            label: 'My Profile' },
];

export default function Sidebar({ mobile = false, onClose }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const links = isAdmin ? adminLinks : techLinks;
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    if (user?.id) {
      const saved = localStorage.getItem('pcm_avatar_' + user.id);
      if (saved) setAvatar(saved);
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className={`flex flex-col h-full bg-white border-r border-slate-200 ${mobile ? 'w-72' : 'w-64'}`}>
      {/* Brand */}
      <div className="px-5 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shadow-sm">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-display text-sm font-bold text-slate-900 leading-none">PCM System</p>
            <p className="text-xs text-slate-400 mt-0.5">Maintenance Manager</p>
          </div>
        </div>
      </div>

      {/* User badge */}
      <div className="px-4 py-3 mx-3 mt-3 bg-slate-50 rounded-xl border border-slate-100">
        <div className="flex items-center gap-2.5">
          {avatar ? (
            <img
              src={avatar}
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-primary-700">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </span>
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-800 truncate">{user?.first_name} {user?.last_name}</p>
            <p className="text-xs text-slate-400 truncate">{user?.role}</p>
          </div>
          <span className={`ml-auto shrink-0 badge ${user?.status === 'Available' ? 'badge-green' : user?.status === 'Busy' ? 'badge-amber' : 'badge-slate'}`} style={{fontSize:'9px'}}>
            {user?.status}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">Menu</p>
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="flex-1">{label}</span>
            <ChevronRight className="w-3 h-3 opacity-30" />
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-4 border-t border-slate-100 pt-3">
        <button onClick={handleLogout} className="nav-link w-full text-red-500 hover:text-red-600 hover:bg-red-50">
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

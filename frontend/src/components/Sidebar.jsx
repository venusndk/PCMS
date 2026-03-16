// components/Sidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Monitor, Mouse, Network, ClipboardList,
  FileText, Users, User, LogOut, Shield, ChevronRight
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

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
    <aside className={`flex flex-col h-full bg-white border-r border-slate-200 transition-colors duration-300 dark:bg-surface-950 dark:border-surface-800 ${mobile ? 'w-72' : 'w-64'}`}>
      {/* Brand */}
      <div className="px-5 py-5 border-b border-slate-100 dark:border-surface-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shadow-sm">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-display text-sm font-bold text-slate-900 dark:text-white leading-none">PCM System</p>
            <p className="text-xs text-slate-400 mt-0.5">Maintenance Manager</p>
          </div>
        </div>
        <ThemeToggle />
      </div>

      {/* User badge */}
      <motion.div 
        whileHover={{ x: 5 }}
        className="px-4 py-3 mx-3 mt-3 glass rounded-2xl border border-slate-100 dark:border-surface-800/50 shadow-sm"
      >
        <div className="flex items-center gap-3">
          {avatar ? (
            <img
              src={avatar}
              alt="Avatar"
              className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-white dark:ring-surface-800"
            />
          ) : (
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/40 rounded-xl flex items-center justify-center shrink-0 ring-1 ring-primary-200 dark:ring-primary-800">
              <span className="text-sm font-black text-primary-700 dark:text-primary-400">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </span>
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{user?.first_name} {user?.last_name}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight truncate">{user?.role}</p>
          </div>
        </div>
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-3 opacity-70">Main Menu</p>
        {links.map(({ to, icon: Icon, label }, idx) => (
          <motion.div
            key={to}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <NavLink
              to={to}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 group
                ${isActive 
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 active-glow scale-[1.02]' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-surface-800/50'}
              `}
            >
              <Icon className={`w-4 h-4 shrink-0 ${mobile ? 'w-5 h-5' : ''}`} />
              <span className="flex-1">{label}</span>
              {!mobile && <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity" />}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-6 border-t border-slate-100 dark:border-surface-800 pt-4">
        <motion.button 
          whileHover={{ x: 5 }}
          onClick={handleLogout} 
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 w-full transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </motion.button>
      </div>
    </aside>
  );
}

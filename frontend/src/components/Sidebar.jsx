// components/Sidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

export default function Sidebar({ mobile = false, onClose, collapsed = false, onToggle }) {
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
    <aside className={`flex flex-col h-full bg-white border-r border-slate-200 transition-all duration-300 ease-in-out dark:bg-surface-950 dark:border-surface-800 ${mobile ? 'w-72' : collapsed ? 'w-20' : 'w-64'}`}>
      {/* Brand */}
      <div className={`px-5 py-5 border-b border-slate-100 dark:border-surface-800 flex items-center relative ${collapsed && !mobile ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shadow-sm shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <AnimatePresence mode="wait">
            {(!collapsed || mobile) && (
              <motion.div
                key="brand-text"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <p className="font-display text-sm font-bold text-slate-900 dark:text-white leading-none">PCM System</p>
                <p className="text-xs text-slate-400 mt-0.5">Maintenance Manager</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {!mobile && (
          <button 
            onClick={onToggle}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 group
              ${collapsed 
                ? 'absolute -right-4 top-6 bg-white dark:bg-surface-950 border border-slate-200 dark:border-surface-800 shadow-xl shadow-primary-500/10 z-50 w-9 h-9' 
                : 'hover:bg-slate-100 dark:hover:bg-surface-800 w-10 h-10'}`}
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <div className="relative w-5 h-4 flex flex-col justify-between items-center">
              <motion.span 
                animate={{ 
                  width: collapsed ? "100%" : "100%",
                  rotate: 0,
                  y: 0
                }}
                className="h-0.5 bg-slate-400 group-hover:bg-primary-500 rounded-full transition-colors"
                style={{ width: '100%' }}
              />
              <motion.span 
                animate={{ 
                  width: collapsed ? "60%" : "100%",
                  opacity: 1
                }}
                className="h-0.5 bg-slate-400 group-hover:bg-primary-500 rounded-full transition-colors"
                style={{ width: '100%' }}
              />
              <motion.span 
                animate={{ 
                  width: collapsed ? "100%" : "100%",
                  rotate: 0,
                  y: 0
                }}
                className="h-0.5 bg-slate-400 group-hover:bg-primary-500 rounded-full transition-colors"
                style={{ width: '100%' }}
              />
            </div>
          </button>
        )}
      </div>

      {/* User badge */}
      <div className={`px-4 py-3 mx-3 mt-3 glass rounded-2xl border border-slate-100 dark:border-surface-800/50 shadow-sm overflow-hidden transition-all duration-300 ${collapsed && !mobile ? 'px-2' : ''}`}>
        <div className={`flex items-center ${collapsed && !mobile ? 'justify-center' : 'gap-3'}`}>
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
          <AnimatePresence mode="wait">
            {(!collapsed || mobile) && (
              <motion.div
                key="user-text"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden whitespace-nowrap min-w-0"
              >
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{user?.first_name} {user?.last_name}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight truncate">{user?.role}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto overflow-x-hidden">
        <AnimatePresence mode="wait">
          {(!collapsed || mobile) && (
            <motion.p 
              key="nav-header"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-3"
            >
              Main Menu
            </motion.p>
          )}
        </AnimatePresence>
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
              title={collapsed ? label : ''}
              className={({ isActive }) => `
                flex items-center rounded-xl text-sm font-bold transition-all duration-300 group
                ${collapsed && !mobile ? 'justify-center px-0 py-2.5 mx-1' : 'gap-3 px-4 py-2.5'}
                ${isActive 
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 active-glow' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-surface-800/50'}
              `}
            >
              <Icon className={`w-4 h-4 shrink-0 transition-transform duration-300 ${mobile ? 'w-5 h-5' : ''} ${collapsed && !mobile ? 'scale-110' : ''}`} />
              <AnimatePresence mode="wait">
                {(!collapsed || mobile) && (
                  <motion.span 
                    key="nav-label"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 truncate overflow-hidden whitespace-nowrap"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
              {!mobile && !collapsed && <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity" />}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-6 border-t border-slate-100 dark:border-surface-800 pt-4">
        <motion.button 
          whileHover={{ x: collapsed ? 0 : 5 }}
          onClick={handleLogout} 
          title={collapsed ? 'Logout' : ''}
          className={`flex items-center rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 w-full transition-all ${collapsed && !mobile ? 'justify-center px-0 py-2.5' : 'gap-3 px-4 py-2.5'}`}
        >
          <LogOut className={`w-4 h-4 shrink-0 ${collapsed && !mobile ? 'scale-110' : ''}`} />
          {(!collapsed || mobile) && <span>Logout</span>}
        </motion.button>
      </div>
    </aside>
  );
}

// components/Sidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Monitor, Mouse, Network, ClipboardList,
  FileText, Users, User, LogOut, Shield, ChevronRight, Settings as SettingsIcon,
  Menu
} from 'lucide-react';

const adminGroups = [
  {
    title: 'Overview',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' }
    ]
  },
  {
    title: 'Assets',
    items: [
      { to: '/pcs', icon: Monitor, label: 'Computers' },
      { to: '/accessories', icon: Mouse, label: 'Accessories' },
      { to: '/network', icon: Network, label: 'Network' }
    ]
  },
  {
    title: 'Operations',
    items: [
      { to: '/requests', icon: ClipboardList, label: 'Requests' },
      { to: '/reports', icon: FileText, label: 'Reports' },
      { to: '/technicians', icon: Users, label: 'Technicians' }
    ]
  },
  {
    title: 'Account',
    items: [
      { to: '/profile', icon: User, label: 'My Profile' },
      { to: '/settings', icon: SettingsIcon, label: 'Settings' }
    ]
  }
];

const techGroups = [
  {
    title: 'Overview',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' }
    ]
  },
  {
    title: 'Inventory',
    items: [
      { to: '/pcs', icon: Monitor, label: 'Equipment' }
    ]
  },
  {
    title: 'Operations',
    items: [
      { to: '/requests', icon: ClipboardList, label: 'My Requests' },
      { to: '/reports', icon: FileText, label: 'Reports' }
    ]
  },
  {
    title: 'Account',
    items: [
      { to: '/profile', icon: User, label: 'My Profile' },
      { to: '/settings', icon: SettingsIcon, label: 'Settings' }
    ]
  }
];

export default function Sidebar({ mobile = false, onClose, collapsed = false, onToggle }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const menuGroups = isAdmin ? adminGroups : techGroups;
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
    <aside 
      className={`relative flex flex-col h-full bg-white dark:bg-surface-950 border-r border-slate-200 dark:border-surface-800 transition-all duration-300 ease-in-out z-20 overflow-hidden ${mobile ? 'w-72' : collapsed ? 'w-20' : 'w-64'}`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-20 px-4 shrink-0 border-b border-slate-100 dark:border-surface-800/60">
        <div className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${(collapsed && !mobile) ? 'w-0 opacity-0 hidden' : 'flex-1'}`}>
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-600 shadow-md shadow-primary-500/20 shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col flex-1 overflow-hidden">
            <span className="font-display font-bold text-slate-900 dark:text-white truncate">PCM System</span>
          </div>
        </div>

        {/* Desktop Collapse Toggle */}
        {!mobile && (
          <button
            onClick={onToggle}
            className={`flex items-center justify-center w-10 h-10 rounded-xl text-slate-400 hover:text-primary-600 hover:bg-slate-50 dark:hover:bg-surface-800/50 transition-colors shrink-0 ${collapsed ? 'mx-auto' : ''}`}
            title={collapsed ? "Expand" : "Collapse"}
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* User Info */}
      <div className="px-4 py-4 shrink-0">
        <div className={`flex items-center gap-3 p-2 rounded-2xl bg-slate-50 dark:bg-surface-900/50 border border-slate-100 dark:border-surface-800/80 transition-all duration-300 ${collapsed && !mobile ? 'justify-center px-0' : ''}`}>
          <div className="relative shrink-0">
            {avatar ? (
              <img
                src={avatar}
                alt="Avatar"
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-white dark:ring-surface-950 shadow-sm"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/40 dark:to-primary-800/40 rounded-xl flex items-center justify-center ring-1 ring-primary-200 dark:ring-primary-800 shadow-inner">
                <span className="text-sm font-bold text-primary-700 dark:text-primary-400 uppercase">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </span>
              </div>
            )}
            <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-surface-900 rounded-full transition-all duration-300 ${collapsed && !mobile ? '-bottom-1 -right-1' : ''}`} />
          </div>
          
          <div className={`flex flex-col flex-1 overflow-hidden transition-all duration-300 ${(collapsed && !mobile) ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
              {user?.first_name} {user?.last_name}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-surface-800 px-3 py-2 space-y-6">
        {menuGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            <div className={`px-3 mb-2 transition-all duration-300 ${(collapsed && !mobile) ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {group.title}
              </span>
            </div>
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={mobile ? onClose : undefined}
                  title={collapsed && !mobile ? item.label : ""}
                  className={({ isActive }) => `
                    flex items-center gap-3 rounded-xl transition-all duration-200 group relative
                    ${collapsed && !mobile ? 'justify-center p-2.5' : 'px-3 py-2.5'}
                    ${isActive 
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 font-bold' 
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-surface-800/50 hover:text-slate-900 dark:hover:text-slate-200 font-medium'}
                  `}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && !collapsed && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-primary-600 dark:bg-primary-500 rounded-r-full" />
                      )}
                      <Icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                      
                      <span className={`flex-1 truncate transition-all duration-300 ${(collapsed && !mobile) ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
                        {item.label}
                      </span>

                      {!mobile && !collapsed && (
                        <ChevronRight className={`w-4 h-4 shrink-0 transition-opacity ${isActive ? 'opacity-100 text-primary-400' : 'opacity-0 group-hover:opacity-40'}`} />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-100 dark:border-surface-800/60 shrink-0">
        <button
          onClick={handleLogout}
          title={collapsed && !mobile ? "Logout" : ""}
          className={`flex items-center gap-3 w-full rounded-xl transition-colors text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 ${collapsed && !mobile ? 'justify-center p-2.5' : 'px-3 py-2.5'}`}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span className={`font-semibold text-sm truncate transition-all duration-300 ${(collapsed && !mobile) ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
}

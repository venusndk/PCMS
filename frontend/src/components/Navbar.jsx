import { Bell, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onMenuClick, title }) {
  const { user } = useAuth();
  const initials = user ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}` : 'AD';

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 gap-4 sticky top-0 z-30 transition-colors duration-300 dark:bg-surface-950 dark:border-surface-800">
      {/* Mobile menu button */}
      <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-800 text-slate-500 transition-colors">
        <Menu className="w-5 h-5" />
      </button>

      {/* Page title */}
      <div className="flex-1">
        <h1 className="font-display text-base font-bold text-slate-800 dark:text-white">{title}</h1>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors relative">
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary-500 rounded-full ring-2 ring-white dark:ring-surface-950" />
        </button>
        <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-surface-950">
          <span className="text-[10px] font-bold text-primary-700 dark:text-primary-400">{initials}</span>
        </div>
      </div>
    </header>
  );
}

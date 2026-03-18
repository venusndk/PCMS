import { Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationButton from './NotificationButton';

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
        <NotificationButton />
        <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-surface-950">
          <span className="text-[10px] font-bold text-primary-700 dark:text-primary-400">{initials}</span>
        </div>
      </div>
    </header>
  );
}

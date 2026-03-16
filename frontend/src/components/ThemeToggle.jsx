import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-colors duration-200 
                 hover:bg-slate-100 dark:hover:bg-surface-800 
                 text-slate-500 dark:text-slate-400 ${className}`}
      title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5 fill-current" />
      ) : (
        <Sun className="w-5 h-5 fill-current text-amber-400" />
      )}
    </button>
  );
}

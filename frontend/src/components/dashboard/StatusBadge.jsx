// components/dashboard/StatusBadge.jsx
import React from 'react';

const StatusBadge = ({ status, className = '' }) => {
  const getStatusStyles = (status) => {
    const s = status?.toLowerCase();
    if (s === 'pending' || s === 'busy') {
      return 'bg-amber-100/50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:ring-amber-800/50';
    }
    if (s === 'completed' || s === 'fixed' || s === 'available' || s === 'working') {
      return 'bg-emerald-100/50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:ring-emerald-800/50';
    }
    if (s === 'urgent' || s === 'critical' || s === 'not working' || s === 'not available') {
      return 'bg-rose-100/50 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:ring-rose-800/50';
    }
    if (s === 'in progress') {
      return 'bg-blue-100/50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:ring-blue-800/50';
    }
    return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200 dark:bg-surface-800 dark:text-slate-400 dark:ring-surface-700';
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide shadow-sm transition-all duration-300 ${getStatusStyles(status)} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
      {status}
    </span>
  );
};

export default StatusBadge;

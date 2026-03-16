// components/dashboard/DashboardHeader.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, RefreshCw } from 'lucide-react';

const DashboardHeader = ({ user, onRefresh, loading }) => {
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="font-display text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Welcome back, <span className="text-primary-600 dark:text-primary-400">{user?.first_name}</span> 👋
        </h2>
        <div className="flex items-center gap-2 mt-1 text-slate-500 dark:text-slate-400">
          <Calendar size={14} />
          <p className="text-sm font-medium">{today}</p>
        </div>
      </motion.div>

      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRefresh}
          disabled={loading}
          className="btn-secondary flex items-center gap-2 py-2.5"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">Refresh Data</span>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-primary py-2.5 shadow-lg shadow-primary-500/20"
        >
          Quick Action
        </motion.button>
      </div>
    </div>
  );
};

export default DashboardHeader;

// components/dashboard/NotificationPanel.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Info, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const NotificationPanel = ({ isOpen, onClose, notifications = [] }) => {
  // Demo notifications if none provided
  const demoNotifications = notifications.length > 0 ? notifications : [
    { 
      id: 1, 
      type: 'urgent', 
      title: 'Urgent Request', 
      msg: 'Server in Room 302 reported "Connection Timeout" issues.', 
      time: 'Just now' 
    },
    { 
      id: 2, 
      type: 'info', 
      title: 'System Update', 
      msg: 'Maintenance scheduled for Sunday at 10 PM.', 
      time: '2 hours ago' 
    },
    { 
      id: 3, 
      type: 'success', 
      title: 'Task Verified', 
      msg: 'Your report for "PC repairs" has been approved.', 
      time: '5 hours ago' 
    }
  ];

  const getIcon = (type) => {
    switch(type) {
      case 'urgent': return <AlertTriangle className="text-rose-500" size={18} />;
      case 'success': return <CheckCircle className="text-emerald-500" size={18} />;
      default: return <Info className="text-blue-500" size={18} />;
    }
  };

  return (
    <div className="card p-6 overflow-hidden h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell size={20} className="text-slate-600 dark:text-slate-300" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 border-2 border-white dark:border-surface-900 rounded-full" />
          </div>
          <h3 className="font-display text-lg font-bold text-slate-800 dark:text-white">Live Updates</h3>
        </div>
        <button className="text-xs font-semibold text-slate-400 hover:text-slate-600">Mark all read</button>
      </div>

      <div className="space-y-4">
        {demoNotifications.map((n, i) => (
          <motion.div 
            key={n.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ x: -2, scale: 1.02 }}
            transition={{ delay: i * 0.1 }}
            className={`p-4 rounded-xl border-l-4 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md
              ${n.type === 'urgent' ? 'border-rose-500 bg-rose-50/30 dark:bg-rose-900/10' : 
                n.type === 'success' ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/10' : 
                'border-primary-500 bg-primary-50/30 dark:bg-primary-900/10'}
            `}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{getIcon(n.type)}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{n.title}</h4>
                  <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1 uppercase tracking-wider">
                    <Clock size={10} /> {n.time}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  {n.msg}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-surface-800">
        <button className="w-full py-2.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-surface-800 transition-colors">
          Expand Notifications Panel
        </button>
      </div>
    </div>
  );
};

export default NotificationPanel;

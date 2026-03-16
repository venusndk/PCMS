// components/dashboard/TaskCalendar.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

const TaskCalendar = () => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const currentMonth = 'October 2024';
  
  // Simplified mock calendar data
  const monthDays = Array.from({ length: 31 }, (_, i) => i + 1);
  const startDay = 2; // Offset for the first day of the month
  
  const tasks = {
    12: { color: 'bg-primary-500', title: 'PC Audit' },
    15: { color: 'bg-rose-500', title: 'Server Maint.' },
    18: { color: 'bg-emerald-500', title: 'Network Setup' },
    24: { color: 'bg-amber-500', title: 'Training' },
  };

  return (
    <div className="card p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-lg font-bold text-slate-800 dark:text-white tracking-tight">Schedule</h3>
        <div className="flex items-center gap-2">
          <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-800 transition-colors">
            <ChevronLeft size={16} className="text-slate-500" />
          </button>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200 min-w-24 text-center">{currentMonth}</span>
          <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-800 transition-colors">
            <ChevronRight size={16} className="text-slate-500" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {days.map(day => (
          <div key={day} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 flex-1">
        {Array.from({ length: startDay }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        {monthDays.map(day => (
          <motion.div 
            key={day} 
            whileHover={{ scale: 1.05 }}
            className={`relative aspect-square rounded-xl border border-slate-100 dark:border-surface-800/50 flex items-center justify-center cursor-pointer transition-all
              ${day === 16 ? 'bg-primary-50 ring-1 ring-primary-200 dark:bg-primary-900/20 dark:ring-primary-800' : 'bg-transparent'}
              hover:bg-slate-50 dark:hover:bg-surface-800/80
            `}
          >
            <span className={`text-xs font-bold ${day === 16 ? 'text-primary-600 dark:text-primary-400 font-extrabold' : 'text-slate-500 dark:text-slate-400'}`}>
              {day}
            </span>
            {tasks[day] && (
              <div className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${tasks[day].color} shadow-sm`} />
            )}
          </motion.div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-surface-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary-500" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Audit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Alert</span>
          </div>
        </div>
        <button className="p-1 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-surface-800 transition-colors">
          <MoreHorizontal size={14} className="text-slate-400" />
        </button>
      </div>
    </div>
  );
};

export default TaskCalendar;

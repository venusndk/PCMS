import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'primary', trend, delay = 0 }) {
  const colors = {
    primary: { 
      bg: 'bg-primary-50 dark:bg-primary-950/30', 
      icon: 'text-primary-600 dark:text-primary-400', 
      ring: 'ring-primary-200 dark:ring-primary-800/50',
      glow: 'shadow-primary-500/20'
    },
    emerald: { 
      bg: 'bg-emerald-50 dark:bg-emerald-950/30', 
      icon: 'text-emerald-600 dark:text-emerald-400', 
      ring: 'ring-emerald-200 dark:ring-emerald-800/50',
      glow: 'shadow-emerald-500/20'
    },
    amber: { 
      bg: 'bg-amber-50 dark:bg-amber-950/30', 
      icon: 'text-amber-600 dark:text-amber-400', 
      ring: 'ring-amber-200 dark:ring-amber-800/50',
      glow: 'shadow-amber-500/20'
    },
    red: { 
      bg: 'bg-red-50 dark:bg-red-950/30', 
      icon: 'text-red-600 dark:text-red-400', 
      ring: 'ring-red-200 dark:ring-red-800/50',
      glow: 'shadow-red-500/20'
    },
    blue: { 
      bg: 'bg-blue-50 dark:bg-blue-950/30', 
      icon: 'text-blue-600 dark:text-blue-400', 
      ring: 'ring-blue-200 dark:ring-blue-800/50',
      glow: 'shadow-blue-500/20'
    },
    purple: { 
      bg: 'bg-purple-50 dark:bg-purple-950/30', 
      icon: 'text-purple-600 dark:text-purple-400', 
      ring: 'ring-purple-200 dark:ring-purple-800/50', 
      glow: 'shadow-purple-500/20'
    },
  };
  
  const c = colors[color] || colors.primary;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="card p-6 group transition-all duration-300 relative overflow-hidden"
    >
      <div className="relative z-10 flex items-start justify-between mb-4">
        <div className={`p-3 rounded-2xl ${c.bg} ring-1 ${c.ring} shadow-lg ${c.glow} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-6 h-6 ${c.icon}`} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black tracking-tighter ${
            trend >= 0 
              ? 'bg-emerald-500/10 text-emerald-600' 
              : 'bg-rose-500/10 text-rose-600'
          }`}>
            <span>{trend >= 0 ? '+' : ''}{trend}%</span>
          </div>
        )}
      </div>

      <div className="relative z-10">
        <h3 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 group-hover:text-slate-500 transition-colors" title={title}>
          {title}
        </h3>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-black text-slate-800 dark:text-white leading-none tracking-tighter">
            {value ?? '0'}
          </p>
        </div>
        {subtitle && (
          <p className="text-[10px] font-medium text-slate-400 mt-2 opacity-60 group-hover:opacity-100 transition-opacity duration-500">
            {subtitle}
          </p>
        )}
      </div>

      {/* Decorative background element */}
      <div className={`absolute -bottom-6 -right-6 w-24 h-24 ${c.bg} opacity-10 rounded-full group-hover:scale-150 transition-transform duration-700 blur-2xl`} />
    </motion.div>
  );
}

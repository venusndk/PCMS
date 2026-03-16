// components/dashboard/ActivityTimeline.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { 
  ClipboardList, UserPlus, CheckCircle, AlertCircle, 
  Settings, Clock, Monitor, Mouse 
} from 'lucide-react';

const ActivityTimeline = ({ activities = [] }) => {
  // Mock data if none provided to show off the UI
  const demoActivities = activities.length > 0 ? activities : [
    { 
      id: 1, 
      type: 'request', 
      title: 'New Service Request', 
      desc: 'John Doe submitted a request for PC maintenance in Lab 04.', 
      time: '12 minutes ago', 
      icon: ClipboardList, 
      color: 'bg-primary-500' 
    },
    { 
      id: 2, 
      type: 'assignment', 
      title: 'Technician Assigned', 
      desc: 'Tech Peter has been assigned to "Monitor Flickering" issue.', 
      time: '1 hour ago', 
      icon: UserPlus, 
      color: 'bg-indigo-500' 
    },
    { 
      id: 3, 
      type: 'completion', 
      title: 'Task Completed', 
      desc: 'Keyboard replacement for Room 202 is fixed.', 
      time: '3 hours ago', 
      icon: CheckCircle, 
      color: 'bg-emerald-500' 
    },
    { 
      id: 4, 
      type: 'system', 
      title: 'System Update', 
      desc: 'Database optimization completed successfully.', 
      time: '5 hours ago', 
      icon: Settings, 
      color: 'bg-slate-500' 
    }
  ];

  return (
    <div className="card h-full p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-lg font-bold text-slate-800 dark:text-white">Recent Activity</h3>
        <button className="text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400">View All</button>
      </div>

      <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-surface-800 before:to-transparent">
        {demoActivities.map((activity, idx) => (
          <motion.div 
            key={activity.id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            viewport={{ once: true }}
            className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
          >
            {/* Dot */}
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-surface-900 shadow ${activity.color} shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10`}>
              {activity.icon && <activity.icon size={16} className="text-white" />}
            </div>

            {/* Content */}
            <motion.div 
              whileHover={{ scale: 1.01, x: 5 }}
              className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl bg-white dark:bg-surface-800/40 border border-slate-100 dark:border-surface-800/50 shadow-sm hover:shadow-md transition-all cursor-default"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{activity.title}</span>
                <time className="font-mono text-[10px] text-slate-400 flex items-center gap-1">
                  <Clock size={10} />
                  {activity.time}
                </time>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {activity.desc}
              </p>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ActivityTimeline;

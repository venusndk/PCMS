// pages/dashboard/Dashboard.jsx
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { dashboardService } from '../../api/dashboardService';
import StatCard from '../../components/StatCard';
import { 
  Monitor, Mouse, Network, ClipboardList, 
  CheckCircle, Users, Clock, AlertCircle,
  BarChart2, Activity, Zap
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

// New Components
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import ActivityTimeline from '../../components/dashboard/ActivityTimeline';
import NotificationPanel from '../../components/dashboard/NotificationPanel';
import TaskCalendar from '../../components/dashboard/TaskCalendar';
import StatusBadge from '../../components/dashboard/StatusBadge';

const PIE_COLORS  = ['#10b981', '#f59e0b', '#ef4444', '#94a3b8'];
const BAR_COLORS  = ['#6366f1', '#10b981', '#ef4444', '#f59e0b'];

export default function Dashboard() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [overview, setOverview] = useState(null);
  const [devices,  setDevices]  = useState(null);
  const [requests, setRequests] = useState(null);
  const [techs,    setTechs]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [o, d, r, t] = await Promise.all([
        dashboardService.overview(),
        dashboardService.devices(),
        dashboardService.requests(),
        dashboardService.technicians(),
      ]);
      setOverview(o.data);
      setDevices(d.data);
      setRequests(r.data);
      setTechs(t.data);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Simulate real-time polling
    const interval = setInterval(() => fetchData(), 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
      <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4" />
      <p className="text-slate-500 animate-pulse font-medium">Preparing your workspace...</p>
    </div>
  );

  // Chart data transformations
  const devicePieData = devices ? [
    { name: 'Working',     value: devices.summary?.working     || 0 },
    { name: 'Not Working', value: devices.summary?.not_working  || 0 },
  ] : [];

  const requestBarData = (requests?.by_status || []).map(s => ({
    name: s.status, count: s.count
  }));

  // Trend Chart Data (Mocking for visual excellence as requested)
  const trendData = [
    { name: 'Mon', requests: 4, fixed: 2 },
    { name: 'Tue', requests: 7, fixed: 5 },
    { name: 'Wed', requests: 5, fixed: 3 },
    { name: 'Thu', requests: 12, fixed: 8 },
    { name: 'Fri', requests: 8, fixed: 6 },
    { name: 'Sat', requests: 3, fixed: 4 },
    { name: 'Sun', requests: 2, fixed: 2 },
  ];

  return (
    <div className="pb-10 space-y-8 max-w-[1600px] mx-auto">
      {/* Header Widget */}
      <DashboardHeader user={user} onRefresh={() => fetchData(true)} loading={refreshing} />

      {/* Quick Insights Banner (Smart Alerts) */}
      <AnimatePresence>
        {overview?.requests?.pending > 5 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-primary-600 dark:bg-primary-900/40 rounded-2xl p-4 text-white flex items-center justify-between shadow-lg shadow-primary-500/20"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Zap size={20} className="fill-current" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Action Required: High Volume of Pending Requests</h4>
                <p className="text-xs text-primary-100 opacity-90 font-medium">There are currently {overview.requests.pending} requests awaiting assignment. We recommend assigning technicians now.</p>
              </div>
            </div>
            <button className="px-4 py-1.5 bg-white text-primary-600 rounded-lg text-xs font-bold hover:bg-primary-50 transition-colors">
              Manage Requests
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Inventory" value={overview?.devices?.pcs + overview?.devices?.accessories + overview?.devices?.network_devices} icon={Monitor} color="primary" trend={12} delay={0.1} subtitle="Across all categories" />
        <StatCard title="Active Requests" value={overview?.requests?.pending} icon={Clock} color="amber" trend={-5} delay={0.2} subtitle="Awaiting resolution" />
        <StatCard title="Completed Today" value={overview?.requests?.fixed} icon={CheckCircle} color="emerald" trend={8} delay={0.3} subtitle="Performance vs yesterday" />
        <StatCard title="Tech Availability" value={`${overview?.technicians?.available}/${overview?.technicians?.total}`} icon={Users} color="blue" delay={0.4} subtitle="Technicians online" />
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Main Analytics Area */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Trend Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display text-lg font-bold text-slate-800 dark:text-white">Activity Overview</h3>
                <p className="text-xs text-slate-500 font-medium tracking-wide flex items-center gap-1 uppercase">
                  <Activity size={12} className="text-primary-500" /> Weekly performance insights
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <div className="w-2 h-2 rounded-full bg-primary-500" /> New Requests
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" /> Fixed
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#1e293b' : '#f1f5f9'} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#0f172a' : '#fff', 
                    borderRadius: '12px', 
                    border: 'none',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                  }} 
                />
                <Area type="monotone" dataKey="requests" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorReq)" />
                <Area type="monotone" dataKey="fixed" stroke="#10b981" strokeWidth={3} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ActivityTimeline />
            <div className="space-y-6">
              <div className="card p-6">
                <h3 className="font-display text-sm font-bold text-slate-800 dark:text-white mb-4">Device Health</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={devicePieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                      {devicePieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {devicePieData.map((d, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{d.name}</span>
                      <span className="text-xl font-extrabold text-slate-800 dark:text-white">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-sm font-bold text-slate-800 dark:text-white">Predictive Insights</h3>
                  <BarChart2 size={16} className="text-amber-500" />
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800/30">
                    <p className="text-xs font-bold text-amber-800 dark:text-amber-300 mb-1">High Workload Warning</p>
                    <p className="text-[10px] text-amber-700 dark:text-amber-400 opacity-80 leading-relaxed font-medium">
                      Average completion time increased by 15% this week. Consider onboarding more technicians.
                    </p>
                  </div>
                  <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-100 dark:border-primary-800/30">
                    <p className="text-xs font-bold text-primary-800 dark:text-primary-300 mb-1">Inventory Alert</p>
                    <p className="text-[10px] text-primary-700 dark:text-primary-400 opacity-80 leading-relaxed font-medium">
                      Projector bulb replacements are trending high in Room 102.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Widgets Area */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <NotificationPanel />
          <TaskCalendar />
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-12 gap-6">
        {/* Workload Table */}
        <div className="col-span-12 lg:col-span-7 card overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 dark:border-surface-800 flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-bold text-slate-800 dark:text-white">Team Performance</h3>
              <p className="text-xs font-medium text-slate-400">Current technician workload and metrics</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-surface-800/20 text-left border-b border-slate-100 dark:border-surface-800">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Technician</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Requests</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-surface-800">
                {Array.isArray(techs?.technicians) && techs.technicians.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-surface-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-primary-500/10 dark:bg-primary-900/40 flex items-center justify-center font-bold text-[10px] text-primary-600 border border-primary-500/20 uppercase">
                          {t.name?.[0] || t.first_name?.[0] || 'T'}
                        </div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{t.name || `${t.first_name} ${t.last_name}`}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="w-full max-w-[80px] h-1.5 bg-slate-100 dark:bg-surface-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${t.assigned_requests > 3 ? 'bg-rose-500' : t.assigned_requests > 1 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(t.assigned_requests * 25, 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{t.assigned_requests} active</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        <span className="text-xs font-bold text-slate-800 dark:text-white">4.8</span>
                        <Zap size={10} className="text-amber-500 fill-current" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Categories Breakdown */}
        <div className="col-span-12 lg:col-span-5 space-y-4">
          {[
            { label: 'Equipment by Location', data: devices?.pcs?.by_location, key: 'location', icon: Monitor },
            { label: 'Support Request Trends', data: requests?.by_status, key: 'status', icon: Zap },
          ].map(({ label, data, key, icon: Icon }) => (
            <div key={label} className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Icon size={16} className="text-primary-500" />
                <h3 className="font-display text-sm font-bold text-slate-800 dark:text-white uppercase tracking-tight">{label}</h3>
              </div>
              <div className="space-y-4">
                {(data || []).slice(0, 4).map((item, i) => (
                  <div key={i} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-500 dark:text-slate-400">{item[key]}</span>
                      <span className="font-mono font-bold text-primary-600 dark:text-primary-400">{item.count}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-surface-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(item.count / (overview?.requests?.total || 10)) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full bg-primary-500 rounded-full relative"
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                        <div className="absolute inset-0 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                      </motion.div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

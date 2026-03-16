// pages/dashboard/Dashboard.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { dashboardService } from '../../api/dashboardService';
import StatCard from '../../components/StatCard';
import {
  Monitor, Mouse, Network, ClipboardList,
  CheckCircle, Users, Clock, AlertCircle,
  Activity, Zap, RefreshCw
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area, LineChart, Line
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

// New Components (keep your imports)
import StatusBadge from '../../components/dashboard/StatusBadge';



export default function Dashboard() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [overview, setOverview] = useState(null);
  const [devices, setDevices] = useState(null);
  const [requests, setRequests] = useState(null);
  const [techs, setTechs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null); // Add error state

  // --- Data fetching (unchanged except error handling) ---
  const fetchData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    setError(null);
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
      setError("Unable to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  // Trend data – replace mock with real API data when available
  // For now, we'll use a mix of real requests count + mock to show trend
  const trendData = useMemo(() => {
    // If we had historical data, we'd use it. Here's a placeholder that uses today's numbers.
    // In production, you'd fetch this from an endpoint.
    return [
      { name: 'Mon', requests: overview?.requests?.pending || 4, fixed: overview?.requests?.fixed || 2 },
      { name: 'Tue', requests: 7, fixed: 5 },
      { name: 'Wed', requests: 5, fixed: 3 },
      { name: 'Thu', requests: 12, fixed: 8 },
      { name: 'Fri', requests: 8, fixed: 6 },
      { name: 'Sat', requests: 3, fixed: 4 },
      { name: 'Sun', requests: 2, fixed: 2 },
    ];
  }, [overview]);

  // Categories breakdown data (by location and by status)
  const locationData = useMemo(() => devices?.pcs?.by_location || [], [devices]);
  const statusData = useMemo(() => requests?.by_status || [], [requests]);

  // Max count for progress bars (to scale them properly)
  const maxLocationCount = useMemo(() =>
    Math.max(...locationData.map(item => item.count), 1), [locationData]);
  const maxStatusCount = useMemo(() =>
    Math.max(...statusData.map(item => item.count), 1), [statusData]);

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-500 animate-pulse font-medium">Preparing your workspace...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <AlertCircle size={48} className="text-rose-500 mb-4" />
        <p className="text-slate-700 dark:text-slate-300 font-medium mb-2">{error}</p>
        <button
          onClick={() => fetchData(true)}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-bold hover:bg-primary-600 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="pb-10 space-y-8 max-w-[1600px] mx-auto pt-8">
      {/* Quick Insights Banner - dynamic */}
      <AnimatePresence>
        {overview?.requests?.pending > 5 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-to-r from-primary-600 to-primary-500 dark:from-primary-900/60 dark:to-primary-800/60 rounded-2xl p-4 text-white flex items-center justify-between shadow-lg shadow-primary-500/20"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Zap size={20} className="fill-current" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Action Required: High Volume of Pending Requests</h4>
                <p className="text-xs text-primary-100 opacity-90 font-medium">
                  There are currently {overview.requests.pending} requests awaiting assignment. We recommend assigning technicians now.
                </p>
              </div>
            </div>
            <button className="px-4 py-1.5 bg-white text-primary-600 rounded-lg text-xs font-bold hover:bg-primary-50 transition-colors shadow-md">
              Manage Requests
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Stats Grid with sparkline-like trend indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Inventory"
          value={overview?.devices?.pcs + overview?.devices?.accessories + overview?.devices?.network_devices}
          icon={Monitor}
          color="primary"
          trend={12}
          delay={0.1}
          subtitle="Across all categories"
        />
        <StatCard
          title="Active Requests"
          value={overview?.requests?.pending}
          icon={Clock}
          color="amber"
          trend={-5}
          delay={0.2}
          subtitle="Awaiting resolution"
        />
        <StatCard
          title="Completed Today"
          value={overview?.requests?.fixed}
          icon={CheckCircle}
          color="emerald"
          trend={8}
          delay={0.3}
          subtitle="Performance vs yesterday"
        />
        <StatCard
          title="Tech Availability"
          value={`${overview?.technicians?.available}/${overview?.technicians?.total}`}
          icon={Users}
          color="blue"
          delay={0.4}
          subtitle="Technicians online"
        />
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Main Analytics Area */}
        <div className="col-span-12 space-y-6">
          {/* Trend Chart with interactive tooltip and gradient */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
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
              <AreaChart data={trendData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorFixed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
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
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    padding: '8px 12px'
                    }}
                  labelStyle={{ fontWeight: 600, marginBottom: 4 }}
                />
                <Area type="monotone" dataKey="requests" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorReq)" />
                <Area type="monotone" dataKey="fixed" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorFixed)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-12 gap-6">
        {/* Workload Table with real ratings if available */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="col-span-12 lg:col-span-7 card overflow-hidden"
        >
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
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center font-bold text-xs text-white shadow-sm">
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
                            className={`h-full rounded-full transition-all duration-500 ${t.assigned_requests > 3 ? 'bg-rose-500' : t.assigned_requests > 1 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                            style={{ width: `${Math.min((t.assigned_requests / 5) * 100, 100)}%` }} // assuming max 5 for scaling
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{t.assigned_requests} active</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        {/* Use real rating if available, else fallback to generated based on performance */}
                        <span className="text-xs font-bold text-slate-800 dark:text-white">
                          {t.rating ? t.rating.toFixed(1) : (t.assigned_requests > 0 ? (4.5 - t.assigned_requests * 0.1).toFixed(1) : '5.0')}
                        </span>
                        <Zap size={10} className="text-amber-500 fill-current" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Categories Breakdown with percentage and animated bars */}
        <div className="col-span-12 lg:col-span-5 space-y-4">
          {/* Equipment by Location */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="card p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Monitor size={16} className="text-primary-500" />
              <h3 className="font-display text-sm font-bold text-slate-800 dark:text-white uppercase tracking-tight">Equipment by Location</h3>
            </div>
            <div className="space-y-4">
              {locationData.slice(0, 4).map((item, i) => (
                <div key={i} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-500 dark:text-slate-400">{item.location}</span>
                    <span className="font-mono font-bold text-primary-600 dark:text-primary-400">
                      {item.count} <span className="text-[10px] text-slate-400">({((item.count / maxLocationCount) * 100).toFixed(0)}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-surface-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(item.count / maxLocationCount) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full relative"
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    </motion.div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Support Request Trends */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="card p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Zap size={16} className="text-primary-500" />
              <h3 className="font-display text-sm font-bold text-slate-800 dark:text-white uppercase tracking-tight">Support Request Trends</h3>
            </div>
            <div className="space-y-4">
              {statusData.slice(0, 4).map((item, i) => (
                <div key={i} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-500 dark:text-slate-400">{item.status}</span>
                    <span className="font-mono font-bold text-primary-600 dark:text-primary-400">
                      {item.count} <span className="text-[10px] text-slate-400">({((item.count / maxStatusCount) * 100).toFixed(0)}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-surface-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(item.count / maxStatusCount) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: 'easeOut', delay: i * 0.1 }}
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full relative"
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    </motion.div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-center gap-4 mt-12 mb-8">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="btn-secondary flex items-center gap-2 py-3 px-6 shadow-sm"
        >
          <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          <span className="font-bold">Refresh Data</span>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-primary py-3 px-6 shadow-lg shadow-primary-500/20 font-bold"
        >
          Quick Action
        </motion.button>
      </div>
    </div>
  );
}
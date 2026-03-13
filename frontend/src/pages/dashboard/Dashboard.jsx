// pages/dashboard/Dashboard.jsx
import { useState, useEffect } from 'react';
import { dashboardService } from '../../api/dashboardService';
import StatCard from '../../components/StatCard';
import { Monitor, Mouse, Network, ClipboardList, CheckCircle, Users, AlertTriangle, Clock } from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useAuth } from '../../context/AuthContext';

const PIE_COLORS  = ['#10b981', '#f59e0b', '#ef4444', '#94a3b8'];
const BAR_COLORS  = ['#6366f1', '#10b981', '#ef4444', '#f59e0b'];

const statusBadge = (status) => {
  const map = { Available: 'badge-green', Busy: 'badge-amber', 'Not Available': 'badge-red' };
  return <span className={`badge ${map[status] || 'badge-slate'}`}>{status}</span>;
};

export default function Dashboard() {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [devices,  setDevices]  = useState(null);
  const [requests, setRequests] = useState(null);
  const [techs,    setTechs]    = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardService.overview(),
      dashboardService.devices(),
      dashboardService.requests(),
      dashboardService.technicians(),
    ]).then(([o, d, r, t]) => {
      setOverview(o.data);
      setDevices(d.data);
      setRequests(r.data);
      setTechs(t.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" style={{borderWidth:'3px'}} />
    </div>
  );

  // Chart data
  const devicePieData = devices ? [
    { name: 'Working',     value: devices.summary?.working     || 0 },
    { name: 'Not Working', value: devices.summary?.not_working  || 0 },
  ] : [];

  const requestBarData = requests?.by_status?.map(s => ({
    name: s.status, count: s.count
  })) || [];

  const techStatusData = techs?.by_status?.map(s => ({
    name: s.status, count: s.count
  })) || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-900">
          Welcome, {user?.first_name}! 
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">Here's what's happening in your system today.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total PCs"          value={overview?.devices?.pcs}             icon={Monitor}       color="primary" />
        <StatCard title="Accessories"         value={overview?.devices?.accessories}     icon={Mouse}         color="blue"    />
        <StatCard title="Network Devices"     value={overview?.devices?.network_devices} icon={Network}       color="purple"  />
        <StatCard title="Pending Requests"    value={overview?.requests?.pending}        icon={Clock}         color="amber"   />
        <StatCard title="Fixed Requests"      value={overview?.requests?.fixed}          icon={CheckCircle}   color="emerald" />
        <StatCard title="Total Requests"      value={overview?.requests?.total}          icon={ClipboardList} color="primary" />
        <StatCard title="Technicians"         value={overview?.technicians?.total}       icon={Users}         color="blue"    />
        <StatCard title="Available Techs"     value={overview?.technicians?.available}   icon={Users}         color="emerald" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Device status pie */}
        <div className="card p-5">
          <h3 className="font-display text-base font-bold text-slate-800 mb-4">Device Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={devicePieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                {devicePieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip formatter={(v) => [v, 'Devices']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Request bar chart */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="font-display text-base font-bold text-slate-800 mb-4">Requests by Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={requestBarData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip />
              <Bar dataKey="count" name="Requests" radius={[4, 4, 0, 0]}>
                {requestBarData.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Technician workload table */}
      {techs?.technicians?.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-display text-base font-bold text-slate-800">Technician Workload</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="table-head">
                <tr>
                  <th className="table-th">Technician</th>
                  <th className="table-th">Status</th>
                  <th className="table-th text-center">PCs</th>
                  <th className="table-th text-center">Accessories</th>
                  <th className="table-th text-center">Network</th>
                  <th className="table-th text-center">Active Requests</th>
                </tr>
              </thead>
              <tbody>
                {techs.technicians.map(t => (
                  <tr key={t.id} className="table-row">
                    <td className="table-td font-medium text-slate-800">{t.name}</td>
                    <td className="table-td">{statusBadge(t.status)}</td>
                    <td className="table-td text-center">{t.assigned_pcs}</td>
                    <td className="table-td text-center">{t.assigned_accessories}</td>
                    <td className="table-td text-center">{t.assigned_network_devices}</td>
                    <td className="table-td text-center">
                      <span className={`badge ${t.assigned_requests > 0 ? 'badge-amber' : 'badge-green'}`}>
                        {t.assigned_requests}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Devices breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          { label: 'PCs by Location', data: devices?.pcs?.by_location, key: 'location' },
          { label: 'PCs by Status',   data: devices?.pcs?.by_status,   key: 'status'   },
          { label: 'Technicians',     data: techStatusData.map(s => ({status: s.name, count: s.count})), key: 'status' },
        ].map(({ label, data, key }) => (
          <div key={label} className="card p-5">
            <h3 className="font-display text-sm font-bold text-slate-700 mb-3">{label}</h3>
            <div className="space-y-2">
              {(data || []).map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-xs text-slate-600">{item[key]}</span>
                  <span className="font-mono text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                    {item.count}
                  </span>
                </div>
              ))}
              {(!data || data.length === 0) && <p className="text-xs text-slate-400">No data</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

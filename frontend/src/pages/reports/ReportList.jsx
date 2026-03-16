import { useState, useEffect, useCallback, useMemo } from 'react';
import { reportService } from '../../api/reportService';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import { useForm } from 'react-hook-form';
import { 
  Plus, FileText, Trash2, Eye, RefreshCw, 
  Search, Filter, Printer, Download,
  CheckCircle, AlertTriangle, Activity, BarChart2
} from 'lucide-react';
import StatusBadge from '../../components/dashboard/StatusBadge';
import StatCard from '../../components/StatCard';
import { useToast } from '../../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';

// StatusBadge component is imported below
const DEVICE_TYPES = ['All Types', 'PC', 'Accessory', 'NetworkDevice'];
const STATUSES = ['All Statuses', 'Working', 'Not Working', 'Damaged', 'Old', 'Repaired', 'Replaced'];

export default function ReportList() {
  const { isAdmin } = useAuth();
  const { showToast } = useToast();
  const [items,    setItems]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(null);
  const [selected, setSelected] = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');
  
  // Advanced Filtering States
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All Types');
  const [filterStatus, setFilterStatus] = useState('All Statuses');
  const [showCharts, setShowCharts] = useState(true);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const load = useCallback(() => {
    setLoading(true);
    reportService.list().then(r => setItems(r.data.results || r.data)).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // Filtering Logic
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = !search || 
        item.location?.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase()) ||
        String(item.device_id).includes(search);
      
      const matchesType = filterType === 'All Types' || item.device_type === filterType;
      const matchesStatus = filterStatus === 'All Statuses' || item.status === filterStatus;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [items, search, filterType, filterStatus]);

  // Metrics for Cards
  const metrics = useMemo(() => {
    return {
      total: items.length,
      fixed: items.filter(i => i.status === 'Working' || i.status === 'Repaired').length,
      damaged: items.filter(i => i.status === 'Damaged' || i.status === 'Not Working').length,
    };
  }, [items]);

  // Chart Data
  const chartData = useMemo(() => {
    const counts = items.reduce((acc, item) => {
      acc[item.device_type] = (acc[item.device_type] || 0) + 1;
      return acc;
    }, {});
    
    return [
      { name: 'PC', count: counts['PC'] || 0, color: '#6366f1' },
      { name: 'Accessory', count: counts['Accessory'] || 0, color: '#8b5cf6' },
      { name: 'Network', count: counts['NetworkDevice'] || 0, color: '#ec4899' },
    ];
  }, [items]);

  const openAdd    = () => { reset({}); setModal('add'); setError(''); };
  const openView   = (r) => { setSelected(r); setModal('view'); };
  const openDelete = (r) => { setSelected(r); setModal('delete'); };
  const close      = () => { setModal(null); setSelected(null); };

  const onSubmit = async (data) => {
    setSaving(true); setError('');
    try {
      await reportService.create({ ...data, device_id: parseInt(data.device_id) });
      showToast('Report created successfully!', 'success');
      load(); close();
    } catch (e) { setError(e.response?.data?.detail || 'Failed to create report.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await reportService.delete(selected.id);
      showToast('Report deleted successfully.', 'success');
      load();
      close();
    } catch (e) {
      showToast('Failed to delete report.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pb-10 space-y-8 animate-fade-in max-w-[1600px] mx-auto pt-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Maintenance Reports</h2>
          <p className="text-sm font-medium text-slate-500">Analyze and track system hardware health</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowCharts(!showCharts)}
            className={`p-2.5 rounded-xl border transition-all ${showCharts ? 'bg-primary-50 border-primary-100 text-primary-600' : 'bg-white border-slate-200 text-slate-500'}`}
            title="Toggle Analytics View"
          >
            <BarChart2 size={20} />
          </button>
          <button onClick={openAdd} className="btn-primary-premium flex items-center gap-2 px-6 py-2.5 shadow-lg shadow-primary-500/20">
            <Plus className="w-4 h-4" /> 
            <span>Create Report</span>
          </button>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Total Reports" 
          value={metrics.total} 
          icon={FileText} 
          color="primary" 
          delay={0.1}
          subtitle="Lifetime system logs"
        />
        <StatCard 
          title="Optimal State" 
          value={metrics.fixed} 
          icon={CheckCircle} 
          color="emerald" 
          delay={0.2}
          subtitle="Devices fully operational"
        />
        <StatCard 
          title="Attention Needed" 
          value={metrics.damaged} 
          icon={AlertTriangle} 
          color="amber" 
          delay={0.3}
          subtitle="Outstanding issues found"
        />
      </div>

      {/* Optional Chart Section */}
      <AnimatePresence>
        {showCharts && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="card p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="flex items-center gap-2 mb-6">
                  <Activity size={18} className="text-primary-500" />
                  <h3 className="font-display text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Distribution by Type</h3>
                </div>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} />
                      <Tooltip 
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-surface-800/30 rounded-2xl p-6 flex flex-col justify-center border border-slate-100 dark:border-surface-800">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Quick Insights</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Success Rate</span>
                    <span className="text-sm font-black text-emerald-600">{metrics.total > 0 ? ((metrics.fixed / metrics.total) * 100).toFixed(0) : 0}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-surface-800 rounded-full">
                    <div 
                      className="h-full bg-emerald-500 rounded-full" 
                      style={{ width: `${metrics.total > 0 ? (metrics.fixed / metrics.total) * 100 : 0}%` }} 
                    />
                  </div>
                  <p className="text-[10px] leading-relaxed text-slate-500 font-medium">
                    Most maintenance tasks lead to successful repairs. Keep monitoring for "Damaged" trends.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Bar */}
      <div className="card p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
          <input 
            type="text"
            placeholder="Search by ID, location or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-surface-900 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-500 transition-all font-medium"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-surface-900 px-3 py-1.5 rounded-xl">
            <Filter size={14} className="text-slate-400" />
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent border-none text-xs font-bold text-slate-600 dark:text-slate-300 focus:ring-0 p-0 cursor-pointer"
            >
              {DEVICE_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-surface-900 px-3 py-1.5 rounded-xl">
            <Activity size={14} className="text-slate-400" />
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent border-none text-xs font-bold text-slate-600 dark:text-slate-300 focus:ring-0 p-0 cursor-pointer"
            >
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <button 
            onClick={() => {
              setSearch('');
              setFilterType('All Types');
              setFilterStatus('All Statuses');
            }}
            className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
            title="Reset Filters"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-7 h-7 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <FileText className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">No reports yet</p>
            <p className="text-xs mt-1">Create your first maintenance report</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="flex gap-2 p-4 justify-end border-b border-slate-100 dark:border-surface-800">
              <button 
                onClick={() => showToast('Preparing report for print...', 'info')}
                className="btn-secondary"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </button>
              <button 
                onClick={() => showToast('Exporting data to CSV...', 'info')}
                className="btn-primary-premium shadow-lg shadow-primary-500/20"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
            <table className="w-full">
              <thead className="table-head">
                <tr>
                  <th className="table-th">ID</th>
                  <th className="table-th">Device Type</th>
                  <th className="table-th">Device ID</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Technician</th>
                  <th className="table-th">Location</th>
                  <th className="table-th">Date</th>
                  <th className="table-th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(r => (
                  <tr key={r.id} className="table-row group">
                    <td className="table-td font-mono text-xs text-slate-400">#{r.id}</td>
                    <td className="table-td">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                        r.device_type === 'PC' ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30' :
                        r.device_type === 'NetworkDevice' ? 'bg-pink-50 text-pink-600 dark:bg-pink-900/30' :
                        'bg-purple-50 text-purple-600 dark:bg-purple-900/30'
                      }`}>
                        {r.device_type}
                      </span>
                    </td>
                    <td className="table-td font-mono text-xs">#{r.device_id}</td>
                    <td className="table-td"><StatusBadge status={r.status} /></td>
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-surface-800 flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase">
                          {r.technician?.first_name?.[0] || 'T'}
                        </div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {r.technician ? `${r.technician.first_name} ${r.technician.last_name}` : 'Unassigned'}
                        </span>
                      </div>
                    </td>
                    <td className="table-td text-xs font-medium text-slate-500">{r.location || '—'}</td>
                    <td className="table-td text-xs font-medium text-slate-400">{r.report_date}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        <motion.button 
                          whileHover={{ scale: 1.1 }} 
                          whileTap={{ scale: 0.9 }} 
                          onClick={() => openView(r)} 
                          className="p-2 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-all"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.1 }} 
                          whileTap={{ scale: 0.9 }} 
                          className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all opacity-0 group-hover:opacity-100"
                          title="Print / Export"
                        >
                          <Printer className="w-4 h-4" />
                        </motion.button>
                        {isAdmin && (
                          <motion.button 
                            whileHover={{ scale: 1.1 }} 
                            whileTap={{ scale: 0.9 }} 
                            onClick={() => openDelete(r)} 
                            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Report Modal */}
      <Modal open={modal === 'add'} onClose={close} title="Create Maintenance Report">
        {error && <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg p-3 mb-4">{error}</p>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Device Type *</label>
            <select className="input-premium" {...register('device_type', { required: true })}>
              {DEVICE_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Device ID *</label>
            <input type="number" className={`input-premium ${errors.device_id ? 'border-rose-500' : ''}`} placeholder="Enter the device ID number"
              {...register('device_id', { required: 'Device ID is required' })} />
            {errors.device_id && <p className="text-[10px] font-bold text-rose-500 mt-1 uppercase tracking-tight">{errors.device_id.message}</p>}
          </div>
          <div>
            <label className="label">Status After Maintenance *</label>
            <select className="input-premium" {...register('status', { required: true })}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Location *</label>
            <input className="input-premium" placeholder="Lab 3, Office A..." {...register('location', { required: true })} />
          </div>
          <div>
            <label className="label">Description *</label>
            <textarea rows={3} className={`input-premium resize-none py-3 ${errors.description ? 'border-rose-500' : ''}`}
              placeholder="Describe what was done, what was found, and what was fixed..."
              {...register('description', { required: 'Description required' })} />
            {errors.description && <p className="text-[10px] font-bold text-rose-500 mt-1 uppercase tracking-tight">{errors.description.message}</p>}
          </div>
          <div className="flex gap-3 justify-end pt-6 border-t border-slate-100 dark:border-surface-800">
            <button type="button" onClick={close} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary-premium">{saving ? 'Saving...' : 'Create Report'}</button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal open={modal === 'view'} onClose={close} title="Report Details" size="lg">
        {selected && (
          <div className="space-y-3">
            {[
              ['Device Type', selected.device_type],
              ['Device ID', `#${selected.device_id}`],
              ['Location', selected.location],
              ['Report Date', selected.report_date],
              ['Technician', selected.technician ? `${selected.technician.first_name} ${selected.technician.last_name}` : '—'],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</span>
                <span className="text-sm text-slate-800">{val}</span>
              </div>
            ))}
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-surface-800">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Status</span>
              <StatusBadge status={selected.status} />
            </div>
            <div className="bg-slate-50 dark:bg-surface-800/50 rounded-xl p-4 border border-slate-100 dark:border-surface-800/50 mt-2">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-2">Detailed Description</p>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{selected.description}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal open={modal === 'delete'} onClose={close} title="Delete Report" size="sm">
        <p className="text-sm text-slate-600 mb-6">Delete report <strong>#{selected?.id}</strong>? This cannot be undone.</p>
        <div className="flex gap-3 justify-end">
          <button onClick={close} className="btn-secondary">Cancel</button>
          <button onClick={handleDelete} disabled={saving} className="btn-danger">{saving ? 'Deleting...' : 'Delete'}</button>
        </div>
      </Modal>
    </div>
  );
}

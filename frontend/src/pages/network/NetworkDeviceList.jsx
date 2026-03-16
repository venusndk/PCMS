// pages/network/NetworkDeviceList.jsx
import { useState, useEffect, useCallback } from 'react';
import { networkService } from '../../api/networkService';
import { technicianService } from '../../api/technicianService';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import { useForm } from 'react-hook-form';
import { Plus, Pencil, Trash2, Network, RefreshCw, Filter, Wifi, ShieldCheck, Cpu } from 'lucide-react';

const getIcon = (type) => {
  const t = type?.toLowerCase();
  if (t === 'access point' || t === 'wifi') return <Wifi size={16} />;
  if (t === 'switch' || t === 'hub') return <Network size={16} />;
  if (t === 'router' || t === 'modem') return <Network size={16} />;
  if (t === 'firewall') return <ShieldCheck size={16} />;
  return <Cpu size={16} />;
};

import StatusBadge from '../../components/dashboard/StatusBadge';
import { motion } from 'framer-motion';

const TYPES    = ['Access Point', 'Switch', 'Router', 'Modem', 'Firewall', 'Other'];
const STATUSES = ['Working', 'Not Working', 'Damaged', 'Old'];

export default function NetworkDeviceList() {
  const { isAdmin } = useAuth();
  const [items,    setItems]    = useState([]);
  const [techs,    setTechs]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(null);
  const [selected, setSelected] = useState(null);
  const [filter,   setFilter]   = useState({ name: '', status: '' });
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const load = useCallback(() => {
    setLoading(true);
    networkService.list(filter).then(r => setItems(r.data.results || r.data)).finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { 
    technicianService.list().then(r => setTechs(r.data.results || r.data)); 
  }, []);

  const openAdd    = () => { reset({}); setModal('add'); setError(''); };
  const openEdit   = (d) => { setSelected(d); reset(d); setModal('edit'); setError(''); };
  const openDelete = (d) => { setSelected(d); setModal('delete'); };
  const close      = () => { setModal(null); setSelected(null); };

  const onSubmit = async (data) => {
    setSaving(true); setError('');
    try {
      if (modal === 'add') await networkService.create(data);
      else await networkService.update(selected.id, data);
      load(); close();
    } catch (e) { setError(e.response?.data?.detail || 'Failed to save.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try { await networkService.delete(selected.id); load(); close(); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Network Devices</h2>
          <p className="page-subtitle">{items.length} devices registered</p>
        </div>
        <button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Add Device</button>
      </div>

      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <Filter className="w-4 h-4 text-slate-400" />
        <select className="input-premium w-40 py-1.5 text-xs h-9" value={filter.name}
          onChange={e => setFilter(f => ({ ...f, name: e.target.value }))}>
          <option value="">All Types</option>
          {TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
        <select className="input-premium w-36 py-1.5 text-xs h-9" value={filter.status}
          onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}>
          <option value="">All Status</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <button onClick={load} className="btn-ghost btn-sm ml-auto"><RefreshCw className="w-3 h-3" /> Refresh</button>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-7 h-7 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Network className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">No network devices found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="table-head">
                <tr>
                  <th className="table-th">ID</th>
                  <th className="table-th">Type</th>
                  <th className="table-th">Brand</th>
                  <th className="table-th">IP Address</th>
                  <th className="table-th">Location</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Technician</th>
                  {isAdmin && <th className="table-th">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {items.map((d, idx) => (
                  <motion.tr 
                    key={d.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="table-row group"
                  >
                    <td className="px-6 py-4 font-mono text-[10px] font-bold text-slate-400">#{d.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 dark:bg-surface-800 rounded-lg flex items-center justify-center group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors">
                          <span className="text-slate-500 group-hover:text-primary-600 transition-colors">
                            {getIcon(d.device_type)}
                          </span>
                        </div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-sm italic">{d.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-widest">{d.brand}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 dark:bg-surface-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded-md font-mono tracking-tighter border border-slate-200 dark:border-surface-700">
                        {d.ip_address || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-[10px] font-bold rounded-md border border-primary-100 dark:border-primary-800/50 uppercase tracking-tighter">
                        {d.location}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={d.status} />
                    </td>
                    <td className="px-6 py-4">
                      {d.technician_assigned ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-[10px] font-bold text-primary-600">
                            {d.technician_assigned.first_name?.[0] || 'T'}
                          </div>
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            {d.technician_assigned.first_name} {d.technician_assigned.last_name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Unassigned</span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4">
                        <div className="flex gap-1.5 leading-none">
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => openEdit(d)} className="p-2 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">
                            <Pencil className="w-4 h-4" />
                          </motion.button>
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => openDelete(d)} className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all">
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    )}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modal === 'add' || modal === 'edit'} onClose={close}
        title={modal === 'add' ? 'Add Network Device' : 'Edit Network Device'}>
        {error && <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg p-3 mb-4">{error}</p>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Device Type *</label>
            <select className="input-premium" {...register('name', { required: true })}>
              {TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Brand *</label>
            <input className={`input-premium ${errors.brand ? 'border-rose-500' : ''}`} placeholder="Cisco, TP-Link..." {...register('brand', { required: 'Brand required' })} />
            {errors.brand && <p className="text-[10px] font-bold text-rose-500 mt-1 uppercase tracking-tight">{errors.brand.message}</p>}
          </div>
          <div>
            <label className="label">IP Address</label>
            <input className="input-premium" placeholder="192.168.1.1" {...register('ip_address')} />
          </div>
          <div>
            <label className="label">Location *</label>
            <input className="input-premium" placeholder="Server Room, Lab..." {...register('location', { required: true })} />
          </div>
          <div>
            <label className="label">Status *</label>
            <select className="input-premium" {...register('status', { required: true })}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Assign Technician</label>
            <select className="input-premium" {...register('technician_assigned')}>
              <option value="">None</option>
              {Array.isArray(techs) && techs.map(t => <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>)}
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-6 border-t border-slate-100 dark:border-surface-800">
            <button type="button" onClick={close} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary-premium">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={modal === 'delete'} onClose={close} title="Delete Device" size="sm">
        <p className="text-sm text-slate-600 mb-6">Delete <strong>{selected?.brand} {selected?.name}</strong>? This cannot be undone.</p>
        <div className="flex gap-3 justify-end">
          <button onClick={close} className="btn-secondary">Cancel</button>
          <button onClick={handleDelete} disabled={saving} className="btn-danger">{saving ? 'Deleting...' : 'Delete'}</button>
        </div>
      </Modal>
    </div>
  );
}

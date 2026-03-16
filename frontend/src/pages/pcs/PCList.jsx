// pages/pcs/PCList.jsx
import { useState, useEffect, useCallback } from 'react';
import { pcService } from '../../api/pcService';
import { technicianService } from '../../api/technicianService';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import FormInput from '../../components/FormInput';
import { useForm } from 'react-hook-form';
import { Plus, Pencil, Trash2, Filter, Monitor, RefreshCw } from 'lucide-react';

import StatusBadge from '../../components/dashboard/StatusBadge';
import { motion } from 'framer-motion';

const STATUSES   = ['Working', 'Not Working', 'Damaged', 'Old'];
const LOCATIONS  = ['Lab', 'Office'];

export default function PCList() {
  const { isAdmin } = useAuth();
  const [pcs,    setPCs]    = useState([]);
  const [techs,  setTechs]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,  setModal]  = useState(null); // null | 'add' | 'edit' | 'delete'
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({ location: '', status: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const load = useCallback(() => {
    setLoading(true);
    pcService.list(filters).then(r => setPCs(r.data.results || r.data)).finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { 
    technicianService.list().then(r => setTechs(r.data.results || r.data)); 
  }, []);

  const openAdd = () => { reset({}); setModal('add'); setError(''); };
  const openEdit = (pc) => { setSelected(pc); reset(pc); setModal('edit'); setError(''); };
  const openDelete = (pc) => { setSelected(pc); setModal('delete'); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const onSubmit = async (data) => {
    setSaving(true); setError('');
    try {
      if (modal === 'add') await pcService.create(data);
      else await pcService.update(selected.id, data);
      load(); closeModal();
    } catch (e) {
      setError(e.response?.data?.detail || JSON.stringify(e.response?.data) || 'Failed to save.');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try { await pcService.delete(selected.id); load(); closeModal(); }
    catch { setError('Failed to delete.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">PCs</h2>
          <p className="page-subtitle">{pcs.length} computers registered</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus className="w-4 h-4" /> Add PC
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <Filter className="w-4 h-4 text-slate-400" />
        <select className="input-premium w-36 py-1.5 text-xs h-9" value={filters.location}
          onChange={e => setFilters(f => ({ ...f, location: e.target.value }))}>
          <option value="">All Locations</option>
          {LOCATIONS.map(l => <option key={l}>{l}</option>)}
        </select>
        <select className="input-premium w-36 py-1.5 text-xs h-9" value={filters.status}
          onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
          <option value="">All Status</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <button onClick={load} className="btn-ghost btn-sm ml-auto">
          <RefreshCw className="w-3 h-3" /> Refresh
        </button>
      </div>

      {/* Table */}
      <div className="table-container">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-7 h-7 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          </div>
        ) : pcs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Monitor className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">No PCs found</p>
            <p className="text-xs mt-1">Add your first PC to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="table-head">
                <tr>
                  <th className="table-th">ID</th>
                  <th className="table-th">Brand</th>
                  <th className="table-th">RAM</th>
                  <th className="table-th">HDD</th>
                  <th className="table-th">OS</th>
                  <th className="table-th">Location</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Technician</th>
                  <th className="table-th">Year</th>
                  {isAdmin && <th className="table-th">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {pcs.map((pc, idx) => (
                  <motion.tr 
                    key={pc.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="table-row group"
                  >
                    <td className="px-6 py-4 font-mono text-[10px] font-bold text-slate-400">#{pc.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 dark:bg-surface-800 rounded-lg flex items-center justify-center group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors">
                          <Monitor className="w-4 h-4 text-slate-500 group-hover:text-primary-600 transition-colors" />
                        </div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{pc.brand}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-400 font-mono">{pc.ram}</td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-400 font-mono">{pc.hdd}</td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{pc.operating_system}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-[10px] font-bold rounded-md border border-primary-100 dark:border-primary-800/50 uppercase tracking-tighter">
                        {pc.location}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={pc.status} />
                    </td>
                    <td className="px-6 py-4">
                      {pc.technician_assigned ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-[10px] font-bold text-primary-600">
                            {pc.technician_assigned.first_name?.[0] || 'T'}
                          </div>
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            {pc.technician_assigned.full_name || `${pc.technician_assigned.first_name} ${pc.technician_assigned.last_name}`}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-500">{pc.registration_year}</td>
                    {isAdmin && (
                      <td className="px-6 py-4">
                        <div className="flex gap-1.5 leading-none">
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => openEdit(pc)} className="p-2 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">
                            <Pencil className="w-4 h-4" />
                          </motion.button>
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => openDelete(pc)} className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all">
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

      {/* Add/Edit Modal */}
      <Modal open={modal === 'add' || modal === 'edit'} onClose={closeModal}
        title={modal === 'add' ? 'Register New PC' : 'Edit PC'} size="lg">
        {error && <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg p-3 mb-4">{error}</p>}
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
          <FormInput label="Brand *" placeholder="Dell, HP, Lenovo..." error={errors.brand?.message}
            register={register('brand', { required: 'Brand is required' })} />
          <FormInput label="RAM *" placeholder="8GB, 16GB..." error={errors.ram?.message}
            register={register('ram', { required: 'RAM is required' })} />
          <FormInput label="HDD/SSD *" placeholder="500GB HDD, 256GB SSD..." error={errors.hdd?.message}
            register={register('hdd', { required: 'Storage is required' })} />
          <FormInput label="Operating System *" placeholder="Windows 10, Ubuntu..." error={errors.operating_system?.message}
            register={register('operating_system', { required: 'OS is required' })} />
          <FormInput label="Registration Year *" type="number" placeholder="2023" error={errors.registration_year?.message}
            register={register('registration_year', { required: 'Year is required', valueAsNumber: true })} />
          <div>
            <label className="label">Location *</label>
            <select className="input-premium" {...register('location', { required: true })}>
              {LOCATIONS.map(l => <option key={l}>{l}</option>)}
            </select>
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
          <div className="col-span-2 flex gap-3 justify-end pt-6 border-t border-slate-100 dark:border-surface-800">
            <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary-premium">
              {saving ? 'Saving...' : modal === 'add' ? 'Register PC' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal open={modal === 'delete'} onClose={closeModal} title="Delete PC" size="sm">
        <p className="text-sm text-slate-600 mb-6">
          Are you sure you want to delete <strong>{selected?.brand}</strong> PC #{selected?.id}?
          This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={closeModal} className="btn-secondary">Cancel</button>
          <button onClick={handleDelete} disabled={saving} className="btn-danger">
            {saving ? 'Deleting...' : 'Delete PC'}
          </button>
        </div>
      </Modal>
    </div>
  );
}

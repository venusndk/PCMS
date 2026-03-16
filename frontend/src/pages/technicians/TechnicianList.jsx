// pages/technicians/TechnicianList.jsx
import { useState, useEffect, useCallback } from 'react';
import { technicianService } from '../../api/technicianService';
import { authService } from '../../api/authService';
import Modal from '../../components/Modal';
import { useForm } from 'react-hook-form';
import { Users, Pencil, Trash2, RefreshCw, UserPlus } from 'lucide-react';

import StatusBadge from '../../components/dashboard/StatusBadge';
import { motion } from 'framer-motion';

export default function TechnicianList() {
  const [items,    setItems]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(null);
  const [selected, setSelected] = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');
  const { register, handleSubmit, reset } = useForm();
  
  const [addModal, setAddModal] = useState(false);
  const [addSaving, setAddSaving] = useState(false);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');

  const { 
    register: regAdd, 
    handleSubmit: subAdd, 
    watch: watchAdd,
    reset: resetAdd,
    formState: { errors: addErrors } 
  } = useForm();

  const load = useCallback(() => {
    setLoading(true);
    technicianService.list().then(r => setItems(r.data)).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openEdit   = (t) => { setSelected(t); reset(t); setModal('edit'); setError(''); };
  const openDelete = (t) => { setSelected(t); setModal('delete'); };
  const close      = () => { setModal(null); setSelected(null); };

  const onSubmit = async (data) => {
    setSaving(true); setError('');
    try {
      await technicianService.update(selected.id, data);
      load(); close();
    } catch (e) { setError(e.response?.data?.detail || 'Failed to update.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try { await technicianService.delete(selected.id); load(); close(); }
    finally { setSaving(false); }
  };

  const handleAddTechnician = async (data) => {
    setAddSaving(true);
    setAddError('');
    try {
      await authService.register({
        ...data,
        role: 'Technician'
      });
      setAddSuccess('Technician added successfully!');
      resetAdd();
      setTimeout(() => {
        setAddModal(false);
        setAddSuccess('');
        load();
      }, 1500);
    } catch (e) {
      const err = e.response?.data;
      setAddError(
        err?.email?.[0] || 
        err?.detail || 
        'Failed to add technician.'
      );
    } finally {
      setAddSaving(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Technicians</h2>
          <p className="page-subtitle">{items.length} technicians registered</p>
        </div>
        <div className="flex gap-2 items-center">
          <button 
            onClick={() => { resetAdd(); setAddModal(true); setAddError(''); }}
            className="btn-primary"
          >
            <UserPlus className="w-4 h-4" /> 
            Add Technician
          </button>
          <button onClick={load} className="btn-secondary btn-sm"><RefreshCw className="w-3.5 h-3.5" /> Refresh</button>
        </div>
      </div>

      {/* Cards grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-7 h-7 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-slate-400">
          <Users className="w-10 h-10 mb-3 opacity-30" />
          <p className="text-sm font-medium">No technicians found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((t, idx) => (
            <motion.div 
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -5 }}
              className="card-hover p-6 group relative overflow-hidden"
            >
              <div className="flex items-start justify-between mb-5 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/40 rounded-2xl flex items-center justify-center ring-1 ring-primary-100 dark:ring-primary-800 shadow-sm group-hover:scale-110 transition-transform duration-300">
                    <span className="text-sm font-extrabold text-primary-700 dark:text-primary-400 uppercase tracking-tighter">
                      {t.first_name?.[0]}{t.last_name?.[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-display font-bold text-slate-800 dark:text-white text-base leading-tight">
                      {t.first_name} {t.last_name}
                    </p>
                    <p className="text-[11px] font-medium text-slate-400 group-hover:text-primary-500 transition-colors uppercase tracking-tight">
                      {t.email}
                    </p>
                  </div>
                </div>
                <StatusBadge status={t.status} />
              </div>

              {t.phone && (
                <div className="flex items-center gap-2 mb-5 px-3 py-1.5 bg-slate-50 dark:bg-surface-800/50 rounded-lg border border-slate-100 dark:border-surface-800/50 w-fit">
                  <span className="text-[10px]">📱</span>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 font-mono">{t.phone}</span>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50/50 dark:bg-surface-800/20 rounded-2xl border border-slate-100 dark:border-surface-800/50 text-center mb-6 relative z-10">
                <div>
                  <p className="font-mono text-lg font-black text-slate-800 dark:text-white leading-none mb-1">{t.assigned_pcs || 0}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PCs</p>
                </div>
                <div>
                  <p className="font-mono text-lg font-black text-slate-800 dark:text-white leading-none mb-1">{t.assigned_accessories || 0}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Acc.</p>
                </div>
                <div>
                  <p className="font-mono text-lg font-black text-slate-800 dark:text-white leading-none mb-1">{t.assigned_network_devices || 0}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Net</p>
                </div>
              </div>

              <div className="flex gap-3 relative z-10">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openEdit(t)} 
                  className="btn-secondary btn-sm flex-1 justify-center py-2 font-bold text-[11px] uppercase tracking-wider"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit Profile
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.02, backgroundColor: '#fef2f2' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openDelete(t)} 
                  className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all border border-transparent hover:border-rose-100"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
              
              {/* Decorative accent bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${t.status === 'Available' ? 'bg-emerald-500' : t.status === 'Busy' ? 'bg-amber-500' : 'bg-rose-500'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              
              {/* Decorative background circle */}
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary-500 opacity-[0.03] rounded-full group-hover:scale-150 transition-transform duration-700 blur-xl" />
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <Modal open={modal === 'edit'} onClose={close} title="Edit Technician">
        {error && <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg p-3 mb-4">{error}</p>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">First Name</label>
              <input className="input-premium" {...register('first_name')} />
            </div>
            <div>
              <label className="label">Last Name</label>
              <input className="input-premium" {...register('last_name')} />
            </div>
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input-premium" {...register('phone')} />
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input-premium" {...register('status')}>
              <option value="Available">Available</option>
              <option value="Busy">Busy</option>
              <option value="Not Available">Not Available</option>
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-6 border-t border-slate-100 dark:border-surface-800">
            <button type="button" onClick={close} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary-premium">{saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal open={modal === 'delete'} onClose={close} title="Delete Technician" size="sm">
        <p className="text-sm text-slate-600 mb-6">
          Delete <strong>{selected?.first_name} {selected?.last_name}</strong>?
          This will remove all their assignments.
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={close} className="btn-secondary">Cancel</button>
          <button onClick={handleDelete} disabled={saving} className="btn-danger">{saving ? 'Deleting...' : 'Delete'}</button>
        </div>
      </Modal>

      {/* Add Modal */}
      <Modal open={addModal} onClose={() => setAddModal(false)} title="Register New Technician" size="lg">
        {addSuccess && <p className="text-sm text-emerald-500 bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4">{addSuccess}</p>}
        {addError && <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg p-3 mb-4">{addError}</p>}
        <form onSubmit={subAdd(handleAddTechnician)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">First Name *</label>
              <input className="input-premium" {...regAdd('first_name', { required: 'First name is required' })} />
              {addErrors.first_name && <p className="text-xs text-red-500 mt-1">{addErrors.first_name.message}</p>}
            </div>
            <div>
              <label className="label">Last Name *</label>
              <input className="input-premium" {...regAdd('last_name', { required: 'Last name is required' })} />
              {addErrors.last_name && <p className="text-xs text-red-500 mt-1">{addErrors.last_name.message}</p>}
            </div>
          </div>
          <div>
            <label className="label">Email *</label>
            <input type="email" className="input-premium" {...regAdd('email', { 
              required: 'Email is required',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email format' }
            })} />
            {addErrors.email && <p className="text-xs text-red-500 mt-1">{addErrors.email.message}</p>}
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input-premium" {...regAdd('phone')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Password *</label>
              <input type="password" className="input-premium" {...regAdd('password', { 
                required: 'Password is required',
                minLength: { value: 6, message: 'Min 6 characters' }
              })} />
              {addErrors.password && <p className="text-xs text-red-500 mt-1">{addErrors.password.message}</p>}
            </div>
            <div>
              <label className="label">Confirm Password *</label>
              <input type="password" className="input-premium" {...regAdd('confirm_password', { 
                required: 'Please confirm password',
                validate: v => v === watchAdd('password') || 'Passwords do not match'
              })} />
              {addErrors.confirm_password && <p className="text-xs text-red-500 mt-1">{addErrors.confirm_password.message}</p>}
            </div>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input-premium" {...regAdd('status')} defaultValue="Available">
              <option value="Available">Available</option>
              <option value="Busy">Busy</option>
              <option value="Not Available">Not Available</option>
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-6 border-t border-slate-100 dark:border-surface-800 mt-6">
            <button type="button" onClick={() => setAddModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={addSaving} className="btn-primary-premium">{addSaving ? 'Registering...' : 'Register Technician'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

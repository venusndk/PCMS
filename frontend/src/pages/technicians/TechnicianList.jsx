// pages/technicians/TechnicianList.jsx
import { useState, useEffect, useCallback } from 'react';
import { technicianService } from '../../api/technicianService';
import { authService } from '../../api/authService';
import Modal from '../../components/Modal';
import { useForm } from 'react-hook-form';
import { Users, Pencil, Trash2, RefreshCw, UserPlus } from 'lucide-react';

const statusBadge = (s) => {
  const map = { Available: 'badge-green', Busy: 'badge-amber', 'Not Available': 'badge-red' };
  return <span className={`badge ${map[s] || 'badge-slate'}`}>{s}</span>;
};

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(t => (
            <div key={t.id} className="card p-5 hover:shadow-card-hover transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-primary-700">{t.first_name?.[0]}{t.last_name?.[0]}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{t.first_name} {t.last_name}</p>
                    <p className="text-xs text-slate-400">{t.email}</p>
                  </div>
                </div>
                {statusBadge(t.status)}
              </div>

              {t.phone && (
                <p className="text-xs text-slate-500 mb-3">📱 {t.phone}</p>
              )}

              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-lg text-center mb-3">
                <div>
                  <p className="font-mono text-sm font-bold text-slate-800">{t.assigned_pcs || 0}</p>
                  <p className="text-xs text-slate-400">PCs</p>
                </div>
                <div>
                  <p className="font-mono text-sm font-bold text-slate-800">{t.assigned_accessories || 0}</p>
                  <p className="text-xs text-slate-400">Access.</p>
                </div>
                <div>
                  <p className="font-mono text-sm font-bold text-slate-800">{t.assigned_network_devices || 0}</p>
                  <p className="text-xs text-slate-400">Network</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => openEdit(t)} className="btn-secondary btn-sm flex-1 justify-center">
                  <Pencil className="w-3 h-3" /> Edit
                </button>
                <button onClick={() => openDelete(t)} className="btn-ghost btn-sm px-3 text-red-500 hover:bg-red-50">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
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
              <input className="input" {...register('first_name')} />
            </div>
            <div>
              <label className="label">Last Name</label>
              <input className="input" {...register('last_name')} />
            </div>
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" {...register('phone')} />
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" {...register('status')}>
              <option value="Available">Available</option>
              <option value="Busy">Busy</option>
              <option value="Not Available">Not Available</option>
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
            <button type="button" onClick={close} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Changes'}</button>
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
              <input className="input" {...regAdd('first_name', { required: 'First name is required' })} />
              {addErrors.first_name && <p className="text-xs text-red-500 mt-1">{addErrors.first_name.message}</p>}
            </div>
            <div>
              <label className="label">Last Name *</label>
              <input className="input" {...regAdd('last_name', { required: 'Last name is required' })} />
              {addErrors.last_name && <p className="text-xs text-red-500 mt-1">{addErrors.last_name.message}</p>}
            </div>
          </div>
          <div>
            <label className="label">Email *</label>
            <input type="email" className="input" {...regAdd('email', { 
              required: 'Email is required',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email format' }
            })} />
            {addErrors.email && <p className="text-xs text-red-500 mt-1">{addErrors.email.message}</p>}
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" {...regAdd('phone')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Password *</label>
              <input type="password" className="input" {...regAdd('password', { 
                required: 'Password is required',
                minLength: { value: 6, message: 'Min 6 characters' }
              })} />
              {addErrors.password && <p className="text-xs text-red-500 mt-1">{addErrors.password.message}</p>}
            </div>
            <div>
              <label className="label">Confirm Password *</label>
              <input type="password" className="input" {...regAdd('confirm_password', { 
                required: 'Please confirm password',
                validate: v => v === watchAdd('password') || 'Passwords do not match'
              })} />
              {addErrors.confirm_password && <p className="text-xs text-red-500 mt-1">{addErrors.confirm_password.message}</p>}
            </div>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" {...regAdd('status')} defaultValue="Available">
              <option value="Available">Available</option>
              <option value="Busy">Busy</option>
              <option value="Not Available">Not Available</option>
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-2 border-t border-slate-100 mt-4">
            <button type="button" onClick={() => setAddModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={addSaving} className="btn-primary">{addSaving ? 'Registering...' : 'Register Technician'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

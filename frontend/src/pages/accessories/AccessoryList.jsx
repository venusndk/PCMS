// pages/accessories/AccessoryList.jsx
import { useState, useEffect, useCallback } from 'react';
import { accessoryService } from '../../api/accessoryService';
import { technicianService } from '../../api/technicianService';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import { useForm } from 'react-hook-form';
import { Plus, Pencil, Trash2, Filter, Mouse, RefreshCw } from 'lucide-react';

const statusBadge = (s) => {
  const map = { Working: 'badge-green', 'Not Working': 'badge-red', Damaged: 'badge-amber', Old: 'badge-slate' };
  return <span className={`badge ${map[s] || 'badge-slate'}`}>{s}</span>;
};

const TYPES    = ['Mouse','Keyboard','Monitor','Projector','Printer','Scanner','UPS','Other'];
const STATUSES = ['Working', 'Not Working', 'Damaged', 'Old'];

export default function AccessoryList() {
  const { isAdmin } = useAuth();
  const [items,   setItems]   = useState([]);
  const [techs,   setTechs]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(null);
  const [selected,setSelected]= useState(null);
  const [filter,  setFilter]  = useState({ name: '', status: '' });
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const load = useCallback(() => {
    setLoading(true);
    accessoryService.list(filter).then(r => setItems(r.data.results || r.data)).finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { technicianService.list().then(r => setTechs(r.data)); }, []);

  const openAdd    = () => { reset({}); setModal('add'); setError(''); };
  const openEdit   = (a) => { setSelected(a); reset(a); setModal('edit'); setError(''); };
  const openDelete = (a) => { setSelected(a); setModal('delete'); };
  const close      = () => { setModal(null); setSelected(null); };

  const onSubmit = async (data) => {
    setSaving(true); setError('');
    try {
      if (modal === 'add') await accessoryService.create(data);
      else await accessoryService.update(selected.id, data);
      load(); close();
    } catch (e) { setError(e.response?.data?.detail || 'Failed to save.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try { await accessoryService.delete(selected.id); load(); close(); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Accessories</h2>
          <p className="page-subtitle">{items.length} items registered</p>
        </div>
        <button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Add Accessory</button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <Filter className="w-4 h-4 text-slate-400" />
        <select className="input w-36 py-1.5 text-xs" value={filter.name}
          onChange={e => setFilter(f => ({ ...f, name: e.target.value }))}>
          <option value="">All Types</option>
          {TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
        <select className="input w-36 py-1.5 text-xs" value={filter.status}
          onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}>
          <option value="">All Status</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <button onClick={load} className="btn-ghost btn-sm ml-auto"><RefreshCw className="w-3 h-3" /> Refresh</button>
      </div>

      {/* Table */}
      <div className="table-container">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-7 h-7 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Mouse className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">No accessories found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="table-head">
                <tr>
                  <th className="table-th">ID</th>
                  <th className="table-th">Type</th>
                  <th className="table-th">Brand</th>
                  <th className="table-th">Location</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Technician</th>
                  {isAdmin && <th className="table-th">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {items.map(a => (
                  <tr key={a.id} className="table-row">
                    <td className="table-td font-mono text-xs text-slate-400">#{a.id}</td>
                    <td className="table-td font-semibold">{a.name}</td>
                    <td className="table-td">{a.brand}</td>
                    <td className="table-td text-xs text-slate-500">{a.location}</td>
                    <td className="table-td">{statusBadge(a.status)}</td>
                    <td className="table-td text-xs text-slate-500">
                      {a.technician_assigned ? `${a.technician_assigned.first_name} ${a.technician_assigned.last_name}` : <span className="text-slate-300">Unassigned</span>}
                    </td>
                    {isAdmin && (
                      <td className="table-td">
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(a)} className="btn-ghost btn-sm p-1.5 text-blue-500 hover:bg-blue-50"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => openDelete(a)} className="btn-ghost btn-sm p-1.5 text-red-500 hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal open={modal === 'add' || modal === 'edit'} onClose={close}
        title={modal === 'add' ? 'Add Accessory' : 'Edit Accessory'}>
        {error && <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg p-3 mb-4">{error}</p>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Type *</label>
            <select className="input" {...register('name', { required: true })}>
              {TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Brand *</label>
            <input className={`input ${errors.brand ? 'input-error' : ''}`} placeholder="Logitech, HP..." {...register('brand', { required: 'Brand required' })} />
            {errors.brand && <p className="error-msg">{errors.brand.message}</p>}
          </div>
          <div>
            <label className="label">Location *</label>
            <input className="input" placeholder="Lab 3, Office A..." {...register('location', { required: true })} />
          </div>
          <div>
            <label className="label">Status *</label>
            <select className="input" {...register('status', { required: true })}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Assign Technician</label>
            <select className="input" {...register('technician_assigned')}>
              <option value="">None</option>
              {techs.map(t => <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>)}
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
            <button type="button" onClick={close} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal open={modal === 'delete'} onClose={close} title="Delete Accessory" size="sm">
        <p className="text-sm text-slate-600 mb-6">Delete <strong>{selected?.brand} {selected?.name}</strong>? This cannot be undone.</p>
        <div className="flex gap-3 justify-end">
          <button onClick={close} className="btn-secondary">Cancel</button>
          <button onClick={handleDelete} disabled={saving} className="btn-danger">{saving ? 'Deleting...' : 'Delete'}</button>
        </div>
      </Modal>
    </div>
  );
}

// pages/pcs/PCList.jsx
import { useState, useEffect, useCallback } from 'react';
import { pcService } from '../../api/pcService';
import { technicianService } from '../../api/technicianService';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import FormInput from '../../components/FormInput';
import { useForm } from 'react-hook-form';
import { Plus, Pencil, Trash2, Filter, Monitor, RefreshCw } from 'lucide-react';

const statusBadge = (s) => {
  const map = { Working: 'badge-green', 'Not Working': 'badge-red', Damaged: 'badge-amber', Old: 'badge-slate' };
  return <span className={`badge ${map[s] || 'badge-slate'}`}>{s}</span>;
};

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
  useEffect(() => { technicianService.list().then(r => setTechs(r.data)); }, []);

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
        <select className="input w-36 py-1.5 text-xs" value={filters.location}
          onChange={e => setFilters(f => ({ ...f, location: e.target.value }))}>
          <option value="">All Locations</option>
          {LOCATIONS.map(l => <option key={l}>{l}</option>)}
        </select>
        <select className="input w-36 py-1.5 text-xs" value={filters.status}
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
                {pcs.map(pc => (
                  <tr key={pc.id} className="table-row">
                    <td className="table-td font-mono text-xs text-slate-400">#{pc.id}</td>
                    <td className="table-td font-semibold text-slate-800">{pc.brand}</td>
                    <td className="table-td">{pc.ram}</td>
                    <td className="table-td">{pc.hdd}</td>
                    <td className="table-td text-xs">{pc.operating_system}</td>
                    <td className="table-td"><span className="badge badge-blue">{pc.location}</span></td>
                    <td className="table-td">{statusBadge(pc.status)}</td>
                    <td className="table-td text-xs text-slate-500">
                      {pc.technician_assigned ? pc.technician_assigned.full_name || `${pc.technician_assigned.first_name} ${pc.technician_assigned.last_name}` : <span className="text-slate-300">Unassigned</span>}
                    </td>
                    <td className="table-td text-slate-500">{pc.registration_year}</td>
                    {isAdmin && (
                      <td className="table-td">
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(pc)} className="btn-ghost btn-sm p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => openDelete(pc)} className="btn-ghost btn-sm p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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
            <select className="input" {...register('location', { required: true })}>
              {LOCATIONS.map(l => <option key={l}>{l}</option>)}
            </select>
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
          <div className="col-span-2 flex gap-3 justify-end pt-2 border-t border-slate-100">
            <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
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

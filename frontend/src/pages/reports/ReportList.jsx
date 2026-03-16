// pages/reports/ReportList.jsx
import { useState, useEffect, useCallback } from 'react';
import { reportService } from '../../api/reportService';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import { useForm } from 'react-hook-form';
import { Plus, FileText, Trash2, Eye, RefreshCw } from 'lucide-react';

// StatusBadge component is imported below
const DEVICE_TYPES = ['PC', 'Accessory', 'NetworkDevice'];
const STATUSES = ['Working', 'Not Working', 'Damaged', 'Old', 'Repaired', 'Replaced'];

export default function ReportList() {
  const { isAdmin } = useAuth();
  const [items,    setItems]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(null);
  const [selected, setSelected] = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const load = useCallback(() => {
    setLoading(true);
    reportService.list().then(r => setItems(r.data.results || r.data)).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd    = () => { reset({}); setModal('add'); setError(''); };
  const openView   = (r) => { setSelected(r); setModal('view'); };
  const openDelete = (r) => { setSelected(r); setModal('delete'); };
  const close      = () => { setModal(null); setSelected(null); };

  const onSubmit = async (data) => {
    setSaving(true); setError('');
    try {
      await reportService.create({ ...data, device_id: parseInt(data.device_id) });
      load(); close();
    } catch (e) { setError(e.response?.data?.detail || 'Failed to create report.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try { await reportService.delete(selected.id); load(); close(); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Maintenance Reports</h2>
          <p className="page-subtitle">{items.length} reports found</p>
        </div>
        <button onClick={openAdd} className="btn-primary-premium px-6 py-2.5 shadow-lg shadow-primary-500/20"><Plus className="w-4 h-4" /> Create Report</button>
      </div>

      <div className="table-container">
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
                {items.map(r => (
                  <tr key={r.id} className="table-row">
                    <td className="table-td font-mono text-xs text-slate-400">#{r.id}</td>
                    <td className="table-td"><span className="badge badge-blue">{r.device_type}</span></td>
                    <td className="table-td font-mono text-xs">#{r.device_id}</td>
                    <td className="table-td"><StatusBadge status={r.status} /></td>
                    <td className="table-td text-xs text-slate-600">
                      {r.technician ? `${r.technician.first_name} ${r.technician.last_name}` : '—'}
                    </td>
                    <td className="table-td text-xs text-slate-500">{r.location}</td>
                    <td className="table-td text-xs text-slate-500">{r.report_date}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1.5">
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => openView(r)} className="p-2 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all font-bold" title="View details">
                          <Eye className="w-4 h-4" />
                        </motion.button>
                        {isAdmin && (
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => openDelete(r)} className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all font-bold" title="Delete">
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

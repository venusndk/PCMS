// pages/requests/RequestList.jsx
import { useState, useEffect, useCallback } from 'react';
import { requestService } from '../../api/requestService';
import { technicianService } from '../../api/technicianService';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import { useForm } from 'react-hook-form';
import { ClipboardList, Eye, UserPlus, CheckCircle, Trash2, Filter, RefreshCw } from 'lucide-react';

const statusBadge = (s) => {
  const map = {
    'Pending': 'badge-amber',
    'Technician Assigned': 'badge-blue',
    'Fixed': 'badge-green',
    'Not Fixed': 'badge-red',
  };
  return <span className={`badge ${map[s] || 'badge-slate'}`}>{s}</span>;
};

const STATUSES = ['Pending', 'Technician Assigned', 'Fixed', 'Not Fixed'];

export default function RequestList() {
  const { isAdmin, isTechnician } = useAuth();
  const [items,    setItems]    = useState([]);
  const [techs,    setTechs]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(null);
  const [selected, setSelected] = useState(null);
  const [filter,   setFilter]   = useState({ status: '' });
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');
  const { register, handleSubmit, reset } = useForm();

  const load = useCallback(() => {
    setLoading(true);
    requestService.list(filter).then(r => setItems(r.data.results || r.data)).finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (isAdmin) technicianService.list().then(r => setTechs(r.data)); }, [isAdmin]);

  const openView   = (r) => { setSelected(r); setModal('view'); };
  const openAssign = (r) => { setSelected(r); reset({}); setModal('assign'); setError(''); };
  const openStatus = (r) => { setSelected(r); setModal('status'); setError(''); };
  const openDelete = (r) => { setSelected(r); setModal('delete'); };
  const close      = () => { setModal(null); setSelected(null); };

  const handleAssign = async (data) => {
    setSaving(true); setError('');
    try {
      await requestService.assignTechnician(selected.id, { technician_id: parseInt(data.technician_id) });
      load(); close();
    } catch (e) { setError(e.response?.data?.error || 'Failed to assign.'); }
    finally { setSaving(false); }
  };

  const handleStatus = async (data) => {
    setSaving(true); setError('');
    try {
      await requestService.updateStatus(selected.id, { status: data.status });
      load(); close();
    } catch (e) { setError(e.response?.data?.error || 'Failed to update status.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try { await requestService.delete(selected.id); load(); close(); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">ICT Requests</h2>
          <p className="page-subtitle">{items.length} requests found</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <Filter className="w-4 h-4 text-slate-400" />
        <select className="input w-48 py-1.5 text-xs" value={filter.status}
          onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}>
          <option value="">All Statuses</option>
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
            <ClipboardList className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">No requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="table-head">
                <tr>
                  <th className="table-th">ID</th>
                  <th className="table-th">Requester</th>
                  <th className="table-th">Unit</th>
                  <th className="table-th">Type</th>
                  <th className="table-th">Date</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Technician</th>
                  <th className="table-th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(r => (
                  <tr key={r.id} className="table-row">
                    <td className="table-td font-mono text-xs text-slate-400">#{r.id}</td>
                    <td className="table-td">
                      <div>
                        <p className="font-semibold text-slate-800 text-xs">{r.first_name} {r.last_name}</p>
                        <p className="text-xs text-slate-400">{r.email}</p>
                      </div>
                    </td>
                    <td className="table-td text-xs text-slate-600">{r.unit}</td>
                    <td className="table-td text-xs font-medium">{r.request_type}</td>
                    <td className="table-td text-xs text-slate-500">{r.date}</td>
                    <td className="table-td">{statusBadge(r.status)}</td>
                    <td className="table-td text-xs text-slate-500">
                      {r.assigned_technician ? `${r.assigned_technician.first_name} ${r.assigned_technician.last_name}` : <span className="text-slate-300">Unassigned</span>}
                    </td>
                    <td className="table-td">
                      <div className="flex gap-1">
                        <button onClick={() => openView(r)} className="btn-ghost btn-sm p-1.5 text-slate-500 hover:bg-slate-100" title="View details">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {isAdmin && r.status === 'Pending' && (
                          <button onClick={() => openAssign(r)} className="btn-ghost btn-sm p-1.5 text-blue-500 hover:bg-blue-50" title="Assign technician">
                            <UserPlus className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {(isAdmin || isTechnician) && r.status === 'Technician Assigned' && (
                          <button onClick={() => openStatus(r)} className="btn-ghost btn-sm p-1.5 text-emerald-500 hover:bg-emerald-50" title="Update status">
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {isAdmin && (
                          <button onClick={() => openDelete(r)} className="btn-ghost btn-sm p-1.5 text-red-500 hover:bg-red-50" title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* View Modal */}
      <Modal open={modal === 'view'} onClose={close} title="Request Details" size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                ['Requester', `${selected.first_name} ${selected.last_name}`],
                ['Email', selected.email],
                ['Telephone', selected.telephone],
                ['Unit/Department', selected.unit],
                ['Request Type', selected.request_type],
                ['Date', selected.date],
                ['Status', ''],
              ].map(([label, val]) => (
                <div key={label} className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">{label}</p>
                  {label === 'Status' ? statusBadge(selected.status) : <p className="text-sm text-slate-800">{val || '—'}</p>}
                </div>
              ))}
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Description</p>
              <p className="text-sm text-slate-700">{selected.description}</p>
            </div>
            {selected.assigned_technician && (
              <div className="bg-primary-50 border border-primary-100 rounded-lg p-3">
                <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide mb-1">Assigned Technician</p>
                <p className="text-sm font-medium text-slate-800">{selected.assigned_technician.first_name} {selected.assigned_technician.last_name}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Assign Technician Modal */}
      <Modal open={modal === 'assign'} onClose={close} title="Assign Technician" size="sm">
        {error && <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg p-3 mb-4">{error}</p>}
        <form onSubmit={handleSubmit(handleAssign)} className="space-y-4">
          <div>
            <label className="label">Select Technician *</label>
            <select className="input" {...register('technician_id', { required: true })}>
              <option value="">Choose technician...</option>
              {techs.filter(t => t.status === 'Available').map(t => (
                <option key={t.id} value={t.id}>{t.first_name} {t.last_name} ({t.status})</option>
              ))}
              {techs.filter(t => t.status !== 'Available').length > 0 && (
                <optgroup label="Other technicians">
                  {techs.filter(t => t.status !== 'Available').map(t => (
                    <option key={t.id} value={t.id}>{t.first_name} {t.last_name} ({t.status})</option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
            <button type="button" onClick={close} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Assigning...' : 'Assign'}</button>
          </div>
        </form>
      </Modal>

      {/* Update Status Modal */}
      <Modal open={modal === 'status'} onClose={close} title="Update Request Status" size="sm">
        {error && <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg p-3 mb-4">{error}</p>}
        <form onSubmit={handleSubmit(handleStatus)} className="space-y-4">
          <div>
            <label className="label">New Status *</label>
            <select className="input" {...register('status', { required: true })}>
              <option value="Fixed">✅ Fixed</option>
              <option value="Not Fixed">❌ Not Fixed</option>
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
            <button type="button" onClick={close} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Updating...' : 'Update Status'}</button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal open={modal === 'delete'} onClose={close} title="Delete Request" size="sm">
        <p className="text-sm text-slate-600 mb-6">Delete request <strong>#{selected?.id}</strong> from <strong>{selected?.first_name} {selected?.last_name}</strong>?</p>
        <div className="flex gap-3 justify-end">
          <button onClick={close} className="btn-secondary">Cancel</button>
          <button onClick={handleDelete} disabled={saving} className="btn-danger">{saving ? 'Deleting...' : 'Delete'}</button>
        </div>
      </Modal>
    </div>
  );
}

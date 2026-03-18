// pages/requests/RequestList.jsx
import { useState, useEffect, useCallback } from 'react';
import { requestService } from '../../api/requestService';
import { technicianService } from '../../api/technicianService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import { useForm } from 'react-hook-form';
import { ClipboardList, Eye, UserPlus, CheckCircle, Trash2, Filter, RefreshCw, Clock } from 'lucide-react';

import StatusBadge from '../../components/dashboard/StatusBadge';
import { motion, AnimatePresence } from 'framer-motion';

const isOld = (dateStr) => {
  if (!dateStr) return false;
  try {
    const d = new Date(dateStr);
    const now = new Date();
    return (now - d) > (2 * 24 * 60 * 60 * 1000);
  } catch (e) { return false; }
};

const STATUSES = ['Pending', 'Technician Assigned', 'Fixed', 'Not Fixed'];

const statusBadge = (s) => <StatusBadge status={s} />;

export default function RequestList() {
  // FIX #12: Use isAdmin and isTechnician directly from AuthContext — single source of truth.
  // Previously these were recomputed locally from user.role, duplicating and potentially
  // diverging from the definition in AuthContext.
  const { isAdmin, isTechnician } = useAuth();
  const [items,    setItems]    = useState([]);
  const [techs,    setTechs]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(null);
  const [selected, setSelected] = useState(null);
  const [filter,   setFilter]   = useState({ status: '' });
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');
  const { showToast } = useToast();
  
  // SOLVED: Isolate forms to prevent cross-validation conflicts (e.g., status required in assign modal)
  const assignForm = useForm();
  const statusForm = useForm();

  const watchedTechId = assignForm.watch('technician_id');

  const load = useCallback(() => {
    setLoading(true);
    const params = { ...filter, _t: Date.now() };
    requestService.list(params)
      .then(r => {
        const data = r.data.results || r.data;
        console.log('[LOAD] Requests loaded:', data.length, 'items');
        setItems(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error('[LOAD] Failed to load requests:', err.message);
        showToast('Failed to load requests. Please check your connection.', 'error');
      })
      .finally(() => setLoading(false));
    
    if (isAdmin) {
      technicianService.list()
        .then(r => {
          const data = r.data.results || r.data;
          console.log('[LOAD] Technicians loaded:', data.length, 'items');
          setTechs(Array.isArray(data) ? data : []);
        })
        .catch((err) => {
          console.error('[LOAD] Failed to load technicians:', err.message);
          // Non-critical: techs list failing shouldn't block the main list
        });
    }
  }, [filter, isAdmin, showToast]);

  // Silent background sync — refreshes data WITHOUT showing spinner or resetting the table.
  // Used after assignment so an item doesn't disappear due to an active status filter.
  const silentRefresh = useCallback(() => {
    const params = { ...filter, _t: Date.now() };
    requestService.list(params)
      .then(r => {
        const data = r.data.results || r.data;
        console.log('[SILENT_REFRESH] Requests refreshed:', data.length, 'items');
        setItems(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error('[SILENT_REFRESH] Failed to refresh requests:', err.message);
        // Silent failures don't show toast (background sync)
      });
    
    if (isAdmin) {
      technicianService.list()
        .then(r => {
          const data = r.data.results || r.data;
          console.log('[SILENT_REFRESH] Technicians refreshed:', data.length, 'items');
          setTechs(Array.isArray(data) ? data : []);
        })
        .catch((err) => {
          console.error('[SILENT_REFRESH] Failed to refresh technicians:', err.message);
          // Silent failures don't show toast
        });
    }
  }, [filter, isAdmin]);

  useEffect(() => { load(); }, [load]);

  const openView   = (r) => { setSelected(r); setModal('view'); };
  const openAssign = (r) => { setSelected(r); assignForm.reset({ technician_id: '' }); setModal('assign'); setError(''); };
  const openStatus = (r) => { setSelected(r); statusForm.reset({ status: 'Fixed' }); setModal('status'); setError(''); };
  const openDelete = (r) => { setSelected(r); setModal('delete'); };
  const close      = () => { setModal(null); setSelected(null); };

  const handleAssign = async (data) => {
    setSaving(true); setError('');
    try {
      if (!selected || !selected.id) {
        console.error('[ASSIGN] No request selected for assignment');
        throw new Error("No request selected. Please close and try again.");
      }

      const techId = parseInt(data.technician_id, 10);
      if (isNaN(techId)) throw new Error("Please select a technician.");

      console.log(`[ASSIGN] Starting assignment: Request #${selected.id} -> Tech #${techId}`);
      console.log('[ASSIGN] Payload:', { technician_id: techId });

      const res = await requestService.assignTechnician(selected.id, {
        technician_id: techId
      });

      console.log('[ASSIGN] API Success:', res?.data);

      // CRITICAL: Validate response structure
      if (!res?.data) {
        throw new Error('Invalid response from server - no data returned');
      }

      // OPTIMISTIC UPDATE: Immediately reflect the assignment in the UI.
      const serverRequest = res.data.request;
      const updatedTech = techs.find(t => t.id === techId);
      const assignedStatus = (serverRequest?.status || 'Technician Assigned');

      // DEBUG: Log state update
      console.log(`[ASSIGN] Updating UI: status=${assignedStatus}, tech=${updatedTech?.first_name}`);

      setItems(prev => prev.map(item => {
        if (item.id === selected.id) {
          return serverRequest && serverRequest.id
            ? { ...serverRequest }
            : { ...item, status: assignedStatus, assigned_technician: updatedTech || item.assigned_technician };
        }
        return item;
      }));

      // Mark the technician as Busy in local techs state
      setTechs(prev => prev.map(t =>
        t.id === techId ? { ...t, status: 'Busy' } : t
      ));

      // Show success toast with technician name
      const techName = updatedTech?.first_name || 'Technician';
      const successMsg = res.data.message || `Technician ${techName} assigned successfully!`;
      showToast(successMsg, 'success');
      
      // DEBUG: Log success
      console.log('[ASSIGN] Success - closing modal and refreshing');
      close();

      // If the current filter would exclude the updated status, clear it and reload.
      if (filter.status && filter.status.toLowerCase() !== String(assignedStatus).toLowerCase()) {
        console.log('[ASSIGN] Filter mismatch - clearing filter to show assigned request');
        setFilter(f => ({ ...f, status: '' }));
      } else {
        console.log('[ASSIGN] Filter matches or empty - silent refresh');
        silentRefresh();
      }
      window.dispatchEvent(new Event('pcm:requests-changed'));
    } catch (e) {
      // DEBUG: Log the error
      console.error('[ASSIGN] Error:', e);
      console.error('[ASSIGN] Response Data:', e.response?.data);
      
      const msg = e.response?.data?.error 
        || e.response?.data?.detail 
        || e.response?.data?.msg
        || e.message 
        || 'Failed to assign technician. Please try again.';
      
      setError(msg);
      showToast(msg, 'error');
    }
    finally {
      setSaving(false);
    }
  };

  const handleStatus = async (data) => {
    setSaving(true); setError('');
    try {
      await requestService.updateStatus(selected.id, { status: data.status });
      showToast('Status updated successfully!', 'success');
      load(); close();
      window.dispatchEvent(new Event('pcm:requests-changed'));
    } catch (e) {
      const msg = e.response?.data?.error || e.response?.data?.detail || 'Failed to update status.';
      setError(msg);
      showToast(msg, 'error');
    }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await requestService.delete(selected.id);
      showToast('Request deleted successfully.', 'success');
      load(); close();
      window.dispatchEvent(new Event('pcm:requests-changed'));
    } catch (e) {
      showToast('Failed to delete request.', 'error');
    } finally { setSaving(false); }
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
        <select className="input-premium w-48 py-1.5 text-xs h-9" value={filter.status}
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
              {/*
                FIX #17: AnimatePresence with initial={false} prevents all rows from
                re-animating on every data refresh. Rows only animate in when first added.
              */}
              <AnimatePresence initial={false}>
                <tbody>
                  {items.map((r) => (
                    <motion.tr
                      key={r.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      layout
                      className={`table-row group ${isOld(r.date) && r.status?.toLowerCase() === 'pending' ? 'bg-rose-50/20 dark:bg-rose-900/5' : ''}`}
                    >
                      <td className="px-6 py-4 font-mono text-[10px] font-bold text-slate-400">#{r.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <p className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2">
                            {r.first_name} {r.last_name}
                            {isOld(r.date) && r.status?.toLowerCase() === 'pending' && (
                              <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" title="Old Request" />
                            )}
                          </p>
                          <p className="text-[11px] font-medium text-slate-400 group-hover:text-primary-500 transition-colors uppercase tracking-tight">{r.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-tight">{r.unit}</td>
                      <td className="px-6 py-4">
                        <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-widest px-2 py-1 bg-slate-100 dark:bg-surface-800 rounded-md ring-1 ring-slate-200 dark:ring-surface-700">
                          {r.request_type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                          <Clock size={12} className={isOld(r.date) ? 'text-rose-500' : ''} />
                          {r.date ? new Date(r.date).toLocaleDateString() : '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-6 py-4">
                        {r.assigned_technician ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-[10px] font-bold text-primary-600 uppercase">
                              {r.assigned_technician.first_name?.[0] || 'T'}
                            </div>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                              {r.assigned_technician.first_name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1.5">
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => openView(r)} className="p-2 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all font-bold" title="View details">
                            <Eye className="w-4 h-4" />
                          </motion.button>
                          {isAdmin && r.status?.toLowerCase() === 'pending' && (
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => openAssign(r)} className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all font-bold" title="Assign technician">
                              <UserPlus className="w-4 h-4" />
                            </motion.button>
                          )}
                          {(isAdmin || isTechnician) && r.status?.toLowerCase() === 'technician assigned' && (
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => openStatus(r)} className="p-2 rounded-lg text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all font-bold" title="Update status">
                              <CheckCircle className="w-4 h-4" />
                            </motion.button>
                          )}
                          {isAdmin && (
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => openDelete(r)} className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all font-bold" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </AnimatePresence>
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
                ['Date', selected.date ? new Date(selected.date).toLocaleString() : '—'],
                ['Status', ''],
              ].map(([label, val]) => (
                <div key={label} className="bg-slate-50 dark:bg-surface-800/50 rounded-xl p-4 border border-slate-100 dark:border-surface-800/50">
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-1.5">{label}</p>
                  {label === 'Status' ? statusBadge(selected.status) : <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{val || '—'}</p>}
                </div>
              ))}
            </div>
            <div className="bg-slate-50 dark:bg-surface-800/50 rounded-xl p-4 border border-slate-100 dark:border-surface-800/50">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-2">Description</p>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{selected.description}</p>
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
        <form onSubmit={assignForm.handleSubmit(handleAssign, (e) => console.error('[ASSIGN] Form Validation Failed:', e))} className="space-y-4">
          <div>
            <label className="label">Select Technician *</label>
            <select
              className={`input-premium ${assignForm.formState.errors.technician_id ? 'border-red-500 ring-1 ring-red-500 bg-red-50' : ''}`}
              {...assignForm.register('technician_id', { required: 'Please select a technician.' })}
              disabled={saving}
            >
              <option value="">
                {Array.isArray(techs) && techs.length > 0 ? 'Choose technician...' : 'Loading technicians...'}
              </option>
              {Array.isArray(techs) && techs.filter(t => t.status?.toLowerCase() === 'available').map(t => (
                <option key={t.id} value={t.id}>
                  {t.first_name} {t.last_name} — Available ✓
                </option>
              ))}
              {Array.isArray(techs) && techs.filter(t => t.status?.toLowerCase() !== 'available').map(t => (
                <option key={t.id} value={t.id} disabled className="text-slate-400">
                  {t.first_name} {t.last_name} — {t.status} (Unavailable)
                </option>
              ))}
            </select>
            {assignForm.formState.errors.technician_id && (
              <p className="text-xs font-bold text-red-500 mt-1.5">{assignForm.formState.errors.technician_id.message}</p>
            )}
            {!assignForm.formState.errors.technician_id && Array.isArray(techs) && techs.filter(t => t.status?.toLowerCase() === 'available').length === 0 && (
              <p className="text-xs text-amber-500 mt-1.5">⚠️ No available technicians at this time</p>
            )}
          </div>
          <div className="flex gap-3 justify-end pt-6 border-t border-slate-100 dark:border-surface-800">
            <button type="button" onClick={() => { console.log('[CLICK] Cancel'); close(); }} disabled={saving} className="btn-secondary">Cancel</button>
            <button 
              type="button" 
              onClick={(e) => {
                assignForm.handleSubmit(
                  (data) => {
                    handleAssign(data);
                  },
                  (err) => {
                    console.error('[FORM] Validation Errors:', err);
                    setError('Please select a technician.');
                  }
                )(e);
              }}
              disabled={saving}
              className="btn-primary-premium flex items-center gap-2"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Assigning...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Assign Technician</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Update Status Modal */}
      <Modal open={modal === 'status'} onClose={close} title="Update Request Status" size="sm">
        {error && <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg p-3 mb-4">{error}</p>}
        <form onSubmit={statusForm.handleSubmit(handleStatus)} className="space-y-4">
          <div>
            <label className="label">New Status *</label>
            <select className="input-premium" {...statusForm.register('status', { required: true })}>
              <option value="Fixed">✅ Fixed</option>
              <option value="Not Fixed">❌ Not Fixed</option>
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-6 border-t border-slate-100 dark:border-surface-800">
            <button type="button" onClick={close} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary-premium">{saving ? 'Updating...' : 'Update Status'}</button>
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

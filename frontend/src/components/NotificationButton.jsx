import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, ClipboardList, RefreshCw } from 'lucide-react';
import { requestService } from '../api/requestService';

const DEFAULT_STATUSES = ['pending'];

function formatDateShort(dateStr) {
  if (!dateStr) return '—';
  // Backend sends DateField (YYYY-MM-DD) - keep it lightweight.
  return String(dateStr);
}

export default function NotificationButton({
  statuses = DEFAULT_STATUSES,
  pollIntervalMs = 15000,
  recentLimit = 6,
  hideBadgeWhenZero = true,
  resetCountOnOpen = false,
}) {
  const navigate = useNavigate();
  const rootRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locallyReset, setLocallyReset] = useState(false);

  const statusParams = useMemo(() => {
    // DRF supports repeated params; axios will serialize arrays as status[]=... by default,
    // so we pass a comma-separated string for compatibility.
    const normalized = (Array.isArray(statuses) ? statuses : [statuses])
      .filter(Boolean)
      .map(s => String(s).trim())
      .filter(Boolean);
    return normalized.length ? normalized.join(',') : undefined;
  }, [statuses]);

  const statusLabel = useMemo(() => {
    const normalized = (Array.isArray(statuses) ? statuses : [statuses])
      .filter(Boolean)
      .map(s => String(s).trim().toLowerCase())
      .filter(Boolean);
    return normalized.length ? normalized.join('/') : 'all';
  }, [statuses]);

  const fetchNotifications = useCallback(async () => {
    if (document.visibilityState === 'hidden') return;
    setLoading(true);
    setError('');
    try {
      const params = {
        status: statusParams,
        limit: recentLimit,
        _t: Date.now(), // bust caches
      };
      const res = await requestService.notifications(params);
      const nextCount = Number(res?.data?.count || 0);
      const nextRecent = Array.isArray(res?.data?.recent) ? res.data.recent : [];
      setCount(Number.isFinite(nextCount) ? nextCount : 0);
      setRecent(nextRecent);
      setLocallyReset(false);
    } catch (e) {
      setError(e?.response?.data?.detail || e?.message || 'Failed to load notifications.');
      // Fail safe: do not spam UI with badge when API errors out
      setCount(0);
      setRecent([]);
    } finally {
      setLoading(false);
    }
  }, [recentLimit, statusParams]);

  useEffect(() => {
    let intervalId;

    fetchNotifications();
    intervalId = window.setInterval(fetchNotifications, pollIntervalMs);

    const onVisibility = () => {
      if (document.visibilityState === 'visible') fetchNotifications();
    };
    document.addEventListener('visibilitychange', onVisibility);

    const onRequestsChanged = () => fetchNotifications();
    window.addEventListener('pcm:requests-changed', onRequestsChanged);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pcm:requests-changed', onRequestsChanged);
    };
  }, [fetchNotifications, pollIntervalMs]);

  useEffect(() => {
    const onDown = (e) => {
      if (!open) return;
      if (!rootRef.current) return;
      if (rootRef.current.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const badgeCount = locallyReset ? 0 : count;
  const showBadge = !hideBadgeWhenZero ? true : badgeCount > 0;

  const handleToggle = () => {
    setOpen(o => {
      const next = !o;
      if (next && resetCountOnOpen) setLocallyReset(true);
      return next;
    });
  };

  const handleGoToRequests = () => {
    setOpen(false);
    navigate('/requests');
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={handleToggle}
        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors relative"
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell className="w-[18px] h-[18px]" />

        <AnimatePresence>
          {showBadge && (
            <motion.span
              key={badgeCount}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 600, damping: 30 }}
              className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1.5 bg-rose-500 text-white rounded-full text-[10px] font-black flex items-center justify-center ring-2 ring-white dark:ring-surface-950"
            >
              {badgeCount > 99 ? '99+' : badgeCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-[22rem] max-w-[90vw] z-50"
          >
            <div className="bg-white dark:bg-surface-950 border border-slate-200 dark:border-surface-800 shadow-xl rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-surface-800 flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Requests</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    {loading ? 'Updating…' : `${count} ${statusLabel}`}
                  </p>
                </div>
                <button
                  onClick={fetchNotifications}
                  className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-surface-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                  title="Refresh"
                  aria-label="Refresh notifications"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {error && (
                <div className="px-4 py-3 text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-900/10 border-b border-rose-100 dark:border-rose-900/20">
                  {error}
                </div>
              )}

              <div className="max-h-80 overflow-y-auto">
                {recent.length === 0 ? (
                  <div className="px-4 py-10 text-center text-slate-400">
                    <p className="text-sm font-bold">No recent requests</p>
                    <p className="text-xs font-medium mt-1">You’re all caught up.</p>
                  </div>
                ) : (
                  <div className="py-2">
                    {recent.map((r) => (
                      <button
                        key={r.id}
                        onClick={handleGoToRequests}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-surface-800/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center shrink-0">
                            <ClipboardList className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100 truncate">
                                {r.request_type || 'Request'}
                              </p>
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">
                                {formatDateShort(r.date)}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-300 truncate">
                              {r.first_name} {r.last_name}
                              {r.unit ? ` • ${r.unit}` : ''}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="px-4 py-3 border-t border-slate-100 dark:border-surface-800 flex items-center gap-2">
                <button
                  onClick={() => setOpen(false)}
                  className="flex-1 py-2 rounded-xl text-xs font-black text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-surface-800 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={handleGoToRequests}
                  className="flex-1 py-2 rounded-xl text-xs font-black bg-primary-600 hover:bg-primary-700 text-white transition-colors"
                >
                  View all
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


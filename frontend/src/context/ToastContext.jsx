import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // FIX #10: Declare removeToast first so showToast can safely reference it
  // and add it to the dependency array without a stale closure issue.
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    // Auto remove after 4 seconds — removeToast is now a stable reference
    setTimeout(() => removeToast(id), 4000);
  }, [removeToast]); // FIX #10: removeToast is now correctly in the dependency array

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="pointer-events-auto"
            >
              <ToastItem
                toast={toast}
                onClose={() => removeToast(toast.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ toast, onClose }) => {
  const icons = {
    success: <CheckCircle className="text-emerald-500" size={18} />,
    error: <AlertCircle className="text-rose-500" size={18} />,
    info: <Info className="text-primary-500" size={18} />,
  };

  const bgColors = {
    success: 'bg-emerald-50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-800/50',
    error: 'bg-rose-50 border-rose-100 dark:bg-rose-900/10 dark:border-rose-800/50',
    info: 'bg-primary-50 border-primary-100 dark:bg-primary-900/10 dark:border-primary-800/50',
  };

  return (
    <div className={`px-4 py-3 rounded-[1.25rem] border shadow-2xl backdrop-blur-md flex items-center gap-3 min-w-[280px] max-w-[400px] group ${bgColors[toast.type]}`}>
      <div className="shrink-0">{icons[toast.type]}</div>
      {/* FIX #18: Use line-clamp-2 instead of truncate so longer messages are readable */}
      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 flex-1 line-clamp-2">
        {toast.message}
      </p>
      <button
        onClick={onClose}
        className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  );
};

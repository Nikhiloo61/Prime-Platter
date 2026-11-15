import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type = 'info', message, duration = 4000 }) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, message }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback((msg, dur) => addToast({ type: 'success', message: msg, duration: dur }), [addToast]);
  const error = useCallback((msg, dur) => addToast({ type: 'error', message: msg, duration: dur }), [addToast]);
  const info = useCallback((msg, dur) => addToast({ type: 'info', message: msg, duration: dur }), [addToast]);
  const warning = useCallback((msg, dur) => addToast({ type: 'warning', message: msg, duration: dur }), [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, success, error, info, warning }}>
      {children}
      {/* Toast viewport */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4">
        {toasts.map((toast) => {
          let bgColor = 'bg-slate-900 text-white';
          let Icon = Info;
          if (toast.type === 'success') {
            bgColor = 'bg-emerald-600 text-white';
            Icon = CheckCircle;
          } else if (toast.type === 'error') {
            bgColor = 'bg-rose-600 text-white';
            Icon = AlertCircle;
          } else if (toast.type === 'warning') {
            bgColor = 'bg-amber-500 text-white';
            Icon = AlertTriangle;
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-xl transition-all duration-300 transform translate-y-0 ${bgColor}`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="opacity-75 hover:opacity-100 transition-opacity p-1"
                aria-label="Dismiss toast"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

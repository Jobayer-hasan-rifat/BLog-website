import React, { createContext, useCallback, useMemo, useState } from 'react';
import '../styles/Toast.css';

export const ToastContext = createContext({ addToast: () => {} });

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);

  const value = useMemo(() => ({ addToast }), [addToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {typeof window !== 'undefined' && (window.__addToast = addToast) && null}
      <div className="toast__container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.type}`}>{t.message}</div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};



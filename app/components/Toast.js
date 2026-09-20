'use client';
import { createContext, useCallback, useContext, useState } from 'react';

const ToastCtx = createContext({ show: () => {} });

export function useToast() {
  return useContext(ToastCtx);
}

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);

  const show = useCallback((message, type = 'success', timeout = 2400) => {
    const id = Math.random().toString(36).slice(2);
    setItems((s) => [...s, { id, message, type }]);
    setTimeout(() => {
      setItems((s) => s.filter((t) => t.id !== id));
    }, timeout);
  }, []);

  return (
    <ToastCtx.Provider value={{ show }}>
      {children}
      <div className="toast-container">
        {items.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

import { createContext, useCallback, useContext, useState } from 'react';
const Ctx = createContext(() => {});
export const useToast = () => useContext(Ctx);
export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const push = useCallback((message, type = 'info') => {
    const id = Math.random();
    setItems((t) => [...t, { id, message, type }]);
    setTimeout(() => setItems((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);
  return <Ctx.Provider value={push}>{children}<div className="toasts" role="status" aria-live="polite">{items.map((t) => <div key={t.id} className={`toast toast--${t.type}`}>{t.message}</div>)}</div></Ctx.Provider>;
}

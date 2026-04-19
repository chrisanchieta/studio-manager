import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'

type ToastType = 'success' | 'error' | 'info'
interface Toast { id: string; message: string; type: ToastType }
interface ToastCtx { success: (msg: string) => void; error: (msg: string) => void; info: (msg: string) => void }

const ToastContext = createContext<ToastCtx | null>(null)
export const useToast = () => { const c = useContext(ToastContext); if (!c) throw new Error(''); return c }

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    const t = setTimeout(() => { setVisible(false); setTimeout(() => onRemove(toast.id), 300) }, 3500)
    return () => clearTimeout(t)
  }, [toast.id, onRemove])
  return (
    <div className={`toast ${toast.type} ${visible ? 'show' : ''}`}>
      {toast.message}
    </div>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const add = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(p => [...p, { id, message, type }])
  }, [])
  const remove = useCallback((id: string) => setToasts(p => p.filter(t => t.id !== id)), [])
  return (
    <ToastContext.Provider value={{ success: m => add(m, 'success'), error: m => add(m, 'error'), info: m => add(m, 'info') }}>
      {children}
      <div className="toast-container">
        {toasts.map(t => <ToastItem key={t.id} toast={t} onRemove={remove} />)}
      </div>
    </ToastContext.Provider>
  )
}

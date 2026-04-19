import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

/* ─── Types ─── */
interface ConfirmOptions {
  title: string
  message: string
  confirmLabel?: string
  danger?: boolean
}

interface ConfirmContextValue {
  confirm: (opts: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null)

export function useConfirm(): ConfirmContextValue {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm must be used inside <ConfirmProvider>')
  return ctx
}

/* ─── Provider ─── */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{
    open: boolean
    opts: ConfirmOptions
    resolve: (v: boolean) => void
  } | null>(null)

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ open: true, opts, resolve })
    })
  }, [])

  const handleResponse = (value: boolean) => {
    state?.resolve(value)
    setState(null)
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {state?.open && (
        <div className="modal-overlay" onClick={() => handleResponse(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{state.opts.title}</h3>
            </div>
            <p className="modal-message">{state.opts.message}</p>
            <div className="modal-actions">
              <button
                className="btn btn-ghost"
                onClick={() => handleResponse(false)}
              >
                Cancelar
              </button>
              <button
                className={`btn ${state.opts.danger ? 'btn-danger-solid' : 'btn-primary'}`}
                onClick={() => handleResponse(true)}
              >
                {state.opts.confirmLabel ?? 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}

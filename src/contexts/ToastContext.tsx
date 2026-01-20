import { createContext, useCallback, useContext, useState } from 'react'
import { ToastContainer, type ToastData, type ToastType } from '@/components/ui/toast'

interface ToastOptions {
  title: string
  message?: string
  duration?: number
}

interface ToastContextType {
  toasts: ToastData[]
  addToast: (type: ToastType, options: ToastOptions) => void
  removeToast: (id: string) => void
  success: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
  warning: (title: string, message?: string) => void
  info: (title: string, message?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastContextType {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const addToast = useCallback((type: ToastType, options: ToastOptions) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    const toast: ToastData = {
      id,
      type,
      ...options,
    }
    setToasts((prev) => [...prev, toast])
  }, [])

  const success = useCallback(
    (title: string, message?: string) => addToast('success', { title, message }),
    [addToast]
  )

  const error = useCallback(
    (title: string, message?: string) => addToast('error', { title, message }),
    [addToast]
  )

  const warning = useCallback(
    (title: string, message?: string) => addToast('warning', { title, message }),
    [addToast]
  )

  const info = useCallback(
    (title: string, message?: string) => addToast('info', { title, message }),
    [addToast]
  )

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        success,
        error,
        warning,
        info,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  )
}

/* eslint-disable react-refresh/only-export-components */
import { render, type RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ToastProvider } from '@/contexts/ToastContext'
import { AuthProvider } from '@/contexts/AuthContext'

interface AllProvidersProps {
  children: React.ReactNode
}

function AllProviders({ children }: AllProvidersProps) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <AuthProvider>{children}</AuthProvider>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  )
}

function customRender(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllProviders, ...options })
}

// Re-export everything from testing-library
export * from '@testing-library/react'
export { userEvent } from '@testing-library/user-event'

// Override render with custom render
export { customRender as render }

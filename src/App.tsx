import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { ToastProvider } from '@/contexts/ToastContext'
import { SettingsProvider } from '@/contexts/SettingsContext'
import { ErrorBoundary } from '@/components/errors/ErrorBoundary'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ExecutiveOverview } from '@/pages/ExecutiveOverview'
import { UnitPerformance } from '@/pages/UnitPerformance'
import { CustomerAnalytics } from '@/pages/CustomerAnalytics'
import { Forecast } from '@/pages/Forecast'
import { Settings } from '@/pages/Settings'
import { Login } from '@/pages/Login'
import i18n from '@/i18n/config'

function App() {
  return (
    <ErrorBoundary>
      <I18nextProvider i18n={i18n}>
        <ThemeProvider>
          <SettingsProvider>
            <ToastProvider>
              <BrowserRouter>
                <AuthProvider>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route
                      path="/"
                      element={
                        <ProtectedRoute>
                          <DashboardLayout />
                        </ProtectedRoute>
                      }
                    >
                      <Route index element={<ExecutiveOverview />} />
                      <Route path="units" element={<UnitPerformance />} />
                      <Route path="customers" element={<CustomerAnalytics />} />
                      <Route path="forecast" element={<Forecast />} />
                      <Route path="settings" element={<Settings />} />
                    </Route>
                  </Routes>
                </AuthProvider>
              </BrowserRouter>
            </ToastProvider>
          </SettingsProvider>
        </ThemeProvider>
      </I18nextProvider>
    </ErrorBoundary>
  )
}

export default App

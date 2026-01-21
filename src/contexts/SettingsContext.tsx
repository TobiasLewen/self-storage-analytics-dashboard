import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

export type Theme = 'light' | 'dark' | 'system'
export type Language = 'de' | 'en'
export type DateFormat = 'dd.MM.yyyy' | 'MM/dd/yyyy' | 'yyyy-MM-dd'
export type CurrencyFormat = 'EUR' | 'USD' | 'GBP'
export type ExportFormat = 'pdf' | 'excel' | 'csv'

export interface Settings {
  // General
  language: Language
  dateFormat: DateFormat
  currencyFormat: CurrencyFormat
  defaultPage: string
  
  // Appearance
  theme: Theme
  accentColor: string
  compactMode: boolean
  
  // Notifications
  emailAlerts: boolean
  browserNotifications: boolean
  occupancyAlertThreshold: number
  revenueAlertThreshold: number
  emailForMediumAlerts: boolean
  pushForMediumAlerts: boolean
  emailFrequency: 'immediate' | 'daily' | 'weekly'
  notificationSound: boolean
  pushPermissionRequested: boolean
  
  // Data & Export
  autoRefreshInterval: number // in seconds, 0 = disabled
  defaultExportFormat: ExportFormat
  dataRetentionMonths: number
}

const defaultSettings: Settings = {
  // General
  language: 'de',
  dateFormat: 'dd.MM.yyyy',
  currencyFormat: 'EUR',
  defaultPage: '/',
  
  // Appearance
  theme: 'system',
  accentColor: 'blue',
  compactMode: false,
  
  // Notifications
  emailAlerts: true,
  browserNotifications: false,
  occupancyAlertThreshold: 85,
  revenueAlertThreshold: 10,
  emailForMediumAlerts: true,
  pushForMediumAlerts: false,
  emailFrequency: 'immediate',
  notificationSound: true,
  pushPermissionRequested: false,
  
  // Data & Export
  autoRefreshInterval: 300, // 5 minutes
  defaultExportFormat: 'pdf',
  dataRetentionMonths: 24,
}

interface SettingsContextType {
  settings: Settings
  updateSettings: (updates: Partial<Settings>) => void
  resetSettings: () => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => {
    const stored = localStorage.getItem('app-settings')
    if (stored) {
      try {
        return { ...defaultSettings, ...JSON.parse(stored) }
      } catch (e) {
        console.error('Failed to parse stored settings:', e)
        return defaultSettings
      }
    }
    return defaultSettings
  })

  useEffect(() => {
    localStorage.setItem('app-settings', JSON.stringify(settings))
  }, [settings])

  const updateSettings = (updates: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...updates }))
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
    localStorage.removeItem('app-settings')
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

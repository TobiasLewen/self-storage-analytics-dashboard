import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSettings } from '@/contexts/SettingsContext'
import { useTheme } from '@/hooks/useTheme'
import { useToast } from '@/hooks/useToast'

export function AppearanceSettings() {
  const { settings, updateSettings } = useSettings()
  const { theme, toggleTheme } = useTheme()
  const toast = useToast()

  const handleThemeChange = (value: string) => {
    updateSettings({ theme: value as 'light' | 'dark' | 'system' })
    // Toggle theme if needed to match selection
    if (value === 'light' && theme === 'dark') {
      toggleTheme()
    } else if (value === 'dark' && theme === 'light') {
      toggleTheme()
    }
    toast.success('Gespeichert', 'Design wurde aktualisiert')
  }

  const handleUpdate = (updates: Partial<typeof settings>) => {
    updateSettings(updates)
    toast.success('Gespeichert', 'Einstellungen wurden aktualisiert')
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="theme">Design</Label>
        <Select value={settings.theme} onValueChange={handleThemeChange}>
          <SelectTrigger id="theme">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Hell</SelectItem>
            <SelectItem value="dark">Dunkel</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          Wählen Sie Ihr bevorzugtes Farbschema
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="accentColor">Akzentfarbe</Label>
        <Select
          value={settings.accentColor}
          onValueChange={(value) => handleUpdate({ accentColor: value })}
        >
          <SelectTrigger id="accentColor">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="blue">Blau</SelectItem>
            <SelectItem value="green">Grün</SelectItem>
            <SelectItem value="purple">Lila</SelectItem>
            <SelectItem value="orange">Orange</SelectItem>
            <SelectItem value="red">Rot</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          Primäre Akzentfarbe für die Benutzeroberfläche
        </p>
      </div>

      <div className="flex items-center justify-between space-x-2">
        <div className="space-y-0.5">
          <Label htmlFor="compactMode">Kompaktmodus</Label>
          <p className="text-sm text-muted-foreground">
            Reduzierte Abstände für mehr Inhalt auf dem Bildschirm
          </p>
        </div>
        <Switch
          id="compactMode"
          checked={settings.compactMode}
          onCheckedChange={(checked) => handleUpdate({ compactMode: checked })}
        />
      </div>
    </div>
  )
}

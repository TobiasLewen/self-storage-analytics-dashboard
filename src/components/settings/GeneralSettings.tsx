import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSettings } from '@/contexts/SettingsContext'
import { useToast } from '@/hooks/useToast'

export function GeneralSettings() {
  const { settings, updateSettings } = useSettings()
  const toast = useToast()

  const handleUpdate = (updates: Partial<typeof settings>) => {
    updateSettings(updates)
    toast.success('Gespeichert', 'Einstellungen wurden aktualisiert')
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="language">Sprache</Label>
        <Select
          value={settings.language}
          onValueChange={(value) => handleUpdate({ language: value as 'de' | 'en' })}
        >
          <SelectTrigger id="language">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="de">Deutsch</SelectItem>
            <SelectItem value="en">English</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          Wählen Sie Ihre bevorzugte Sprache
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dateFormat">Datumsformat</Label>
        <Select
          value={settings.dateFormat}
          onValueChange={(value) => handleUpdate({ dateFormat: value as any })}
        >
          <SelectTrigger id="dateFormat">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dd.MM.yyyy">DD.MM.YYYY (31.12.2024)</SelectItem>
            <SelectItem value="MM/dd/yyyy">MM/DD/YYYY (12/31/2024)</SelectItem>
            <SelectItem value="yyyy-MM-dd">YYYY-MM-DD (2024-12-31)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          Format für die Datumsanzeige
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="currency">Währung</Label>
        <Select
          value={settings.currencyFormat}
          onValueChange={(value) => handleUpdate({ currencyFormat: value as any })}
        >
          <SelectTrigger id="currency">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EUR">EUR (€)</SelectItem>
            <SelectItem value="USD">USD ($)</SelectItem>
            <SelectItem value="GBP">GBP (£)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          Währung für Preisanzeigen
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="defaultPage">Startseite</Label>
        <Select
          value={settings.defaultPage}
          onValueChange={(value) => handleUpdate({ defaultPage: value })}
        >
          <SelectTrigger id="defaultPage">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="/">Executive Overview</SelectItem>
            <SelectItem value="/units">Unit Performance</SelectItem>
            <SelectItem value="/customers">Customer Analytics</SelectItem>
            <SelectItem value="/forecast">Forecast</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          Seite, die beim Start angezeigt wird
        </p>
      </div>
    </div>
  )
}

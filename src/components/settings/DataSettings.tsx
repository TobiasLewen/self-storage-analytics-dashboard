import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useSettings } from '@/contexts/SettingsContext'
import { useToast } from '@/hooks/useToast'

export function DataSettings() {
  const { settings, updateSettings, resetSettings } = useSettings()
  const toast = useToast()

  const handleReset = () => {
    resetSettings()
    toast.success('Einstellungen zurückgesetzt', 'Alle Einstellungen wurden auf die Standardwerte zurückgesetzt.')
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="autoRefresh">Automatische Aktualisierung (Sekunden)</Label>
        <Input
          id="autoRefresh"
          type="number"
          min="0"
          step="30"
          value={settings.autoRefreshInterval}
          onChange={(e) =>
            updateSettings({ autoRefreshInterval: parseInt(e.target.value) || 0 })
          }
        />
        <p className="text-sm text-muted-foreground">
          Intervall für automatische Datenaktualisierung (0 = deaktiviert)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="exportFormat">Standard-Exportformat</Label>
        <Select
          value={settings.defaultExportFormat}
          onValueChange={(value) => updateSettings({ defaultExportFormat: value as any })}
        >
          <SelectTrigger id="exportFormat">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pdf">PDF</SelectItem>
            <SelectItem value="excel">Excel</SelectItem>
            <SelectItem value="csv">CSV</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          Bevorzugtes Format für Datenexporte
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dataRetention">Datenspeicherung (Monate)</Label>
        <Input
          id="dataRetention"
          type="number"
          min="1"
          max="60"
          value={settings.dataRetentionMonths}
          onChange={(e) =>
            updateSettings({ dataRetentionMonths: parseInt(e.target.value) || 12 })
          }
        />
        <p className="text-sm text-muted-foreground">
          Wie lange historische Daten gespeichert werden sollen
        </p>
      </div>

      <div className="pt-4 border-t border-border">
        <div className="space-y-2">
          <Label>Einstellungen zurücksetzen</Label>
          <p className="text-sm text-muted-foreground">
            Alle Einstellungen auf Standardwerte zurücksetzen
          </p>
          <Button variant="destructive" onClick={handleReset}>
            Auf Standard zurücksetzen
          </Button>
        </div>
      </div>
    </div>
  )
}

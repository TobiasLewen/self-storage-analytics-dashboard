import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { useSettings } from '@/contexts/SettingsContext'

export function NotificationSettings() {
  const { settings, updateSettings } = useSettings()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between space-x-2">
        <div className="space-y-0.5">
          <Label htmlFor="emailAlerts">E-Mail-Benachrichtigungen</Label>
          <p className="text-sm text-muted-foreground">
            Erhalten Sie wichtige Benachrichtigungen per E-Mail
          </p>
        </div>
        <Switch
          id="emailAlerts"
          checked={settings.emailAlerts}
          onCheckedChange={(checked) => updateSettings({ emailAlerts: checked })}
        />
      </div>

      <div className="flex items-center justify-between space-x-2">
        <div className="space-y-0.5">
          <Label htmlFor="browserNotifications">Browser-Benachrichtigungen</Label>
          <p className="text-sm text-muted-foreground">
            Desktop-Benachrichtigungen für wichtige Ereignisse
          </p>
        </div>
        <Switch
          id="browserNotifications"
          checked={settings.browserNotifications}
          onCheckedChange={(checked) => updateSettings({ browserNotifications: checked })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="occupancyThreshold">Belegungsrate-Schwellenwert (%)</Label>
        <Input
          id="occupancyThreshold"
          type="number"
          min="0"
          max="100"
          value={settings.occupancyAlertThreshold}
          onChange={(e) =>
            updateSettings({ occupancyAlertThreshold: parseInt(e.target.value) || 0 })
          }
        />
        <p className="text-sm text-muted-foreground">
          Benachrichtigung bei Überschreitung dieser Belegungsrate
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="revenueThreshold">Umsatzänderungs-Schwellenwert (%)</Label>
        <Input
          id="revenueThreshold"
          type="number"
          min="0"
          max="100"
          value={settings.revenueAlertThreshold}
          onChange={(e) =>
            updateSettings({ revenueAlertThreshold: parseInt(e.target.value) || 0 })
          }
        />
        <p className="text-sm text-muted-foreground">
          Benachrichtigung bei Umsatzänderung über diesem Prozentsatz
        </p>
      </div>
    </div>
  )
}

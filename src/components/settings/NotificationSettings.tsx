import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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
import { Bell, Mail, Volume2 } from 'lucide-react'
import NotificationService from '@/services/NotificationService'

export function NotificationSettings() {
  const { settings, updateSettings } = useSettings()

  const handleRequestPushPermission = async () => {
    const granted = await NotificationService.requestPushPermission()
    if (granted) {
      updateSettings({ pushPermissionRequested: true, browserNotifications: true })
    }
  }

  const handleTestNotification = async () => {
    await NotificationService.createTestNotification('system_alert')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Benachrichtigungseinstellungen
          </h3>
          <p className="text-sm text-muted-foreground">
            Konfigurieren Sie, wie und wann Sie Benachrichtigungen erhalten
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleTestNotification}>
          Testbenachrichtigung
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between space-x-2">
          <div className="space-y-0.5">
            <Label htmlFor="emailAlerts" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              E-Mail-Benachrichtigungen
            </Label>
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
            <Label htmlFor="browserNotifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Browser-Benachrichtigungen
            </Label>
            <p className="text-sm text-muted-foreground">
              Desktop-Benachrichtigungen für wichtige Ereignisse
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!settings.pushPermissionRequested && (
              <Button variant="outline" size="sm" onClick={handleRequestPushPermission}>
                Berechtigung anfordern
              </Button>
            )}
            <Switch
              id="browserNotifications"
              checked={settings.browserNotifications}
              onCheckedChange={(checked) => updateSettings({ browserNotifications: checked })}
              disabled={!settings.pushPermissionRequested}
            />
          </div>
        </div>

        <div className="flex items-center justify-between space-x-2">
          <div className="space-y-0.5">
            <Label htmlFor="notificationSound" className="flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              Benachrichtigungston
            </Label>
            <p className="text-sm text-muted-foreground">
              Ton bei neuen Benachrichtigungen abspielen
            </p>
          </div>
          <Switch
            id="notificationSound"
            checked={settings.notificationSound}
            onCheckedChange={(checked) => updateSettings({ notificationSound: checked })}
          />
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-border">
        <h4 className="font-medium">Benachrichtigungsfilter</h4>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="emailForMediumAlerts">E-Mail für mittlere Priorität</Label>
            <Switch
              id="emailForMediumAlerts"
              checked={settings.emailForMediumAlerts}
              onCheckedChange={(checked) => updateSettings({ emailForMediumAlerts: checked })}
            />
            <p className="text-sm text-muted-foreground">
              E-Mails für Benachrichtigungen mit mittlerer Priorität senden
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pushForMediumAlerts">Push für mittlere Priorität</Label>
            <Switch
              id="pushForMediumAlerts"
              checked={settings.pushForMediumAlerts}
              onCheckedChange={(checked) => updateSettings({ pushForMediumAlerts: checked })}
            />
            <p className="text-sm text-muted-foreground">
              Push-Benachrichtigungen für mittlere Priorität senden
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="emailFrequency">E-Mail-Häufigkeit</Label>
          <Select
            value={settings.emailFrequency}
            onValueChange={(value: 'immediate' | 'daily' | 'weekly') => 
              updateSettings({ emailFrequency: value })
            }
          >
            <SelectTrigger id="emailFrequency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="immediate">Sofort</SelectItem>
              <SelectItem value="daily">Tägliche Zusammenfassung</SelectItem>
              <SelectItem value="weekly">Wöchentliche Zusammenfassung</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Wie oft Sie E-Mail-Benachrichtigungen erhalten möchten
          </p>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-border">
        <h4 className="font-medium">Alarm-Schwellenwerte</h4>
        
        <div className="grid gap-4 md:grid-cols-2">
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
      </div>
    </div>
  )
}

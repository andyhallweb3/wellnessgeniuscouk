import { useState, useEffect } from "react";
import {
  Bell,
  Mail,
  Clock,
  Moon,
  Save,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useNotificationPreferences, NotificationPreferences } from "@/hooks/useNotificationPreferences";

const DAYS_OF_WEEK = [
  { value: "sunday", label: "Sun" },
  { value: "monday", label: "Mon" },
  { value: "tuesday", label: "Tue" },
  { value: "wednesday", label: "Wed" },
  { value: "thursday", label: "Thu" },
  { value: "friday", label: "Fri" },
  { value: "saturday", label: "Sat" },
];

const TIME_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0");
  return { value: `${hour}:00`, label: `${hour}:00` };
});

interface NotificationPreferencesProps {
  onClose?: () => void;
}

const NotificationPreferencesComponent = ({ onClose }: NotificationPreferencesProps) => {
  const { preferences, loading, saving, updatePreferences } = useNotificationPreferences();
  
  const [localPrefs, setLocalPrefs] = useState<Partial<NotificationPreferences>>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (preferences) {
      setLocalPrefs({
        email_enabled: preferences.email_enabled,
        email_frequency: preferences.email_frequency,
        email_priority_threshold: preferences.email_priority_threshold,
        quiet_hours_enabled: preferences.quiet_hours_enabled,
        quiet_hours_start: preferences.quiet_hours_start?.slice(0, 5) || "22:00",
        quiet_hours_end: preferences.quiet_hours_end?.slice(0, 5) || "08:00",
        quiet_days: preferences.quiet_days || [],
        push_enabled: preferences.push_enabled,
      });
    }
  }, [preferences]);

  const updateLocal = <K extends keyof NotificationPreferences>(
    key: K,
    value: NotificationPreferences[K]
  ) => {
    setLocalPrefs((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    const success = await updatePreferences(localPrefs);
    if (success) {
      toast.success("Notification preferences saved");
      setHasChanges(false);
    } else {
      toast.error("Failed to save preferences");
    }
  };

  const toggleQuietDay = (day: string) => {
    const currentDays = localPrefs.quiet_days || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day];
    updateLocal("quiet_days", newDays);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Mail size={18} className="text-accent" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Configure how and when you receive email alerts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-enabled" className="text-sm font-medium">
                Enable email notifications
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Receive important alerts via email
              </p>
            </div>
            <Switch
              id="email-enabled"
              checked={localPrefs.email_enabled}
              onCheckedChange={(checked) => updateLocal("email_enabled", checked)}
            />
          </div>

          {localPrefs.email_enabled && (
            <>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Email frequency</Label>
                <Select
                  value={localPrefs.email_frequency}
                  onValueChange={(value) =>
                    updateLocal("email_frequency", value as NotificationPreferences["email_frequency"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instant">Instant (as they happen)</SelectItem>
                    <SelectItem value="daily_digest">Daily digest</SelectItem>
                    <SelectItem value="weekly_digest">Weekly digest</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Email for priority</Label>
                <Select
                  value={localPrefs.email_priority_threshold}
                  onValueChange={(value) =>
                    updateLocal(
                      "email_priority_threshold",
                      value as NotificationPreferences["email_priority_threshold"]
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All notifications</SelectItem>
                    <SelectItem value="medium_and_high">Medium & high priority</SelectItem>
                    <SelectItem value="high">High priority only</SelectItem>
                    <SelectItem value="none">None (in-app only)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Moon size={18} className="text-accent" />
            Quiet Hours
          </CardTitle>
          <CardDescription>
            Pause notifications during specific times
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="quiet-enabled" className="text-sm font-medium">
                Enable quiet hours
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                No notifications during these hours
              </p>
            </div>
            <Switch
              id="quiet-enabled"
              checked={localPrefs.quiet_hours_enabled}
              onCheckedChange={(checked) => updateLocal("quiet_hours_enabled", checked)}
            />
          </div>

          {localPrefs.quiet_hours_enabled && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Start time</Label>
                  <Select
                    value={localPrefs.quiet_hours_start}
                    onValueChange={(value) => updateLocal("quiet_hours_start", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map((time) => (
                        <SelectItem key={time.value} value={time.value}>
                          {time.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">End time</Label>
                  <Select
                    value={localPrefs.quiet_hours_end}
                    onValueChange={(value) => updateLocal("quiet_hours_end", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map((time) => (
                        <SelectItem key={time.value} value={time.value}>
                          {time.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Quiet days (all day)</Label>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <button
                      key={day.value}
                      onClick={() => toggleQuietDay(day.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        localPrefs.quiet_days?.includes(day.value)
                          ? "bg-accent text-accent-foreground"
                          : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Push Notifications (placeholder for now) */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell size={18} className="text-accent" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Get instant alerts on your device
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="push-enabled" className="text-sm font-medium">
                Enable push notifications
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Receive browser notifications (coming soon)
              </p>
            </div>
            <Switch
              id="push-enabled"
              checked={localPrefs.push_enabled}
              onCheckedChange={(checked) => updateLocal("push_enabled", checked)}
              disabled
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        )}
        <Button
          variant="accent"
          onClick={handleSave}
          disabled={!hasChanges || saving}
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save size={16} className="mr-2" />
              Save Preferences
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default NotificationPreferencesComponent;

import { Shield, Eye, EyeOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTrustSettings, TrustDisplayMode } from "@/hooks/useTrustSettings";
import { toast } from "sonner";

const TrustSettingsToggle = () => {
  const { displayMode, isLoading, updateDisplayMode } = useTrustSettings();

  const handleToggle = async (checked: boolean) => {
    const newMode: TrustDisplayMode = checked ? "full" : "compact";
    const success = await updateDisplayMode(newMode);
    
    if (success) {
      toast.success(`Trust indicators set to ${newMode} mode`);
    } else {
      toast.error("Failed to update settings");
    }
  };

  if (isLoading) return null;

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border/50">
      <div className="flex items-center gap-3">
        <Shield size={16} className="text-muted-foreground" />
        <div>
          <Label htmlFor="trust-mode" className="text-sm font-medium">
            Trust Indicators
          </Label>
          <p className="text-xs text-muted-foreground">
            {displayMode === "full" ? "Showing full details" : "Compact view"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <EyeOff size={12} className="text-muted-foreground" />
        <Switch
          id="trust-mode"
          checked={displayMode === "full"}
          onCheckedChange={handleToggle}
        />
        <Eye size={12} className="text-muted-foreground" />
      </div>
    </div>
  );
};

export default TrustSettingsToggle;

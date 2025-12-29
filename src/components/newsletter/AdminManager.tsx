import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  Loader2, 
  Plus,
  Trash2,
  ShieldCheck,
  ShieldX
} from "lucide-react";

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  email_confirmed_at: string | null;
  is_admin: boolean;
}

interface AdminManagerProps {
  getAuthHeaders: () => Record<string, string>;
}

export const AdminManager = ({ getAuthHeaders }: AdminManagerProps) => {
  const { toast } = useToast();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-admins", {
        body: { action: "list" },
        headers: getAuthHeaders(),
      });

      if (error) throw error;
      setAdmins(data.users || []);
    } catch (error) {
      console.error("Failed to fetch admin users:", error);
    } finally {
      setLoading(false);
    }
  };

  const grantAccess = async () => {
    if (!newAdminEmail.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("manage-admins", {
        body: { action: "grant", email: newAdminEmail.trim() },
        headers: getAuthHeaders(),
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast({
        title: "Admin Access Granted",
        description: data.message || "User now has admin privileges.",
      });

      setNewAdminEmail("");
      fetchAdmins();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to grant admin access",
        variant: "destructive",
      });
    }
  };

  const revokeAccess = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to revoke admin access for ${userEmail}?`)) return;

    try {
      const { data, error } = await supabase.functions.invoke("manage-admins", {
        body: { action: "revoke", userId },
        headers: getAuthHeaders(),
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast({
        title: "Admin Access Revoked",
        description: `${userEmail} no longer has admin privileges.`,
      });

      fetchAdmins();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to revoke admin access",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Shield className="h-4 w-4" />
          {admins.filter((a) => a.is_admin).length} admins
        </span>
      </div>

      {/* Add admin */}
      <div className="flex gap-2">
        <Input
          placeholder="Email address"
          value={newAdminEmail}
          onChange={(e) => setNewAdminEmail(e.target.value)}
          className="flex-1"
        />
        <Button onClick={grantAccess}>
          <Plus className="h-4 w-4 mr-1" />
          Grant Access
        </Button>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
        </div>
      ) : admins.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No admin users found
        </div>
      ) : (
        <div className="space-y-2">
          {admins.map((admin) => (
            <div
              key={admin.id}
              className="flex items-center justify-between p-3 rounded-lg border"
            >
              <div className="flex items-center gap-3">
                {admin.is_admin ? (
                  <ShieldCheck className="h-5 w-5 text-green-500" />
                ) : (
                  <ShieldX className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <p className="font-medium">{admin.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {admin.email_confirmed_at ? "Verified" : "Pending verification"} •{" "}
                    {new Date(admin.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {admin.is_admin && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => revokeAccess(admin.id, admin.email)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

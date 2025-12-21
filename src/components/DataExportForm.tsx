import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const emailSchema = z.string().trim().email({ message: "Please enter a valid email address" });

type ExportStatus = "idle" | "loading" | "success" | "error";

export const DataExportForm = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || "");
  const [status, setStatus] = useState<ExportStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    // Validate email
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setErrorMessage(result.error.issues[0].message);
      return;
    }

    setStatus("loading");

    try {
      const { data, error } = await supabase.functions.invoke("export-user-data", {
        body: { email: result.data },
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        setStatus("success");
        toast.success("Data export ready! Check your email for the download link.");
      } else if (data?.downloadUrl) {
        // Direct download if URL is provided
        setStatus("success");
        const link = document.createElement("a");
        link.href = data.downloadUrl;
        link.download = `wellness-genius-data-export-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Your data export has been downloaded!");
      } else {
        throw new Error(data?.error || "Export failed");
      }
    } catch (err: unknown) {
      console.error("Export error:", err);
      setStatus("error");
      const message = err instanceof Error ? err.message : "Failed to export data. Please try again.";
      setErrorMessage(message);
      toast.error(message);
    }
  };

  const handleReset = () => {
    setStatus("idle");
    setErrorMessage("");
  };

  if (status === "success") {
    return (
      <div className="text-center py-6">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Export Complete!</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Your personal data has been exported. If you requested it via email, check your inbox.
        </p>
        <Button variant="outline" onClick={handleReset}>
          Export Again
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleExport} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="export-email">Email Address</Label>
        <Input
          id="export-email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "loading"}
          className={errorMessage ? "border-destructive" : ""}
        />
        {errorMessage && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errorMessage}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Enter the email address associated with your account to export all your personal data.
        </p>
      </div>

      <div className="bg-muted/50 rounded-lg p-4 text-sm">
        <h4 className="font-medium mb-2">What's included in your export:</h4>
        <ul className="list-disc pl-5 text-muted-foreground space-y-1">
          <li>Profile information</li>
          <li>AI Coach sessions and saved outputs</li>
          <li>Credit transactions history</li>
          <li>Product downloads and purchases</li>
          <li>Newsletter subscription data</li>
          <li>AI Readiness assessment results</li>
        </ul>
      </div>

      <Button
        type="submit"
        variant="accent"
        className="w-full"
        disabled={status === "loading"}
      >
        {status === "loading" ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Preparing Export...
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            Export My Data
          </>
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Your data will be compiled and made available for download in JSON format.
      </p>
    </form>
  );
};

export default DataExportForm;

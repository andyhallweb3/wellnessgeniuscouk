import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Mail, Send, FlaskConical, AlertCircle, CheckCircle2 } from "lucide-react";
import FounderLayout from "@/components/founder/FounderLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface NudgeResult {
  sent: number;
  skipped: number;
  errors: string[];
}

// ---------------------------------------------------------------------------
// Hook — invoke the edge function
// ---------------------------------------------------------------------------

function useNudgeMutation(userId?: string) {
  return useMutation<NudgeResult, Error>({
    mutationFn: async () => {
      const body = userId ? { userId } : {};

      const { data, error } = await supabase.functions.invoke<NudgeResult>(
        "send-operator-nudge",
        { body }
      );

      if (error) throw new Error(error.message);
      if (!data) throw new Error("No response from edge function");

      return data;
    },
  });
}

// ---------------------------------------------------------------------------
// Result display
// ---------------------------------------------------------------------------

function NudgeResultAlert({ result }: { result: NudgeResult }) {
  const hasErrors = result.errors.length > 0;

  return (
    <div className="space-y-3">
      <Alert variant={hasErrors ? "destructive" : "default"} className="border-green-200 bg-green-50">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">Send complete</AlertTitle>
        <AlertDescription className="text-green-700">
          <span className="font-semibold">{result.sent}</span> sent,{" "}
          <span className="font-semibold">{result.skipped}</span> skipped
        </AlertDescription>
      </Alert>

      {hasErrors && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Errors ({result.errors.length})</AlertTitle>
          <AlertDescription>
            <ul className="mt-2 space-y-1 text-xs">
              {result.errors.map((e, i) => (
                <li key={i} className="font-mono break-all">{e}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function OperatorNudgeAdmin() {
  const { user } = useAuth();
  const [testEmail, setTestEmail] = useState("");

  // Use the logged-in user's ID for the test send
  const testUserId = user?.id;

  const batchMutation = useNudgeMutation();
  const testMutation = useNudgeMutation(testUserId);

  const handleBatchSend = () => {
    batchMutation.reset();
    testMutation.reset();
    batchMutation.mutate(undefined, {
      onSuccess: (result) => {
        toast.success(`Sent ${result.sent} nudge emails`);
      },
      onError: (err) => {
        toast.error(`Batch send failed: ${err.message}`);
      },
    });
  };

  const handleTestSend = () => {
    if (!testUserId) {
      toast.error("No user session — cannot send test");
      return;
    }
    batchMutation.reset();
    testMutation.reset();
    testMutation.mutate(undefined, {
      onSuccess: (result) => {
        toast.success(`Test email sent (${result.sent} sent, ${result.skipped} skipped)`);
      },
      onError: (err) => {
        toast.error(`Test send failed: ${err.message}`);
      },
    });
  };

  const isBatchLoading = batchMutation.isPending;
  const isTestLoading = testMutation.isPending;

  return (
    <FounderLayout>
      <div className="space-y-8 max-w-2xl">

        {/* Page header */}
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-100">
            <Mail className="h-5 w-5 text-teal-700" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Operator Nudge Emails
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Send AI-personalised weekly insight emails to active operators. Each email is generated
              individually using the operator's workspace profile, goals, and recent Genie activity.
            </p>
          </div>
        </div>

        {/* Batch send card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Send className="h-4 w-4" />
              Send to all eligible operators
            </CardTitle>
            <CardDescription>
              Sends to operators with weekly digest enabled, plus any user who has used Genie in the
              last 30 days and hasn't opted out. Skips anyone with email_frequency set to "never".
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleBatchSend}
              disabled={isBatchLoading || isTestLoading}
              className="w-full sm:w-auto"
            >
              {isBatchLoading ? (
                <>
                  <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block" />
                  Sending…
                </>
              ) : (
                "Send to all eligible"
              )}
            </Button>

            {batchMutation.isSuccess && batchMutation.data && (
              <NudgeResultAlert result={batchMutation.data} />
            )}

            {batchMutation.isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Send failed</AlertTitle>
                <AlertDescription>{batchMutation.error.message}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Test send card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FlaskConical className="h-4 w-4" />
              Test send
            </CardTitle>
            <CardDescription>
              Sends a single nudge email to your account. Useful for previewing the AI-generated
              content before a batch run.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="test-email" className="text-sm font-medium text-foreground">
                Your email (for reference)
              </label>
              <Input
                id="test-email"
                type="email"
                placeholder={user?.email ?? "your@email.com"}
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="max-w-sm"
                aria-describedby="test-email-hint"
              />
              <p id="test-email-hint" className="text-xs text-muted-foreground">
                The email will be sent to the address on your account record, not this field.
                This is display only.
              </p>
            </div>

            <Button
              variant="outline"
              onClick={handleTestSend}
              disabled={isBatchLoading || isTestLoading || !testUserId}
              className="w-full sm:w-auto"
            >
              {isTestLoading ? (
                <>
                  <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full inline-block" />
                  Sending test…
                </>
              ) : (
                "Send test"
              )}
            </Button>

            {testMutation.isSuccess && testMutation.data && (
              <NudgeResultAlert result={testMutation.data} />
            )}

            {testMutation.isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Test send failed</AlertTitle>
                <AlertDescription>{testMutation.error.message}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Info card */}
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground space-y-2">
              <p className="font-medium text-foreground">How it works</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Each email is AI-generated using claude-haiku (fast and cheap)</li>
                <li>Content is specific to each operator's sector, goals, and recent Genie activity</li>
                <li>Sent from <code className="text-xs bg-muted px-1 py-0.5 rounded">andy@wellnessgenius.co.uk</code> via Resend</li>
                <li>If the AI times out for a user, that user is skipped — not errored</li>
                <li>Errors are per-user; a failed send doesn't stop the batch</li>
              </ul>
            </div>
          </CardContent>
        </Card>

      </div>
    </FounderLayout>
  );
}

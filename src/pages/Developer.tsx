import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Key,
  Plus,
  Copy,
  Check,
  Trash2,
  AlertTriangle,
  Code,
  RotateCcw,
  Mail,
} from "lucide-react";
import { toast } from "sonner";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ApiKey {
  id: string;
  name: string;
  tier: "starter" | "growth";
  key_prefix: string;
  monthly_limit: number;
  calls_this_month: number;
  reset_at: string;
  created_at: string;
}

interface CreatedKey {
  key: string;
  id: string;
  name: string;
  tier: string;
  key_prefix: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SUPABASE_FUNCTIONS_URL =
  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

const CODE_SNIPPETS = {
  curl: `curl -X POST ${SUPABASE_FUNCTIONS_URL}/operator-api \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"question": "Why is my retention dropping in January?"}'`,

  javascript: `const res = await fetch('${SUPABASE_FUNCTIONS_URL}/operator-api', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ question: 'Why is my retention dropping in January?' }),
});
const data = await res.json();
console.log(data.answer);`,

  python: `import requests

response = requests.post(
    '${SUPABASE_FUNCTIONS_URL}/operator-api',
    headers={'Authorization': 'Bearer YOUR_API_KEY'},
    json={'question': 'Why is my retention dropping in January?'}
)
print(response.json()['answer'])`,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatResetDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ── Sub-components ────────────────────────────────────────────────────────────

/** Inline copyable text with a copy-to-clipboard button */
function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`Copy ${label ?? "text"} to clipboard`}
      className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors min-w-[44px] min-h-[44px]"
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-600" aria-hidden="true" />
      ) : (
        <Copy className="h-4 w-4" aria-hidden="true" />
      )}
      <span>{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}

/** Single API key card */
function ApiKeyCard({
  apiKey,
  onRevoke,
}: {
  apiKey: ApiKey;
  onRevoke: (id: string) => void;
}) {
  const usagePercent = Math.round(
    (apiKey.calls_this_month / apiKey.monthly_limit) * 100
  );

  return (
    <Card className="border border-border">
      <CardContent className="pt-5 pb-4 px-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          {/* Name + tier */}
          <div className="flex items-center gap-2 min-w-0">
            <Key className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
            <span className="font-medium text-sm truncate">{apiKey.name}</span>
            <Badge
              variant={apiKey.tier === "growth" ? "default" : "secondary"}
              className="shrink-0 text-xs"
            >
              {apiKey.tier === "growth" ? "Growth" : "Starter"}
            </Badge>
          </div>

          {/* Revoke */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                aria-label={`Revoke API key ${apiKey.name}`}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0 min-h-[44px]"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Revoke</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Revoke "{apiKey.name}"?</AlertDialogTitle>
                <AlertDialogDescription>
                  Any integrations using this key will stop working immediately.
                  This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onRevoke(apiKey.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Revoke key
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Key prefix */}
        <p className="mt-2 font-mono text-xs text-muted-foreground select-all">
          {apiKey.key_prefix}••••••••••••••••••••••••••
        </p>

        {/* Usage */}
        <div className="mt-3 space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {apiKey.calls_this_month.toLocaleString("en-GB")} /{" "}
              {apiKey.monthly_limit.toLocaleString("en-GB")} calls this month
            </span>
            <span>{usagePercent}%</span>
          </div>
          <Progress
            value={usagePercent}
            className="h-1.5"
            aria-label={`${usagePercent}% of monthly call limit used`}
          />
        </div>

        {/* Reset date */}
        <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <RotateCcw className="h-3 w-3" aria-hidden="true" />
          Resets {formatResetDate(apiKey.reset_at)}
        </p>
      </CardContent>
    </Card>
  );
}

/** Newly created key — shown once */
function NewKeyAlert({ createdKey, onDismiss }: { createdKey: CreatedKey; onDismiss: () => void }) {
  return (
    <Alert className="border-amber-300 bg-amber-50 dark:bg-amber-950/20 mt-4">
      <AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden="true" />
      <AlertDescription>
        <p className="font-semibold text-amber-800 dark:text-amber-300 mb-2">
          Copy this key now — it will not be shown again.
        </p>
        <div className="flex items-center gap-2 rounded bg-white dark:bg-black/30 border border-amber-200 dark:border-amber-700 px-3 py-2 font-mono text-sm break-all">
          <span className="flex-1 select-all">{createdKey.key}</span>
          <CopyButton text={createdKey.key} label="API key" />
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="mt-3 text-amber-700 dark:text-amber-400 hover:text-amber-900"
        >
          I've saved my key
        </Button>
      </AlertDescription>
    </Alert>
  );
}

/** Code snippet block with copy button */
function CodeBlock({ code, language }: { code: string; language: string }) {
  return (
    <div className="relative rounded-lg bg-muted/60 border border-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <span className="text-xs font-mono text-muted-foreground">{language}</span>
        <CopyButton text={code} label="code snippet" />
      </div>
      <pre className="px-4 py-4 text-xs overflow-x-auto leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function Developer() {
  const { user, session, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyTier, setNewKeyTier] = useState<"starter" | "growth">("starter");
  const [createdKey, setCreatedKey] = useState<CreatedKey | null>(null);

  // Redirect unauthenticated users
  if (!authLoading && !user) {
    navigate("/auth", { replace: true });
    return null;
  }

  // ── Fetch existing keys ──────────────────────────────────────────────────
  const {
    data: keys = [],
    isLoading: keysLoading2,
    isError: keysError2,
  } = useQuery<ApiKey[]>({
    queryKey: ["operator-api-keys-direct", user?.id],
    enabled: !!user && !!session,
    staleTime: 30_000,
    queryFn: async () => {
      const res = await fetch(
        `${SUPABASE_FUNCTIONS_URL}/manage-api-keys?action=list`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session!.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error ?? "Failed to load API keys");
      }

      const json = await res.json();
      return (json.keys as ApiKey[]) ?? [];
    },
  });

  // ── Create key mutation ──────────────────────────────────────────────────
  const createKeyMutation = useMutation({
    mutationFn: async ({ name, tier }: { name: string; tier: "starter" | "growth" }) => {
      const res = await fetch(
        `${SUPABASE_FUNCTIONS_URL}/manage-api-keys?action=create`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session!.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, tier }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error ?? "Failed to create API key");
      }

      return (await res.json()) as CreatedKey;
    },
    onSuccess: (data) => {
      setCreatedKey(data);
      setShowCreateForm(false);
      setNewKeyName("");
      setNewKeyTier("starter");
      queryClient.invalidateQueries({ queryKey: ["operator-api-keys-direct"] });
      toast.success("API key created");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to create API key");
    },
  });

  // ── Revoke key mutation ──────────────────────────────────────────────────
  const revokeKeyMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(
        `${SUPABASE_FUNCTIONS_URL}/manage-api-keys?action=revoke`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session!.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error ?? "Failed to revoke key");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operator-api-keys-direct"] });
      toast.success("API key revoked");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to revoke API key");
    },
  });

  const hasGrowthKey = keys.some((k) => k.tier === "growth");

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-muted-foreground text-sm">Loading…</span>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Operator API | Wellness Genius</title>
        <meta
          name="description"
          content="Embed Wellness Genius AI into your own platform. REST API for gym operators, spa software vendors, and corporate wellbeing platforms."
        />
      </Helmet>

      <Header />

      <main className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-4 py-10 sm:px-6 lg:px-8">

          {/* ── Page header ─────────────────────────────────────────────── */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Operator API
            </h1>
            <p className="mt-2 text-muted-foreground max-w-xl">
              Embed Wellness Genius AI into your own platform. One API call. Wellness-specific answers for gym operators, spa directors, and corporate wellbeing leads.
            </p>
          </div>

          {/* ── API Keys section ─────────────────────────────────────────── */}
          <section aria-labelledby="api-keys-heading" className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 id="api-keys-heading" className="text-lg font-semibold">
                API Keys
              </h2>
              {!showCreateForm && (
                <Button
                  size="sm"
                  onClick={() => setShowCreateForm(true)}
                  className="min-h-[44px] gap-2"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Create new key
                </Button>
              )}
            </div>

            {/* Create key form */}
            {showCreateForm && (
              <Card className="mb-4 border-primary/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">New API key</CardTitle>
                  <CardDescription>
                    Give your key a label so you can identify it later (e.g. "Production" or "Staging").
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="key-name" className="text-sm font-medium">
                      Key name
                    </label>
                    <Input
                      id="key-name"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      placeholder="e.g. Production"
                      maxLength={80}
                      autoFocus
                      aria-required="true"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="key-tier" className="text-sm font-medium">
                      Plan
                    </label>
                    <Select
                      value={newKeyTier}
                      onValueChange={(v) => setNewKeyTier(v as "starter" | "growth")}
                    >
                      <SelectTrigger id="key-tier" className="min-h-[44px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="starter">Starter — £49/mo · 500 calls/month</SelectItem>
                        <SelectItem value="growth">Growth — £99/mo · 2,000 calls/month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button
                      onClick={() =>
                        createKeyMutation.mutate({ name: newKeyName, tier: newKeyTier })
                      }
                      disabled={!newKeyName.trim() || createKeyMutation.isPending}
                      className="min-h-[44px]"
                    >
                      {createKeyMutation.isPending ? "Creating…" : "Create key"}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setShowCreateForm(false);
                        setNewKeyName("");
                      }}
                      className="min-h-[44px]"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Newly created key — show full key once */}
            {createdKey && (
              <NewKeyAlert
                createdKey={createdKey}
                onDismiss={() => setCreatedKey(null)}
              />
            )}

            {/* Key list */}
            <div className="mt-4 space-y-3">
              {keysLoading2 ? (
                <div className="text-sm text-muted-foreground py-6 text-center">
                  Loading keys…
                </div>
              ) : keysError2 ? (
                <div className="text-sm text-destructive py-6 text-center">
                  Failed to load API keys. Try refreshing the page.
                </div>
              ) : keys.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border py-10 text-center">
                  <Key className="h-8 w-8 mx-auto text-muted-foreground/40 mb-3" aria-hidden="true" />
                  <p className="text-sm text-muted-foreground">
                    No API keys yet. Create one to get started.
                  </p>
                </div>
              ) : (
                keys.map((k) => (
                  <ApiKeyCard
                    key={k.id}
                    apiKey={k}
                    onRevoke={(id) => revokeKeyMutation.mutate(id)}
                  />
                ))
              )}
            </div>
          </section>

          {/* ── Code snippets ────────────────────────────────────────────── */}
          <section aria-labelledby="snippets-heading" className="mb-10">
            <h2 id="snippets-heading" className="text-lg font-semibold mb-4">
              Integration examples
            </h2>

            <Tabs defaultValue="curl">
              <TabsList className="mb-4">
                <TabsTrigger value="curl">curl</TabsTrigger>
                <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                <TabsTrigger value="python">Python</TabsTrigger>
              </TabsList>

              <TabsContent value="curl">
                <CodeBlock code={CODE_SNIPPETS.curl} language="shell" />
              </TabsContent>

              <TabsContent value="javascript">
                <CodeBlock code={CODE_SNIPPETS.javascript} language="javascript" />
              </TabsContent>

              <TabsContent value="python">
                <CodeBlock code={CODE_SNIPPETS.python} language="python" />
              </TabsContent>
            </Tabs>

            {/* Response shape reference */}
            <Card className="mt-4 bg-muted/40 border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Code className="h-4 w-4" aria-hidden="true" />
                  Response shape
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs font-mono leading-relaxed overflow-x-auto">
{`{
  "answer": "string",
  "mode": "daily_operator | diagnostic | decision_support | commercial_lens | board_mode",
  "calls_used": 12,
  "calls_remaining": 488,
  "reset_at": "2026-07-01T00:00:00.000Z"
}`}
                </pre>
              </CardContent>
            </Card>

            {/* Optional parameters reference */}
            <Card className="mt-3 bg-muted/40 border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Optional parameters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div>
                  <span className="font-mono text-xs text-foreground">mode</span>
                  <span className="ml-2">
                    Sets the advisor's frame. Options:{" "}
                    <span className="font-mono text-xs">daily_operator</span> (default),{" "}
                    <span className="font-mono text-xs">diagnostic</span>,{" "}
                    <span className="font-mono text-xs">decision_support</span>,{" "}
                    <span className="font-mono text-xs">commercial_lens</span>,{" "}
                    <span className="font-mono text-xs">board_mode</span>.
                  </span>
                </div>
                <div>
                  <span className="font-mono text-xs text-foreground">context</span>
                  <span className="ml-2">
                    Optional string. Pass operator-specific context (e.g. business type, member count) to personalise responses.
                  </span>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* ── Pricing / upgrade CTA — hidden if user already has a Growth key ── */}
          {!hasGrowthKey && (
            <section aria-labelledby="pricing-heading" className="mb-10">
              <h2 id="pricing-heading" className="text-lg font-semibold mb-4">
                Plans
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Starter */}
                <Card className="border-border">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Starter</CardTitle>
                      <Badge variant="secondary">Current</Badge>
                    </div>
                    <CardDescription>For testing and low-volume integrations</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-2xl font-bold">£49</span>
                      <span className="text-muted-foreground text-sm">/month</span>
                    </div>
                    <ul className="space-y-1.5 text-sm text-muted-foreground">
                      <li>500 API calls per month</li>
                      <li>All 5 advisor modes</li>
                      <li>JSON responses</li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Growth */}
                <Card className="border-primary/40 bg-primary/5">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Growth</CardTitle>
                      <Badge>Most popular</Badge>
                    </div>
                    <CardDescription>For production platforms and live products</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-2xl font-bold">£99</span>
                      <span className="text-muted-foreground text-sm">/month</span>
                    </div>
                    <ul className="space-y-1.5 text-sm text-muted-foreground">
                      <li>2,000 API calls per month</li>
                      <li>All 5 advisor modes</li>
                      <li>Priority support</li>
                    </ul>
                    <a
                      href="mailto:andy@wellnessgenius.co.uk?subject=Operator API - Upgrade to Growth"
                      className="inline-flex items-center gap-2 mt-2"
                    >
                      <Button className="w-full min-h-[44px] gap-2" size="sm">
                        <Mail className="h-4 w-4" aria-hidden="true" />
                        Book a call to upgrade
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              </div>

              <p className="mt-3 text-xs text-muted-foreground">
                Upgrades are handled via email for now. You'll receive a confirmation and an updated API key within one working day.
              </p>
            </section>
          )}

        </div>
      </main>

      <Footer />
    </>
  );
}

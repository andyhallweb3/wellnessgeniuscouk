import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, FileText, Database, Workflow, Shield, FolderTree, Settings, AlertTriangle } from "lucide-react";
import AdminBreadcrumb from "@/components/admin/AdminBreadcrumb";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Loader2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const AdminDocs = () => {
  const { isAdmin, isLoading: authLoading, isAuthenticated } = useAdminAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-heading mb-4">Admin Access Required</h1>
          <Link to="/admin" className="text-accent hover:underline">
            Go to Admin Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Documentation | Admin | Wellness Genius</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <header className="border-b border-border bg-card">
        <div className="container-wide flex items-center justify-between h-16 px-6">
          <Link 
            to="/admin" 
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Admin
          </Link>
        </div>
      </header>

      <div className="container-wide px-6 py-3 border-b border-border/50 bg-muted/30">
        <AdminBreadcrumb currentPage="Documentation" />
      </div>

      <main className="container-wide py-8 px-6 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-accent/10">
              <FileText size={24} className="text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-heading">Wellness Genius Documentation</h1>
              <p className="text-muted-foreground">Architecture, data models, and system overview</p>
            </div>
          </div>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {/* Architecture Map */}
          <AccordionItem value="architecture" className="border rounded-xl px-6">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <Workflow size={20} className="text-blue-600" />
                <span className="font-medium">Architecture Map</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="prose prose-sm max-w-none text-muted-foreground">
              <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React/Vite SPA)                │
│  Pages: Index, Hub, Genie, Coach, Admin, Auth, Blog, News...   │
│  Components: UI (shadcn), Features, Layouts                     │
│  Hooks: useAuth, useCoachCredits, useGenieSessions...          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE SDK (client.ts)                     │
│  Auth │ Database │ Storage │ Realtime │ Edge Functions          │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  EDGE FUNCTIONS │ │   POSTGRES DB   │ │    STORAGE      │
│  (Deno runtime) │ │   (with RLS)    │ │   (Buckets)     │
│                 │ │                 │ │                 │
│ • genie-chat    │ │ • profiles      │ │ • coach-docs    │
│ • ai-coach-chat │ │ • feed_posts    │ │ • avatars       │
│ • founder-agent │ │ • genie_sessions│ │                 │
│ • stripe-*      │ │ • coach_credits │ │                 │
│ • newsletter-*  │ │ • subscriptions │ │                 │
│ • manage-*      │ │ • knowledge_base│ │                 │
└─────────────────┘ └─────────────────┘ └─────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EXTERNAL INTEGRATIONS                       │
│  Stripe (payments) │ Resend (email) │ OpenAI/Gemini (AI)        │
│  Twitter/X (social) │ ZeroBounce (validation)                   │
└─────────────────────────────────────────────────────────────────┘`}
              </pre>
            </AccordionContent>
          </AccordionItem>

          {/* Data Model */}
          <AccordionItem value="data-model" className="border rounded-xl px-6">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <Database size={20} className="text-green-600" />
                <span className="font-medium">Data Model</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="prose prose-sm max-w-none text-muted-foreground">
              <h4 className="text-foreground font-medium mt-4">Core Entities</h4>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Entity</th>
                    <th className="text-left py-2">Key Fields</th>
                    <th className="text-left py-2">Privacy</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 font-mono">coach_profiles</td>
                    <td className="py-2">user_id, business_name, primary_goal</td>
                    <td className="py-2">Private (RLS)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 font-mono">feed_posts</td>
                    <td className="py-2">author_id, content, moderation_status</td>
                    <td className="py-2">Public read, private write</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 font-mono">genie_sessions</td>
                    <td className="py-2">user_id, mode, messages, summary</td>
                    <td className="py-2">Private (RLS)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 font-mono">coach_credits</td>
                    <td className="py-2">user_id, balance, monthly_allowance</td>
                    <td className="py-2">Private (RLS)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 font-mono">knowledge_base</td>
                    <td className="py-2">title, content, category, is_active</td>
                    <td className="py-2">Admin-only write</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 font-mono">professional_scores</td>
                    <td className="py-2">user_id, score, total_posts</td>
                    <td className="py-2">Public read</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 font-mono">newsletter_subscribers</td>
                    <td className="py-2">email, is_active, coupon_code</td>
                    <td className="py-2">Admin-only</td>
                  </tr>
                </tbody>
              </table>

              <h4 className="text-foreground font-medium mt-6">Key Relationships</h4>
              <ul className="list-disc pl-4 space-y-1">
                <li>feed_posts → feed_comments (one-to-many)</li>
                <li>feed_posts → feed_likes (one-to-many)</li>
                <li>user → coach_credits (one-to-one)</li>
                <li>user → genie_sessions (one-to-many)</li>
                <li>user → professional_scores (one-to-one)</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          {/* Core Flows */}
          <AccordionItem value="core-flows" className="border rounded-xl px-6">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <Workflow size={20} className="text-purple-600" />
                <span className="font-medium">Core Flows</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="prose prose-sm max-w-none text-muted-foreground space-y-4">
              <div>
                <h4 className="text-foreground font-medium">Sign Up / Login</h4>
                <ol className="list-decimal pl-4 text-xs space-y-1">
                  <li>User submits email + password on /auth</li>
                  <li>Supabase Auth creates session</li>
                  <li>AuthContext updates, redirects to /hub</li>
                  <li>coach_credits row created on first login</li>
                </ol>
              </div>

              <div>
                <h4 className="text-foreground font-medium">AI Advisor Session</h4>
                <ol className="list-decimal pl-4 text-xs space-y-1">
                  <li>User opens Genie page, selects mode</li>
                  <li>Message sent to genie-chat edge function</li>
                  <li>Function fetches knowledge_base + business_memory</li>
                  <li>Builds prompt with First Principles + Pareto framework</li>
                  <li>Streams response from AI model</li>
                  <li>Session saved to genie_sessions</li>
                  <li>Credits deducted from coach_credits</li>
                </ol>
              </div>

              <div>
                <h4 className="text-foreground font-medium">Feed Post Creation</h4>
                <ol className="list-decimal pl-4 text-xs space-y-1">
                  <li>User submits post content</li>
                  <li>manage-feed edge function validates</li>
                  <li>Post inserted with moderation_status = 'pending'</li>
                  <li>professional_scores updated (+points)</li>
                  <li>Post appears in feed after moderation</li>
                </ol>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Folder Structure */}
          <AccordionItem value="folder-structure" className="border rounded-xl px-6">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <FolderTree size={20} className="text-amber-600" />
                <span className="font-medium">Folder Structure</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="prose prose-sm max-w-none text-muted-foreground">
              <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`src/
├── components/
│   ├── ui/              # shadcn primitives
│   ├── admin/           # Admin-specific components
│   ├── advisor/         # AI advisor UI
│   ├── coach/           # Coach features
│   ├── feed/            # Community feed
│   ├── genie/           # Genie dashboard
│   ├── hub/             # Member hub widgets
│   └── newsletter/      # Newsletter admin
│
├── contexts/
│   └── AuthContext.tsx  # Global auth state
│
├── hooks/
│   ├── useAdminAuth.ts
│   ├── useCoachCredits.ts
│   ├── useGenieSessions.ts
│   └── ...
│
├── pages/
│   ├── Index.tsx        # Landing page
│   ├── Auth.tsx         # Login/signup
│   ├── MemberHub.tsx    # Dashboard
│   ├── Genie.tsx        # AI advisor
│   ├── Admin.tsx        # Admin dashboard
│   └── ...
│
├── integrations/
│   └── supabase/
│       ├── client.ts    # Auto-generated
│       └── types.ts     # Auto-generated
│
└── lib/
    ├── utils.ts
    └── logger.ts

supabase/
├── functions/
│   ├── genie-chat/
│   ├── ai-coach-chat/
│   ├── manage-feed/
│   ├── stripe-*/
│   └── newsletter-*/
│
└── migrations/          # Database migrations`}
              </pre>
            </AccordionContent>
          </AccordionItem>

          {/* Security */}
          <AccordionItem value="security" className="border rounded-xl px-6">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <Shield size={20} className="text-red-600" />
                <span className="font-medium">Security & Abuse Prevention</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="prose prose-sm max-w-none text-muted-foreground">
              <h4 className="text-foreground font-medium mt-4">Row Level Security (RLS)</h4>
              <ul className="list-disc pl-4 text-xs space-y-1">
                <li>All user data tables have RLS enabled</li>
                <li>Users can only read/write their own data</li>
                <li>Admin role checked via has_role() function</li>
              </ul>

              <h4 className="text-foreground font-medium mt-4">Rate Limiting</h4>
              <ul className="list-disc pl-4 text-xs space-y-1">
                <li>Credit system limits AI usage</li>
                <li>Feed posting limited by professional_scores</li>
                <li>Edge functions validate auth headers</li>
              </ul>

              <h4 className="text-foreground font-medium mt-4">Moderation</h4>
              <ul className="list-disc pl-4 text-xs space-y-1">
                <li>feed_posts have moderation_status enum</li>
                <li>feed_reports table for user flagging</li>
                <li>professional_scores track community behavior</li>
                <li>Repeat offenders can be suspended</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          {/* Architecture Decisions */}
          <AccordionItem value="decisions" className="border rounded-xl px-6">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <Settings size={20} className="text-slate-600" />
                <span className="font-medium">Architecture Decisions</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="prose prose-sm max-w-none text-muted-foreground">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Decision</th>
                    <th className="text-left py-2">Choice</th>
                    <th className="text-left py-2">Rationale</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2">Architecture</td>
                    <td className="py-2">Monolith</td>
                    <td className="py-2">Simplicity, fast iteration</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Database</td>
                    <td className="py-2">Postgres (Supabase)</td>
                    <td className="py-2">RLS, realtime, managed</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Auth</td>
                    <td className="py-2">Email/Password</td>
                    <td className="py-2">Simple, no OAuth complexity</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">State</td>
                    <td className="py-2">React Query + Context</td>
                    <td className="py-2">Caching, no Redux overhead</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">AI</td>
                    <td className="py-2">Lovable AI Gateway</td>
                    <td className="py-2">No API keys, usage-based</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Payments</td>
                    <td className="py-2">Stripe</td>
                    <td className="py-2">Industry standard, webhooks</td>
                  </tr>
                </tbody>
              </table>
            </AccordionContent>
          </AccordionItem>

          {/* MVP Scope */}
          <AccordionItem value="mvp-scope" className="border rounded-xl px-6">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <AlertTriangle size={20} className="text-orange-600" />
                <span className="font-medium">MVP Scope Guardrails</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="prose prose-sm max-w-none text-muted-foreground">
              <h4 className="text-foreground font-medium mt-4">✅ In Scope</h4>
              <ul className="list-disc pl-4 text-xs space-y-1">
                <li>Email auth with auto-confirm</li>
                <li>AI Advisor (Genie) with modes</li>
                <li>Community feed with posts/comments/likes</li>
                <li>Credit system for AI usage</li>
                <li>Newsletter with subscriber management</li>
                <li>Basic admin dashboard</li>
              </ul>

              <h4 className="text-foreground font-medium mt-4">❌ Out of Scope (Future)</h4>
              <ul className="list-disc pl-4 text-xs space-y-1">
                <li>OAuth providers (Google, Apple)</li>
                <li>Native mobile apps</li>
                <li>Real-time chat between users</li>
                <li>Advanced analytics dashboard</li>
                <li>Multi-tenancy / white-label</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </main>
    </div>
  );
};

export default AdminDocs;

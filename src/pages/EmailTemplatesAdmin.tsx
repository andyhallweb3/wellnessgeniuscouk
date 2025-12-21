import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Mail,
  Plus,
  Edit,
  Trash2,
  Eye,
  Copy,
  ArrowLeft,
  Loader2,
  Check,
  Download,
  ArrowUp,
  ArrowDown,
  Send,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EmailTemplate {
  id: string;
  name: string;
  slug: string;
  subject: string;
  preview_text: string | null;
  html_content: string;
  sequence_order: number;
  is_active: boolean;
  template_type: string;
  variables: string[];
  created_at: string;
  updated_at: string;
}

const DEFAULT_TEMPLATES: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    name: "Welcome to Wellness Genius",
    slug: "welcome",
    subject: "Welcome to Wellness Genius: how to use the stack properly",
    preview_text: "A simple order of operations that saves time, budget, and credibility.",
    html_content: `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Welcome to Wellness Genius</title>
  </head>
  <body style="margin:0;padding:0;background:#0b0f0e;font-family:Arial,Helvetica,sans-serif;color:#e8f0ee;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0b0f0e;">
      <tr>
        <td align="center" style="padding:24px 16px;">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:#0f1513;border:1px solid #1b2a26;border-radius:14px;overflow:hidden;">
            <tr>
              <td style="padding:22px 22px 10px 22px;">
                <div style="font-size:14px;letter-spacing:0.4px;color:#9fb6b0;">WELLNESS GENIUS</div>
                <h1 style="margin:10px 0 8px 0;font-size:24px;line-height:1.25;color:#e8f0ee;">Welcome, {{contact.firstname}}.</h1>
                <p style="margin:0 0 14px 0;font-size:16px;line-height:1.55;color:#cfe0dc;">
                  You now have access to the Wellness Genius stack: decision infrastructure for wellness leaders who want clarity before they spend money, time, or trust on the wrong initiatives.
                </p>
                <p style="margin:0 0 14px 0;font-size:16px;line-height:1.55;color:#cfe0dc;">
                  The key point: the stack is designed to be used in sequence. Skipping steps usually creates AI theatre, over-incentivisation, or a dashboard full of metrics nobody trusts.
                </p>
                <div style="background:#0b0f0e;border:1px solid #1b2a26;border-radius:12px;padding:14px 14px;margin:16px 0;">
                  <p style="margin:0;font-size:14px;line-height:1.55;color:#cfe0dc;">
                    The principle: <strong style="color:#e8f0ee;">Clarity before tools. Behaviour before automation. Control before scale.</strong>
                  </p>
                </div>
                <p style="margin:0 0 10px 0;font-size:16px;line-height:1.55;color:#cfe0dc;">
                  Start here:
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 22px 22px 22px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:separate;border-spacing:0;">
                  <tr>
                    <td style="padding:12px 0;border-top:1px solid #1b2a26;">
                      <p style="margin:0;font-size:15px;line-height:1.5;color:#e8f0ee;">
                        1) AI Readiness Score
                        <span style="color:#9fb6b0;">— establish reality</span>
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:12px 0;border-top:1px solid #1b2a26;">
                      <p style="margin:0;font-size:15px;line-height:1.5;color:#e8f0ee;">
                        2) Build vs Buy
                        <span style="color:#9fb6b0;">— choose the right path</span>
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:12px 0;border-top:1px solid #1b2a26;border-bottom:1px solid #1b2a26;">
                      <p style="margin:0;font-size:15px;line-height:1.5;color:#e8f0ee;">
                        3) Engagement Systems + Engagement→Revenue
                        <span style="color:#9fb6b0;">— build value you can defend</span>
                      </p>
                    </td>
                  </tr>
                </table>
                <div style="padding:18px 0 0 0;">
                  <a href="{{site_url}}/hub" style="display:inline-block;background:#16d1a3;color:#06211a;text-decoration:none;font-weight:bold;font-size:16px;padding:12px 16px;border-radius:10px;">
                    Open My Intelligence Hub
                  </a>
                </div>
                <p style="margin:14px 0 0 0;font-size:13px;line-height:1.55;color:#9fb6b0;">
                  If you only do one thing this week: run the AI Readiness Score and share the Executive Summary with whoever controls budget.
                </p>
              </td>
            </tr>
          </table>
          <p style="margin:14px 0 0 0;font-size:12px;color:#6f8580;">
            Wellness Genius. Practical intelligence for wellness businesses.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`,
    sequence_order: 1,
    is_active: true,
    template_type: "onboarding",
    variables: ["contact.firstname", "site_url"],
  },
  {
    name: "Step 1-2: Reality then Decision",
    slug: "step-1-2",
    subject: "Step 1 and 2: reality first, then the build decision",
    preview_text: "Run the Readiness Score. Then decide build vs buy without guessing.",
    html_content: `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#0b0f0e;font-family:Arial,Helvetica,sans-serif;color:#e8f0ee;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:#0f1513;border:1px solid #1b2a26;border-radius:14px;">
          <tr>
            <td style="padding:22px;">
              <div style="font-size:14px;color:#9fb6b0;">WELLNESS GENIUS STACK</div>
              <h2 style="margin:10px 0 10px 0;font-size:22px;line-height:1.25;">Step 1 and 2: establish reality, then choose a path</h2>
              <p style="margin:0 0 12px 0;font-size:16px;line-height:1.6;color:#cfe0dc;">
                Most teams jump straight to tools. That's how you end up with AI pilots that impress nobody, and engagement dashboards that never reach finance.
              </p>
              <div style="background:#0b0f0e;border:1px solid #1b2a26;border-radius:12px;padding:14px;margin:14px 0;">
                <p style="margin:0;font-size:15px;line-height:1.55;color:#cfe0dc;">
                  <strong style="color:#e8f0ee;">Step 1: AI Readiness Score</strong><br>
                  You're not aiming for a high score. You're aiming for a truthful baseline and a prioritised 90-day fix plan.
                </p>
              </div>
              <div style="background:#0b0f0e;border:1px solid #1b2a26;border-radius:12px;padding:14px;margin:14px 0;">
                <p style="margin:0;font-size:15px;line-height:1.55;color:#cfe0dc;">
                  <strong style="color:#e8f0ee;">Step 2: Build vs Buy</strong><br>
                  Decide whether to build, buy, partner, or wait. Document the decision so it doesn't get re-litigated every month.
                </p>
              </div>
              <p style="margin:0 0 14px 0;font-size:15px;line-height:1.6;color:#cfe0dc;">
                If your Readiness Score flags low confidence, the correct next move is usually boring: definitions, data hygiene, and trust. That's not a setback. That's what prevents wasted spend.
              </p>
              <a href="{{site_url}}/hub/ai-readiness" style="display:inline-block;background:#16d1a3;color:#06211a;text-decoration:none;font-weight:bold;font-size:16px;padding:12px 16px;border-radius:10px;margin-right:10px;">
                Run Readiness Score
              </a>
              <a href="{{site_url}}/hub/build-vs-buy" style="display:inline-block;background:#0b0f0e;color:#e8f0ee;text-decoration:none;font-weight:bold;font-size:16px;padding:12px 16px;border-radius:10px;border:1px solid #1b2a26;">
                Open Build vs Buy
              </a>
              <p style="margin:14px 0 0 0;font-size:13px;line-height:1.55;color:#9fb6b0;">
                Use this rule: if you cannot describe the decision AI will improve in one sentence, you are not ready to build it.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    sequence_order: 2,
    is_active: true,
    template_type: "onboarding",
    variables: ["site_url"],
  },
  {
    name: "Step 3-4: AI Builder + Engagement",
    slug: "step-3-4",
    subject: "The bit most teams skip: define decisions, then fix engagement",
    preview_text: "Use the AI Builder prompts, then install behaviour-first engagement systems.",
    html_content: `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#0b0f0e;font-family:Arial,Helvetica,sans-serif;color:#e8f0ee;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:#0f1513;border:1px solid #1b2a26;border-radius:14px;">
          <tr>
            <td style="padding:22px;">
              <div style="font-size:14px;color:#9fb6b0;">WELLNESS GENIUS STACK</div>
              <h2 style="margin:10px 0 10px 0;font-size:22px;line-height:1.25;">Step 3 and 4: define AI properly, then fix engagement systems</h2>
              <p style="margin:0 0 12px 0;font-size:16px;line-height:1.6;color:#cfe0dc;">
                AI should support decisions. Engagement should shape behaviour. If either becomes "more content" or "more features", you'll burn time and margin.
              </p>
              <div style="background:#0b0f0e;border:1px solid #1b2a26;border-radius:12px;padding:14px;margin:14px 0;">
                <p style="margin:0;font-size:15px;line-height:1.55;color:#cfe0dc;">
                  <strong style="color:#e8f0ee;">Step 3: Wellness AI Builder</strong><br>
                  Use the C.L.E.A.R prompts to lock purpose, map the user decision, run the data reality check, and pass the governance test.
                </p>
              </div>
              <div style="background:#0b0f0e;border:1px solid #1b2a26;border-radius:12px;padding:14px;margin:14px 0;">
                <p style="margin:0;font-size:15px;line-height:1.55;color:#cfe0dc;">
                  <strong style="color:#e8f0ee;">Step 4: Engagement Systems Playbook</strong><br>
                  Install the Habit→Outcome Map and the Intervention Ladder. This is where retention improves without incentives becoming your business model.
                </p>
              </div>
              <p style="margin:0 0 14px 0;font-size:15px;line-height:1.6;color:#cfe0dc;">
                A quick rule: if the only way you can improve retention is by increasing rewards, your engagement system is not working. Fix the system before you fund the symptoms.
              </p>
              <a href="{{site_url}}/hub/ai-builder" style="display:inline-block;background:#16d1a3;color:#06211a;text-decoration:none;font-weight:bold;font-size:16px;padding:12px 16px;border-radius:10px;margin-right:10px;">
                Open AI Builder
              </a>
              <a href="{{site_url}}/hub/engagement-systems" style="display:inline-block;background:#0b0f0e;color:#e8f0ee;text-decoration:none;font-weight:bold;font-size:16px;padding:12px 16px;border-radius:10px;border:1px solid #1b2a26;">
                Open Engagement Systems
              </a>
              <p style="margin:14px 0 0 0;font-size:13px;line-height:1.55;color:#9fb6b0;">
                If you want a fast win: build one churn rescue workflow using IF/THEN logic and test it for 14 days.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    sequence_order: 3,
    is_active: true,
    template_type: "onboarding",
    variables: ["site_url"],
  },
  {
    name: "Step 5-6: Revenue + Activation",
    slug: "step-5-6",
    subject: "Make engagement defensible, then execute without AI theatre",
    preview_text: "CFO language first. 90-day discipline second.",
    html_content: `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#0b0f0e;font-family:Arial,Helvetica,sans-serif;color:#e8f0ee;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:#0f1513;border:1px solid #1b2a26;border-radius:14px;">
          <tr>
            <td style="padding:22px;">
              <div style="font-size:14px;color:#9fb6b0;">WELLNESS GENIUS STACK</div>
              <h2 style="margin:10px 0 10px 0;font-size:22px;line-height:1.25;">Step 5 and 6: CFO language, then disciplined activation</h2>
              <p style="margin:0 0 12px 0;font-size:16px;line-height:1.6;color:#cfe0dc;">
                If engagement cannot be translated into retention and value, it will never get protected budget. And if activation has no stop rules, it turns into theatre.
              </p>
              <div style="background:#0b0f0e;border:1px solid #1b2a26;border-radius:12px;padding:14px;margin:14px 0;">
                <p style="margin:0;font-size:15px;line-height:1.55;color:#cfe0dc;">
                  <strong style="color:#e8f0ee;">Step 5: Engagement → Revenue Framework</strong><br>
                  Translate behaviours into retention sensitivity and LTV impact using conservative ranges that finance teams accept.
                </p>
              </div>
              <div style="background:#0b0f0e;border:1px solid #1b2a26;border-radius:12px;padding:14px;margin:14px 0;">
                <p style="margin:0;font-size:15px;line-height:1.55;color:#cfe0dc;">
                  <strong style="color:#e8f0ee;">Step 6: 90-Day AI Activation Playbook</strong><br>
                  Follow the month-by-month structure: foundations, journeys, monetisation experiments. AI comes last, not first.
                </p>
              </div>
              <p style="margin:0 0 14px 0;font-size:15px;line-height:1.6;color:#cfe0dc;">
                If you want to look credible fast: export one board-safe KPI set and one conservative model range. That shifts internal conversations immediately.
              </p>
              <a href="{{site_url}}/hub/engagement-revenue" style="display:inline-block;background:#16d1a3;color:#06211a;text-decoration:none;font-weight:bold;font-size:16px;padding:12px 16px;border-radius:10px;margin-right:10px;">
                Open Engagement → Revenue
              </a>
              <a href="{{site_url}}/hub/90-day-activation" style="display:inline-block;background:#0b0f0e;color:#e8f0ee;text-decoration:none;font-weight:bold;font-size:16px;padding:12px 16px;border-radius:10px;border:1px solid #1b2a26;">
                Open 90-Day Activation
              </a>
              <p style="margin:14px 0 0 0;font-size:13px;line-height:1.55;color:#9fb6b0;">
                Quick check: if your plan doesn't include a stop rule, it's not a plan. It's hope with a timeline.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    sequence_order: 4,
    is_active: true,
    template_type: "onboarding",
    variables: ["site_url"],
  },
  {
    name: "Ongoing: Prompt Library + AI Coach",
    slug: "ongoing",
    subject: "Your ongoing advantage: judgement on demand",
    preview_text: "Use the Coach for decisions. Use prompts for repeatable systems.",
    html_content: `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#0b0f0e;font-family:Arial,Helvetica,sans-serif;color:#e8f0ee;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:#0f1513;border:1px solid #1b2a26;border-radius:14px;">
          <tr>
            <td style="padding:22px;">
              <div style="font-size:14px;color:#9fb6b0;">WELLNESS GENIUS</div>
              <h2 style="margin:10px 0 10px 0;font-size:22px;line-height:1.25;">Use the stack once. Then keep the judgement layer.</h2>
              <p style="margin:0 0 12px 0;font-size:16px;line-height:1.6;color:#cfe0dc;">
                The value compounds when you stop making the same decisions repeatedly. That's what the Prompt Library and AI Coach are for.
              </p>
              <div style="background:#0b0f0e;border:1px solid #1b2a26;border-radius:12px;padding:14px;margin:14px 0;">
                <p style="margin:0;font-size:15px;line-height:1.55;color:#cfe0dc;">
                  <strong style="color:#e8f0ee;">Prompt Library</strong><br>
                  Use C.L.E.A.R prompts to standardise decision-making across teams: engagement systems, monetisation logic, governance checks.
                </p>
              </div>
              <div style="background:#0b0f0e;border:1px solid #1b2a26;border-radius:12px;padding:14px;margin:14px 0;">
                <p style="margin:0;font-size:15px;line-height:1.55;color:#cfe0dc;">
                  <strong style="color:#e8f0ee;">AI Coach</strong><br>
                  Use the Coach when trade-offs matter: build vs buy decisions, retention strategy, monetisation structure, governance concerns.
                </p>
              </div>
              <p style="margin:0 0 14px 0;font-size:15px;line-height:1.6;color:#cfe0dc;">
                If you're unsure what to do next, ask the Coach this question:<br>
                <strong style="color:#e8f0ee;">"What decision are we failing to make well right now, and what would change if we fixed it?"</strong>
              </p>
              <a href="{{site_url}}/hub/prompt-library" style="display:inline-block;background:#16d1a3;color:#06211a;text-decoration:none;font-weight:bold;font-size:16px;padding:12px 16px;border-radius:10px;margin-right:10px;">
                Open Prompt Library
              </a>
              <a href="{{site_url}}/hub/ai-coach" style="display:inline-block;background:#0b0f0e;color:#e8f0ee;text-decoration:none;font-weight:bold;font-size:16px;padding:12px 16px;border-radius:10px;border:1px solid #1b2a26;">
                Ask the AI Coach
              </a>
              <p style="margin:14px 0 0 0;font-size:13px;line-height:1.55;color:#9fb6b0;">
                Want the fastest improvement? Re-run the AI Readiness Score every 90 days and compare deltas. Decisions get easier when evidence accumulates.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    sequence_order: 5,
    is_active: true,
    template_type: "onboarding",
    variables: ["site_url"],
  },
];

const EmailTemplatesAdmin = () => {
  const { isAdmin, isLoading: authLoading } = useAdminAuth();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sampleData, setSampleData] = useState({
    firstname: "Sarah",
    siteUrl: "https://wellnessgenius.co",
  });
  const [testEmail, setTestEmail] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    subject: "",
    preview_text: "",
    html_content: "",
    is_active: true,
  });

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate("/");
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchTemplates();
    }
  }, [isAdmin]);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .eq("template_type", "onboarding")
        .order("sequence_order", { ascending: true });

      if (error) throw error;
      
      // Cast the data to our interface, handling the variables array
      const typedData = (data || []).map(t => ({
        ...t,
        variables: Array.isArray(t.variables) ? t.variables : []
      })) as EmailTemplate[];
      
      setTemplates(typedData);
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast.error("Failed to load email templates");
    } finally {
      setIsLoading(false);
    }
  };

  const seedDefaultTemplates = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("email_templates")
        .insert(DEFAULT_TEMPLATES);

      if (error) throw error;
      
      toast.success("Default templates created successfully");
      fetchTemplates();
    } catch (error) {
      console.error("Error seeding templates:", error);
      toast.error("Failed to create default templates");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.slug || !formData.subject || !formData.html_content) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSaving(true);
    try {
      if (selectedTemplate) {
        // Update existing
        const { error } = await supabase
          .from("email_templates")
          .update({
            name: formData.name,
            slug: formData.slug,
            subject: formData.subject,
            preview_text: formData.preview_text || null,
            html_content: formData.html_content,
            is_active: formData.is_active,
          })
          .eq("id", selectedTemplate.id);

        if (error) throw error;
        toast.success("Template updated successfully");
      } else {
        // Create new
        const maxOrder = templates.length > 0 
          ? Math.max(...templates.map(t => t.sequence_order)) 
          : 0;
        
        const { error } = await supabase
          .from("email_templates")
          .insert({
            name: formData.name,
            slug: formData.slug,
            subject: formData.subject,
            preview_text: formData.preview_text || null,
            html_content: formData.html_content,
            is_active: formData.is_active,
            sequence_order: maxOrder + 1,
            template_type: "onboarding",
          });

        if (error) throw error;
        toast.success("Template created successfully");
      }

      setIsEditing(false);
      setSelectedTemplate(null);
      resetForm();
      fetchTemplates();
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Failed to save template");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("email_templates")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      toast.success("Template deleted successfully");
      setDeleteConfirmId(null);
      fetchTemplates();
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("Failed to delete template");
    }
  };

  const handleMoveOrder = async (template: EmailTemplate, direction: 'up' | 'down') => {
    const currentIndex = templates.findIndex(t => t.id === template.id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= templates.length) return;
    
    const targetTemplate = templates[targetIndex];
    
    try {
      // Swap sequence orders
      await supabase
        .from("email_templates")
        .update({ sequence_order: targetTemplate.sequence_order })
        .eq("id", template.id);
        
      await supabase
        .from("email_templates")
        .update({ sequence_order: template.sequence_order })
        .eq("id", targetTemplate.id);
      
      fetchTemplates();
    } catch (error) {
      console.error("Error reordering:", error);
      toast.error("Failed to reorder templates");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      subject: "",
      preview_text: "",
      html_content: "",
      is_active: true,
    });
  };

  const openEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      slug: template.slug,
      subject: template.subject,
      preview_text: template.preview_text || "",
      html_content: template.html_content,
      is_active: template.is_active,
    });
    setIsEditing(true);
  };

  const openCreate = () => {
    setSelectedTemplate(null);
    resetForm();
    setIsEditing(true);
  };

  const renderWithSampleData = (html: string): string => {
    let rendered = html;
    rendered = rendered.split("{{contact.firstname}}").join(sampleData.firstname);
    rendered = rendered.split("{{site_url}}").join(sampleData.siteUrl);
    return rendered;
  };

  const copyHtml = async (template: EmailTemplate) => {
    try {
      await navigator.clipboard.writeText(template.html_content);
      setCopiedId(template.id);
      toast.success("HTML copied to clipboard");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Failed to copy HTML");
    }
  };

  const copyRenderedHtml = async (html: string) => {
    try {
      const rendered = renderWithSampleData(html);
      await navigator.clipboard.writeText(rendered);
      toast.success("Rendered HTML copied to clipboard");
    } catch {
      toast.error("Failed to copy rendered HTML");
    }
  };

  const sendTestEmail = async (html: string, subject: string) => {
    if (!testEmail) {
      toast.error("Please enter an email address");
      return;
    }

    setIsSendingTest(true);
    try {
      const renderedHtml = renderWithSampleData(html);
      const { data, error } = await supabase.functions.invoke("send-test-email", {
        body: {
          to: testEmail,
          subject: subject,
          html: renderedHtml,
        },
      });

      if (error) throw error;
      toast.success(`Test email sent to ${testEmail}`);
    } catch (error) {
      console.error("Error sending test email:", error);
      toast.error("Failed to send test email");
    } finally {
      setIsSendingTest(false);
    }
  };

  const exportAllAsJson = () => {
    const exportData = templates.map(t => ({
      name: t.name,
      subject: t.subject,
      preview_text: t.preview_text,
      html_content: t.html_content,
      sequence_order: t.sequence_order,
    }));
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hubspot-email-templates.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Templates exported as JSON");
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Email Templates Admin | Wellness Genius</title>
      </Helmet>

      <Header />

      <main className="pt-24 pb-16">
        <div className="container-wide section-padding">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin">
                  <ArrowLeft size={16} />
                  Back to Admin
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-heading">Email Templates</h1>
                <p className="text-muted-foreground text-sm">Manage HubSpot onboarding email series</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={exportAllAsJson} disabled={templates.length === 0}>
                <Download size={16} />
                Export JSON
              </Button>
              <Button variant="accent" onClick={openCreate}>
                <Plus size={16} />
                Add Template
              </Button>
            </div>
          </div>

          {/* Templates List */}
          {templates.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <Mail className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-heading mb-2">No email templates yet</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Get started by loading the default onboarding email series for HubSpot.
              </p>
              <Button variant="accent" onClick={seedDefaultTemplates} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus size={16} />}
                Load Default Templates
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {templates.map((template, index) => (
                <div
                  key={template.id}
                  className={`rounded-xl border bg-card p-5 ${
                    template.is_active ? 'border-border' : 'border-border/50 opacity-60'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Order Controls */}
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleMoveOrder(template, 'up')}
                        disabled={index === 0}
                      >
                        <ArrowUp size={14} />
                      </Button>
                      <span className="text-xs text-center text-muted-foreground">{template.sequence_order}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleMoveOrder(template, 'down')}
                        disabled={index === templates.length - 1}
                      >
                        <ArrowDown size={14} />
                      </Button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-heading text-base">{template.name}</h3>
                        {!template.is_active && (
                          <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        <strong>Subject:</strong> {template.subject}
                      </p>
                      {template.preview_text && (
                        <p className="text-sm text-muted-foreground/70 truncate">
                          <strong>Preview:</strong> {template.preview_text}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedTemplate(template);
                          setIsPreviewOpen(true);
                        }}
                      >
                        <Eye size={14} />
                        Preview
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyHtml(template)}
                      >
                        {copiedId === template.id ? (
                          <Check size={14} className="text-green-500" />
                        ) : (
                          <Copy size={14} />
                        )}
                        Copy HTML
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(template)}>
                        <Edit size={14} />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteConfirmId(template.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Edit/Create Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate ? "Edit Email Template" : "Create Email Template"}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="content" className="mt-4">
            <TabsList>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="html">HTML</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Template Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Welcome Email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g. welcome"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject Line *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Email subject line"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preview_text">Preview Text</Label>
                <Input
                  id="preview_text"
                  value={formData.preview_text}
                  onChange={(e) => setFormData({ ...formData, preview_text: e.target.value })}
                  placeholder="Text shown in email client preview"
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </TabsContent>

            <TabsContent value="html" className="mt-4">
              <div className="space-y-2">
                <Label htmlFor="html_content">HTML Content *</Label>
                <Textarea
                  id="html_content"
                  value={formData.html_content}
                  onChange={(e) => setFormData({ ...formData, html_content: e.target.value })}
                  className="font-mono text-sm min-h-[400px]"
                  placeholder="Paste your HTML email content here..."
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Variables: {"{{contact.firstname}}"}, {"{{site_url}}"}, etc.
              </p>
            </TabsContent>

            <TabsContent value="preview" className="mt-4">
              <div className="mb-3 p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-xs text-muted-foreground mb-2">
                  <strong>Edit sample data for preview:</strong>
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">{"{{contact.firstname}}"}</Label>
                    <Input
                      value={sampleData.firstname}
                      onChange={(e) => setSampleData({ ...sampleData, firstname: e.target.value })}
                      placeholder="First name"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{"{{site_url}}"}</Label>
                    <Input
                      value={sampleData.siteUrl}
                      onChange={(e) => setSampleData({ ...sampleData, siteUrl: e.target.value })}
                      placeholder="Site URL"
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mb-3">
                <div className="flex-1 flex gap-2">
                  <Input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="Enter email for test send..."
                    className="h-9 text-sm"
                  />
                  <Button
                    variant="accent"
                    size="sm"
                    onClick={() => sendTestEmail(formData.html_content, formData.subject)}
                    disabled={isSendingTest || !testEmail}
                  >
                    {isSendingTest ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    Send Test
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyRenderedHtml(formData.html_content)}
                >
                  <Copy size={14} />
                  Copy Rendered HTML
                </Button>
              </div>
              <div className="rounded-lg border border-border overflow-hidden bg-white">
                <iframe
                  srcDoc={renderWithSampleData(formData.html_content) || "<p>No content to preview</p>"}
                  className="w-full h-[500px]"
                  title="Email Preview"
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button variant="accent" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {selectedTemplate ? "Update Template" : "Create Template"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{selectedTemplate?.name}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-3">
            <div className="text-sm">
              <strong>Subject:</strong> {selectedTemplate?.subject}
            </div>
            {selectedTemplate?.preview_text && (
              <div className="text-sm text-muted-foreground">
                <strong>Preview:</strong> {selectedTemplate.preview_text}
              </div>
            )}
            <div className="mb-3 p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground mb-2">
                <strong>Edit sample data for preview:</strong>
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">{"{{contact.firstname}}"}</Label>
                  <Input
                    value={sampleData.firstname}
                    onChange={(e) => setSampleData({ ...sampleData, firstname: e.target.value })}
                    placeholder="First name"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{"{{site_url}}"}</Label>
                  <Input
                    value={sampleData.siteUrl}
                    onChange={(e) => setSampleData({ ...sampleData, siteUrl: e.target.value })}
                    placeholder="Site URL"
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mb-3">
              <div className="flex-1 flex gap-2">
                <Input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="Enter email for test send..."
                  className="h-9 text-sm"
                />
                <Button
                  variant="accent"
                  size="sm"
                  onClick={() => selectedTemplate && sendTestEmail(selectedTemplate.html_content, selectedTemplate.subject)}
                  disabled={isSendingTest || !testEmail}
                >
                  {isSendingTest ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  Send Test
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => selectedTemplate && copyRenderedHtml(selectedTemplate.html_content)}
              >
                <Copy size={14} />
                Copy Rendered HTML
              </Button>
            </div>
            <div className="rounded-lg border border-border overflow-hidden bg-white">
              <iframe
                srcDoc={selectedTemplate ? renderWithSampleData(selectedTemplate.html_content) : ""}
                className="w-full h-[500px]"
                title="Email Preview"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Email Template?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The email template will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EmailTemplatesAdmin;

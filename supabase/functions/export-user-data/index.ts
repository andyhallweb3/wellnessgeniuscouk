import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // SECURITY: Verify authentication first
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("Export request rejected: No authorization header");
      return new Response(
        JSON.stringify({ error: "Authentication required. Please log in to export your data." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create client with user's token to verify their identity
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    
    if (authError || !user) {
      console.error("Export request rejected: Invalid or expired token", authError?.message);
      return new Response(
        JSON.stringify({ error: "Invalid or expired session. Please log in again." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // The authenticated user's email - this is the ONLY email they can export
    const authenticatedEmail = user.email?.trim().toLowerCase();
    
    if (!authenticatedEmail) {
      console.error("Export request rejected: User has no email");
      return new Response(
        JSON.stringify({ error: "Unable to determine your email address." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing authenticated data export for user: ${user.id}, email: ${authenticatedEmail}`);

    // Use service role for data access (bypasses RLS for comprehensive export)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Initialize export data object
    const exportData: Record<string, unknown> = {
      exportDate: new Date().toISOString(),
      email: authenticatedEmail,
      userId: user.id,
      data: {},
    };

    // 1. Get profile data (by email from profiles table)
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", authenticatedEmail)
      .single();

    if (profileData) {
      exportData.data = {
        ...exportData.data as object,
        profile: {
          id: profileData.id,
          email: profileData.email,
          fullName: profileData.full_name,
          createdAt: profileData.created_at,
          updatedAt: profileData.updated_at,
        },
      };

      const userId = profileData.id;

      // 2. Get coach profile
      const { data: coachProfile } = await supabase
        .from("coach_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (coachProfile) {
        (exportData.data as Record<string, unknown>).coachProfile = {
          businessName: coachProfile.business_name,
          businessType: coachProfile.business_type,
          businessSizeBand: coachProfile.business_size_band,
          role: coachProfile.role,
          teamSize: coachProfile.team_size,
          primaryGoal: coachProfile.primary_goal,
          aiExperience: coachProfile.ai_experience,
          currentTech: coachProfile.current_tech,
          decisionStyle: coachProfile.decision_style,
          frustration: coachProfile.frustration,
          biggestWin: coachProfile.biggest_win,
          onboardingCompleted: coachProfile.onboarding_completed,
          createdAt: coachProfile.created_at,
          updatedAt: coachProfile.updated_at,
        };
      }

      // 3. Get coach credits
      const { data: coachCredits } = await supabase
        .from("coach_credits")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (coachCredits) {
        (exportData.data as Record<string, unknown>).coachCredits = {
          balance: coachCredits.balance,
          monthlyAllowance: coachCredits.monthly_allowance,
          lastResetAt: coachCredits.last_reset_at,
          createdAt: coachCredits.created_at,
        };
      }

      // 4. Get agent sessions (AI coach conversations)
      const { data: agentSessions } = await supabase
        .from("agent_sessions")
        .select("mode, prompt_input, output_text, credit_cost, saved, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (agentSessions && agentSessions.length > 0) {
        (exportData.data as Record<string, unknown>).aiCoachSessions = agentSessions.map((session) => ({
          mode: session.mode,
          prompt: session.prompt_input,
          response: session.output_text,
          creditCost: session.credit_cost,
          saved: session.saved,
          createdAt: session.created_at,
        }));
      }

      // 5. Get credit transactions
      const { data: creditTransactions } = await supabase
        .from("credit_transactions")
        .select("change_amount, reason, mode, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (creditTransactions && creditTransactions.length > 0) {
        (exportData.data as Record<string, unknown>).creditTransactions = creditTransactions;
      }

      // 6. Get saved outputs
      const { data: savedOutputs } = await supabase
        .from("user_saved_outputs")
        .select("title, output_type, data, created_at, updated_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (savedOutputs && savedOutputs.length > 0) {
        (exportData.data as Record<string, unknown>).savedOutputs = savedOutputs;
      }

      // 7. Get user purchases
      const { data: purchases } = await supabase
        .from("user_purchases")
        .select("product_id, product_name, price_paid, currency, purchased_at")
        .eq("user_id", userId)
        .order("purchased_at", { ascending: false });

      if (purchases && purchases.length > 0) {
        (exportData.data as Record<string, unknown>).purchases = purchases;
      }

      // 8. Get coach documents metadata (not the actual files)
      const { data: documents } = await supabase
        .from("coach_documents")
        .select("file_name, file_type, file_size, category, description, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (documents && documents.length > 0) {
        (exportData.data as Record<string, unknown>).uploadedDocuments = documents.map((doc) => ({
          fileName: doc.file_name,
          fileType: doc.file_type,
          fileSize: doc.file_size,
          category: doc.category,
          description: doc.description,
          createdAt: doc.created_at,
        }));
      }
    }

    // 9. Get product downloads (by authenticated email only)
    const { data: downloads } = await supabase
      .from("product_downloads")
      .select("product_id, product_name, product_type, download_type, created_at")
      .eq("email", authenticatedEmail)
      .order("created_at", { ascending: false });

    if (downloads && downloads.length > 0) {
      (exportData.data as Record<string, unknown>).productDownloads = downloads;
    }

    // 10. Get newsletter subscription (by authenticated email only)
    const { data: newsletter } = await supabase
      .from("newsletter_subscribers")
      .select("email, name, source, subscribed_at, is_active")
      .eq("email", authenticatedEmail)
      .single();

    if (newsletter) {
      (exportData.data as Record<string, unknown>).newsletterSubscription = {
        email: newsletter.email,
        name: newsletter.name,
        source: newsletter.source,
        subscribedAt: newsletter.subscribed_at,
        isActive: newsletter.is_active,
      };
    }

    // 11. Get AI Readiness completions (by authenticated email only)
    const { data: readinessCompletions } = await supabase
      .from("ai_readiness_completions")
      .select("name, company, role, industry, company_size, overall_score, leadership_score, data_score, people_score, process_score, risk_score, score_band, completed_at")
      .eq("email", authenticatedEmail)
      .order("completed_at", { ascending: false });

    if (readinessCompletions && readinessCompletions.length > 0) {
      (exportData.data as Record<string, unknown>).aiReadinessAssessments = readinessCompletions;
    }

    console.log(`Data export compiled successfully for authenticated user: ${user.id}`);

    // Return the data as a downloadable JSON
    const jsonData = JSON.stringify(exportData, null, 2);
    const base64Data = btoa(unescape(encodeURIComponent(jsonData)));

    return new Response(
      JSON.stringify({
        success: true,
        downloadUrl: `data:application/json;base64,${base64Data}`,
        filename: `wellness-genius-data-export-${new Date().toISOString().split("T")[0]}.json`,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Data export error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to export data. Please try again later." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

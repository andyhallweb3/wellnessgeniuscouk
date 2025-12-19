import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, completionId, shareToken } = await req.json();

    if (action === "create") {
      if (!completionId) {
        return new Response(
          JSON.stringify({ error: "completionId is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Creating share link for completion: ${completionId}`);

      // Check if a share already exists
      const { data: existing } = await supabase
        .from("report_shares")
        .select("share_token")
        .eq("completion_id", completionId)
        .maybeSingle();

      if (existing) {
        console.log(`Share link already exists: ${existing.share_token}`);
        return new Response(
          JSON.stringify({ shareToken: existing.share_token }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Create new share
      const { data, error } = await supabase
        .from("report_shares")
        .insert({ completion_id: completionId })
        .select("share_token")
        .single();

      if (error) throw error;

      console.log(`Created share link: ${data.share_token}`);
      return new Response(
        JSON.stringify({ shareToken: data.share_token }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "get") {
      if (!shareToken) {
        return new Response(
          JSON.stringify({ error: "shareToken is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Fetching report for share token: ${shareToken}`);

      // Get the share record
      const { data: share, error: shareError } = await supabase
        .from("report_shares")
        .select("*")
        .eq("share_token", shareToken)
        .maybeSingle();

      if (shareError || !share) {
        console.error("Share not found:", shareError);
        return new Response(
          JSON.stringify({ error: "Share link not found or expired" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check expiration
      if (share.expires_at && new Date(share.expires_at) < new Date()) {
        return new Response(
          JSON.stringify({ error: "Share link has expired" }),
          { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get the completion data
      const { data: completion, error: completionError } = await supabase
        .from("ai_readiness_completions")
        .select("*")
        .eq("id", share.completion_id)
        .single();

      if (completionError || !completion) {
        console.error("Completion not found:", completionError);
        return new Response(
          JSON.stringify({ error: "Report not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Increment view count
      await supabase
        .from("report_shares")
        .update({ view_count: share.view_count + 1 })
        .eq("id", share.id);

      console.log(`Returning report data for ${completion.company}`);
      return new Response(
        JSON.stringify({ completion }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in manage-report-shares:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

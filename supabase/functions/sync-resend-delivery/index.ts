import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify admin auth via JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check admin role
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: "Forbidden: Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Starting optimized Resend delivery sync...");

    // Use a single aggregated query to get delivery counts per email
    const { data: deliveryStats, error: statsError } = await supabase
      .from("newsletter_send_recipients")
      .select("email, sent_at")
      .eq("status", "sent")
      .limit(5000); // Limit to prevent memory issues

    if (statsError) {
      console.error("Error fetching delivery stats:", statsError);
      throw statsError;
    }

    // Build delivery counts in memory (fast)
    const deliveryCounts: Record<string, { count: number; lastDelivered: string }> = {};
    
    for (const row of deliveryStats || []) {
      const emailLower = row.email.toLowerCase();
      if (!deliveryCounts[emailLower]) {
        deliveryCounts[emailLower] = { count: 0, lastDelivered: row.sent_at };
      }
      deliveryCounts[emailLower].count += 1;
      if (new Date(row.sent_at) > new Date(deliveryCounts[emailLower].lastDelivered)) {
        deliveryCounts[emailLower].lastDelivered = row.sent_at;
      }
    }

    const uniqueEmails = Object.keys(deliveryCounts);
    console.log(`Aggregated ${deliveryStats?.length || 0} records into ${uniqueEmails.length} unique emails`);

    // Batch update using upsert - much faster than individual updates
    const updates = uniqueEmails.slice(0, 500).map(email => ({
      email,
      delivery_count: deliveryCounts[email].count,
      last_delivered_at: deliveryCounts[email].lastDelivered,
    }));

    let updated = 0;
    
    // Process in batches of 50 to avoid timeout
    const batchSize = 50;
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      
      // Use individual updates but in parallel
      const updatePromises = batch.map(update => 
        supabase
          .from("newsletter_subscribers")
          .update({
            delivery_count: update.delivery_count,
            last_delivered_at: update.last_delivered_at,
          })
          .eq("email", update.email)
      );

      const results = await Promise.all(updatePromises);
      updated += results.filter(r => !r.error).length;
    }

    console.log(`Sync complete: ${updated} subscribers updated`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Synced: ${updated} subscribers updated`,
        stats: {
          sentRecords: deliveryStats?.length || 0,
          uniqueEmails: uniqueEmails.length,
          updated,
        }
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Sync error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

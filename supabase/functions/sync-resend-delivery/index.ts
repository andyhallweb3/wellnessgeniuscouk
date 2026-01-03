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

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Starting Resend delivery sync...");

    // Get all subscribers
    const { data: subscribers, error: subError } = await supabase
      .from("newsletter_subscribers")
      .select("email, delivery_count, last_delivered_at");

    if (subError) {
      console.error("Error fetching subscribers:", subError);
      throw subError;
    }

    console.log(`Found ${subscribers?.length || 0} subscribers to sync`);

    // Fetch emails from Resend API using fetch directly
    let emails: any[] = [];
    try {
      const response = await fetch("https://api.resend.com/emails", {
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        console.error("Resend API error:", response.status, await response.text());
      } else {
        const data = await response.json();
        emails = data.data || [];
        console.log(`Fetched ${emails.length} emails from Resend`);
      }
    } catch (err) {
      console.error("Error fetching emails from Resend:", err);
      // Continue with what we have
    }

    // Build delivery counts per email
    const deliveryCounts: Record<string, { count: number; lastDelivered: string | null }> = {};
    
    for (const email of emails) {
      // Each email has a 'to' array and a 'last_event' status
      const recipients = email.to || [];
      const status = email.last_event;
      const createdAt = email.created_at;
      
      if (status === "delivered" || status === "opened" || status === "clicked") {
        for (const recipient of recipients) {
          const recipientLower = recipient.toLowerCase();
          if (!deliveryCounts[recipientLower]) {
            deliveryCounts[recipientLower] = { count: 0, lastDelivered: null };
          }
          deliveryCounts[recipientLower].count += 1;
          
          // Track most recent delivery
          if (!deliveryCounts[recipientLower].lastDelivered || 
              new Date(createdAt) > new Date(deliveryCounts[recipientLower].lastDelivered!)) {
            deliveryCounts[recipientLower].lastDelivered = createdAt;
          }
        }
      }
    }

    console.log(`Processed delivery data for ${Object.keys(deliveryCounts).length} unique recipients`);

    // Update subscribers with delivery data
    let updated = 0;
    let skipped = 0;

    for (const subscriber of subscribers || []) {
      const emailLower = subscriber.email.toLowerCase();
      const deliveryData = deliveryCounts[emailLower];
      
      if (deliveryData) {
        // Only update if we have new data
        const newCount = deliveryData.count;
        const currentCount = subscriber.delivery_count || 0;
        
        if (newCount > currentCount || !subscriber.last_delivered_at) {
          const { error: updateError } = await supabase
            .from("newsletter_subscribers")
            .update({
              delivery_count: Math.max(newCount, currentCount),
              last_delivered_at: deliveryData.lastDelivered || subscriber.last_delivered_at,
            })
            .eq("email", subscriber.email);

          if (updateError) {
            console.error(`Error updating ${subscriber.email}:`, updateError);
          } else {
            updated++;
          }
        } else {
          skipped++;
        }
      } else {
        skipped++;
      }
    }

    console.log(`Sync complete: ${updated} updated, ${skipped} skipped`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Synced delivery data: ${updated} subscribers updated, ${skipped} skipped`,
        stats: {
          totalSubscribers: subscribers?.length || 0,
          emailsFromResend: emails.length,
          uniqueRecipients: Object.keys(deliveryCounts).length,
          updated,
          skipped,
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

import { supabase } from "@/integrations/supabase/client";

/**
 * Store a lead in newsletter_subscribers (the live table with a public insert policy).
 * `source` records where the lead came from, e.g. "sector-hotels-spas", "ai-readiness", "contact".
 * Duplicate emails are treated as success so we never reveal who is already subscribed.
 */
export async function captureLead(email: string, source: string, name?: string | null) {
  const { error } = await supabase
    .from("newsletter_subscribers")
    .insert({ email: email.trim().toLowerCase(), name: name?.trim() || null, source });
  if (error && error.code !== "23505" && !error.message?.includes("duplicate key")) {
    throw error;
  }
}

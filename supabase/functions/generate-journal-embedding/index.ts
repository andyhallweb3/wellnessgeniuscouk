import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.21.0";
import { getCorsHeaders, corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { journalEntryId, content } = await req.json();
    
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    if (!journalEntryId || !content) {
      throw new Error("journalEntryId and content are required");
    }

    console.log("Generating embedding for journal entry:", journalEntryId);

    // Initialize Gemini for embeddings
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

    // Generate embedding
    const result = await embeddingModel.embedContent(content);
    const embedding = result.embedding.values;

    console.log("Embedding generated, dimension:", embedding.length);

    // Store embedding in database
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    
    const { error: updateError } = await supabase
      .from('founder_journal')
      .update({ embedding: embedding })
      .eq('id', journalEntryId);

    if (updateError) {
      console.error("Error updating journal entry with embedding:", updateError);
      throw updateError;
    }

    console.log("Embedding saved successfully for entry:", journalEntryId);

    return new Response(JSON.stringify({ 
      success: true, 
      embeddingDimension: embedding.length 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error generating embedding:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

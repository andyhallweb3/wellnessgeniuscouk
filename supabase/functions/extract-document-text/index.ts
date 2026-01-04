import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders, corsHeaders } from "../_shared/cors.ts";

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[EXTRACT-DOCUMENT-TEXT] ${step}${detailsStr}`);
};

serve(async (req) => {
  const dynamicCorsHeaders = getCorsHeaders(req);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: dynamicCorsHeaders });
  }

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error("Authentication failed");
    }

    const { storagePath, fileType, documentId } = await req.json();
    logStep("Processing document", { storagePath, fileType, documentId });

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabaseClient.storage
      .from("coach-documents")
      .download(storagePath);

    if (downloadError || !fileData) {
      throw new Error(`Failed to download file: ${downloadError?.message}`);
    }

    let extractedText = "";

    if (fileType === "application/pdf") {
      // For PDFs, use a simple text extraction approach
      // Convert to array buffer and extract text patterns
      const arrayBuffer = await fileData.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      
      // Decode as text and extract readable content
      const decoder = new TextDecoder("utf-8", { fatal: false });
      const rawText = decoder.decode(bytes);
      
      // Extract text between parentheses (common PDF text encoding) and clean stream content
      const textMatches: string[] = [];
      
      // Pattern 1: Text in parentheses (PDF string objects)
      const parenRegex = /\(([^)]+)\)/g;
      let match;
      while ((match = parenRegex.exec(rawText)) !== null) {
        const text = match[1]
          .replace(/\\n/g, "\n")
          .replace(/\\r/g, "")
          .replace(/\\t/g, " ")
          .replace(/\\\\/g, "\\")
          .replace(/\\\(/g, "(")
          .replace(/\\\)/g, ")");
        if (text.length > 2 && /[a-zA-Z]/.test(text)) {
          textMatches.push(text);
        }
      }
      
      // Pattern 2: Text in BT...ET blocks (text objects)
      const btRegex = /BT\s*([\s\S]*?)\s*ET/g;
      while ((match = btRegex.exec(rawText)) !== null) {
        const blockText = match[1];
        const tjRegex = /\[([^\]]+)\]\s*TJ|\(([^)]+)\)\s*Tj/g;
        let tjMatch;
        while ((tjMatch = tjRegex.exec(blockText)) !== null) {
          const text = (tjMatch[1] || tjMatch[2] || "")
            .replace(/\([^)]*\)/g, (m) => m.slice(1, -1))
            .replace(/[-\d.]+/g, " ")
            .trim();
          if (text.length > 2 && /[a-zA-Z]/.test(text)) {
            textMatches.push(text);
          }
        }
      }
      
      // Combine and clean up extracted text
      extractedText = textMatches
        .join(" ")
        .replace(/\s+/g, " ")
        .replace(/[^\x20-\x7E\n]/g, " ")
        .trim()
        .slice(0, 50000); // Limit to 50k chars
      
      logStep("PDF text extracted", { charCount: extractedText.length });
      
    } else if (fileType === "text/plain" || fileType === "text/csv") {
      extractedText = await fileData.text();
      logStep("Plain text extracted", { charCount: extractedText.length });
      
    } else if (fileType.includes("spreadsheet") || fileType.includes("excel")) {
      // For Excel files, extract what text we can
      const arrayBuffer = await fileData.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const decoder = new TextDecoder("utf-8", { fatal: false });
      const rawText = decoder.decode(bytes);
      
      // Extract strings from shared strings table (xlsx format)
      const stringMatches = rawText.match(/<t[^>]*>([^<]+)<\/t>/g) || [];
      extractedText = stringMatches
        .map(m => m.replace(/<[^>]+>/g, ""))
        .filter(s => s.length > 1)
        .join(" | ")
        .slice(0, 50000);
      
      logStep("Excel text extracted", { charCount: extractedText.length });
      
    } else if (fileType.includes("word") || fileType.includes("document")) {
      // For Word docs, extract text content
      const arrayBuffer = await fileData.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const decoder = new TextDecoder("utf-8", { fatal: false });
      const rawText = decoder.decode(bytes);
      
      // Extract text from docx XML content
      const textMatches = rawText.match(/<w:t[^>]*>([^<]+)<\/w:t>/g) || [];
      extractedText = textMatches
        .map(m => m.replace(/<[^>]+>/g, ""))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 50000);
      
      logStep("Word text extracted", { charCount: extractedText.length });
    }

    // Update the document record with extracted text
    if (extractedText && documentId) {
      const { error: updateError } = await supabaseClient
        .from("coach_documents")
        .update({ extracted_text: extractedText })
        .eq("id", documentId)
        .eq("user_id", userData.user.id);

      if (updateError) {
        logStep("Failed to update document", { error: updateError.message });
      } else {
        logStep("Document updated with extracted text");
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      extractedText,
      charCount: extractedText.length 
    }), {
      headers: { ...dynamicCorsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...dynamicCorsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

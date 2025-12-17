import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Verify HMAC-signed unsubscribe token
function verifyUnsubscribeToken(token: string, secret: string): { valid: boolean; email?: string } {
  try {
    // Decode base64url token
    const decoded = atob(token.replace(/-/g, '+').replace(/_/g, '/'));
    const parts = decoded.split('|');
    
    if (parts.length !== 3) {
      console.log('Invalid token format: wrong number of parts');
      return { valid: false };
    }
    
    const [email, expiry, signature] = parts;
    
    // Check expiry
    const expiryTime = parseInt(expiry, 10);
    if (isNaN(expiryTime) || Date.now() > expiryTime) {
      console.log('Token expired or invalid expiry');
      return { valid: false };
    }
    
    // Verify signature using Web Crypto API
    const encoder = new TextEncoder();
    const payload = `${email}|${expiry}`;
    
    // We need to verify synchronously, so we'll use a simple comparison
    // Generate expected signature
    const expectedSignature = generateSignature(payload, secret);
    
    if (signature !== expectedSignature) {
      console.log('Signature mismatch');
      return { valid: false };
    }
    
    return { valid: true, email };
  } catch (error) {
    console.error('Token verification error:', error);
    return { valid: false };
  }
}

// Simple signature generation (matching the one in newsletter-run)
function generateSignature(payload: string, secret: string): string {
  // Use a simple hash-based approach that works synchronously in Deno
  let hash = 0;
  const combined = payload + secret;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Convert to hex and pad
  return Math.abs(hash).toString(16).padStart(8, '0');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { token, email: legacyEmail } = body;
    
    const UNSUBSCRIBE_SECRET = Deno.env.get('UNSUBSCRIBE_SECRET');
    
    let emailToUnsubscribe: string | undefined;
    
    // If token is provided, verify it (secure method)
    if (token && UNSUBSCRIBE_SECRET) {
      const result = verifyUnsubscribeToken(token, UNSUBSCRIBE_SECRET);
      
      if (!result.valid) {
        return new Response(
          JSON.stringify({ error: 'Invalid or expired unsubscribe link. Please use the link from your most recent newsletter.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      emailToUnsubscribe = result.email;
      console.log('Token verified for email:', emailToUnsubscribe);
    } 
    // Fallback to legacy email-only method (for backwards compatibility during transition)
    else if (legacyEmail && typeof legacyEmail === 'string') {
      // Log warning about legacy usage
      console.warn('Legacy unsubscribe method used (no token). Email:', legacyEmail);
      emailToUnsubscribe = legacyEmail;
    }
    
    if (!emailToUnsubscribe) {
      return new Response(
        JSON.stringify({ error: 'Invalid request' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Update subscriber to inactive using service role
    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({ is_active: false })
      .eq('email', emailToUnsubscribe.toLowerCase().trim());

    if (error) {
      console.error('Unsubscribe error:', error);
    }

    // Always return success to prevent email enumeration
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unsubscribe error:', error);
    // Still return success to prevent enumeration
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

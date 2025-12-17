import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Verify HMAC-signed unsubscribe token
async function verifyUnsubscribeToken(token: string, secret: string): Promise<{ valid: boolean; email?: string }> {
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
    const payload = `${email}|${expiry}`;
    const expectedSignature = await generateSignature(payload, secret);
    
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

// Cryptographically secure HMAC-SHA256 signature (matching newsletter-run)
async function generateSignature(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const data = encoder.encode(payload);
  
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, data);
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
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
      const result = await verifyUnsubscribeToken(token, UNSUBSCRIBE_SECRET);
      
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

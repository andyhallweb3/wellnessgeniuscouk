import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface AdminAuthResult {
  isAdmin: boolean;
  userId: string | null;
  error: string | null;
}

/**
 * Validates JWT token and checks if user has admin role
 * Returns admin status and user info
 */
export async function validateAdminAuth(req: Request): Promise<AdminAuthResult> {
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { isAdmin: false, userId: null, error: 'Missing or invalid Authorization header' };
  }

  const token = authHeader.replace('Bearer ', '');
  
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseKey) {
    return { isAdmin: false, userId: null, error: 'Server configuration error' };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Verify the JWT and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.log('JWT validation failed:', authError?.message);
      return { isAdmin: false, userId: null, error: 'Invalid or expired token' };
    }

    // Check admin role using has_role function
    const { data: hasAdminRole, error: roleError } = await supabase.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin',
    });

    if (roleError) {
      console.error('Role check error:', roleError);
      return { isAdmin: false, userId: user.id, error: 'Failed to verify admin role' };
    }

    if (!hasAdminRole) {
      console.log('User is not admin:', user.id);
      return { isAdmin: false, userId: user.id, error: 'Admin access required' };
    }

    return { isAdmin: true, userId: user.id, error: null };
  } catch (err) {
    console.error('Admin auth validation error:', err);
    return { isAdmin: false, userId: null, error: 'Authentication failed' };
  }
}

/**
 * Helper to return unauthorized response with CORS headers
 */
export function unauthorizedResponse(message: string, corsHeaders: Record<string, string>) {
  return new Response(
    JSON.stringify({ error: message }),
    { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

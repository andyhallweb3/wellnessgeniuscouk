import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AdminRequest {
  action: 'list' | 'grant' | 'revoke';
  userId?: string;
  email?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("manage-admins: Received request");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate JWT and check admin status
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Create client with user's JWT to verify identity
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Use service role client for admin operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Check if requesting user is admin
    const { data: roleCheck } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleCheck) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { action, userId, email }: AdminRequest = await req.json();
    console.log(`Action: ${action}, userId: ${userId}, email: ${email}`);

    switch (action) {
      case 'list': {
        // Get all users with their admin status
        const { data: users, error: usersError } = await adminClient.auth.admin.listUsers();
        if (usersError) throw usersError;

        const { data: roles } = await adminClient
          .from('user_roles')
          .select('user_id, role');

        const adminUserIds = new Set(roles?.filter(r => r.role === 'admin').map(r => r.user_id) || []);

        const userList = users.users.map(u => ({
          id: u.id,
          email: u.email,
          created_at: u.created_at,
          email_confirmed_at: u.email_confirmed_at,
          is_admin: adminUserIds.has(u.id),
        }));

        return new Response(JSON.stringify({ users: userList }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      case 'grant': {
        let targetUserId = userId;

        // If email provided instead of userId, look up the user
        if (!targetUserId && email) {
          const { data: users } = await adminClient.auth.admin.listUsers();
          const targetUser = users.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
          if (!targetUser) {
            return new Response(JSON.stringify({ error: "User not found with that email" }), {
              status: 404,
              headers: { "Content-Type": "application/json", ...corsHeaders },
            });
          }
          targetUserId = targetUser.id;
        }

        if (!targetUserId) {
          return new Response(JSON.stringify({ error: "userId or email required" }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }

        // Check if already admin
        const { data: existing } = await adminClient
          .from('user_roles')
          .select('id')
          .eq('user_id', targetUserId)
          .eq('role', 'admin')
          .maybeSingle();

        if (existing) {
          return new Response(JSON.stringify({ message: "User is already an admin" }), {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }

        const { error: insertError } = await adminClient
          .from('user_roles')
          .insert({ user_id: targetUserId, role: 'admin' });

        if (insertError) throw insertError;

        console.log(`Granted admin to user ${targetUserId}`);
        return new Response(JSON.stringify({ success: true, message: "Admin access granted" }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      case 'revoke': {
        if (!userId) {
          return new Response(JSON.stringify({ error: "userId required" }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }

        // Prevent revoking own admin access
        if (userId === user.id) {
          return new Response(JSON.stringify({ error: "Cannot revoke your own admin access" }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }

        const { error: deleteError } = await adminClient
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'admin');

        if (deleteError) throw deleteError;

        console.log(`Revoked admin from user ${userId}`);
        return new Response(JSON.stringify({ success: true, message: "Admin access revoked" }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      default:
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
    }
  } catch (error: any) {
    console.error("Error in manage-admins:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);

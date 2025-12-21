import { Resend } from 'https://esm.sh/resend@4.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DeletionRequest {
  name: string;
  email: string;
  details?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      throw new Error('Email service not configured');
    }

    const resend = new Resend(resendApiKey);
    const { name, email, details }: DeletionRequest = await req.json();

    // Validate required fields
    if (!name || !email) {
      return new Response(
        JSON.stringify({ error: 'Name and email are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requestDate = new Date().toISOString();
    const deadlineDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    // Send notification to admin
    const adminEmailResult = await resend.emails.send({
      from: 'Wellness Genius <noreply@wellnessgenius.co.uk>',
      to: ['andy@wellnessgenius.co.uk'],
      subject: `🔒 Data Deletion Request from ${name}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #0f172a; margin-bottom: 20px;">Data Deletion Request</h2>
          
          <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <p style="margin: 0 0 10px 0;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 0 0 10px 0;"><strong>Request Date:</strong> ${requestDate}</p>
            <p style="margin: 0 0 10px 0;"><strong>GDPR Deadline:</strong> ${deadlineDate}</p>
            ${details ? `<p style="margin: 0;"><strong>Additional Details:</strong><br/>${details}</p>` : ''}
          </div>
          
          <h3 style="color: #0f172a;">Action Required</h3>
          <p style="color: #475569;">Please process this data deletion request within 30 days as required by GDPR. Check the following systems:</p>
          <ul style="color: #475569;">
            <li>Newsletter subscribers (newsletter_subscribers table)</li>
            <li>AI Readiness completions (ai_readiness_completions table)</li>
            <li>Product downloads (product_downloads table)</li>
            <li>AI Coach data (coach_profiles, agent_sessions, coach_documents)</li>
            <li>User accounts (profiles, auth.users)</li>
          </ul>
        </div>
      `,
    });

    console.log('Admin notification sent:', adminEmailResult);

    // Send confirmation to user
    const userEmailResult = await resend.emails.send({
      from: 'Wellness Genius <noreply@wellnessgenius.co.uk>',
      to: [email],
      subject: 'Your Data Deletion Request - Wellness Genius',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #0f172a; margin-bottom: 20px;">Data Deletion Request Received</h2>
          
          <p style="color: #475569;">Hi ${name},</p>
          
          <p style="color: #475569;">
            We've received your request to delete your personal data from Wellness Genius. 
            In accordance with GDPR, we will process your request within 30 days (by ${deadlineDate}).
          </p>
          
          <div style="background: #f0fdfa; border-left: 4px solid #14b8a6; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #134e4a;">
              <strong>What happens next?</strong><br/>
              We'll verify your identity and remove your data from our systems. You'll receive a confirmation email once the deletion is complete.
            </p>
          </div>
          
          <p style="color: #475569;">
            If you have any questions or didn't make this request, please contact us immediately at 
            <a href="mailto:andy@wellnessgenius.co.uk" style="color: #0d9488;">andy@wellnessgenius.co.uk</a>.
          </p>
          
          <p style="color: #475569; margin-top: 30px;">
            Best regards,<br/>
            The Wellness Genius Team
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
          
          <p style="color: #94a3b8; font-size: 12px;">
            This is an automated message confirming your data deletion request. 
            Reference: ${requestDate}
          </p>
        </div>
      `,
    });

    console.log('User confirmation sent:', userEmailResult);

    return new Response(
      JSON.stringify({ success: true, message: 'Deletion request submitted' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing deletion request:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

-- Insert Free Assets Campaign Email Templates
INSERT INTO public.email_templates (name, slug, subject, preview_text, html_content, template_type, is_active, sequence_order)
VALUES 
(
  'Free AI Advisor Trial',
  'free-ai-advisor-trial',
  '🤖 Your Free AI Wellness Advisor Awaits',
  'Get instant, personalised AI guidance for your wellness business – no strings attached.',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Free AI Wellness Advisor Awaits</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #0D9488 0%, #0891B2 100%); padding: 40px 30px; text-align: center; }
    .header h1 { color: #ffffff; font-size: 28px; margin: 0; font-weight: 700; }
    .header p { color: rgba(255,255,255,0.9); font-size: 16px; margin-top: 10px; }
    .content { padding: 40px 30px; }
    .content h2 { color: #1a1a1a; font-size: 22px; margin: 0 0 20px; }
    .content p { color: #4a4a4a; font-size: 16px; line-height: 1.6; margin: 0 0 20px; }
    .feature-box { background: #f0fdfa; border-left: 4px solid #0D9488; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0; }
    .feature-box h3 { color: #0D9488; font-size: 18px; margin: 0 0 10px; }
    .feature-box p { margin: 0; color: #1a1a1a; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #0D9488 0%, #0891B2 100%); color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; }
    .footer { background: #1a1a1a; padding: 30px; text-align: center; }
    .footer p { color: #888888; font-size: 14px; margin: 0; }
    .footer a { color: #0D9488; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🤖 Your Free AI Advisor Awaits</h1>
      <p>Instant, personalised guidance for your wellness business</p>
    </div>
    <div class="content">
      <h2>What if you had a strategic advisor available 24/7?</h2>
      <p>Running a wellness business means wearing many hats. Marketing, operations, client retention, pricing strategy – the decisions never stop.</p>
      <p>Our AI Wellness Advisor is trained specifically for the wellness industry. It understands the unique challenges you face and provides actionable guidance instantly.</p>
      <div class="feature-box">
        <h3>Try These Modes Free:</h3>
        <p>✓ Strategy Mode – Get advice on business decisions<br>
        ✓ Marketing Mode – Generate content ideas and copy<br>
        ✓ Operations Mode – Streamline your processes</p>
      </div>
      <p><strong>No credit card required. No commitment. Just practical help.</strong></p>
      <p style="text-align: center;">
        <a href="https://wellnessgenius.co.uk/ai-advisor" class="cta-button">Try AI Advisor Free →</a>
      </p>
    </div>
    <div class="footer">
      <p>© 2025 Wellness Genius | <a href="{{unsubscribe_url}}">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>',
  'campaign',
  true,
  10
),
(
  'Free Ebook Download',
  'free-ebook-download',
  '📚 Your Free AI Strategy Ebook Is Ready',
  'Download our comprehensive guide to implementing AI in your wellness business.',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Free AI Strategy Ebook</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #7C3AED 0%, #A855F7 100%); padding: 40px 30px; text-align: center; }
    .header h1 { color: #ffffff; font-size: 28px; margin: 0; font-weight: 700; }
    .header p { color: rgba(255,255,255,0.9); font-size: 16px; margin-top: 10px; }
    .content { padding: 40px 30px; }
    .content h2 { color: #1a1a1a; font-size: 22px; margin: 0 0 20px; }
    .content p { color: #4a4a4a; font-size: 16px; line-height: 1.6; margin: 0 0 20px; }
    .chapter-list { background: #faf5ff; border-radius: 8px; padding: 25px; margin: 25px 0; }
    .chapter-list h3 { color: #7C3AED; font-size: 18px; margin: 0 0 15px; }
    .chapter-list ul { margin: 0; padding: 0 0 0 20px; color: #1a1a1a; }
    .chapter-list li { margin: 8px 0; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #7C3AED 0%, #A855F7 100%); color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; }
    .footer { background: #1a1a1a; padding: 30px; text-align: center; }
    .footer p { color: #888888; font-size: 14px; margin: 0; }
    .footer a { color: #7C3AED; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📚 Your Free Ebook Is Ready</h1>
      <p>The Structured AI Playbook for Wellness Professionals</p>
    </div>
    <div class="content">
      <h2>Stop guessing. Start implementing AI strategically.</h2>
      <p>Most wellness professionals know AI could help their business. Few know where to start or how to avoid the pitfalls.</p>
      <p>This comprehensive ebook gives you a clear, actionable framework – no tech jargon, no fluff, just practical guidance.</p>
      <div class="chapter-list">
        <h3>What You''ll Learn:</h3>
        <ul>
          <li>The 5-pillar AI readiness framework</li>
          <li>Quick wins you can implement this week</li>
          <li>How to evaluate AI tools for your specific needs</li>
          <li>Common mistakes that waste time and money</li>
          <li>Real case studies from wellness businesses</li>
        </ul>
      </div>
      <p><strong>Instant download. No strings attached.</strong></p>
      <p style="text-align: center;">
        <a href="https://wellnessgenius.co.uk/hub/structured-ai-ebook" class="cta-button">Download Free Ebook →</a>
      </p>
    </div>
    <div class="footer">
      <p>© 2025 Wellness Genius | <a href="{{unsubscribe_url}}">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>',
  'campaign',
  true,
  11
),
(
  'Free AI Readiness Assessment',
  'free-ai-readiness-assessment',
  '📊 How AI-Ready Is Your Wellness Business?',
  'Take our 5-minute assessment and get your personalised AI readiness score.',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Readiness Assessment</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #EA580C 0%, #F97316 100%); padding: 40px 30px; text-align: center; }
    .header h1 { color: #ffffff; font-size: 28px; margin: 0; font-weight: 700; }
    .header p { color: rgba(255,255,255,0.9); font-size: 16px; margin-top: 10px; }
    .content { padding: 40px 30px; }
    .content h2 { color: #1a1a1a; font-size: 22px; margin: 0 0 20px; }
    .content p { color: #4a4a4a; font-size: 16px; line-height: 1.6; margin: 0 0 20px; }
    .score-preview { background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%); border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center; }
    .score-preview h3 { color: #EA580C; font-size: 18px; margin: 0 0 15px; }
    .pillars { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
    .pillar { background: #ffffff; border: 2px solid #EA580C; border-radius: 20px; padding: 8px 16px; font-size: 14px; color: #EA580C; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #EA580C 0%, #F97316 100%); color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; }
    .footer { background: #1a1a1a; padding: 30px; text-align: center; }
    .footer p { color: #888888; font-size: 14px; margin: 0; }
    .footer a { color: #EA580C; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 How AI-Ready Are You?</h1>
      <p>Get your personalised score in 5 minutes</p>
    </div>
    <div class="content">
      <h2>Know exactly where you stand.</h2>
      <p>AI is transforming the wellness industry. But rushing in without understanding your readiness can lead to wasted investment and frustration.</p>
      <p>Our free assessment evaluates your business across 5 key pillars and gives you a clear picture of where to focus first.</p>
      <div class="score-preview">
        <h3>Get Scored On:</h3>
        <div class="pillars">
          <span class="pillar">Leadership</span>
          <span class="pillar">Data</span>
          <span class="pillar">Process</span>
          <span class="pillar">People</span>
          <span class="pillar">Risk</span>
        </div>
      </div>
      <p><strong>Takes 5 minutes. Get instant results plus personalised recommendations.</strong></p>
      <p style="text-align: center;">
        <a href="https://wellnessgenius.co.uk/ai-readiness" class="cta-button">Take Free Assessment →</a>
      </p>
    </div>
    <div class="footer">
      <p>© 2025 Wellness Genius | <a href="{{unsubscribe_url}}">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>',
  'campaign',
  true,
  12
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  subject = EXCLUDED.subject,
  preview_text = EXCLUDED.preview_text,
  html_content = EXCLUDED.html_content,
  template_type = EXCLUDED.template_type,
  is_active = EXCLUDED.is_active,
  sequence_order = EXCLUDED.sequence_order,
  updated_at = now();
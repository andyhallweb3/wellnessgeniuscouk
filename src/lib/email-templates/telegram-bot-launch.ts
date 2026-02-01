// Email template for Telegram Bot launch announcement
export const generateTelegramBotEmailHTML = (unsubscribeUrl?: string): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Meet Your New AI Assistant on Telegram</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f4f5;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    
    .email-wrapper {
      width: 100%;
      background-color: #f4f4f5;
      padding: 40px 20px;
    }
    
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    
    .header {
      background: linear-gradient(135deg, #0d9488 0%, #115e59 100%);
      padding: 40px 32px;
      text-align: center;
    }
    
    .logo {
      width: 180px;
      height: auto;
      margin-bottom: 24px;
    }
    
    .header h1 {
      color: #ffffff;
      font-size: 26px;
      font-weight: 700;
      margin: 0 0 8px 0;
      line-height: 1.3;
    }
    
    .header p {
      color: rgba(255, 255, 255, 0.9);
      font-size: 16px;
      margin: 0;
    }
    
    .content {
      padding: 40px 32px;
    }
    
    .intro {
      font-size: 16px;
      line-height: 1.7;
      color: #374151;
      margin-bottom: 24px;
    }
    
    .highlight-box {
      background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%);
      border-radius: 12px;
      padding: 24px;
      margin: 24px 0;
      border-left: 4px solid #0d9488;
    }
    
    .highlight-box h3 {
      font-size: 18px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 12px 0;
    }
    
    .highlight-box p {
      font-size: 15px;
      color: #374151;
      margin: 0;
      line-height: 1.6;
    }
    
    .section-title {
      font-size: 20px;
      font-weight: 700;
      color: #111827;
      margin: 32px 0 16px 0;
    }
    
    .benefit-list {
      margin: 0;
      padding: 0;
      list-style: none;
    }
    
    .benefit-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 16px;
      font-size: 15px;
      line-height: 1.6;
      color: #374151;
    }
    
    .benefit-icon {
      width: 24px;
      height: 24px;
      min-width: 24px;
      background-color: #d1fae5;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      color: #059669;
      font-weight: bold;
    }
    
    .use-cases {
      background-color: #f9fafb;
      border-radius: 12px;
      padding: 24px;
      margin: 24px 0;
    }
    
    .use-case {
      padding: 12px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .use-case:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    
    .use-case-emoji {
      font-size: 20px;
      margin-right: 12px;
    }
    
    .use-case-text {
      font-size: 15px;
      color: #374151;
    }
    
    .use-case-text strong {
      color: #111827;
    }
    
    .cta-section {
      background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
      border-radius: 12px;
      padding: 32px;
      text-align: center;
      margin: 32px 0;
    }
    
    .cta-title {
      font-size: 20px;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 8px 0;
    }
    
    .cta-subtitle {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.9);
      margin: 0 0 20px 0;
    }
    
    .cta-button {
      display: inline-block;
      background-color: #ffffff;
      color: #0d9488 !important;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      transition: transform 0.2s;
    }
    
    .cta-button:hover {
      transform: translateY(-2px);
    }
    
    .telegram-icon {
      display: inline-block;
      margin-right: 8px;
      vertical-align: middle;
    }
    
    .quote-box {
      border-left: 4px solid #0d9488;
      padding-left: 20px;
      margin: 32px 0;
      font-style: italic;
      color: #4b5563;
      font-size: 15px;
      line-height: 1.7;
    }
    
    .signature {
      margin-top: 40px;
      padding-top: 24px;
      border-top: 1px solid #e5e7eb;
    }
    
    .signature p {
      margin: 4px 0;
      font-size: 15px;
      color: #374151;
    }
    
    .signature .name {
      font-weight: 600;
      color: #111827;
    }
    
    .footer {
      background-color: #f9fafb;
      padding: 24px 32px;
      text-align: center;
    }
    
    .footer p {
      font-size: 13px;
      color: #6b7280;
      margin: 4px 0;
    }
    
    .footer a {
      color: #0d9488;
      text-decoration: none;
    }
    
    @media only screen and (max-width: 600px) {
      .email-wrapper {
        padding: 20px 12px;
      }
      
      .header, .content, .footer {
        padding-left: 20px;
        padding-right: 20px;
      }
      
      .header h1 {
        font-size: 22px;
      }
      
      .cta-button {
        display: block;
        text-align: center;
      }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      <!-- Header -->
      <div class="header">
        <img src="https://wellness-genius.lovable.app/images/wellness-genius-logo-teal.png" alt="Wellness Genius" class="logo" />
        <h1>Your AI Advisor is Now on Telegram</h1>
        <p>24/7 intelligence at your fingertips</p>
      </div>
      
      <!-- Content -->
      <div class="content">
        <p class="intro">
          We've just launched something that makes getting AI guidance faster and easier than ever: the <strong>Wellness Genius Telegram Bot</strong>.
        </p>
        
        <div class="highlight-box">
          <h3>Why Telegram?</h3>
          <p>
            Because your best ideas don't wait for office hours. Now you can get instant, expert AI guidance wherever you are — from your phone, tablet, or desktop.
          </p>
        </div>
        
        <h2 class="section-title">What Can the Bot Do?</h2>
        
        <ul class="benefit-list">
          <li class="benefit-item">
            <span class="benefit-icon">✓</span>
            <span><strong>Answer AI strategy questions</strong> — What should I automate first? Is this vendor worth it?</span>
          </li>
          <li class="benefit-item">
            <span class="benefit-icon">✓</span>
            <span><strong>Guide you through our tools</strong> — Get help with the AI Readiness Assessment, Prompt Packs, and more</span>
          </li>
          <li class="benefit-item">
            <span class="benefit-icon">✓</span>
            <span><strong>Qualify your AI use cases</strong> — Not sure if something is realistic? Ask the bot</span>
          </li>
          <li class="benefit-item">
            <span class="benefit-icon">✓</span>
            <span><strong>Point you to the right resources</strong> — Products, downloads, and booking links on demand</span>
          </li>
        </ul>
        
        <h2 class="section-title">Try These Starter Prompts</h2>
        
        <div class="use-cases">
          <div class="use-case">
            <span class="use-case-emoji">🎯</span>
            <span class="use-case-text">"What's the fastest way to assess my AI readiness?"</span>
          </div>
          <div class="use-case">
            <span class="use-case-emoji">💡</span>
            <span class="use-case-text">"I run a spa chain — where should I start with AI?"</span>
          </div>
          <div class="use-case">
            <span class="use-case-emoji">🛡️</span>
            <span class="use-case-text">"What GDPR risks should I know about with AI?"</span>
          </div>
          <div class="use-case">
            <span class="use-case-emoji">📊</span>
            <span class="use-case-text">"How do I interpret my AI Readiness Score?"</span>
          </div>
        </div>
        
        <div class="quote-box">
          "The best time to get AI advice is when the question is fresh. The bot is built to give you clarity in the moment — no waiting, no scheduling."
        </div>
        
        <!-- CTA Section -->
        <div class="cta-section">
          <h3 class="cta-title">Start Chatting Now</h3>
          <p class="cta-subtitle">Click below to open Telegram and say hello</p>
          <a href="https://t.me/Wellnessgenius_bot" class="cta-button">
            💬 Open Telegram Bot
          </a>
        </div>
        
        <p class="intro">
          The bot is powered by the same intelligence behind our AI Advisor — trained on wellness industry data, commercial frameworks, and practical implementation guidance.
        </p>
        
        <p class="intro">
          Got feedback? Just reply to this email. We're always refining based on what you need.
        </p>
        
        <!-- Signature -->
        <div class="signature">
          <p class="name">The Wellness Genius Team</p>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="footer">
        <p>Wellness Genius — AI Intelligence for the Wellness Industry</p>
        <p>
          <a href="https://wellnessgenius.co.uk">Website</a> · 
          <a href="https://wellnessgenius.co.uk/advisor">AI Advisor</a> · 
          <a href="https://wellnessgenius.co.uk/products">Products</a>
        </p>
        ${unsubscribeUrl ? `<p style="margin-top: 16px;"><a href="${unsubscribeUrl}" style="color: #9ca3af;">Unsubscribe</a></p>` : ''}
        <p style="margin-top: 16px; font-size: 12px; color: #9ca3af;">
          © 2025 Wellness Genius. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`;
};

export const telegramBotEmailSubject = "💬 Your AI Advisor is Now on Telegram — Chat Anytime";

export const telegramBotEmailPreview = "24/7 AI guidance at your fingertips. Ask strategy questions, get product help, and qualify use cases instantly.";

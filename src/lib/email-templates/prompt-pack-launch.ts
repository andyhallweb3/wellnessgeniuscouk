// Email template for Wellness AI Prompt Pack launch
export const generatePromptPackEmailHTML = (unsubscribeUrl?: string): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Happy New Year from Wellness Genius</title>
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
      font-size: 28px;
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
      margin-bottom: 32px;
    }
    
    .gift-badge {
      display: inline-block;
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      color: #92400e;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 16px;
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
    
    .cta-section {
      background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%);
      border-radius: 12px;
      padding: 32px;
      text-align: center;
      margin: 32px 0;
    }
    
    .cta-title {
      font-size: 18px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 8px 0;
    }
    
    .cta-subtitle {
      font-size: 14px;
      color: #6b7280;
      margin: 0 0 20px 0;
    }
    
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
      color: #ffffff !important;
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
    
    .outcomes-grid {
      display: table;
      width: 100%;
      margin: 24px 0;
    }
    
    .outcome-row {
      display: table-row;
    }
    
    .outcome-item {
      display: table-cell;
      width: 50%;
      padding: 12px;
      vertical-align: top;
    }
    
    .outcome-card {
      background-color: #f9fafb;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
    }
    
    .outcome-emoji {
      font-size: 28px;
      margin-bottom: 8px;
    }
    
    .outcome-text {
      font-size: 14px;
      font-weight: 600;
      color: #374151;
      margin: 0;
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
    
    .social-links {
      margin-top: 16px;
    }
    
    .social-link {
      display: inline-block;
      margin: 0 8px;
      color: #6b7280;
      text-decoration: none;
      font-size: 13px;
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
        font-size: 24px;
      }
      
      .outcome-item {
        display: block;
        width: 100%;
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
        <img src="https://wellnessgenius.co.uk/images/wellness-genius-logo-teal.png" alt="Wellness Genius" class="logo" />
        <h1>Happy New Year! 🎉</h1>
        <p>A gift to kickstart your 2025 AI journey</p>
      </div>
      
      <!-- Content -->
      <div class="content">
        <span class="gift-badge">🎁 Free Download</span>
        
        <p class="intro">
          As we step into 2025, I wanted to share something practical to help you move from AI curiosity to AI that actually delivers.
        </p>
        
        <p class="intro">
          Introducing the <strong>Wellness Genius AI Prompt Pack</strong> — a set of battle-tested prompts designed specifically for wellness operators, suppliers, and commercial leaders who want results, not opinions.
        </p>
        
        <h2 class="section-title">What's Inside?</h2>
        
        <ul class="benefit-list">
          <li class="benefit-item">
            <span class="benefit-icon">✓</span>
            <span><strong>8 strategic prompts</strong> covering readiness assessment, engagement design, personalisation, monetisation, and more</span>
          </li>
          <li class="benefit-item">
            <span class="benefit-icon">✓</span>
            <span><strong>Direct integration</strong> with your Wellness Genius AI Readiness Score</span>
          </li>
          <li class="benefit-item">
            <span class="benefit-icon">✓</span>
            <span><strong>Commercial focus</strong> — every prompt ties back to revenue, retention, or risk reduction</span>
          </li>
          <li class="benefit-item">
            <span class="benefit-icon">✓</span>
            <span><strong>Governance-aware</strong> — built for GDPR reality, not AI theatre</span>
          </li>
        </ul>
        
        <h2 class="section-title">What You'll Achieve</h2>
        
        <table class="outcomes-grid" role="presentation">
          <tr class="outcome-row">
            <td class="outcome-item">
              <div class="outcome-card">
                <div class="outcome-emoji">🎯</div>
                <p class="outcome-text">Turn your AI Readiness Score into a 90-day action plan</p>
              </div>
            </td>
            <td class="outcome-item">
              <div class="outcome-card">
                <div class="outcome-emoji">💰</div>
                <p class="outcome-text">Identify monetisation models you're actually ready for</p>
              </div>
            </td>
          </tr>
          <tr class="outcome-row">
            <td class="outcome-item">
              <div class="outcome-card">
                <div class="outcome-emoji">⚡</div>
                <p class="outcome-text">Design engagement engines that match your maturity</p>
              </div>
            </td>
            <td class="outcome-item">
              <div class="outcome-card">
                <div class="outcome-emoji">🛡️</div>
                <p class="outcome-text">Avoid the traps that sink most wellness AI projects</p>
              </div>
            </td>
          </tr>
        </table>
        
        <div class="quote-box">
          "Most companies don't need more AI. They need clarity, sequencing, and restraint. This Prompt Pack gives you exactly that."
        </div>
        
        <!-- CTA Section -->
        <div class="cta-section">
          <h3 class="cta-title">Ready to Get Started?</h3>
          <p class="cta-subtitle">Subscribe to Wellness Genius and download your free Prompt Pack</p>
          <a href="https://wellnessgenius.co.uk/downloads" class="cta-button">
            Download the AI Prompt Pack →
          </a>
        </div>
        
        <p class="intro">
          This is the same framework we use with enterprise clients — now available to everyone in our community.
        </p>
        
        <p class="intro">
          Here's to making 2025 the year your AI investment actually pays off.
        </p>
        
        <!-- Signature -->
        <div class="signature">
          <p class="name">Wellness Genius</p>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="footer">
        <p>Wellness Genius — AI Intelligence for the Wellness Industry</p>
        <p>
          <a href="https://wellnessgenius.co.uk">Website</a> · 
          <a href="https://wellnessgenius.co.uk/insights">Latest Insights</a> · 
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

export const promptPackEmailSubject = "🎁 Happy New Year — Your Free AI Prompt Pack from Wellness Genius";

export const promptPackEmailPreview = "A gift to kickstart your 2025 AI journey — download 8 strategic prompts designed for wellness operators";

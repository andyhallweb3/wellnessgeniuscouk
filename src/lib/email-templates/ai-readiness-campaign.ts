// Email template for AI Readiness Assessment campaign
export const generateAIReadinessEmailHTML = (unsubscribeUrl?: string): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Is Your Business AI-Ready?</title>
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
    :root {
      color-scheme: light dark;
      supported-color-schemes: light dark;
    }
    
    body {
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    .email-wrapper {
      width: 100%;
      background-color: #f8fafc;
      padding: 32px 16px;
    }
    
    .email-container {
      max-width: 580px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
    }
    
    .header {
      background: linear-gradient(135deg, #0f766e 0%, #134e4a 100%);
      padding: 48px 32px;
      text-align: center;
    }
    
    .logo {
      width: 160px;
      height: auto;
      margin-bottom: 20px;
    }
    
    .header h1 {
      color: #ffffff;
      font-size: 26px;
      font-weight: 700;
      margin: 0 0 8px 0;
      line-height: 1.3;
      letter-spacing: -0.02em;
    }
    
    .header p {
      color: rgba(255, 255, 255, 0.85);
      font-size: 15px;
      margin: 0;
      font-weight: 400;
    }
    
    .content {
      padding: 32px;
      background-color: #ffffff;
    }
    
    .badge {
      display: inline-block;
      background-color: #f0fdf4;
      color: #166534;
      padding: 6px 14px;
      border-radius: 16px;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 20px;
      border: 1px solid #bbf7d0;
    }
    
    .intro {
      font-size: 15px;
      line-height: 1.7;
      color: #475569;
      margin: 0 0 20px 0;
    }
    
    .intro strong {
      color: #1e293b;
    }
    
    .section-title {
      font-size: 18px;
      font-weight: 700;
      color: #1e293b;
      margin: 28px 0 16px 0;
      letter-spacing: -0.01em;
    }
    
    .alert-box {
      background-color: #fef2f2;
      border-left: 3px solid #ef4444;
      border-radius: 0 8px 8px 0;
      padding: 20px;
      margin: 24px 0;
    }
    
    .alert-box h3 {
      color: #b91c1c;
      font-size: 15px;
      font-weight: 600;
      margin: 0 0 12px 0;
    }
    
    .alert-list {
      margin: 0;
      padding: 0 0 0 18px;
      color: #991b1b;
      font-size: 14px;
      line-height: 1.7;
    }
    
    .alert-list li {
      margin-bottom: 4px;
    }
    
    .benefit-list {
      margin: 0;
      padding: 0;
      list-style: none;
    }
    
    .benefit-item {
      display: table;
      width: 100%;
      margin-bottom: 14px;
      font-size: 14px;
      line-height: 1.6;
      color: #475569;
    }
    
    .benefit-check {
      display: table-cell;
      width: 28px;
      vertical-align: top;
      padding-top: 2px;
    }
    
    .benefit-check span {
      display: inline-block;
      width: 20px;
      height: 20px;
      background-color: #dcfce7;
      color: #16a34a;
      border-radius: 50%;
      text-align: center;
      line-height: 20px;
      font-size: 12px;
      font-weight: bold;
    }
    
    .benefit-text {
      display: table-cell;
      vertical-align: top;
    }
    
    .benefit-text strong {
      color: #1e293b;
    }
    
    .pillar-grid {
      margin: 20px 0;
    }
    
    .pillar-row {
      display: table;
      width: 100%;
      margin-bottom: 8px;
    }
    
    .pillar-cell {
      display: table-cell;
      width: 50%;
      padding: 4px;
      vertical-align: top;
    }
    
    .pillar-card {
      background-color: #f0fdfa;
      border-radius: 8px;
      padding: 14px 12px;
      text-align: center;
      border: 1px solid #99f6e4;
    }
    
    .pillar-emoji {
      font-size: 22px;
      margin-bottom: 6px;
    }
    
    .pillar-name {
      font-size: 12px;
      font-weight: 600;
      color: #0f766e;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    
    .stats-grid {
      display: table;
      width: 100%;
      margin: 24px 0;
      border-spacing: 8px;
      border-collapse: separate;
    }
    
    .stat-cell {
      display: table-cell;
      width: 33.33%;
      text-align: center;
      background-color: #f8fafc;
      border-radius: 8px;
      padding: 16px 8px;
      border: 1px solid #e2e8f0;
    }
    
    .stat-number {
      font-size: 24px;
      font-weight: 700;
      color: #0f766e;
      margin: 0;
      line-height: 1.2;
    }
    
    .stat-label {
      font-size: 11px;
      color: #64748b;
      margin: 4px 0 0 0;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .cta-box {
      background: linear-gradient(135deg, #f0fdfa 0%, #ecfdf5 100%);
      border-radius: 12px;
      padding: 28px 24px;
      text-align: center;
      margin: 28px 0;
      border: 1px solid #a7f3d0;
    }
    
    .cta-title {
      font-size: 17px;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 6px 0;
    }
    
    .cta-subtitle {
      font-size: 13px;
      color: #64748b;
      margin: 0 0 18px 0;
    }
    
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #0f766e 0%, #0d9488 100%);
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 600;
      letter-spacing: -0.01em;
    }
    
    .cta-note {
      display: inline-block;
      background-color: #fef3c7;
      color: #92400e;
      padding: 4px 10px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 600;
      margin-top: 14px;
    }
    
    .audience-box {
      background-color: #f8fafc;
      border-radius: 10px;
      padding: 20px;
      margin: 24px 0;
      border: 1px solid #e2e8f0;
    }
    
    .audience-title {
      font-size: 15px;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 14px 0;
    }
    
    .audience-grid {
      display: table;
      width: 100%;
    }
    
    .audience-col {
      display: table-cell;
      width: 50%;
      vertical-align: top;
      padding-right: 12px;
    }
    
    .audience-col:last-child {
      padding-right: 0;
      padding-left: 12px;
    }
    
    .audience-label {
      font-size: 11px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin: 0 0 6px 0;
    }
    
    .audience-list {
      margin: 0;
      padding: 0 0 0 14px;
      font-size: 12px;
      color: #475569;
      line-height: 1.7;
    }
    
    .quote-box {
      border-left: 3px solid #0d9488;
      padding-left: 16px;
      margin: 24px 0;
      font-style: italic;
      color: #64748b;
      font-size: 14px;
      line-height: 1.6;
    }
    
    .signature {
      margin-top: 32px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
    }
    
    .signature p {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: #1e293b;
    }
    
    .footer {
      background-color: #f8fafc;
      padding: 24px 32px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
    }
    
    .footer p {
      font-size: 12px;
      color: #64748b;
      margin: 4px 0;
      line-height: 1.6;
    }
    
    .footer a {
      color: #0f766e;
      text-decoration: none;
    }
    
    .footer-links {
      margin-bottom: 12px;
    }
    
    .footer-legal {
      color: #94a3b8 !important;
      font-size: 11px !important;
    }
    
    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      body {
        background-color: #0f172a !important;
      }
      
      .email-wrapper {
        background-color: #0f172a !important;
      }
      
      .email-container {
        background-color: #1e293b !important;
        border-color: #334155 !important;
      }
      
      .header {
        background: linear-gradient(135deg, #115e59 0%, #0f172a 100%) !important;
      }
      
      .content {
        background-color: #1e293b !important;
      }
      
      .badge {
        background-color: #064e3b !important;
        color: #6ee7b7 !important;
        border-color: #065f46 !important;
      }
      
      .intro {
        color: #cbd5e1 !important;
      }
      
      .intro strong {
        color: #f1f5f9 !important;
      }
      
      .section-title {
        color: #f1f5f9 !important;
      }
      
      .alert-box {
        background-color: #450a0a !important;
        border-left-color: #dc2626 !important;
      }
      
      .alert-box h3 {
        color: #fca5a5 !important;
      }
      
      .alert-list {
        color: #fecaca !important;
      }
      
      .benefit-item {
        color: #cbd5e1 !important;
      }
      
      .benefit-check span {
        background-color: #064e3b !important;
        color: #6ee7b7 !important;
      }
      
      .benefit-text strong {
        color: #f1f5f9 !important;
      }
      
      .pillar-card {
        background-color: #134e4a !important;
        border-color: #0f766e !important;
      }
      
      .pillar-name {
        color: #5eead4 !important;
      }
      
      .stat-cell {
        background-color: #0f172a !important;
        border-color: #334155 !important;
      }
      
      .stat-number {
        color: #2dd4bf !important;
      }
      
      .stat-label {
        color: #94a3b8 !important;
      }
      
      .cta-box {
        background: linear-gradient(135deg, #134e4a 0%, #115e59 100%) !important;
        border-color: #0f766e !important;
      }
      
      .cta-title {
        color: #f1f5f9 !important;
      }
      
      .cta-subtitle {
        color: #94a3b8 !important;
      }
      
      .cta-note {
        background-color: #78350f !important;
        color: #fde68a !important;
      }
      
      .audience-box {
        background-color: #0f172a !important;
        border-color: #334155 !important;
      }
      
      .audience-title {
        color: #f1f5f9 !important;
      }
      
      .audience-label {
        color: #94a3b8 !important;
      }
      
      .audience-list {
        color: #cbd5e1 !important;
      }
      
      .quote-box {
        border-left-color: #2dd4bf !important;
        color: #94a3b8 !important;
      }
      
      .signature {
        border-top-color: #334155 !important;
      }
      
      .signature p {
        color: #f1f5f9 !important;
      }
      
      .footer {
        background-color: #0f172a !important;
        border-top-color: #334155 !important;
      }
      
      .footer p {
        color: #94a3b8 !important;
      }
      
      .footer a {
        color: #2dd4bf !important;
      }
    }
    
    @media only screen and (max-width: 600px) {
      .email-wrapper {
        padding: 16px 12px;
      }
      
      .header {
        padding: 36px 24px;
      }
      
      .header h1 {
        font-size: 22px;
      }
      
      .content {
        padding: 24px;
      }
      
      .pillar-cell {
        display: block;
        width: 100%;
        margin-bottom: 8px;
      }
      
      .stat-cell {
        display: block;
        width: 100%;
        margin-bottom: 8px;
      }
      
      .audience-col {
        display: block;
        width: 100%;
        padding: 0 !important;
        margin-bottom: 16px;
      }
      
      .cta-button {
        display: block;
        text-align: center;
      }
      
      .footer {
        padding: 20px 24px;
      }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      <!-- Header -->
      <div class="header">
        <img src="https://wellnessgenius.co.uk/images/wellness-genius-logo-white.png" alt="Wellness Genius" class="logo" />
        <h1>Is Your Business AI-Ready?</h1>
        <p>Find out in 5 minutes — free assessment inside</p>
      </div>
      
      <!-- Content -->
      <div class="content">
        <span class="badge">📊 Free Assessment</span>
        
        <p class="intro">
          AI is transforming the wellness industry. But while some businesses are pulling ahead, others are stuck in analysis paralysis — unsure where to start or what to prioritise.
        </p>
        
        <p class="intro">
          The difference? <strong>Knowing your starting point.</strong>
        </p>
        
        <!-- Alert Section -->
        <div class="alert-box">
          <h3>🚨 The AI Readiness Gap</h3>
          <ul class="alert-list">
            <li>70% of AI projects fail due to poor preparation, not technology</li>
            <li>Most businesses don't know their data quality or team capability</li>
            <li>Jumping into AI without a baseline leads to wasted budget</li>
          </ul>
        </div>
        
        <h2 class="section-title">Why Take the Assessment?</h2>
        
        <ul class="benefit-list">
          <li class="benefit-item">
            <span class="benefit-check"><span>✓</span></span>
            <span class="benefit-text"><strong>Instant clarity</strong> — Know where you stand across 5 strategic pillars</span>
          </li>
          <li class="benefit-item">
            <span class="benefit-check"><span>✓</span></span>
            <span class="benefit-text"><strong>Actionable insights</strong> — Get tailored recommendations, not generic advice</span>
          </li>
          <li class="benefit-item">
            <span class="benefit-check"><span>✓</span></span>
            <span class="benefit-text"><strong>Benchmark yourself</strong> — See how you compare to industry peers</span>
          </li>
          <li class="benefit-item">
            <span class="benefit-check"><span>✓</span></span>
            <span class="benefit-text"><strong>Prioritise investment</strong> — Know what to fix before spending on AI</span>
          </li>
          <li class="benefit-item">
            <span class="benefit-check"><span>✓</span></span>
            <span class="benefit-text"><strong>Board-ready output</strong> — Share your score with stakeholders</span>
          </li>
        </ul>
        
        <h2 class="section-title">What We Measure</h2>
        
        <div class="pillar-grid">
          <div class="pillar-row">
            <div class="pillar-cell">
              <div class="pillar-card">
                <div class="pillar-emoji">🔄</div>
                <p class="pillar-name">Transformation</p>
              </div>
            </div>
            <div class="pillar-cell">
              <div class="pillar-card">
                <div class="pillar-emoji">🏗️</div>
                <p class="pillar-name">Architecture</p>
              </div>
            </div>
          </div>
          <div class="pillar-row">
            <div class="pillar-cell">
              <div class="pillar-card">
                <div class="pillar-emoji">🛡️</div>
                <p class="pillar-name">Governance</p>
              </div>
            </div>
            <div class="pillar-cell">
              <div class="pillar-card">
                <div class="pillar-emoji">💰</div>
                <p class="pillar-name">Value</p>
              </div>
            </div>
          </div>
          <div class="pillar-row" style="text-align: center;">
            <div class="pillar-cell" style="width: 100%; text-align: center;">
              <div class="pillar-card" style="display: inline-block; min-width: 140px;">
                <div class="pillar-emoji">⚙️</div>
                <p class="pillar-name">Operating Style</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Stats -->
        <table class="stats-grid" role="presentation">
          <tr>
            <td class="stat-cell">
              <p class="stat-number">5</p>
              <p class="stat-label">Minutes</p>
            </td>
            <td class="stat-cell">
              <p class="stat-number">10</p>
              <p class="stat-label">Questions</p>
            </td>
            <td class="stat-cell">
              <p class="stat-number">100%</p>
              <p class="stat-label">Free</p>
            </td>
          </tr>
        </table>
        
        <!-- CTA Section -->
        <div class="cta-box">
          <h3 class="cta-title">Get Your AI Readiness Score</h3>
          <p class="cta-subtitle">No signup required for the free assessment</p>
          <a href="https://wellnessgenius.co.uk/ai-readiness" class="cta-button">
            Take the Assessment →
          </a>
          <div><span class="cta-note">🎯 Takes less than 5 minutes</span></div>
        </div>
        
        <!-- Audience -->
        <div class="audience-box">
          <h3 class="audience-title">Built for Wellness Professionals</h3>
          <table class="audience-grid" role="presentation">
            <tr>
              <td class="audience-col">
                <p class="audience-label">Operators</p>
                <ul class="audience-list">
                  <li>Gyms & health clubs</li>
                  <li>Spas & retreats</li>
                  <li>Studios & boutique fitness</li>
                  <li>Corporate wellness</li>
                </ul>
              </td>
              <td class="audience-col">
                <p class="audience-label">Suppliers</p>
                <ul class="audience-list">
                  <li>Wellness technology</li>
                  <li>Equipment providers</li>
                  <li>Content & programming</li>
                  <li>SaaS platforms</li>
                </ul>
              </td>
            </tr>
          </table>
        </div>
        
        <div class="quote-box">
          "You can't improve what you can't measure. The AI Readiness Assessment gives wellness businesses the clarity they need to make smart AI investments."
        </div>
        
        <p class="intro">
          Whether you're exploring your first AI project or scaling existing initiatives, knowing your baseline changes everything.
        </p>
        
        <!-- Signature -->
        <div class="signature">
          <p>The Wellness Genius Team</p>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="footer">
        <p class="footer-links">
          <a href="https://wellnessgenius.co.uk">Website</a> · 
          <a href="https://wellnessgenius.co.uk/insights">Latest Insights</a> · 
          <a href="https://wellnessgenius.co.uk/ai-readiness">AI Readiness</a>
        </p>
        <p>Wellness Genius — AI Intelligence for the Wellness Industry</p>
        ${unsubscribeUrl ? `<p style="margin-top: 12px;"><a href="${unsubscribeUrl}" style="color: #94a3b8;">Unsubscribe</a></p>` : ''}
        <p class="footer-legal" style="margin-top: 12px;">
          © ${new Date().getFullYear()} Wellness Genius. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`;
};

export const aiReadinessEmailSubject = "📊 Is Your Wellness Business AI-Ready? Find Out in 5 Minutes";

export const aiReadinessEmailPreview = "70% of AI projects fail due to poor preparation. Take our free assessment to discover your AI Readiness Score across 5 strategic pillars.";

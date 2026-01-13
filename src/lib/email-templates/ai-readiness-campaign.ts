// Email template for AI Readiness Assessment campaign
export const generateAIReadinessEmailHTML = (unsubscribeUrl?: string): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
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
      margin-bottom: 24px;
    }
    
    .highlight-badge {
      display: inline-block;
      background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
      color: #1e40af;
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
    
    .problem-box {
      background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
      border-left: 4px solid #ef4444;
      border-radius: 0 12px 12px 0;
      padding: 24px;
      margin: 24px 0;
    }
    
    .problem-box h3 {
      color: #991b1b;
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 12px 0;
    }
    
    .problem-list {
      margin: 0;
      padding: 0 0 0 20px;
      color: #7f1d1d;
      font-size: 14px;
      line-height: 1.8;
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
    
    .pillar-grid {
      display: table;
      width: 100%;
      margin: 24px 0;
    }
    
    .pillar-row {
      display: table-row;
    }
    
    .pillar-item {
      display: table-cell;
      width: 50%;
      padding: 8px;
      vertical-align: top;
    }
    
    .pillar-card {
      background-color: #f0fdfa;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
      border: 1px solid #99f6e4;
    }
    
    .pillar-emoji {
      font-size: 24px;
      margin-bottom: 8px;
    }
    
    .pillar-name {
      font-size: 13px;
      font-weight: 600;
      color: #0f766e;
      margin: 0;
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
    
    .free-badge {
      display: inline-block;
      background: #fef3c7;
      color: #92400e;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      margin-top: 12px;
    }
    
    .stats-row {
      display: table;
      width: 100%;
      margin: 24px 0;
      border-collapse: separate;
      border-spacing: 8px;
    }
    
    .stat-item {
      display: table-cell;
      width: 33.33%;
      text-align: center;
      background: #f9fafb;
      border-radius: 8px;
      padding: 16px 8px;
    }
    
    .stat-number {
      font-size: 24px;
      font-weight: 700;
      color: #0d9488;
      margin: 0;
    }
    
    .stat-label {
      font-size: 11px;
      color: #6b7280;
      margin: 4px 0 0 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
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
    
    .audience-section {
      background: #fafafa;
      border-radius: 12px;
      padding: 24px;
      margin: 24px 0;
    }
    
    .audience-title {
      font-size: 16px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 16px 0;
    }
    
    .audience-grid {
      display: table;
      width: 100%;
    }
    
    .audience-col {
      display: table-cell;
      width: 50%;
      vertical-align: top;
      padding-right: 16px;
    }
    
    .audience-col:last-child {
      padding-right: 0;
      padding-left: 16px;
    }
    
    .audience-label {
      font-size: 12px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0 0 8px 0;
    }
    
    .audience-list {
      margin: 0;
      padding: 0 0 0 16px;
      font-size: 13px;
      color: #374151;
      line-height: 1.8;
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
        font-size: 24px;
      }
      
      .pillar-item, .stat-item, .audience-col {
        display: block;
        width: 100%;
        padding: 8px 0;
      }
      
      .audience-col:last-child {
        padding-left: 0;
        margin-top: 16px;
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
        <h1>Is Your Business AI-Ready?</h1>
        <p>Find out in 5 minutes — free assessment inside</p>
      </div>
      
      <!-- Content -->
      <div class="content">
        <span class="highlight-badge">📊 Free Assessment</span>
        
        <p class="intro">
          AI is transforming the wellness industry. But while some businesses are pulling ahead, others are stuck in analysis paralysis — unsure where to start or what to prioritise.
        </p>
        
        <p class="intro">
          The difference? <strong>Knowing your starting point.</strong>
        </p>
        
        <!-- Problem Section -->
        <div class="problem-box">
          <h3>🚨 The AI Readiness Gap</h3>
          <ul class="problem-list">
            <li>70% of AI projects fail due to poor preparation, not technology</li>
            <li>Most businesses don't know their data quality or team capability</li>
            <li>Jumping into AI without a baseline leads to wasted budget and frustration</li>
          </ul>
        </div>
        
        <h2 class="section-title">Why Take the AI Readiness Assessment?</h2>
        
        <ul class="benefit-list">
          <li class="benefit-item">
            <span class="benefit-icon">✓</span>
            <span><strong>Instant clarity</strong> — Know exactly where you stand across 5 strategic pillars</span>
          </li>
          <li class="benefit-item">
            <span class="benefit-icon">✓</span>
            <span><strong>Actionable insights</strong> — Get tailored recommendations, not generic advice</span>
          </li>
          <li class="benefit-item">
            <span class="benefit-icon">✓</span>
            <span><strong>Benchmark yourself</strong> — See how you compare to industry peers</span>
          </li>
          <li class="benefit-item">
            <span class="benefit-icon">✓</span>
            <span><strong>Prioritise investment</strong> — Know what to fix before you spend on AI</span>
          </li>
          <li class="benefit-item">
            <span class="benefit-icon">✓</span>
            <span><strong>Board-ready output</strong> — Share your score with stakeholders confidently</span>
          </li>
        </ul>
        
        <h2 class="section-title">What We Measure</h2>
        
        <table class="pillar-grid" role="presentation">
          <tr class="pillar-row">
            <td class="pillar-item">
              <div class="pillar-card">
                <div class="pillar-emoji">🔄</div>
                <p class="pillar-name">Transformation</p>
              </div>
            </td>
            <td class="pillar-item">
              <div class="pillar-card">
                <div class="pillar-emoji">🏗️</div>
                <p class="pillar-name">Architecture</p>
              </div>
            </td>
          </tr>
          <tr class="pillar-row">
            <td class="pillar-item">
              <div class="pillar-card">
                <div class="pillar-emoji">🛡️</div>
                <p class="pillar-name">Governance</p>
              </div>
            </td>
            <td class="pillar-item">
              <div class="pillar-card">
                <div class="pillar-emoji">💰</div>
                <p class="pillar-name">Value</p>
              </div>
            </td>
          </tr>
          <tr class="pillar-row">
            <td class="pillar-item" colspan="2" style="text-align: center;">
              <div class="pillar-card" style="display: inline-block; min-width: 120px;">
                <div class="pillar-emoji">⚙️</div>
                <p class="pillar-name">Operating Style</p>
              </div>
            </td>
          </tr>
        </table>
        
        <!-- Stats -->
        <table class="stats-row" role="presentation">
          <tr>
            <td class="stat-item">
              <p class="stat-number">5</p>
              <p class="stat-label">Minutes</p>
            </td>
            <td class="stat-item">
              <p class="stat-number">10</p>
              <p class="stat-label">Questions</p>
            </td>
            <td class="stat-item">
              <p class="stat-number">100%</p>
              <p class="stat-label">Free</p>
            </td>
          </tr>
        </table>
        
        <!-- CTA Section -->
        <div class="cta-section">
          <h3 class="cta-title">Get Your AI Readiness Score</h3>
          <p class="cta-subtitle">No signup required for the free assessment</p>
          <a href="https://wellnessgenius.ai/ai-readiness" class="cta-button">
            Take the Assessment →
          </a>
          <div class="free-badge">🎯 Takes less than 5 minutes</div>
        </div>
        
        <!-- Who it's for -->
        <div class="audience-section">
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
          <p class="name">Wellness Genius</p>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="footer">
        <p>Wellness Genius — AI Intelligence for the Wellness Industry</p>
        <p>
          <a href="https://wellnessgenius.ai">Website</a> · 
          <a href="https://wellnessgenius.ai/insights">Latest Insights</a> · 
          <a href="https://wellnessgenius.ai/ai-readiness">AI Readiness</a>
        </p>
        ${unsubscribeUrl ? `<p style="margin-top: 16px;"><a href="${unsubscribeUrl}" style="color: #9ca3af;">Unsubscribe</a></p>` : ''}
        <p style="margin-top: 16px; font-size: 12px; color: #9ca3af;">
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

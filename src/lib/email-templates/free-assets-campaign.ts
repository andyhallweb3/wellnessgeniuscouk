// Email campaign templates for 3 free wellness assets
// Designed for wellness professionals to drive platform engagement

const baseStyles = `
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
    
    .header-accent {
      background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);
    }
    
    .header-warm {
      background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%);
    }
    
    .logo {
      width: 160px;
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
    
    .header .subhead {
      color: rgba(255, 255, 255, 0.9);
      font-size: 15px;
      margin: 0;
    }
    
    .badge {
      display: inline-block;
      background: rgba(255,255,255,0.2);
      color: #ffffff;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 16px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
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
    
    .highlight-box.purple {
      background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
      border-left-color: #7c3aed;
    }
    
    .highlight-box.orange {
      background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
      border-left-color: #ea580c;
    }
    
    .section-title {
      font-size: 18px;
      font-weight: 700;
      color: #111827;
      margin: 28px 0 16px 0;
    }
    
    .benefit-list {
      margin: 0;
      padding: 0;
      list-style: none;
    }
    
    .benefit-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 14px;
      font-size: 15px;
      line-height: 1.6;
      color: #374151;
    }
    
    .benefit-icon {
      width: 22px;
      height: 22px;
      min-width: 22px;
      background-color: #d1fae5;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      color: #059669;
      font-size: 12px;
    }
    
    .benefit-icon.purple {
      background-color: #ede9fe;
      color: #7c3aed;
    }
    
    .benefit-icon.orange {
      background-color: #ffedd5;
      color: #ea580c;
    }
    
    .cta-section {
      background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
      border-radius: 12px;
      padding: 32px;
      text-align: center;
      margin: 32px 0;
    }
    
    .cta-section.purple {
      background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
    }
    
    .cta-section.orange {
      background: linear-gradient(135deg, #ea580c 0%, #dc2626 100%);
    }
    
    .cta-title {
      font-size: 20px;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 8px 0;
    }
    
    .cta-subtitle {
      font-size: 14px;
      color: rgba(255,255,255,0.9);
      margin: 0 0 20px 0;
    }
    
    .cta-button {
      display: inline-block;
      background: #ffffff;
      color: #0d9488 !important;
      text-decoration: none;
      padding: 16px 40px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
    }
    
    .cta-button.purple {
      color: #7c3aed !important;
    }
    
    .cta-button.orange {
      color: #ea580c !important;
    }
    
    .stat-row {
      display: table;
      width: 100%;
      margin: 24px 0;
    }
    
    .stat-item {
      display: table-cell;
      width: 33.33%;
      text-align: center;
      padding: 16px 8px;
    }
    
    .stat-number {
      font-size: 28px;
      font-weight: 700;
      color: #0d9488;
      margin-bottom: 4px;
    }
    
    .stat-label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .testimonial {
      border-left: 4px solid #0d9488;
      padding-left: 20px;
      margin: 28px 0;
      font-style: italic;
      color: #4b5563;
      font-size: 15px;
      line-height: 1.7;
    }
    
    .testimonial-author {
      font-style: normal;
      font-weight: 600;
      color: #111827;
      margin-top: 12px;
    }
    
    .ps-section {
      background-color: #fefce8;
      border-radius: 8px;
      padding: 20px;
      margin-top: 24px;
    }
    
    .ps-section p {
      margin: 0;
      font-size: 14px;
      color: #713f12;
    }
    
    .signature {
      margin-top: 32px;
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
      .email-wrapper { padding: 20px 12px; }
      .header, .content, .footer { padding-left: 20px; padding-right: 20px; }
      .header h1 { font-size: 22px; }
      .stat-item { display: block; width: 100%; }
      .cta-button { display: block; text-align: center; }
    }
  </style>
`;

// ============================================
// EMAIL 1: AI Advisor Free Trial
// ============================================
export const generateAIAdvisorTrialEmail = (unsubscribeUrl?: string): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Your Personal AI Advisor is Waiting</title>
  ${baseStyles}
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      <div class="header header-accent">
        <img src="https://wellnessgenius.co.uk/images/wellness-genius-logo-teal.png" alt="Wellness Genius" class="logo" />
        <span class="badge">Free Trial</span>
        <h1>Your Personal AI Advisor is Ready</h1>
        <p class="subhead">5 free questions. Zero commitment. Real answers.</p>
      </div>
      
      <div class="content">
        <p class="intro">
          <strong>Let me be direct:</strong> Most AI tools give you generic advice that sounds impressive but doesn't move your business forward.
        </p>
        
        <p class="intro">
          The Wellness Genius AI Advisor is different. It's trained on 15+ years of wellness industry intelligence — and it's ready to tackle your specific challenges.
        </p>
        
        <div class="highlight-box purple">
          <strong>Here's what you get with your free trial:</strong>
          <ul class="benefit-list" style="margin-top: 16px;">
            <li class="benefit-item">
              <span class="benefit-icon purple">✓</span>
              <span>5 questions across any topic — strategy, operations, tech decisions</span>
            </li>
            <li class="benefit-item">
              <span class="benefit-icon purple">✓</span>
              <span>Answers grounded in real wellness industry data, not ChatGPT fluff</span>
            </li>
            <li class="benefit-item">
              <span class="benefit-icon purple">✓</span>
              <span>Diagnostic, Decision, and Commercial modes to match your need</span>
            </li>
          </ul>
        </div>
        
        <h3 class="section-title">Questions Other Wellness Leaders Are Asking:</h3>
        
        <ul class="benefit-list">
          <li class="benefit-item">
            <span class="benefit-icon purple">→</span>
            <span>"Should I build custom AI or buy off-the-shelf for member engagement?"</span>
          </li>
          <li class="benefit-item">
            <span class="benefit-icon purple">→</span>
            <span>"What's the realistic ROI timeline for AI personalisation?"</span>
          </li>
          <li class="benefit-item">
            <span class="benefit-icon purple">→</span>
            <span>"How do I get my team ready for AI without blowing budget?"</span>
          </li>
          <li class="benefit-item">
            <span class="benefit-icon purple">→</span>
            <span>"Where are the quick wins I can show my board in 90 days?"</span>
          </li>
        </ul>
        
        <div class="testimonial">
          "I spent 3 hours with consultants and got less clarity than 10 minutes with the AI Advisor. It actually understands wellness operations."
          <div class="testimonial-author">— Commercial Director, Multi-site Operator</div>
        </div>
        
        <div class="cta-section purple">
          <h3 class="cta-title">Start Your Free Trial</h3>
          <p class="cta-subtitle">No credit card. No sales call. Just answers.</p>
          <a href="https://wellnessgenius.co.uk/ai-advisor" class="cta-button purple">
            Ask Your First Question →
          </a>
        </div>
        
        <div class="ps-section">
          <p><strong>P.S.</strong> Your 5 free questions never expire. Use them when you need them most — like before your next board meeting or vendor negotiation.</p>
        </div>
        
        <div class="signature">
          <p class="name">Andy Sherwin</p>
          <p>Founder, Wellness Genius</p>
          <p style="color: #6b7280; font-size: 14px;">
            <a href="https://www.linkedin.com/in/andy-sherwin-wellness-genius/" style="color: #7c3aed;">Connect on LinkedIn</a>
          </p>
        </div>
      </div>
      
      <div class="footer">
        <p>Wellness Genius — AI Intelligence for the Wellness Industry</p>
        <p>
          <a href="https://wellnessgenius.co.uk">Website</a> · 
          <a href="https://wellnessgenius.co.uk/products">Products</a>
        </p>
        ${unsubscribeUrl ? `<p style="margin-top: 16px;"><a href="${unsubscribeUrl}" style="color: #9ca3af;">Unsubscribe</a></p>` : ''}
        <p style="margin-top: 16px; font-size: 12px; color: #9ca3af;">© 2025 Wellness Genius. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;
};

export const aiAdvisorTrialSubject = "🤖 Your personal AI advisor is waiting (5 free questions)";
export const aiAdvisorTrialPreview = "Real answers for wellness operators. No ChatGPT fluff. Start your free trial today.";

// ============================================
// EMAIL 2: Free Ebook Download
// ============================================
export const generateEbookDownloadEmail = (unsubscribeUrl?: string): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Free Ebook: Structure AI in Your Wellness Business</title>
  ${baseStyles}
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      <div class="header">
        <img src="https://wellnessgenius.co.uk/images/wellness-genius-logo-teal.png" alt="Wellness Genius" class="logo" />
        <span class="badge">Free Download</span>
        <h1>Stop Guessing. Start Structuring.</h1>
        <p class="subhead">The 30-page guide to AI that actually works for wellness</p>
      </div>
      
      <div class="content">
        <p class="intro">
          <strong>The hard truth:</strong> 70% of wellness AI projects fail. Not because of bad technology — but because operators skip the foundational work.
        </p>
        
        <p class="intro">
          This free ebook shows you how to structure AI properly from day one — so you avoid becoming another cautionary tale.
        </p>
        
        <div class="stat-row">
          <div class="stat-item">
            <div class="stat-number">30</div>
            <div class="stat-label">Pages</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">4</div>
            <div class="stat-label">Key Pillars</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">15+</div>
            <div class="stat-label">Years Expertise</div>
          </div>
        </div>
        
        <h3 class="section-title">The 4 Pillars You'll Master:</h3>
        
        <div class="highlight-box">
          <ul class="benefit-list">
            <li class="benefit-item">
              <span class="benefit-icon">📊</span>
              <span><strong>Data Foundation</strong> — What you actually need (and what's just noise)</span>
            </li>
            <li class="benefit-item">
              <span class="benefit-icon">⚙️</span>
              <span><strong>Process Integration</strong> — Where AI fits in your operations</span>
            </li>
            <li class="benefit-item">
              <span class="benefit-icon">🛡️</span>
              <span><strong>Risk Management</strong> — GDPR, ethics, and staying out of trouble</span>
            </li>
            <li class="benefit-item">
              <span class="benefit-icon">👥</span>
              <span><strong>People Readiness</strong> — Getting your team to embrace (not fear) AI</span>
            </li>
          </ul>
        </div>
        
        <h3 class="section-title">What You'll Walk Away With:</h3>
        
        <ul class="benefit-list">
          <li class="benefit-item">
            <span class="benefit-icon">✓</span>
            <span>A clear framework for evaluating any AI investment</span>
          </li>
          <li class="benefit-item">
            <span class="benefit-icon">✓</span>
            <span>Red flags that signal a project is doomed before it starts</span>
          </li>
          <li class="benefit-item">
            <span class="benefit-icon">✓</span>
            <span>The minimum viable data requirements for each AI use case</span>
          </li>
          <li class="benefit-item">
            <span class="benefit-icon">✓</span>
            <span>A 90-day sequencing plan that boards actually approve</span>
          </li>
        </ul>
        
        <div class="testimonial">
          "This ebook saved me from signing a £50k contract we weren't ready for. The data pillar section alone was worth its weight in gold."
          <div class="testimonial-author">— Head of Digital, Boutique Fitness Chain</div>
        </div>
        
        <div class="cta-section">
          <h3 class="cta-title">Download Your Free Copy</h3>
          <p class="cta-subtitle">Instant access. No sales pitch. Just substance.</p>
          <a href="https://wellnessgenius.co.uk/hub/structured-ai-ebook" class="cta-button">
            Get the Free Ebook →
          </a>
        </div>
        
        <div class="ps-section">
          <p><strong>P.S.</strong> Already know you need help implementing? After reading, check out our AI Readiness Score — it turns these concepts into a personalised action plan for your business.</p>
        </div>
        
        <div class="signature">
          <p class="name">Andy Sherwin</p>
          <p>Founder, Wellness Genius</p>
          <p style="color: #6b7280; font-size: 14px;">
            <a href="https://www.linkedin.com/in/andy-sherwin-wellness-genius/" style="color: #0d9488;">Connect on LinkedIn</a>
          </p>
        </div>
      </div>
      
      <div class="footer">
        <p>Wellness Genius — AI Intelligence for the Wellness Industry</p>
        <p>
          <a href="https://wellnessgenius.co.uk">Website</a> · 
          <a href="https://wellnessgenius.co.uk/products">Products</a>
        </p>
        ${unsubscribeUrl ? `<p style="margin-top: 16px;"><a href="${unsubscribeUrl}" style="color: #9ca3af;">Unsubscribe</a></p>` : ''}
        <p style="margin-top: 16px; font-size: 12px; color: #9ca3af;">© 2025 Wellness Genius. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;
};

export const ebookDownloadSubject = "📖 Free: The 30-page guide to AI that actually works for wellness";
export const ebookDownloadPreview = "70% of wellness AI projects fail. Here's how to avoid that fate — free ebook inside.";

// ============================================
// EMAIL 3: AI Readiness Score
// ============================================
export const generateReadinessScoreEmail = (unsubscribeUrl?: string): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>What's Your AI Readiness Score?</title>
  ${baseStyles}
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      <div class="header header-warm">
        <img src="https://wellnessgenius.co.uk/images/wellness-genius-logo-teal.png" alt="Wellness Genius" class="logo" />
        <span class="badge">Free Assessment</span>
        <h1>What's Your AI Readiness Score?</h1>
        <p class="subhead">5 minutes. Brutal honesty. A clear path forward.</p>
      </div>
      
      <div class="content">
        <p class="intro">
          <strong>Here's what I've learned from 15 years in wellness tech:</strong> The businesses that win with AI aren't the ones with the biggest budgets. They're the ones who know exactly where they stand — and what to fix first.
        </p>
        
        <p class="intro">
          The AI Readiness Score gives you that clarity in under 5 minutes.
        </p>
        
        <div class="highlight-box orange">
          <strong>After the assessment, you'll know:</strong>
          <ul class="benefit-list" style="margin-top: 16px;">
            <li class="benefit-item">
              <span class="benefit-icon orange">1</span>
              <span>Your overall readiness band (Explorer → Champion)</span>
            </li>
            <li class="benefit-item">
              <span class="benefit-icon orange">2</span>
              <span>Which of the 5 pillars is holding you back</span>
            </li>
            <li class="benefit-item">
              <span class="benefit-icon orange">3</span>
              <span>What to prioritise in the next 90 days</span>
            </li>
            <li class="benefit-item">
              <span class="benefit-icon orange">4</span>
              <span>How you compare to similar wellness operators</span>
            </li>
          </ul>
        </div>
        
        <h3 class="section-title">The 5 Pillars We Assess:</h3>
        
        <ul class="benefit-list">
          <li class="benefit-item">
            <span class="benefit-icon orange">📊</span>
            <span><strong>Data</strong> — Is your data AI-ready or a liability?</span>
          </li>
          <li class="benefit-item">
            <span class="benefit-icon orange">⚙️</span>
            <span><strong>Process</strong> — Where can AI actually plug in?</span>
          </li>
          <li class="benefit-item">
            <span class="benefit-icon orange">👥</span>
            <span><strong>People</strong> — Will your team embrace or resist?</span>
          </li>
          <li class="benefit-item">
            <span class="benefit-icon orange">🛡️</span>
            <span><strong>Risk</strong> — Are you protected legally and ethically?</span>
          </li>
          <li class="benefit-item">
            <span class="benefit-icon orange">👔</span>
            <span><strong>Leadership</strong> — Does the C-suite really get it?</span>
          </li>
        </ul>
        
        <div class="testimonial" style="border-color: #ea580c;">
          "The score showed us we were a 'Dabbler' — painful to hear, but exactly what we needed. We fixed our data gaps first and jumped two bands in 6 months."
          <div class="testimonial-author">— CEO, Wellness Retreat Group</div>
        </div>
        
        <h3 class="section-title">Why This Matters Now:</h3>
        
        <p class="intro">
          Your competitors are investing in AI. Some will fail spectacularly. Others will pull ahead and never look back.
        </p>
        
        <p class="intro">
          The difference? <strong>They knew their starting point.</strong>
        </p>
        
        <div class="cta-section orange">
          <h3 class="cta-title">Get Your Free Score</h3>
          <p class="cta-subtitle">5 minutes. Instant results. No sales call required.</p>
          <a href="https://wellnessgenius.co.uk/ai-readiness" class="cta-button orange">
            Take the Assessment →
          </a>
        </div>
        
        <div class="ps-section">
          <p><strong>P.S.</strong> After you get your score, you can upgrade to the Commercial Edition (£39.99) for revenue projections, benchmarks, and a detailed 90-day roadmap. But the free version? Still brutally honest.</p>
        </div>
        
        <div class="signature">
          <p class="name">Andy Sherwin</p>
          <p>Founder, Wellness Genius</p>
          <p style="color: #6b7280; font-size: 14px;">
            <a href="https://www.linkedin.com/in/andy-sherwin-wellness-genius/" style="color: #ea580c;">Connect on LinkedIn</a>
          </p>
        </div>
      </div>
      
      <div class="footer">
        <p>Wellness Genius — AI Intelligence for the Wellness Industry</p>
        <p>
          <a href="https://wellnessgenius.co.uk">Website</a> · 
          <a href="https://wellnessgenius.co.uk/products">Products</a>
        </p>
        ${unsubscribeUrl ? `<p style="margin-top: 16px;"><a href="${unsubscribeUrl}" style="color: #9ca3af;">Unsubscribe</a></p>` : ''}
        <p style="margin-top: 16px; font-size: 12px; color: #9ca3af;">© 2025 Wellness Genius. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;
};

export const readinessScoreSubject = "🎯 What's your AI Readiness Score? (5-min assessment)";
export const readinessScorePreview = "Brutal honesty about where you stand with AI — and what to fix first. Free assessment inside.";

// ============================================
// COMBINED: All 3 templates for campaign
// ============================================
export const freeAssetsCampaign = {
  email1: {
    name: "AI Advisor Free Trial",
    generate: generateAIAdvisorTrialEmail,
    subject: aiAdvisorTrialSubject,
    preview: aiAdvisorTrialPreview,
    sendDelay: 0, // Send immediately
  },
  email2: {
    name: "Free Ebook Download",
    generate: generateEbookDownloadEmail,
    subject: ebookDownloadSubject,
    preview: ebookDownloadPreview,
    sendDelay: 3, // Send 3 days later
  },
  email3: {
    name: "AI Readiness Score",
    generate: generateReadinessScoreEmail,
    subject: readinessScoreSubject,
    preview: readinessScorePreview,
    sendDelay: 7, // Send 7 days later
  },
};

import jsPDF from "jspdf";

// Brand colors (converted to RGB)
const BRAND = {
  teal: [45, 212, 191] as [number, number, number],
  darkBg: [24, 24, 27] as [number, number, number],
  cardBg: [39, 39, 42] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  muted: [161, 161, 170] as [number, number, number],
};

// Helper to add header to each page
const addHeader = (doc: jsPDF, pageNum: number, totalPages: number) => {
  doc.setFillColor(...BRAND.darkBg);
  doc.rect(0, 0, 210, 297, "F");
  
  // Header bar
  doc.setFillColor(...BRAND.teal);
  doc.rect(0, 0, 210, 8, "F");
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(...BRAND.muted);
  doc.text("wellnessgenius.io", 20, 290);
  doc.text(`${pageNum} / ${totalPages}`, 190, 290, { align: "right" });
};

// AI Myths Deck - 10 Slides
export const generateAIMythsDeck = (): jsPDF => {
  const doc = new jsPDF();
  
  const slides = [
    {
      title: "The Wellness AI Myths Deck",
      subtitle: "10 myths holding back your AI strategy",
      isTitle: true,
    },
    {
      myth: "Myth #1",
      title: '"We need AI"',
      reality: "You need better outcomes. AI is a tool, not a goal.",
      insight: "Start with the problem you are solving, not the technology you want to use. Most wellness challenges can be addressed with simpler solutions.",
    },
    {
      myth: "Myth #2",
      title: '"Engagement = Value"',
      reality: "High engagement without insight is just noise.",
      insight: "Tracking app opens and session length tells you nothing about health outcomes. Focus on meaningful actions that correlate with results.",
    },
    {
      myth: "Myth #3",
      title: '"Our data is our moat"',
      reality: "Most wellness data cannot be monetised or even used.",
      insight: "Without proper consent, data governance, and clean pipelines, your data is a liability, not an asset. Quality beats quantity.",
    },
    {
      myth: "Myth #4",
      title: '"AI will reduce our headcount"',
      reality: "AI augments expertise. It does not replace judgement.",
      insight: "The best AI implementations free up skilled staff for higher-value work. Plan for redeployment, not replacement.",
    },
    {
      myth: "Myth #5",
      title: '"We can build this ourselves"',
      reality: "Build vs buy is rarely binary. Most should partner.",
      insight: "In-house AI requires sustained investment in talent, infrastructure, and maintenance. Honest assessment of capabilities saves money.",
    },
    {
      myth: "Myth #6",
      title: '"Personalisation sells"',
      reality: "Generic personalisation is often worse than none.",
      insight: "Users can spot shallow personalisation instantly. It erodes trust. Either invest in meaningful personalisation or be honest about what you offer.",
    },
    {
      myth: "Myth #7",
      title: '"We need more features"',
      reality: "Feature creep kills wellness products faster than competition.",
      insight: "Every feature is a promise to maintain, support, and improve. The best products do fewer things exceptionally well.",
    },
    {
      myth: "Myth #8",
      title: '"AI is plug and play"',
      reality: "Integration is where most AI projects fail.",
      insight: "The AI model is 20% of the work. Data pipelines, user experience, and operational integration are the other 80%.",
    },
    {
      myth: "Myth #9",
      title: '"Compliance can come later"',
      reality: "Retrofitting governance is 10x harder than building it in.",
      insight: "GDPR, HIPAA, and emerging AI regulations require privacy-by-design. Early investment prevents expensive rewrites.",
    },
    {
      myth: "Myth #10",
      title: '"First mover advantage"',
      reality: "In wellness AI, fast followers often win.",
      insight: "Let others make expensive mistakes. Focus on execution excellence and genuine differentiation rather than being first.",
    },
  ];

  slides.forEach((slide, index) => {
    if (index > 0) doc.addPage();
    addHeader(doc, index + 1, slides.length);

    if (slide.isTitle) {
      // Title slide
      doc.setFontSize(36);
      doc.setTextColor(...BRAND.white);
      doc.text(slide.title, 105, 100, { align: "center" });
      
      doc.setFontSize(16);
      doc.setTextColor(...BRAND.teal);
      doc.text(slide.subtitle || "", 105, 120, { align: "center" });
      
      doc.setFontSize(12);
      doc.setTextColor(...BRAND.muted);
      doc.text("Wellness Genius", 105, 200, { align: "center" });
      doc.text("wellnessgenius.io", 105, 210, { align: "center" });
    } else {
      // Content slide
      doc.setFontSize(12);
      doc.setTextColor(...BRAND.teal);
      doc.text(slide.myth || "", 20, 40);
      
      doc.setFontSize(28);
      doc.setTextColor(...BRAND.white);
      doc.text(slide.title, 20, 60);
      
      // Reality box
      doc.setFillColor(...BRAND.cardBg);
      doc.roundedRect(20, 80, 170, 40, 3, 3, "F");
      
      doc.setFontSize(10);
      doc.setTextColor(...BRAND.teal);
      doc.text("REALITY", 30, 95);
      
      doc.setFontSize(14);
      doc.setTextColor(...BRAND.white);
      const realityLines = doc.splitTextToSize(slide.reality || "", 150);
      doc.text(realityLines, 30, 108);
      
      // Insight section
      doc.setFontSize(10);
      doc.setTextColor(...BRAND.teal);
      doc.text("INSIGHT", 20, 145);
      
      doc.setFontSize(12);
      doc.setTextColor(...BRAND.muted);
      const insightLines = doc.splitTextToSize(slide.insight || "", 170);
      doc.text(insightLines, 20, 158);
    }
  });

  // Final CTA slide
  doc.addPage();
  addHeader(doc, slides.length + 1, slides.length + 1);
  
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("Ready to cut through the noise?", 105, 100, { align: "center" });
  
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.muted);
  doc.text("Take the free AI Readiness Assessment", 105, 130, { align: "center" });
  
  doc.setFontSize(16);
  doc.setTextColor(...BRAND.teal);
  doc.text("wellnessgenius.io/ai-readiness", 105, 150, { align: "center" });

  return doc;
};

// 90-Day AI Reality Checklist
export const generate90DayChecklist = (): jsPDF => {
  const doc = new jsPDF();
  
  addHeader(doc, 1, 1);
  
  // Title
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("90-Day AI Reality Checklist", 105, 30, { align: "center" });
  
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.teal);
  doc.text("Your practical roadmap to AI readiness in wellness", 105, 40, { align: "center" });

  const sections = [
    {
      title: "MONTH 1: DATA FOUNDATIONS",
      items: [
        "Audit existing data sources and quality",
        "Map data consent and governance gaps",
        "Identify one high-value data set to clean",
        "Document current manual processes",
        "Benchmark current metrics baseline",
      ],
    },
    {
      title: "MONTH 2: ENGAGEMENT & JOURNEYS",
      items: [
        "Map user journeys end-to-end",
        "Identify drop-off points and friction",
        "Define 3 key engagement metrics that matter",
        "Audit current personalisation (if any)",
        "Interview 5 users about their experience",
      ],
    },
    {
      title: "MONTH 3: MONETISATION CLARITY",
      items: [
        "Calculate true cost of current operations",
        "Model potential efficiency gains",
        "Identify one pilot AI use case",
        "Build business case with conservative estimates",
        "Define success criteria for pilot",
      ],
    },
    {
      title: "ONGOING: TRUST & COMPLIANCE",
      items: [
        "Review privacy policy for AI implications",
        "Plan for transparency in AI-driven decisions",
        "Establish human oversight protocols",
        "Train team on responsible AI principles",
        "Monitor regulatory developments",
      ],
    },
  ];

  let yPos = 55;
  const checkboxSize = 4;
  
  sections.forEach((section) => {
    // Section header
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(15, yPos - 5, 180, 10, 2, 2, "F");
    
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.teal);
    doc.text(section.title, 20, yPos + 2);
    
    yPos += 12;
    
    // Checklist items
    section.items.forEach((item) => {
      // Checkbox
      doc.setDrawColor(...BRAND.teal);
      doc.setLineWidth(0.5);
      doc.rect(20, yPos - 3, checkboxSize, checkboxSize);
      
      // Text
      doc.setFontSize(9);
      doc.setTextColor(...BRAND.white);
      doc.text(item, 28, yPos);
      
      yPos += 8;
    });
    
    yPos += 6;
  });

  // Bottom CTA
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, 255, 180, 25, 3, 3, "F");
  
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.white);
  doc.text("Want a personalised action plan?", 105, 265, { align: "center" });
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.teal);
  doc.text("Get your AI Readiness Score at wellnessgenius.io/ai-readiness", 105, 275, { align: "center" });

  return doc;
};

// Wellness AI Builder Prompt Pack
export const generatePromptPack = (): jsPDF => {
  const doc = new jsPDF();
  
  const pages = [
    {
      title: "Wellness AI Builder",
      subtitle: "Prompt Pack",
      isTitle: true,
    },
    {
      section: "STRATEGIC PROMPTS",
      prompts: [
        {
          name: "Market Position Analysis",
          prompt: "Analyse my wellness [product/service] targeting [audience]. What AI capabilities would create genuine differentiation vs competitors offering [list 3 competitors]? Focus on defensible advantages, not features.",
        },
        {
          name: "Build vs Buy Decision",
          prompt: "I'm considering [AI capability] for [use case]. Our team has [X developers], budget of [£X], and need delivery in [X months]. Walk me through build vs buy trade-offs specific to our constraints.",
        },
        {
          name: "ROI Modelling",
          prompt: "Calculate potential ROI for implementing [AI feature] in our [wellness product]. Current metrics: [engagement rate], [retention], [LTV]. Be conservative and highlight assumptions.",
        },
      ],
    },
    {
      section: "PRODUCT PROMPTS",
      prompts: [
        {
          name: "Feature Prioritisation",
          prompt: "Our wellness app has these potential AI features: [list]. Users report these pain points: [list]. Rank features by impact vs implementation effort, considering we have [team size/budget].",
        },
        {
          name: "Personalisation Strategy",
          prompt: "Design a personalisation framework for [wellness product]. We collect [data types]. Define 3 tiers: basic (rule-based), intermediate (ML), advanced (generative). What's minimum viable?",
        },
        {
          name: "User Journey Optimisation",
          prompt: "Map how AI could improve each stage of this wellness user journey: [describe journey]. Identify where AI adds genuine value vs where simpler solutions work better.",
        },
      ],
    },
    {
      section: "DATA & COMPLIANCE PROMPTS",
      prompts: [
        {
          name: "Data Audit",
          prompt: "Audit our wellness data readiness: We have [data sources]. Users consented to [uses]. Identify gaps in: quality, consent, governance, and pipeline readiness for AI applications.",
        },
        {
          name: "Privacy-First AI",
          prompt: "Design a GDPR-compliant AI feature for [use case] in wellness. Cover: data minimisation, consent mechanisms, right to explanation, and human oversight requirements.",
        },
        {
          name: "Vendor Evaluation",
          prompt: "Evaluate [AI vendor] for [wellness use case]. Create scorecard covering: data handling, accuracy claims, integration effort, pricing model, and exit strategy.",
        },
      ],
    },
    {
      section: "ENGAGEMENT PROMPTS",
      prompts: [
        {
          name: "Retention Analysis",
          prompt: "Analyse what drives retention in wellness apps like ours (category: [type]). Our current 30-day retention is [X%]. What AI interventions have evidence of impact?",
        },
        {
          name: "Content Strategy",
          prompt: "Create AI-assisted content strategy for [wellness niche]. Balance: personalisation depth, content freshness, production cost, and authenticity. Define what stays human-created.",
        },
        {
          name: "Behaviour Change Design",
          prompt: "Design an AI-supported behaviour change programme for [health goal]. Use evidence-based frameworks (COM-B, TTM). Specify where AI helps vs where human support matters.",
        },
      ],
    },
  ];

  pages.forEach((page, index) => {
    if (index > 0) doc.addPage();
    addHeader(doc, index + 1, pages.length);

    if (page.isTitle) {
      doc.setFontSize(36);
      doc.setTextColor(...BRAND.white);
      doc.text(page.title || "", 105, 100, { align: "center" });
      
      doc.setFontSize(24);
      doc.setTextColor(...BRAND.teal);
      doc.text(page.subtitle || "", 105, 120, { align: "center" });
      
      doc.setFontSize(12);
      doc.setTextColor(...BRAND.muted);
      doc.text("12 battle-tested prompts for wellness AI strategy", 105, 150, { align: "center" });
      doc.text("Wellness Genius • wellnessgenius.io", 105, 200, { align: "center" });
    } else {
      doc.setFontSize(14);
      doc.setTextColor(...BRAND.teal);
      doc.text(page.section || "", 20, 30);
      
      let yPos = 45;
      page.prompts?.forEach((p) => {
        doc.setFillColor(...BRAND.cardBg);
        doc.roundedRect(15, yPos - 5, 180, 70, 3, 3, "F");
        
        doc.setFontSize(12);
        doc.setTextColor(...BRAND.white);
        doc.text(p.name, 20, yPos + 5);
        
        doc.setFontSize(9);
        doc.setTextColor(...BRAND.muted);
        const lines = doc.splitTextToSize(p.prompt, 165);
        doc.text(lines, 20, yPos + 18);
        
        yPos += 80;
      });
    }
  });

  return doc;
};

// Engagement → Revenue Framework
export const generateRevenueFramework = (): jsPDF => {
  const doc = new jsPDF();
  
  const pages = [
    { isTitle: true },
    {
      title: "The Revenue Equation",
      content: [
        "Revenue = Users × Engagement × Conversion × LTV",
        "",
        "Most wellness products optimise for the wrong variable.",
        "",
        "More users with poor engagement = expensive churn",
        "High engagement without conversion = vanity metrics",
        "Conversion without LTV focus = race to bottom",
        "",
        "This framework helps you identify which variable",
        "deserves your AI investment.",
      ],
    },
    {
      title: "Stage 1: Diagnostic",
      subtitle: "Where's your revenue leaking?",
      checklist: [
        "Calculate true CAC (include all marketing + onboarding costs)",
        "Map user journey with drop-off rates at each stage",
        "Identify time-to-value for your product",
        "Measure engagement quality, not just quantity",
        "Calculate revenue per engaged user (not per user)",
      ],
    },
    {
      title: "Stage 2: Prioritisation Matrix",
      matrix: true,
    },
    {
      title: "Stage 3: AI Investment Zones",
      zones: [
        { name: "ACQUISITION", ai: "Content generation, lead scoring, channel optimisation", caution: "Don't automate bad messaging" },
        { name: "ACTIVATION", ai: "Personalised onboarding, smart defaults, progress prediction", caution: "Keep human touchpoints for trust" },
        { name: "RETENTION", ai: "Churn prediction, re-engagement timing, content personalisation", caution: "Avoid creepy over-personalisation" },
        { name: "REVENUE", ai: "Upgrade propensity, pricing optimisation, upsell timing", caution: "Transparency over manipulation" },
      ],
    },
    {
      title: "Stage 4: Build Your Business Case",
      steps: [
        "1. Identify your weakest stage (highest drop-off)",
        "2. Quantify the revenue impact of 10% improvement",
        "3. Estimate AI solution cost (build vs buy)",
        "4. Calculate payback period with conservative assumptions",
        "5. Define success metrics before starting",
        "6. Plan pilot scope (small, measurable, reversible)",
      ],
    },
    {
      title: "The 80/20 Rule for Wellness AI",
      insights: [
        "80% of AI value comes from 20% of features",
        "80% of implementation cost is integration, not AI",
        "80% of failures are expectation mismatches, not tech",
        "80% of quick wins need no AI at all",
        "",
        "Start with the 20% that matters.",
      ],
    },
  ];

  pages.forEach((page, index) => {
    if (index > 0) doc.addPage();
    addHeader(doc, index + 1, pages.length);

    if (page.isTitle) {
      doc.setFontSize(32);
      doc.setTextColor(...BRAND.white);
      doc.text("Engagement → Revenue", 105, 90, { align: "center" });
      doc.setFontSize(24);
      doc.setTextColor(...BRAND.teal);
      doc.text("Framework", 105, 110, { align: "center" });
      doc.setFontSize(12);
      doc.setTextColor(...BRAND.muted);
      doc.text("Turn wellness engagement into sustainable revenue", 105, 140, { align: "center" });
      doc.text("Wellness Genius • wellnessgenius.io", 105, 200, { align: "center" });
    } else if (page.matrix) {
      doc.setFontSize(16);
      doc.setTextColor(...BRAND.white);
      doc.text(page.title || "", 105, 30, { align: "center" });
      
      // Draw matrix
      doc.setFillColor(...BRAND.cardBg);
      doc.roundedRect(25, 50, 75, 50, 3, 3, "F");
      doc.roundedRect(110, 50, 75, 50, 3, 3, "F");
      doc.roundedRect(25, 110, 75, 50, 3, 3, "F");
      doc.roundedRect(110, 110, 75, 50, 3, 3, "F");
      
      doc.setFontSize(10);
      doc.setTextColor(...BRAND.teal);
      doc.text("HIGH IMPACT", 62, 45, { align: "center" });
      doc.text("LOW IMPACT", 147, 45, { align: "center" });
      
      doc.setTextColor(...BRAND.white);
      doc.setFontSize(11);
      doc.text("DO FIRST", 62, 70, { align: "center" });
      doc.text("(AI-worthy)", 62, 80, { align: "center" });
      
      doc.text("CONSIDER", 147, 70, { align: "center" });
      doc.text("(Validate need)", 147, 80, { align: "center" });
      
      doc.text("SIMPLIFY", 62, 130, { align: "center" });
      doc.text("(Often no AI needed)", 62, 140, { align: "center" });
      
      doc.text("IGNORE", 147, 130, { align: "center" });
      doc.text("(Distraction)", 147, 140, { align: "center" });
      
      doc.setTextColor(...BRAND.muted);
      doc.setFontSize(9);
      doc.text("LOW EFFORT", 15, 80, { angle: 90 });
      doc.text("HIGH EFFORT", 15, 140, { angle: 90 });
    } else if (page.zones) {
      doc.setFontSize(16);
      doc.setTextColor(...BRAND.white);
      doc.text(page.title || "", 105, 25, { align: "center" });
      
      let yPos = 40;
      page.zones.forEach((zone) => {
        doc.setFillColor(...BRAND.cardBg);
        doc.roundedRect(15, yPos, 180, 55, 3, 3, "F");
        
        doc.setFontSize(11);
        doc.setTextColor(...BRAND.teal);
        doc.text(zone.name, 20, yPos + 12);
        
        doc.setFontSize(9);
        doc.setTextColor(...BRAND.white);
        doc.text("AI opportunity:", 20, yPos + 25);
        const aiLines = doc.splitTextToSize(zone.ai, 160);
        doc.text(aiLines, 20, yPos + 33);
        
        doc.setTextColor(...BRAND.muted);
        doc.text("Caution: " + zone.caution, 20, yPos + 48);
        
        yPos += 60;
      });
    } else {
      doc.setFontSize(18);
      doc.setTextColor(...BRAND.white);
      doc.text(page.title || "", 20, 35);
      
      if (page.subtitle) {
        doc.setFontSize(12);
        doc.setTextColor(...BRAND.teal);
        doc.text(page.subtitle, 20, 48);
      }
      
      let yPos = page.subtitle ? 65 : 55;
      
      const items = page.content || page.checklist || page.steps || page.insights || [];
      items.forEach((item) => {
        if (item === "") {
          yPos += 8;
        } else {
          doc.setFontSize(10);
          doc.setTextColor(...BRAND.muted);
          const lines = doc.splitTextToSize(item, 170);
          doc.text(lines, 20, yPos);
          yPos += lines.length * 6 + 4;
        }
      });
    }
  });

  return doc;
};

// Build vs Buy Guide
export const generateBuildVsBuyGuide = (): jsPDF => {
  const doc = new jsPDF();
  
  const pages = [
    { isTitle: true },
    {
      title: "The Real Question",
      content: [
        "Build vs Buy is never binary.",
        "",
        "The real question is: What capability do you",
        "need to own to win?",
        "",
        "Everything else should be bought, partnered,",
        "or skipped entirely.",
        "",
        "This framework helps you decide what belongs",
        "in each category for your wellness business.",
      ],
    },
    {
      title: "The Build Criteria",
      subtitle: "Only build if ALL of these are true:",
      items: [
        "✓ Core to your differentiation (not just 'nice to have')",
        "✓ You have or can hire the expertise",
        "✓ You can maintain it for 3+ years",
        "✓ No suitable vendor exists (really check)",
        "✓ Speed to market isn't critical",
        "✓ You're willing to be wrong and pivot",
      ],
    },
    {
      title: "The Buy Criteria",
      subtitle: "Buy when ANY of these are true:",
      items: [
        "→ It's commodity functionality (auth, payments, etc.)",
        "→ Vendors have 10x your R&D budget",
        "→ Your team's time is better spent elsewhere",
        "→ You need it working in < 6 months",
        "→ The space is evolving rapidly",
        "→ Switching costs are manageable",
      ],
    },
    {
      title: "Wellness-Specific Guidance",
      sections: [
        { label: "USUALLY BUILD", items: "Domain-specific algorithms, proprietary content, unique user journeys, competitive-advantage features" },
        { label: "USUALLY BUY", items: "Infrastructure, generic AI (LLMs, speech-to-text), analytics, compliance tooling, payments" },
        { label: "USUALLY PARTNER", items: "Clinical validation, specialist content, hardware integration, enterprise distribution" },
        { label: "OFTEN SKIP", items: "Features that sound good in pitches but users don't need. Be ruthless." },
      ],
    },
    {
      title: "The Hidden Costs of Building",
      costs: [
        { item: "Initial development", multiplier: "1x" },
        { item: "Maintenance (per year)", multiplier: "0.2x" },
        { item: "Opportunity cost", multiplier: "2-5x" },
        { item: "Hiring/retaining talent", multiplier: "0.5x" },
        { item: "Technical debt (years 3+)", multiplier: "1-2x" },
      ],
    },
    {
      title: "Decision Framework",
      steps: [
        "1. List all AI capabilities you're considering",
        "2. Score each: differentiation (1-5), expertise (1-5)",
        "3. Research vendor landscape (spend a week)",
        "4. Cost model: build (3 years) vs buy (3 years)",
        "5. Assess switching costs if you change mind",
        "6. Start with buy, earn the right to build",
      ],
    },
    {
      title: "Key Takeaways",
      insights: [
        "1. Building is a marriage, buying is dating",
        "",
        "2. The best companies build less than you think",
        "",
        "3. Your build list should shrink over time",
        "",
        "4. 'We could build that' ≠ 'We should build that'",
        "",
        "5. Buy time, build moats",
      ],
    },
  ];

  pages.forEach((page, index) => {
    if (index > 0) doc.addPage();
    addHeader(doc, index + 1, pages.length);

    if (page.isTitle) {
      doc.setFontSize(32);
      doc.setTextColor(...BRAND.white);
      doc.text("Build vs Buy", 105, 90, { align: "center" });
      doc.setFontSize(24);
      doc.setTextColor(...BRAND.teal);
      doc.text("AI in Wellness", 105, 115, { align: "center" });
      doc.setFontSize(12);
      doc.setTextColor(...BRAND.muted);
      doc.text("A practical framework for investment decisions", 105, 145, { align: "center" });
      doc.text("Wellness Genius • wellnessgenius.io", 105, 200, { align: "center" });
    } else if (page.sections) {
      doc.setFontSize(16);
      doc.setTextColor(...BRAND.white);
      doc.text(page.title || "", 105, 25, { align: "center" });
      
      let yPos = 45;
      page.sections.forEach((s) => {
        doc.setFillColor(...BRAND.cardBg);
        doc.roundedRect(15, yPos, 180, 50, 3, 3, "F");
        
        doc.setFontSize(10);
        doc.setTextColor(...BRAND.teal);
        doc.text(s.label, 20, yPos + 15);
        
        doc.setFontSize(9);
        doc.setTextColor(...BRAND.muted);
        const lines = doc.splitTextToSize(s.items, 165);
        doc.text(lines, 20, yPos + 28);
        
        yPos += 55;
      });
    } else if (page.costs) {
      doc.setFontSize(16);
      doc.setTextColor(...BRAND.white);
      doc.text(page.title || "", 105, 30, { align: "center" });
      
      doc.setFontSize(10);
      doc.setTextColor(...BRAND.muted);
      doc.text("If initial build = £100k, expect:", 105, 45, { align: "center" });
      
      let yPos = 65;
      page.costs.forEach((c) => {
        doc.setFillColor(...BRAND.cardBg);
        doc.roundedRect(30, yPos, 150, 20, 2, 2, "F");
        
        doc.setFontSize(10);
        doc.setTextColor(...BRAND.white);
        doc.text(c.item, 40, yPos + 13);
        
        doc.setTextColor(...BRAND.teal);
        doc.text(c.multiplier, 165, yPos + 13, { align: "right" });
        
        yPos += 28;
      });
      
      doc.setFontSize(10);
      doc.setTextColor(...BRAND.muted);
      doc.text("Total 3-year cost: 4-10x initial estimate", 105, 235, { align: "center" });
    } else {
      doc.setFontSize(18);
      doc.setTextColor(...BRAND.white);
      doc.text(page.title || "", 20, 35);
      
      if (page.subtitle) {
        doc.setFontSize(11);
        doc.setTextColor(...BRAND.teal);
        doc.text(page.subtitle, 20, 48);
      }
      
      let yPos = page.subtitle ? 65 : 55;
      
      const items = page.content || page.items || page.steps || page.insights || [];
      items.forEach((item) => {
        if (item === "") {
          yPos += 8;
        } else {
          doc.setFontSize(10);
          doc.setTextColor(...BRAND.muted);
          const lines = doc.splitTextToSize(item, 170);
          doc.text(lines, 20, yPos);
          yPos += lines.length * 6 + 4;
        }
      });
    }
  });

  return doc;
};

// Download helper
export const downloadPDF = (doc: jsPDF, filename: string) => {
  doc.save(filename);
};

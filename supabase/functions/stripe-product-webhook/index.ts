import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0?target=deno";
import { Resend } from "https://esm.sh/resend@2.0.0?target=deno";
import { jsPDF } from "https://esm.sh/jspdf@2.5.2?target=deno&bundle-deps";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

// Brand colors (RGB)
const BRAND = {
  teal: [45, 212, 191] as [number, number, number],
  darkBg: [24, 24, 27] as [number, number, number],
  cardBg: [39, 39, 42] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  muted: [161, 161, 170] as [number, number, number],
};

const addHeader = (doc: jsPDF, pageNum: number, totalPages: number) => {
  doc.setFillColor(BRAND.darkBg[0], BRAND.darkBg[1], BRAND.darkBg[2]);
  doc.rect(0, 0, 210, 297, "F");
  doc.setFillColor(BRAND.teal[0], BRAND.teal[1], BRAND.teal[2]);
  doc.rect(0, 0, 210, 8, "F");
  doc.setFontSize(8);
  doc.setTextColor(BRAND.muted[0], BRAND.muted[1], BRAND.muted[2]);
  doc.text("wellnessgenius.co.uk", 20, 290);
  doc.text(`${pageNum} / ${totalPages}`, 190, 290, { align: "right" });
};

// Product PDF generators (simplified versions for edge function)
const generatePromptPackPDF = (): string => {
  const doc = new jsPDF();
  
  // Title page
  addHeader(doc, 1, 5);
  doc.setFontSize(36);
  doc.setTextColor(BRAND.white[0], BRAND.white[1], BRAND.white[2]);
  doc.text("Wellness AI Builder", 105, 100, { align: "center" });
  doc.setFontSize(24);
  doc.setTextColor(BRAND.teal[0], BRAND.teal[1], BRAND.teal[2]);
  doc.text("Prompt Pack", 105, 120, { align: "center" });
  doc.setFontSize(12);
  doc.setTextColor(BRAND.muted[0], BRAND.muted[1], BRAND.muted[2]);
  doc.text("12 battle-tested prompts for wellness AI strategy", 105, 150, { align: "center" });

  const sections = [
    {
      section: "STRATEGIC PROMPTS",
      prompts: [
        { name: "Market Position Analysis", prompt: "Analyse my wellness [product/service] targeting [audience]. What AI capabilities would create genuine differentiation vs competitors? Focus on defensible advantages." },
        { name: "Build vs Buy Decision", prompt: "I'm considering [AI capability] for [use case]. Our team has [X developers], budget of [£X], and need delivery in [X months]. Walk me through trade-offs." },
        { name: "ROI Modelling", prompt: "Calculate potential ROI for implementing [AI feature] in our [wellness product]. Current metrics: [engagement rate], [retention], [LTV]. Be conservative." },
      ],
    },
    {
      section: "PRODUCT PROMPTS", 
      prompts: [
        { name: "Feature Prioritisation", prompt: "Our wellness app has these potential AI features: [list]. Users report these pain points: [list]. Rank by impact vs implementation effort." },
        { name: "Personalisation Strategy", prompt: "Design a personalisation framework for [wellness product]. We collect [data types]. Define 3 tiers: basic, intermediate, advanced." },
        { name: "User Journey Optimisation", prompt: "Map how AI could improve each stage of this wellness user journey: [describe]. Identify where AI adds genuine value." },
      ],
    },
    {
      section: "DATA & COMPLIANCE PROMPTS",
      prompts: [
        { name: "Data Audit", prompt: "Audit our wellness data readiness: We have [data sources]. Users consented to [uses]. Identify gaps in quality, consent, governance." },
        { name: "Privacy-First AI", prompt: "Design a GDPR-compliant AI feature for [use case] in wellness. Cover: data minimisation, consent, right to explanation." },
        { name: "Vendor Evaluation", prompt: "Evaluate [AI vendor] for [wellness use case]. Score: data handling, accuracy claims, integration effort, pricing, exit strategy." },
      ],
    },
    {
      section: "ENGAGEMENT PROMPTS",
      prompts: [
        { name: "Retention Analysis", prompt: "Analyse what drives retention in wellness apps like ours (category: [type]). Our 30-day retention is [X%]. What AI interventions have evidence?" },
        { name: "Content Strategy", prompt: "Create AI-assisted content strategy for [wellness niche]. Balance: personalisation, freshness, cost, authenticity. Define what stays human." },
        { name: "Behaviour Change Design", prompt: "Design an AI-supported behaviour change programme for [health goal]. Use evidence-based frameworks. Specify AI vs human support." },
      ],
    },
  ];

  sections.forEach((s, i) => {
    doc.addPage();
    addHeader(doc, i + 2, 5);
    doc.setFontSize(14);
    doc.setTextColor(BRAND.teal[0], BRAND.teal[1], BRAND.teal[2]);
    doc.text(s.section, 20, 30);
    
    let yPos = 45;
    s.prompts.forEach((p) => {
      doc.setFillColor(BRAND.cardBg[0], BRAND.cardBg[1], BRAND.cardBg[2]);
      doc.roundedRect(15, yPos - 5, 180, 70, 3, 3, "F");
      doc.setFontSize(12);
      doc.setTextColor(BRAND.white[0], BRAND.white[1], BRAND.white[2]);
      doc.text(p.name, 20, yPos + 5);
      doc.setFontSize(9);
      doc.setTextColor(BRAND.muted[0], BRAND.muted[1], BRAND.muted[2]);
      const lines = doc.splitTextToSize(p.prompt, 165);
      doc.text(lines, 20, yPos + 18);
      yPos += 80;
    });
  });

  return doc.output("datauristring").split(",")[1];
};

const generateRevenueFrameworkPDF = (): string => {
  const doc = new jsPDF();
  
  addHeader(doc, 1, 7);
  doc.setFontSize(32);
  doc.setTextColor(BRAND.white[0], BRAND.white[1], BRAND.white[2]);
  doc.text("Engagement → Revenue", 105, 90, { align: "center" });
  doc.setFontSize(24);
  doc.setTextColor(BRAND.teal[0], BRAND.teal[1], BRAND.teal[2]);
  doc.text("Framework", 105, 110, { align: "center" });
  doc.setFontSize(12);
  doc.setTextColor(BRAND.muted[0], BRAND.muted[1], BRAND.muted[2]);
  doc.text("Turn wellness engagement into sustainable revenue", 105, 140, { align: "center" });

  const pages = [
    { title: "The Revenue Equation", content: ["Revenue = Users × Engagement × Conversion × LTV", "", "Most wellness products optimise for the wrong variable.", "", "This framework helps you identify which variable deserves your AI investment."] },
    { title: "Stage 1: Diagnostic", content: ["□ Calculate true CAC", "□ Map user journey with drop-off rates", "□ Identify time-to-value", "□ Measure engagement quality", "□ Calculate revenue per engaged user"] },
    { title: "Stage 2: AI Investment Zones", content: ["ACQUISITION: Content generation, lead scoring", "ACTIVATION: Personalised onboarding, smart defaults", "RETENTION: Churn prediction, re-engagement timing", "REVENUE: Upgrade propensity, pricing optimisation"] },
    { title: "Stage 3: Build Your Business Case", content: ["1. Identify weakest stage (highest drop-off)", "2. Quantify revenue impact of 10% improvement", "3. Estimate AI solution cost", "4. Calculate payback period", "5. Define success metrics", "6. Plan pilot scope"] },
    { title: "The 80/20 Rule", content: ["80% of AI value comes from 20% of features", "80% of implementation cost is integration", "80% of failures are expectation mismatches", "80% of quick wins need no AI at all", "", "Start with the 20% that matters."] },
    { title: "Key Takeaways", content: ["1. Focus on outcomes, not engagement metrics", "2. AI amplifies your strategy, doesn't replace it", "3. Start small, measure everything, scale what works", "4. Revenue follows value, not features"] },
  ];

  pages.forEach((p, i) => {
    doc.addPage();
    addHeader(doc, i + 2, 7);
    doc.setFontSize(18);
    doc.setTextColor(BRAND.white[0], BRAND.white[1], BRAND.white[2]);
    doc.text(p.title, 20, 35);
    let yPos = 55;
    p.content.forEach((line) => {
      if (line === "") { yPos += 8; return; }
      doc.setFontSize(10);
      doc.setTextColor(BRAND.muted[0], BRAND.muted[1], BRAND.muted[2]);
      const lines = doc.splitTextToSize(line, 170);
      doc.text(lines, 20, yPos);
      yPos += lines.length * 6 + 4;
    });
  });

  return doc.output("datauristring").split(",")[1];
};

const generateBuildVsBuyPDF = (): string => {
  const doc = new jsPDF();
  
  addHeader(doc, 1, 8);
  doc.setFontSize(32);
  doc.setTextColor(BRAND.white[0], BRAND.white[1], BRAND.white[2]);
  doc.text("Build vs Buy", 105, 90, { align: "center" });
  doc.setFontSize(24);
  doc.setTextColor(BRAND.teal[0], BRAND.teal[1], BRAND.teal[2]);
  doc.text("AI in Wellness", 105, 115, { align: "center" });
  doc.setFontSize(12);
  doc.setTextColor(BRAND.muted[0], BRAND.muted[1], BRAND.muted[2]);
  doc.text("A practical framework for investment decisions", 105, 145, { align: "center" });

  const pages = [
    { title: "The Real Question", content: ["Build vs Buy is never binary.", "", "The real question is: What capability do you need to own to win?", "", "Everything else should be bought, partnered, or skipped."] },
    { title: "Build Criteria (ALL must be true)", content: ["✓ Core to your differentiation", "✓ You have the expertise", "✓ You can maintain it for 3+ years", "✓ No suitable vendor exists", "✓ Speed to market isn't critical", "✓ You're willing to pivot"] },
    { title: "Buy Criteria (ANY can be true)", content: ["→ It's commodity functionality", "→ Vendors have 10x your R&D budget", "→ Your team's time is better spent elsewhere", "→ You need it in < 6 months", "→ The space is evolving rapidly", "→ Switching costs are manageable"] },
    { title: "Wellness-Specific Guidance", content: ["USUALLY BUILD: Domain-specific algorithms, proprietary content, unique user journeys", "", "USUALLY BUY: Infrastructure, generic AI, analytics, compliance, payments", "", "USUALLY PARTNER: Clinical validation, specialist content, hardware", "", "OFTEN SKIP: Features users don't actually need"] },
    { title: "Hidden Costs of Building", content: ["Initial development: 1x", "Maintenance (per year): 0.2x", "Opportunity cost: 2-5x", "Hiring/retaining talent: 0.5x", "Technical debt (years 3+): 1-2x", "", "Total 3-year: 4-10x initial estimate"] },
    { title: "Decision Framework", content: ["1. List all AI capabilities considered", "2. Score each: differentiation, expertise", "3. Research vendor landscape (1 week)", "4. Cost model: build vs buy (3 years)", "5. Assess switching costs", "6. Start with buy, earn right to build"] },
    { title: "Key Takeaways", content: ["1. Building is a marriage, buying is dating", "", "2. The best companies build less than you think", "", "3. 'We could build that' ≠ 'We should build that'", "", "4. Buy time, build moats"] },
  ];

  pages.forEach((p, i) => {
    doc.addPage();
    addHeader(doc, i + 2, 8);
    doc.setFontSize(18);
    doc.setTextColor(BRAND.white[0], BRAND.white[1], BRAND.white[2]);
    doc.text(p.title, 20, 35);
    let yPos = 55;
    p.content.forEach((line) => {
      if (line === "") { yPos += 8; return; }
      doc.setFontSize(10);
      doc.setTextColor(BRAND.muted[0], BRAND.muted[1], BRAND.muted[2]);
      const lines = doc.splitTextToSize(line, 170);
      doc.text(lines, 20, yPos);
      yPos += lines.length * 6 + 4;
    });
  });

  return doc.output("datauristring").split(",")[1];
};

const generateActivationPlaybookPDF = (): string => {
  const doc = new jsPDF();
  
  // Cover page
  addHeader(doc, 1, 10);
  doc.setFontSize(36);
  doc.setTextColor(BRAND.white[0], BRAND.white[1], BRAND.white[2]);
  doc.text("90-Day AI", 105, 90, { align: "center" });
  doc.setFontSize(36);
  doc.text("Activation Playbook", 105, 110, { align: "center" });
  doc.setFontSize(14);
  doc.setTextColor(BRAND.teal[0], BRAND.teal[1], BRAND.teal[2]);
  doc.text("Month-by-month execution plan for wellness leaders", 105, 140, { align: "center" });
  doc.setFontSize(10);
  doc.setTextColor(BRAND.muted[0], BRAND.muted[1], BRAND.muted[2]);
  doc.text("No AI until you're ready.", 105, 160, { align: "center" });

  // Introduction
  doc.addPage();
  addHeader(doc, 2, 10);
  doc.setFontSize(22);
  doc.setTextColor(BRAND.white[0], BRAND.white[1], BRAND.white[2]);
  doc.text("Introduction", 20, 35);
  doc.setFontSize(11);
  doc.setTextColor(BRAND.muted[0], BRAND.muted[1], BRAND.muted[2]);
  const introText = [
    "Most AI projects fail because they start with technology instead of foundations.",
    "",
    "This playbook exists to force clarity before you build anything.",
    "",
    "Use it slowly. Rushing defeats the purpose.",
    "",
    "Month 1 focuses on data foundations. No AI yet. This matters.",
    "Month 2 introduces engagement journeys and segmentation.",
    "Month 3 links everything to monetisation.",
    "",
    "Success is not 'we launched AI'.",
    "Success is 'we made better decisions faster'."
  ];
  let yPos = 55;
  introText.forEach((line) => {
    if (line === "") { yPos += 8; return; }
    doc.text(line, 20, yPos);
    yPos += 8;
  });

  // Month 1
  doc.addPage();
  addHeader(doc, 3, 10);
  doc.setFontSize(22);
  doc.setTextColor(BRAND.teal[0], BRAND.teal[1], BRAND.teal[2]);
  doc.text("MONTH 1", 20, 35);
  doc.setFontSize(18);
  doc.setTextColor(BRAND.white[0], BRAND.white[1], BRAND.white[2]);
  doc.text("Foundations & Data Cleanup", 20, 50);
  
  const month1Tasks = [
    { week: "Week 1-2", title: "Data Audit", tasks: ["Identify where core data lives", "Document data sources and quality", "List what's missing or unclear", "Clean obvious duplicates"] },
    { week: "Week 3", title: "Event Definition", tasks: ["Define your 5 most important events", "Ensure consistent tracking", "Validate data accuracy"] },
    { week: "Week 4", title: "Consent & Governance", tasks: ["Review consent mechanisms", "Document data usage policies", "Identify compliance gaps"] }
  ];
  
  yPos = 70;
  month1Tasks.forEach((item) => {
    doc.setFillColor(BRAND.cardBg[0], BRAND.cardBg[1], BRAND.cardBg[2]);
    doc.roundedRect(15, yPos - 5, 180, 55, 3, 3, "F");
    doc.setFontSize(10);
    doc.setTextColor(BRAND.teal[0], BRAND.teal[1], BRAND.teal[2]);
    doc.text(item.week, 20, yPos + 5);
    doc.setFontSize(12);
    doc.setTextColor(BRAND.white[0], BRAND.white[1], BRAND.white[2]);
    doc.text(item.title, 20, yPos + 18);
    doc.setFontSize(9);
    doc.setTextColor(BRAND.muted[0], BRAND.muted[1], BRAND.muted[2]);
    item.tasks.forEach((task, i) => {
      doc.text(`□ ${task}`, 25, yPos + 30 + (i * 6));
    });
    yPos += 65;
  });

  // Month 1 Success Criteria
  doc.addPage();
  addHeader(doc, 4, 10);
  doc.setFontSize(18);
  doc.setTextColor(BRAND.white[0], BRAND.white[1], BRAND.white[2]);
  doc.text("Month 1 Success Criteria", 20, 35);
  doc.setFontSize(11);
  doc.setTextColor(BRAND.muted[0], BRAND.muted[1], BRAND.muted[2]);
  const m1Success = [
    "✓ You can explain where your core data lives without opening 5 tools",
    "✓ You have documented your 5 most important engagement events",
    "✓ You know which data you trust and which you don't",
    "✓ Consent mechanisms are reviewed and documented",
    "✓ You can confidently describe your data to a regulator"
  ];
  yPos = 55;
  m1Success.forEach((line) => {
    doc.text(line, 20, yPos);
    yPos += 12;
  });

  // Month 2
  doc.addPage();
  addHeader(doc, 5, 10);
  doc.setFontSize(22);
  doc.setTextColor(BRAND.teal[0], BRAND.teal[1], BRAND.teal[2]);
  doc.text("MONTH 2", 20, 35);
  doc.setFontSize(18);
  doc.setTextColor(BRAND.white[0], BRAND.white[1], BRAND.white[2]);
  doc.text("Engagement Journeys & Segmentation", 20, 50);

  const month2Tasks = [
    { week: "Week 5-6", title: "Journey Mapping", tasks: ["Map current user journeys", "Identify drop-off points", "Define 'time-to-value'"] },
    { week: "Week 7", title: "Segmentation", tasks: ["Create 3-5 user segments", "Define segment behaviours", "Identify high-value segments"] },
    { week: "Week 8", title: "Test Hypotheses", tasks: ["Pick ONE journey to improve", "Design A/B test", "Implement and measure"] }
  ];

  yPos = 70;
  month2Tasks.forEach((item) => {
    doc.setFillColor(BRAND.cardBg[0], BRAND.cardBg[1], BRAND.cardBg[2]);
    doc.roundedRect(15, yPos - 5, 180, 50, 3, 3, "F");
    doc.setFontSize(10);
    doc.setTextColor(BRAND.teal[0], BRAND.teal[1], BRAND.teal[2]);
    doc.text(item.week, 20, yPos + 5);
    doc.setFontSize(12);
    doc.setTextColor(BRAND.white[0], BRAND.white[1], BRAND.white[2]);
    doc.text(item.title, 20, yPos + 18);
    doc.setFontSize(9);
    doc.setTextColor(BRAND.muted[0], BRAND.muted[1], BRAND.muted[2]);
    item.tasks.forEach((task, i) => {
      doc.text(`□ ${task}`, 25, yPos + 28 + (i * 6));
    });
    yPos += 58;
  });

  // Month 2 Success Criteria
  doc.addPage();
  addHeader(doc, 6, 10);
  doc.setFontSize(18);
  doc.setTextColor(BRAND.white[0], BRAND.white[1], BRAND.white[2]);
  doc.text("Month 2 Success Criteria", 20, 35);
  doc.setFontSize(11);
  doc.setTextColor(BRAND.muted[0], BRAND.muted[1], BRAND.muted[2]);
  const m2Success = [
    "✓ User journeys are mapped with measurable drop-off points",
    "✓ You have 3-5 actionable user segments",
    "✓ You know which behaviours predict retention",
    "✓ At least one A/B test is running or completed",
    "✓ You can explain what engagement means for your business"
  ];
  yPos = 55;
  m2Success.forEach((line) => {
    doc.text(line, 20, yPos);
    yPos += 12;
  });

  // Month 3
  doc.addPage();
  addHeader(doc, 7, 10);
  doc.setFontSize(22);
  doc.setTextColor(BRAND.teal[0], BRAND.teal[1], BRAND.teal[2]);
  doc.text("MONTH 3", 20, 35);
  doc.setFontSize(18);
  doc.setTextColor(BRAND.white[0], BRAND.white[1], BRAND.white[2]);
  doc.text("Monetisation Experiments", 20, 50);

  const month3Tasks = [
    { week: "Week 9-10", title: "Revenue Levers", tasks: ["Identify all revenue levers", "Link engagement to outcomes", "Calculate LTV by segment"] },
    { week: "Week 11", title: "Test One Lever", tasks: ["Pick highest-impact lever", "Design controlled test", "Set conservative targets"] },
    { week: "Week 12", title: "Measure & Plan", tasks: ["Analyse test results", "Document learnings", "Plan next quarter"] }
  ];

  yPos = 70;
  month3Tasks.forEach((item) => {
    doc.setFillColor(BRAND.cardBg[0], BRAND.cardBg[1], BRAND.cardBg[2]);
    doc.roundedRect(15, yPos - 5, 180, 50, 3, 3, "F");
    doc.setFontSize(10);
    doc.setTextColor(BRAND.teal[0], BRAND.teal[1], BRAND.teal[2]);
    doc.text(item.week, 20, yPos + 5);
    doc.setFontSize(12);
    doc.setTextColor(BRAND.white[0], BRAND.white[1], BRAND.white[2]);
    doc.text(item.title, 20, yPos + 18);
    doc.setFontSize(9);
    doc.setTextColor(BRAND.muted[0], BRAND.muted[1], BRAND.muted[2]);
    item.tasks.forEach((task, i) => {
      doc.text(`□ ${task}`, 25, yPos + 28 + (i * 6));
    });
    yPos += 58;
  });

  // Month 3 Success Criteria
  doc.addPage();
  addHeader(doc, 8, 10);
  doc.setFontSize(18);
  doc.setTextColor(BRAND.white[0], BRAND.white[1], BRAND.white[2]);
  doc.text("Month 3 Success Criteria", 20, 35);
  doc.setFontSize(11);
  doc.setTextColor(BRAND.muted[0], BRAND.muted[1], BRAND.muted[2]);
  const m3Success = [
    "✓ Engagement improvements are linked to revenue/retention",
    "✓ You understand LTV and churn drivers by segment",
    "✓ At least one revenue lever has been tested",
    "✓ You can explain value to finance in their language",
    "✓ You have a clear plan for the next 90 days"
  ];
  yPos = 55;
  m3Success.forEach((line) => {
    doc.text(line, 20, yPos);
    yPos += 12;
  });

  // Final page
  doc.addPage();
  addHeader(doc, 9, 10);
  doc.setFontSize(22);
  doc.setTextColor(BRAND.white[0], BRAND.white[1], BRAND.white[2]);
  doc.text("What Not To Do", 20, 35);
  doc.setFontSize(11);
  doc.setTextColor(BRAND.muted[0], BRAND.muted[1], BRAND.muted[2]);
  const dontDo = [
    "✗ Don't skip Month 1 because it feels slow",
    "✗ Don't add AI before foundations are solid",
    "✗ Don't measure vanity metrics",
    "✗ Don't optimise for engagement without linking to outcomes",
    "✗ Don't assume more data = better decisions",
    "✗ Don't build features users haven't asked for",
    "✗ Don't rush to 'launch AI' for PR value"
  ];
  yPos = 55;
  dontDo.forEach((line) => {
    doc.text(line, 20, yPos);
    yPos += 12;
  });

  doc.setFontSize(14);
  doc.setTextColor(BRAND.teal[0], BRAND.teal[1], BRAND.teal[2]);
  doc.text("The goal is better decisions, not more technology.", 20, yPos + 20);

  // Closing
  doc.addPage();
  addHeader(doc, 10, 10);
  doc.setFontSize(22);
  doc.setTextColor(BRAND.white[0], BRAND.white[1], BRAND.white[2]);
  doc.text("Next Steps", 20, 35);
  doc.setFontSize(11);
  doc.setTextColor(BRAND.muted[0], BRAND.muted[1], BRAND.muted[2]);
  const nextSteps = [
    "1. Print Month 1 checklist and pin it to your wall",
    "",
    "2. Schedule a weekly 30-minute review",
    "",
    "3. Assign ownership for each task",
    "",
    "4. Resist the urge to skip ahead",
    "",
    "5. Questions? Email hello@wellnessgenius.co.uk"
  ];
  yPos = 55;
  nextSteps.forEach((line) => {
    if (line === "") { yPos += 6; return; }
    doc.text(line, 20, yPos);
    yPos += 10;
  });

  doc.setFontSize(12);
  doc.setTextColor(BRAND.muted[0], BRAND.muted[1], BRAND.muted[2]);
  doc.text("Wellness Genius", 105, 250, { align: "center" });
  doc.setFontSize(10);
  doc.text("Practical intelligence for wellness leaders", 105, 260, { align: "center" });

  return doc.output("datauristring").split(",")[1];
};

// Generate Engagement Playbook PDF
const generateEngagementPlaybookPDF = (): string => {
  const doc = new jsPDF();
  
  addHeader(doc, 1, 8);
  doc.setFontSize(32);
  doc.setTextColor(BRAND.white[0], BRAND.white[1], BRAND.white[2]);
  doc.text("Wellness Engagement", 105, 90, { align: "center" });
  doc.setFontSize(24);
  doc.setTextColor(BRAND.teal[0], BRAND.teal[1], BRAND.teal[2]);
  doc.text("Systems Playbook", 105, 115, { align: "center" });
  doc.setFontSize(12);
  doc.setTextColor(BRAND.muted[0], BRAND.muted[1], BRAND.muted[2]);
  doc.text("Operating systems for wellness engagement", 105, 145, { align: "center" });

  const pages = [
    { title: "The Engagement Problem", content: ["Most wellness products confuse activity with outcome.", "", "This playbook gives you operating systems that:", "→ Link habits to measurable outcomes", "→ Protect margin while increasing engagement", "→ Create executable intervention logic"] },
    { title: "Habit → Outcome Mapping", content: ["Map every habit to a business outcome:", "", "Habit: Daily check-in", "→ Outcome: Increased retention", "→ Evidence: Users who check in 3x/week retain 40% longer", "", "If you can't complete this, the habit doesn't matter."] },
    { title: "6-Rung Intervention Ladder", content: ["1. Information (free, scalable)", "2. Reminder (low cost)", "3. Social proof (peer comparison)", "4. Challenge (gamification)", "5. Accountability (human touch)", "6. Incentive (use sparingly - margin risk)", "", "Always start at rung 1. Only escalate when data proves necessity."] },
    { title: "Engagement KPI Canon", content: ["Approved metrics by outcome:", "", "RETENTION: 7-day return rate, session frequency", "ACTIVATION: Time-to-first-value, onboarding completion", "REVENUE: Upgrade rate, LTV by cohort", "", "If it doesn't link to these, question whether to track it."] },
    { title: "Intervention Register Template", content: ["For each intervention, document:", "", "→ Trigger: What fires this?", "→ Cost: Time and £", "→ Expected outcome: Be specific", "→ Actual outcome: Measure", "→ Decision: Keep / Kill / Adjust"] },
    { title: "MVP Segment Definition", content: ["Your Most Valuable Players share:", "", "→ High visit frequency (3x+/week)", "→ Long tenure (6+ months)", "→ Referral behaviour", "→ Premium feature usage", "", "Identify them. Protect them. Learn from them."] },
    { title: "What To Do Next", content: ["☐ Foundations unclear → Re-run AI Readiness Score", "☐ Decisions unclear → Use AI Coach", "☐ Execution blocked → 90-Day Activation Playbook", "☐ Strategic confidence low → Book working session", "", "wellnessgenius.co.uk"] },
  ];

  pages.forEach((p, i) => {
    doc.addPage();
    addHeader(doc, i + 2, 8);
    doc.setFontSize(18);
    doc.setTextColor(BRAND.white[0], BRAND.white[1], BRAND.white[2]);
    doc.text(p.title, 20, 35);
    let yPos = 55;
    p.content.forEach((line) => {
      if (line === "") { yPos += 8; return; }
      doc.setFontSize(10);
      doc.setTextColor(BRAND.muted[0], BRAND.muted[1], BRAND.muted[2]);
      const lines = doc.splitTextToSize(line, 170);
      doc.text(lines, 20, yPos);
      yPos += lines.length * 6 + 4;
    });
  });

  return doc.output("datauristring").split(",")[1];
};

const PRODUCT_INFO: Record<string, { name: string; filename: string; generator: () => string }> = {
  "prompt-pack": {
    name: "Wellness AI Builder – Prompt Pack",
    filename: "wellness-ai-prompt-pack.pdf",
    generator: generatePromptPackPDF,
  },
  "ai-builder": {
    name: "Wellness AI Builder – Operator Edition",
    filename: "wellness-ai-builder-operator.pdf",
    generator: generatePromptPackPDF,
  },
  "revenue-framework": {
    name: "Engagement → Revenue Framework",
    filename: "engagement-revenue-framework.pdf",
    generator: generateRevenueFrameworkPDF,
  },
  "build-vs-buy": {
    name: "Build vs Buy: AI in Wellness",
    filename: "build-vs-buy-guide.pdf",
    generator: generateBuildVsBuyPDF,
  },
  "activation-playbook": {
    name: "90-Day AI Activation Playbook",
    filename: "90-day-activation-playbook.pdf",
    generator: generateActivationPlaybookPDF,
  },
  "engagement-playbook": {
    name: "Wellness Engagement Systems Playbook",
    filename: "wellness-engagement-systems-playbook.pdf",
    generator: generateEngagementPlaybookPDF,
  },
  "gamification-playbook": {
    name: "Gamification, Rewards & Incentives Playbook",
    filename: "gamification-rewards-incentives-playbook.pdf",
    generator: generateEngagementPlaybookPDF, // Uses engagement as base, full version in frontend
  },
};

// Bundle definitions - maps bundle ID to included product IDs
const BUNDLE_PRODUCTS: Record<string, string[]> = {
  "operator-bundle": ["prompt-pack", "engagement-playbook"],
  "gamification-bundle": ["engagement-playbook", "gamification-playbook"],
  "execution-bundle": ["activation-playbook", "gamification-playbook"],
};

const BUNDLE_INFO: Record<string, { name: string }> = {
  "operator-bundle": { name: "Wellness AI Operator Bundle" },
  "gamification-bundle": { name: "Gamification & Personalisation Bundle" },
  "execution-bundle": { name: "Execution Bundle" },
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");
    
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey || !resendKey) {
      throw new Error("Missing required API keys");
    }
    
    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const resend = new Resend(resendKey);
    
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    
    if (!signature) {
      logStep("Missing stripe-signature header");
      return new Response(JSON.stringify({ error: "Missing signature" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    
    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      logStep("Webhook signature verification failed", { error: errorMessage });
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    
    logStep("Event verified", { type: event.type });

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      logStep("Checkout completed", { sessionId: session.id });
      
      const customerEmail = session.customer_email || session.customer_details?.email;
      const productId = session.metadata?.productId;
      
      if (!customerEmail || !productId) {
        logStep("Missing data", { customerEmail, productId });
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check if this is a bundle
      const bundleProductIds = BUNDLE_PRODUCTS[productId];
      const isBundle = !!bundleProductIds;
      
      if (isBundle) {
        // Handle bundle - generate and attach all included PDFs
        const bundleInfo = BUNDLE_INFO[productId];
        logStep("Processing bundle", { productId, includedProducts: bundleProductIds });
        
        const attachments: { filename: string; content: string }[] = [];
        const productNames: string[] = [];
        
        for (const includedId of bundleProductIds) {
          const product = PRODUCT_INFO[includedId];
          if (product) {
            logStep("Generating bundle PDF", { includedId });
            const pdfBase64 = product.generator();
            attachments.push({
              filename: product.filename,
              content: pdfBase64,
            });
            productNames.push(product.name);
          }
        }
        
        logStep("Sending bundle email", { to: customerEmail, attachmentCount: attachments.length });
        
        const emailResult = await resend.emails.send({
          from: "Wellness Genius <hello@wellnessgenius.co.uk>",
          to: [customerEmail],
          subject: `Your ${bundleInfo.name} is ready!`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #18181b; color: #ffffff; padding: 40px 20px; margin: 0;">
              <div style="max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(to right, #2dd4bf, #14b8a6); height: 4px; border-radius: 2px; margin-bottom: 32px;"></div>
                
                <h1 style="font-size: 28px; margin-bottom: 16px; color: #ffffff;">Thank you for your purchase!</h1>
                
                <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                  Your <strong style="color: #2dd4bf;">${bundleInfo.name}</strong> includes ${attachments.length} products, all attached to this email.
                </p>
                
                <div style="background-color: #27272a; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                  <h2 style="font-size: 18px; margin: 0 0 12px 0; color: #ffffff;">What's included:</h2>
                  <ul style="color: #a1a1aa; padding-left: 20px; margin: 0;">
                    ${productNames.map(name => `<li style="margin-bottom: 8px;">${name}</li>`).join('')}
                  </ul>
                </div>
                
                <div style="background-color: #27272a; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                  <h2 style="font-size: 18px; margin: 0 0 12px 0; color: #ffffff;">What's next?</h2>
                  <ul style="color: #a1a1aa; padding-left: 20px; margin: 0;">
                    <li style="margin-bottom: 8px;">Download all ${attachments.length} attached PDFs</li>
                    <li style="margin-bottom: 8px;">Start with the AI Readiness Score to get your baseline</li>
                    <li style="margin-bottom: 8px;">Work through the playbooks in order</li>
                    <li style="margin-bottom: 8px;">Reply to this email if you have questions</li>
                  </ul>
                </div>
                
                <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                  Want personalised guidance? Take our free 
                  <a href="https://www.wellnessgenius.co.uk/ai-readiness/start" style="color: #2dd4bf; text-decoration: none;">AI Readiness Assessment</a>
                  for tailored recommendations.
                </p>
                
                <p style="color: #71717a; font-size: 14px; margin-top: 32px;">
                  Best,<br>
                  <strong style="color: #a1a1aa;">Andy @ Wellness Genius</strong>
                </p>
                
                <div style="border-top: 1px solid #27272a; margin-top: 32px; padding-top: 24px;">
                  <p style="color: #52525b; font-size: 12px; margin: 0;">
                    Wellness Genius • <a href="https://www.wellnessgenius.co.uk" style="color: #52525b;">wellnessgenius.co.uk</a>
                  </p>
                </div>
              </div>
            </body>
            </html>
          `,
          attachments,
        });

        logStep("Bundle email sent", { result: emailResult });
      } else {
        // Handle single product
        const product = PRODUCT_INFO[productId];
        if (!product) {
          logStep("Unknown product", { productId });
          return new Response(JSON.stringify({ received: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        logStep("Generating PDF", { productId });
        const pdfBase64 = product.generator();
        
        logStep("Sending email", { to: customerEmail, product: product.name });
        
        const emailResult = await resend.emails.send({
          from: "Wellness Genius <hello@wellnessgenius.co.uk>",
          to: [customerEmail],
          subject: `Your ${product.name} is ready!`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #18181b; color: #ffffff; padding: 40px 20px; margin: 0;">
              <div style="max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(to right, #2dd4bf, #14b8a6); height: 4px; border-radius: 2px; margin-bottom: 32px;"></div>
                
                <h1 style="font-size: 28px; margin-bottom: 16px; color: #ffffff;">Thank you for your purchase!</h1>
                
                <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                  Your <strong style="color: #2dd4bf;">${product.name}</strong> is attached to this email.
                </p>
                
                <div style="background-color: #27272a; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                  <h2 style="font-size: 18px; margin: 0 0 12px 0; color: #ffffff;">What's next?</h2>
                  <ul style="color: #a1a1aa; padding-left: 20px; margin: 0;">
                    <li style="margin-bottom: 8px;">Download the attached PDF</li>
                    <li style="margin-bottom: 8px;">Work through the frameworks at your own pace</li>
                    <li style="margin-bottom: 8px;">Reply to this email if you have questions</li>
                  </ul>
                </div>
                
                <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                  Want more personalised guidance? Take our free 
                  <a href="https://www.wellnessgenius.co.uk/ai-readiness/start" style="color: #2dd4bf; text-decoration: none;">AI Readiness Assessment</a>
                  for tailored recommendations.
                </p>
                
                <p style="color: #71717a; font-size: 14px; margin-top: 32px;">
                  Best,<br>
                  <strong style="color: #a1a1aa;">Andy @ Wellness Genius</strong>
                </p>
                
                <div style="border-top: 1px solid #27272a; margin-top: 32px; padding-top: 24px;">
                  <p style="color: #52525b; font-size: 12px; margin: 0;">
                    Wellness Genius • <a href="https://www.wellnessgenius.co.uk" style="color: #52525b;">wellnessgenius.co.uk</a>
                  </p>
                </div>
              </div>
            </body>
            </html>
          `,
          attachments: [
            {
              filename: product.filename,
              content: pdfBase64,
            },
          ],
        });

        logStep("Email sent", { result: emailResult });
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

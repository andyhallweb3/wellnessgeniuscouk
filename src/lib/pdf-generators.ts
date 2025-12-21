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

// Helper to add What Next section
const addWhatNextSection = (doc: jsPDF, pageNum: number, totalPages: number) => {
  doc.addPage();
  addHeader(doc, pageNum, totalPages);
  
  doc.setFontSize(20);
  doc.setTextColor(...BRAND.teal);
  doc.text("What To Do Next", 105, 50, { align: "center" });
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.muted);
  doc.text("Based on what you've completed, take the next logical step:", 105, 70, { align: "center" });
  
  const nextSteps = [
    { condition: "Foundations unclear", action: "Re-run AI Readiness Score" },
    { condition: "Decisions unclear", action: "Use AI Coach (Diagnostic Mode)" },
    { condition: "Execution blocked", action: "90-Day Activation Playbook" },
    { condition: "Strategic confidence low", action: "Book working session with Andy" }
  ];
  
  let yPos = 95;
  nextSteps.forEach(step => {
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(30, yPos - 5, 150, 28, 3, 3, "F");
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.teal);
    doc.text("IF: " + step.condition, 40, yPos + 5);
    doc.setTextColor(...BRAND.white);
    doc.text("→ " + step.action, 40, yPos + 17);
    yPos += 35;
  });
  
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.teal);
  doc.text("This creates a journey, not a dead end.", 105, yPos + 20, { align: "center" });
};

// Helper to add CTA page
const addCTAPage = (doc: jsPDF, pageNum: number, totalPages: number) => {
  doc.addPage();
  addHeader(doc, pageNum, totalPages);
  
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("If you want to quantify the gap,", 105, 100, { align: "center" });
  doc.text("use the AI Readiness Score.", 105, 115, { align: "center" });
  
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.muted);
  doc.text("Practical clarity for wellness leaders.", 105, 150, { align: "center" });
  
  doc.setFontSize(16);
  doc.setTextColor(...BRAND.teal);
  doc.text("wellnessgenius.io/ai-readiness", 105, 180, { align: "center" });
  
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.muted);
  doc.text("Wellness Genius", 105, 220, { align: "center" });
};

// Helper to wrap text and track position
const wrapText = (doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight: number = 6): number => {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return y + (lines.length * lineHeight);
};

// AI Readiness Quick Check (Lite) - FREE
export const generateQuickCheck = (): jsPDF => {
  const doc = new jsPDF();
  const totalPages = 6;
  
  // Page 1 - Cover
  addHeader(doc, 1, totalPages);
  doc.setFontSize(32);
  doc.setTextColor(...BRAND.white);
  doc.text("AI Readiness", 105, 90, { align: "center" });
  doc.text("Quick Check", 105, 110, { align: "center" });
  
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.muted);
  doc.text("A reality check for wellness businesses", 105, 140, { align: "center" });
  doc.text("considering AI, engagement, or automation.", 105, 155, { align: "center" });
  
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.teal);
  doc.text("Wellness Genius", 105, 200, { align: "center" });
  
  // Page 2 - Introduction
  doc.addPage();
  addHeader(doc, 2, totalPages);
  
  doc.setFontSize(20);
  doc.setTextColor(...BRAND.white);
  doc.text("Introduction", 20, 35);
  
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.muted);
  const intro = [
    "Most wellness organisations believe they are \"exploring AI\".",
    "Very few can explain what problem they are solving,",
    "what data they trust, or what outcome they expect.",
    "",
    "This quick check is not a score.",
    "It is a signal.",
    "",
    "If multiple questions below feel uncomfortable,",
    "that discomfort is useful."
  ];
  let yPos = 55;
  intro.forEach(line => {
    doc.text(line, 20, yPos);
    yPos += 10;
  });
  
  // Page 3 - Questions (Data & Engagement)
  doc.addPage();
  addHeader(doc, 3, totalPages);
  
  doc.setFontSize(16);
  doc.setTextColor(...BRAND.white);
  doc.text("The 10 Questions", 20, 35);
  
  const sections = [
    {
      title: "DATA",
      questions: [
        "1. Can you explain where your customer data lives without opening five tools?",
        "2. Can you clearly define your three most important engagement events?"
      ]
    },
    {
      title: "ENGAGEMENT",
      questions: [
        "3. Do you know which behaviours predict retention?",
        "4. Can you confidently say which engagement initiatives worked last quarter?"
      ]
    },
    {
      title: "MONETISATION",
      questions: [
        "5. Can you link engagement improvements to revenue or retention?",
        "6. Could you explain the commercial value of your app or platform to a CFO?"
      ]
    }
  ];
  
  yPos = 50;
  sections.forEach(section => {
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(15, yPos - 5, 180, 10, 2, 2, "F");
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.teal);
    doc.text(section.title, 20, yPos + 2);
    yPos += 15;
    
    doc.setFontSize(11);
    doc.setTextColor(...BRAND.white);
    section.questions.forEach(q => {
      const lines = doc.splitTextToSize(q, 170);
      doc.text(lines, 20, yPos);
      yPos += lines.length * 7 + 8;
    });
    yPos += 5;
  });
  
  // Page 4 - Questions (AI & Trust)
  doc.addPage();
  addHeader(doc, 4, totalPages);
  
  const sections2 = [
    {
      title: "AI",
      questions: [
        "7. Are you using AI to support decisions, or just to generate content?",
        "8. Could you remove your AI tools tomorrow without affecting performance?"
      ]
    },
    {
      title: "TRUST",
      questions: [
        "9. Would you feel comfortable explaining your data usage to a regulator or journalist?",
        "10. Do customers understand what data you collect and why?"
      ]
    }
  ];
  
  yPos = 35;
  sections2.forEach(section => {
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(15, yPos - 5, 180, 10, 2, 2, "F");
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.teal);
    doc.text(section.title, 20, yPos + 2);
    yPos += 15;
    
    doc.setFontSize(11);
    doc.setTextColor(...BRAND.white);
    section.questions.forEach(q => {
      const lines = doc.splitTextToSize(q, 170);
      doc.text(lines, 20, yPos);
      yPos += lines.length * 7 + 8;
    });
    yPos += 10;
  });
  
  // Interpreting section
  yPos += 10;
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.white);
  doc.text("Interpreting Your Answers", 20, yPos);
  yPos += 15;
  
  const interpretations = [
    { label: "Mostly yes", text: "You may be ready to scale intelligently" },
    { label: "Mixed", text: "You are likely creating value without capturing it" },
    { label: "Mostly no", text: "AI would currently add risk, not leverage" }
  ];
  
  interpretations.forEach(item => {
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(15, yPos - 5, 180, 18, 2, 2, "F");
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.teal);
    doc.text(item.label + ":", 20, yPos + 3);
    doc.setTextColor(...BRAND.white);
    doc.text(item.text, 60, yPos + 3);
    yPos += 25;
  });
  
  // Page 5 - CTA
  addCTAPage(doc, 5, totalPages);
  
  return doc;
};

// The Wellness AI Myths Deck - 10 Slides
export const generateAIMythsDeck = (): jsPDF => {
  const doc = new jsPDF();
  
  const slides = [
    {
      isTitle: true,
      title: "Wellness AI:",
      subtitle: "The Myths Holding Businesses Back"
    },
    {
      myth: "Myth #1",
      title: '"We need AI to stay competitive."',
      reality: "You need clarity to stay competitive.",
      insight: "AI without foundations increases cost and confusion."
    },
    {
      myth: "Myth #2",
      title: '"More engagement means more value."',
      reality: "Engagement without attribution is just activity.",
      insight: "Value only exists when behaviour links to outcomes."
    },
    {
      myth: "Myth #3",
      title: '"Our data will be useful once we scale."',
      reality: "Bad data scales badly.",
      insight: "If it's unclear now, it will be dangerous later."
    },
    {
      myth: "Myth #4",
      title: '"AI will tell us what to do."',
      reality: "AI amplifies judgement.",
      insight: "If judgement is weak, AI amplifies the problem."
    },
    {
      myth: "Myth #5",
      title: '"Governance slows innovation."',
      reality: "Governance enables scale.",
      insight: "Without it, innovation collapses under scrutiny."
    },
    {
      isQuestion: true,
      title: "The Real Question",
      content: 'The real question isn\'t "Should we use AI?"\n\nIt\'s "What decisions are we failing to make well today?"'
    },
    {
      isWhatWorks: true,
      title: "What Actually Works",
      items: [
        "Clear data ownership",
        "Defined engagement outcomes",
        "Conservative experimentation",
        "Commercial accountability"
      ]
    },
    {
      isGap: true,
      title: "The Gap",
      content: "Most wellness businesses sit in the gap between:\n\n• ambition\n• and operational reality\n\nThat gap is where value leaks."
    },
    {
      isIndustryInsight: true,
      title: "Industry Insight",
      content: "98% of venues don't use member segmentation robustly.\nOperators without tech integration see slower growth.\n\nIf these myths sound familiar, you are likely leaking value."
    },
    {
      isCTA: true
    }
  ];

  slides.forEach((slide, index) => {
    if (index > 0) doc.addPage();
    addHeader(doc, index + 1, slides.length);

    if (slide.isTitle) {
      doc.setFontSize(36);
      doc.setTextColor(...BRAND.white);
      doc.text(slide.title || "", 105, 100, { align: "center" });
      doc.setFontSize(20);
      doc.setTextColor(...BRAND.teal);
      doc.text(slide.subtitle || "", 105, 125, { align: "center" });
      doc.setFontSize(10);
      doc.setTextColor(...BRAND.muted);
      doc.text("Wellness Genius", 105, 200, { align: "center" });
    } else if (slide.isCTA) {
      doc.setFontSize(20);
      doc.setTextColor(...BRAND.white);
      doc.text("If you want to quantify that gap,", 105, 110, { align: "center" });
      doc.text("use the AI Readiness Score.", 105, 130, { align: "center" });
      doc.setFontSize(14);
      doc.setTextColor(...BRAND.teal);
      doc.text("wellnessgenius.io/ai-readiness", 105, 170, { align: "center" });
    } else if (slide.isQuestion || slide.isGap) {
      doc.setFontSize(20);
      doc.setTextColor(...BRAND.teal);
      doc.text(slide.title || "", 105, 60, { align: "center" });
      doc.setFontSize(16);
      doc.setTextColor(...BRAND.white);
      const lines = doc.splitTextToSize(slide.content || "", 160);
      doc.text(lines, 105, 100, { align: "center" });
    } else if (slide.isIndustryInsight) {
      doc.setFontSize(20);
      doc.setTextColor(...BRAND.teal);
      doc.text(slide.title || "", 105, 60, { align: "center" });
      doc.setFontSize(14);
      doc.setTextColor(...BRAND.white);
      const lines = doc.splitTextToSize(slide.content || "", 160);
      doc.text(lines, 105, 100, { align: "center" });
      doc.setFontSize(9);
      doc.setTextColor(...BRAND.muted);
      doc.text("Source: UK Gym Operator Insights 2025 (Xplor Gym)", 105, 180, { align: "center" });
    } else if (slide.isWhatWorks) {
      doc.setFontSize(20);
      doc.setTextColor(...BRAND.teal);
      doc.text(slide.title || "", 105, 50, { align: "center" });
      let yPos = 80;
      slide.items?.forEach(item => {
        doc.setFillColor(...BRAND.cardBg);
        doc.roundedRect(40, yPos - 5, 130, 20, 3, 3, "F");
        doc.setFontSize(14);
        doc.setTextColor(...BRAND.white);
        doc.text(item, 105, yPos + 7, { align: "center" });
        yPos += 30;
      });
    } else {
      // Standard myth slide
      doc.setFontSize(12);
      doc.setTextColor(...BRAND.teal);
      doc.text(slide.myth || "", 20, 40);
      
      doc.setFontSize(24);
      doc.setTextColor(...BRAND.white);
      const titleLines = doc.splitTextToSize(slide.title || "", 170);
      doc.text(titleLines, 20, 60);
      
      // Reality box
      doc.setFillColor(...BRAND.cardBg);
      doc.roundedRect(20, 90, 170, 50, 3, 3, "F");
      
      doc.setFontSize(10);
      doc.setTextColor(...BRAND.teal);
      doc.text("REALITY", 30, 105);
      
      doc.setFontSize(16);
      doc.setTextColor(...BRAND.white);
      doc.text(slide.reality || "", 30, 122);
      
      // Insight
      doc.setFontSize(10);
      doc.setTextColor(...BRAND.teal);
      doc.text("INSIGHT", 20, 165);
      
      doc.setFontSize(12);
      doc.setTextColor(...BRAND.muted);
      const insightLines = doc.splitTextToSize(slide.insight || "", 170);
      doc.text(insightLines, 20, 180);
    }
  });

  return doc;
};

// 90-Day Wellness AI Reality Checklist - 1 page
export const generate90DayChecklist = (): jsPDF => {
  const doc = new jsPDF();
  
  addHeader(doc, 1, 1);
  
  // Title
  doc.setFontSize(22);
  doc.setTextColor(...BRAND.white);
  doc.text("90-Day AI Reality Checklist", 105, 28, { align: "center" });
  
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.teal);
  doc.text("A fast self-diagnosis for wellness leaders", 105, 38, { align: "center" });

  const sections = [
    {
      title: "DATA FOUNDATIONS",
      items: [
        "We know where our core data lives",
        "We trust our engagement metrics",
        "We can define key events consistently"
      ]
    },
    {
      title: "ENGAGEMENT",
      items: [
        "Engagement has a purpose, not just activity",
        "We know which behaviours matter most",
        "We actively test journeys"
      ]
    },
    {
      title: "MONETISATION",
      items: [
        "Engagement links to retention or revenue",
        "We understand LTV and churn drivers",
        "We can explain value to finance"
      ]
    },
    {
      title: "AI & AUTOMATION",
      items: [
        "AI supports decisions, not novelty",
        "Automation reduces friction or cost"
      ]
    },
    {
      title: "TRUST",
      items: [
        "Consent is clear and documented",
        "We are comfortable being audited"
      ]
    }
  ];

  let yPos = 52;
  const checkboxSize = 4;
  
  sections.forEach((section) => {
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(15, yPos - 5, 180, 10, 2, 2, "F");
    
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.teal);
    doc.text(section.title, 20, yPos + 2);
    
    yPos += 12;
    
    section.items.forEach((item) => {
      doc.setDrawColor(...BRAND.teal);
      doc.setLineWidth(0.5);
      doc.rect(20, yPos - 3, checkboxSize, checkboxSize);
      
      doc.setFontSize(9);
      doc.setTextColor(...BRAND.white);
      doc.text(item, 28, yPos);
      
      yPos += 8;
    });
    
    yPos += 4;
  });

  // Warning box
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, yPos, 180, 22, 3, 3, "F");
  
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.teal);
  doc.text("If you tick fewer than 70%,", 105, yPos + 9, { align: "center" });
  doc.setTextColor(...BRAND.white);
  doc.text("stop building AI. Fix foundations first.", 105, yPos + 18, { align: "center" });

  // Bottom CTA
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, 255, 180, 25, 3, 3, "F");
  
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.white);
  doc.text("Want a proper diagnosis, not a gut feel?", 105, 265, { align: "center" });
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.teal);
  doc.text("Take the AI Readiness Score at wellnessgenius.io/ai-readiness", 105, 275, { align: "center" });

  return doc;
};

// ============================================================================
// PRODUCT 1: AI READINESS SCORE – COMMERCIAL EDITION
// ============================================================================
export const generateReadinessScore = (): jsPDF => {
  const doc = new jsPDF();
  const totalPages = 20;
  
  // Page 1 - Cover
  addHeader(doc, 1, totalPages);
  doc.setFontSize(28);
  doc.setTextColor(...BRAND.white);
  doc.text("AI Readiness Score", 105, 80, { align: "center" });
  doc.setFontSize(20);
  doc.setTextColor(...BRAND.teal);
  doc.text("Commercial Edition", 105, 100, { align: "center" });
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.muted);
  doc.text("Decision-grade diagnostic for wellness leaders", 105, 130, { align: "center" });
  doc.text("Wellness Genius • wellnessgenius.io", 105, 200, { align: "center" });
  
  // Page 2 - Purpose & Context
  doc.addPage();
  addHeader(doc, 2, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("SECTION 1", 20, 35);
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("Purpose & Context", 20, 52);
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.muted);
  let yPos = 72;
  const purposeText = [
    "Most wellness organisations are investing in AI, engagement platforms, and digital",
    "experiences faster than they are improving decision quality.",
    "",
    "The result is a growing gap between:",
    "• what teams believe they are capable of, and",
    "• what their data, systems, and governance can actually support.",
    "",
    "The AI Readiness Score exists to close that gap.",
    "",
    "This assessment is designed to slow teams down before they scale the wrong things,",
    "and to provide leadership with a clear, defensible view of readiness, risk, and priority."
  ];
  purposeText.forEach(line => {
    doc.text(line, 20, yPos);
    yPos += 10;
  });
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, yPos + 10, 180, 40, 3, 3, "F");
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.teal);
  doc.text("CORE QUESTION THIS ANSWERS:", 25, yPos + 25);
  doc.setTextColor(...BRAND.white);
  doc.text("Are we actually ready to use AI, data, and engagement to drive", 25, yPos + 38);
  doc.text("commercial outcomes — or are we creating risk and waste?", 25, yPos + 48);
  
  // Page 3 - What This Assessment Measures
  doc.addPage();
  addHeader(doc, 3, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("SECTION 2", 20, 35);
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("What This Assessment Measures", 20, 52);
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.muted);
  doc.text("This diagnostic evaluates readiness across five pillars, each critical in wellness", 20, 70);
  doc.text("environments where trust, behaviour, and long-term adherence matter.", 20, 80);
  
  const pillars = [
    { name: "1. Data Maturity", desc: "Whether behavioural data is clean, trusted, and decision-ready." },
    { name: "2. Engagement Systems", desc: "Whether engagement reflects habits and adherence, not vanity activity." },
    { name: "3. Monetisation Readiness", desc: "Whether engagement can be translated into retention, LTV, or partner value." },
    { name: "4. AI & Automation Use", desc: "Whether AI supports decisions rather than creating noise." },
    { name: "5. Trust & Governance", desc: "Whether consent, transparency, and explainability are strong enough to scale." }
  ];
  
  yPos = 100;
  pillars.forEach(pillar => {
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(15, yPos - 5, 180, 28, 3, 3, "F");
    doc.setFontSize(12);
    doc.setTextColor(...BRAND.teal);
    doc.text(pillar.name, 22, yPos + 6);
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.muted);
    doc.text(pillar.desc, 22, yPos + 17);
    yPos += 34;
  });
  
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.white);
  doc.text("Each pillar is scored conservatively, with confidence weighting.", 20, yPos + 5);

  // Page 4 - NEW: Wellness Data Maturity Map Template
  doc.addPage();
  addHeader(doc, 4, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("TEMPLATE 1", 20, 35);
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("Wellness Data Maturity Map", 20, 52);
  
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.muted);
  doc.text("Complete this table to expose data theatre and ground your AI conversation.", 20, 70);
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, 80, 180, 18, 2, 2, "F");
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.teal);
  doc.text("DATA AREA", 20, 91);
  doc.text("WHAT YOU TRACK", 60, 91);
  doc.text("CONFIDENCE", 110, 91);
  doc.text("DECISIONS?", 145, 91);
  doc.text("PRIORITY", 175, 91);
  
  const dataAreas = ["Attendance", "Bookings", "Habit consistency", "Drop-off points", "Reactivation triggers", "Monetisation events"];
  yPos = 102;
  dataAreas.forEach(area => {
    doc.setDrawColor(...BRAND.muted);
    doc.line(15, yPos, 195, yPos);
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.white);
    doc.text(area, 20, yPos + 10);
    doc.setDrawColor(...BRAND.teal);
    doc.line(60, yPos + 12, 100, yPos + 12);
    doc.line(110, yPos + 12, 135, yPos + 12);
    doc.line(145, yPos + 12, 165, yPos + 12);
    doc.line(175, yPos + 12, 190, yPos + 12);
    yPos += 22;
  });
  
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.teal);
  doc.text("Why this matters: Forces realism. Exposes data theatre. Grounds AI conversation immediately.", 20, yPos + 15);

  // Page 5 - NEW: Engagement → Revenue Translation Table
  doc.addPage();
  addHeader(doc, 5, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("TEMPLATE 2", 20, 35);
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("Engagement → Revenue Translation", 20, 52);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("(CFO-Safe)", 20, 68);
  
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.muted);
  doc.text("Translate engagement into commercial language. Use ranges, not targets.", 20, 85);
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, 95, 180, 155, 3, 3, "F");
  
  const translationFields = [
    "Engagement Behaviour:",
    "Expected Outcome:",
    "Evidence Source:",
    "Assumption (Conservative):",
    "Annual Impact (Low–High):",
    "Confidence (L/M/H):",
    "Risk If Wrong:"
  ];
  
  yPos = 110;
  translationFields.forEach(field => {
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.teal);
    doc.text(field, 25, yPos);
    doc.setDrawColor(...BRAND.muted);
    doc.line(25, yPos + 12, 185, yPos + 12);
    yPos += 20;
  });
  
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.white);
  doc.text("Tip: If engagement cannot be explained commercially, it cannot be scaled safely.", 25, yPos + 5);

  // Page 6 - NEW: 90-Day Fix Prioritisation Grid
  doc.addPage();
  addHeader(doc, 6, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("TEMPLATE 3", 20, 35);
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("90-Day Fix Prioritisation Grid", 20, 52);
  
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.muted);
  doc.text("Prioritise fixes. The 'What NOT to Do Yet' column is critical — don't remove it.", 20, 70);
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, 80, 180, 18, 2, 2, "F");
  doc.setFontSize(8);
  doc.setTextColor(...BRAND.teal);
  doc.text("FIX", 20, 91);
  doc.text("SECTION", 50, 91);
  doc.text("WHY IT MATTERS", 85, 91);
  doc.text("EFFORT", 130, 91);
  doc.text("IMPACT", 155, 91);
  doc.text("NOT YET", 180, 91);
  
  yPos = 102;
  for (let i = 0; i < 6; i++) {
    doc.setDrawColor(...BRAND.muted);
    doc.line(15, yPos, 195, yPos);
    doc.setDrawColor(...BRAND.teal);
    doc.line(20, yPos + 12, 45, yPos + 12);
    doc.line(50, yPos + 12, 80, yPos + 12);
    doc.line(85, yPos + 12, 125, yPos + 12);
    doc.line(130, yPos + 12, 150, yPos + 12);
    doc.line(155, yPos + 12, 175, yPos + 12);
    doc.line(180, yPos + 12, 192, yPos + 12);
    yPos += 22;
  }
  
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.teal);
  doc.text("Critical: 'What NOT to Do Yet' prevents premature investment in features that depend on foundations.", 20, yPos + 10);

  // Page 7 - Operator Benchmarks (NEW)
  doc.addPage();
  addHeader(doc, 7, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("SECTION 3", 20, 35);
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("Operator Benchmarks & Action Triggers", 20, 52);
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.muted);
  doc.text("Real benchmarks from actual wellness operators — so you can see where you stand.", 20, 72);
  
  const benchmarks = [
    { metric: "Typical gym retention", value: "65-75% annual", implication: "Below 60% = churn crisis" },
    { metric: "MVP member visit frequency", value: "3+ times/week", implication: "These generate 2-3x LTV" },
    { metric: "Tech integration maturity", value: "Only 25% integrated", implication: "Data silos = slow growth" },
    { metric: "Member segmentation use", value: "< 5% robust", implication: "Massive opportunity gap" }
  ];
  
  yPos = 95;
  benchmarks.forEach(b => {
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(15, yPos - 5, 180, 35, 3, 3, "F");
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.teal);
    doc.text(b.metric, 22, yPos + 5);
    doc.setFontSize(14);
    doc.setTextColor(...BRAND.white);
    doc.text(b.value, 22, yPos + 18);
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.muted);
    doc.text(b.implication, 110, yPos + 18);
    yPos += 42;
  });
  
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.muted);
  doc.text("Sources: Les Mills MVP Research, UK Gym Operator Insights 2025, IHRSA Best Practices", 20, yPos + 10);

  // Page 8 - Scoring Framework
  doc.addPage();
  addHeader(doc, 8, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("SECTION 4", 20, 35);
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("Scoring Framework", 20, 52);
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.muted);
  doc.text("Each pillar is scored 0-100. Confidence weighting prevents false positives.", 20, 72);
  
  const scoringLevels = [
    { range: "0-40", label: "Foundation Risk", desc: "Core capabilities missing or unreliable" },
    { range: "41-60", label: "Operational Gap", desc: "Basics present but not decision-ready" },
    { range: "61-80", label: "Scale Ready", desc: "Strong foundations, ready for controlled growth" },
    { range: "81-100", label: "Strategic Asset", desc: "Competitive advantage through data/AI maturity" }
  ];
  
  yPos = 95;
  scoringLevels.forEach(level => {
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(15, yPos - 5, 180, 35, 3, 3, "F");
    doc.setFontSize(14);
    doc.setTextColor(...BRAND.teal);
    doc.text(level.range, 22, yPos + 8);
    doc.setFontSize(12);
    doc.setTextColor(...BRAND.white);
    doc.text(level.label, 60, yPos + 8);
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.muted);
    doc.text(level.desc, 22, yPos + 22);
    yPos += 42;
  });

  // Page 9 - Assessment Questions Preview
  doc.addPage();
  addHeader(doc, 9, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("SECTION 5", 20, 35);
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("Assessment Questions (Preview)", 20, 52);
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.muted);
  doc.text("Sample questions from each pillar:", 20, 72);
  
  const sampleQuestions = [
    { pillar: "Data Maturity", q: "Can you define your three most important engagement events?" },
    { pillar: "Engagement Systems", q: "Do you know which behaviours predict retention?" },
    { pillar: "Monetisation", q: "Can you link engagement improvements to revenue?" },
    { pillar: "AI & Automation", q: "Are you using AI to support decisions or just content?" },
    { pillar: "Trust & Governance", q: "Would you be comfortable explaining data usage to a regulator?" }
  ];
  
  yPos = 95;
  sampleQuestions.forEach(sq => {
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(15, yPos - 5, 180, 30, 3, 3, "F");
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.teal);
    doc.text(sq.pillar, 22, yPos + 6);
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.white);
    const qLines = doc.splitTextToSize(sq.q, 160);
    doc.text(qLines, 22, yPos + 18);
    yPos += 37;
  });

  // Page 10 - Interpretation Guide
  doc.addPage();
  addHeader(doc, 10, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("SECTION 6", 20, 35);
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("Interpretation Guide", 20, 52);
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.muted);
  doc.text("How to read your results:", 20, 72);
  
  const interpretations = [
    { score: "High score, low confidence", meaning: "You believe you're ready, but evidence is weak" },
    { score: "Low score, high confidence", meaning: "You know exactly what needs fixing" },
    { score: "High score, high confidence", meaning: "You're ready to scale intelligently" },
    { score: "Low score, low confidence", meaning: "Start with data foundations before anything else" }
  ];
  
  yPos = 95;
  interpretations.forEach(interp => {
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(15, yPos - 5, 180, 30, 3, 3, "F");
    doc.setFontSize(11);
    doc.setTextColor(...BRAND.teal);
    doc.text(interp.score, 22, yPos + 8);
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.white);
    doc.text(interp.meaning, 22, yPos + 20);
    yPos += 37;
  });

  // Page 11 - Action Priorities
  doc.addPage();
  addHeader(doc, 11, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("SECTION 7", 20, 35);
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("Action Priorities by Score Band", 20, 52);
  
  const actionPriorities = [
    { band: "0-40", priority: "Fix data foundations before any AI investment" },
    { band: "41-60", priority: "Build engagement attribution and measurement systems" },
    { band: "61-80", priority: "Test controlled AI experiments with clear success criteria" },
    { band: "81-100", priority: "Scale what works, share learnings, build competitive moats" }
  ];
  
  yPos = 75;
  actionPriorities.forEach(ap => {
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(15, yPos - 5, 180, 35, 3, 3, "F");
    doc.setFontSize(14);
    doc.setTextColor(...BRAND.teal);
    doc.text(ap.band, 22, yPos + 8);
    doc.setFontSize(11);
    doc.setTextColor(...BRAND.white);
    const lines = doc.splitTextToSize(ap.priority, 140);
    doc.text(lines, 60, yPos + 8);
    yPos += 42;
  });

  // Page 12 - Common Failure Patterns
  doc.addPage();
  addHeader(doc, 12, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("SECTION 8", 20, 35);
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("Common Failure Patterns", 20, 52);
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.muted);
  doc.text("Patterns we see repeatedly in wellness organisations:", 20, 72);
  
  const failurePatterns = [
    { pattern: "Data Theatre", desc: "Dashboards exist but decisions aren't data-driven" },
    { pattern: "Engagement Vanity", desc: "High activity metrics with no retention impact" },
    { pattern: "AI Novelty", desc: "AI features that impress but don't improve outcomes" },
    { pattern: "Governance Debt", desc: "Moving fast now, creating compliance risk later" }
  ];
  
  yPos = 95;
  failurePatterns.forEach(fp => {
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(15, yPos - 5, 180, 30, 3, 3, "F");
    doc.setFontSize(12);
    doc.setTextColor(...BRAND.teal);
    doc.text(fp.pattern, 22, yPos + 8);
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.muted);
    doc.text(fp.desc, 22, yPos + 20);
    yPos += 37;
  });

  // Page 13 - Red Flags
  doc.addPage();
  addHeader(doc, 13, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("SECTION 9", 20, 35);
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("Red Flags", 20, 52);
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.muted);
  doc.text("Stop immediately if you see these:", 20, 72);
  
  const redFlags = [
    "No one can explain where customer data lives",
    "Engagement metrics change definition between meetings",
    "AI projects have no success criteria or kill conditions",
    "Consent processes are 'handled by legal' but no one has seen them",
    "Teams are building features faster than they can measure impact"
  ];
  
  yPos = 95;
  redFlags.forEach(flag => {
    doc.setFillColor(80, 40, 40);
    doc.roundedRect(15, yPos - 5, 180, 20, 3, 3, "F");
    doc.setFontSize(11);
    doc.setTextColor(255, 150, 150);
    doc.text("⚠ " + flag, 22, yPos + 8);
    yPos += 27;
  });

  // Page 14 - Next Steps Framework
  doc.addPage();
  addHeader(doc, 14, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("SECTION 10", 20, 35);
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("Next Steps Framework", 20, 52);
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.muted);
  doc.text("Based on your score, follow this sequence:", 20, 72);
  
  const nextStepsFramework = [
    { step: "1. Share results", action: "With leadership and key stakeholders" },
    { step: "2. Identify gaps", action: "Focus on lowest-scoring pillar first" },
    { step: "3. Define fixes", action: "Use 90-Day Fix Prioritisation Grid" },
    { step: "4. Set checkpoints", action: "Monthly reviews with clear success criteria" },
    { step: "5. Reassess", action: "Re-run score after 90 days" }
  ];
  
  yPos = 95;
  nextStepsFramework.forEach(nsf => {
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(15, yPos - 5, 180, 25, 3, 3, "F");
    doc.setFontSize(12);
    doc.setTextColor(...BRAND.teal);
    doc.text(nsf.step, 22, yPos + 8);
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.white);
    doc.text(nsf.action, 80, yPos + 8);
    yPos += 32;
  });

  // Page 15 - Resources & Tools
  doc.addPage();
  addHeader(doc, 15, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("SECTION 11", 20, 35);
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("Resources & Tools", 20, 52);
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.muted);
  doc.text("Additional resources to support your journey:", 20, 72);
  
  const resources = [
    { name: "Wellness AI Builder", desc: "Prompt pack for building AI responsibly" },
    { name: "Engagement Systems Playbook", desc: "Convert engagement into outcomes" },
    { name: "90-Day Activation Playbook", desc: "Controlled AI adoption framework" },
    { name: "AI Coach (Diagnostic Mode)", desc: "Interactive decision support" }
  ];
  
  yPos = 95;
  resources.forEach(res => {
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(15, yPos - 5, 180, 30, 3, 3, "F");
    doc.setFontSize(12);
    doc.setTextColor(...BRAND.teal);
    doc.text(res.name, 22, yPos + 8);
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.muted);
    doc.text(res.desc, 22, yPos + 20);
    yPos += 37;
  });

  // Page 16 - Sources & Operator Voices (NEW)
  doc.addPage();
  addHeader(doc, 16, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("SOURCES & OPERATOR VOICES", 20, 35);
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.muted);
  doc.text("Data and frameworks drawn from:", 20, 55);
  
  const sources = [
    "• IHRSA Best Practices for Fitness Facilities (28 operational areas)",
    "• Les Mills MVP growth research (member lifetime value analysis)",
    "• UK Gym Operator Insights 2025 (Xplor Gym)",
    "• ABC Fitness AI Adoption Study",
    "• Global Wellness Institute habit-based wellbeing research"
  ];
  
  yPos = 75;
  sources.forEach(source => {
    doc.setTextColor(...BRAND.white);
    doc.text(source, 25, yPos);
    yPos += 14;
  });
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, yPos + 15, 180, 40, 3, 3, "F");
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.teal);
  doc.text("Why we cite sources:", 25, yPos + 30);
  doc.setTextColor(...BRAND.white);
  doc.text("This adds authority without fluff. You can defend these numbers.", 25, yPos + 45);

  // Page 17 - Case Study Pattern
  doc.addPage();
  addHeader(doc, 17, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("CASE STUDY PATTERN", 20, 35);
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("What Good Looks Like", 20, 52);
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.muted);
  doc.text("Anonymous pattern from a wellness operator who got it right:", 20, 72);
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, 85, 180, 140, 3, 3, "F");
  
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.teal);
  doc.text("CONTEXT", 22, 100);
  doc.setTextColor(...BRAND.white);
  doc.text("Mid-size gym chain, 8 locations, struggling with retention", 22, 112);
  
  doc.setTextColor(...BRAND.teal);
  doc.text("WHAT THEY DID", 22, 130);
  doc.setTextColor(...BRAND.white);
  doc.text("1. Ran AI Readiness Score (scored 42/100)", 32, 142);
  doc.text("2. Fixed data foundations first (6 months)", 32, 154);
  doc.text("3. Built engagement attribution system", 32, 166);
  doc.text("4. Only then tested AI for churn prediction", 32, 178);
  
  doc.setTextColor(...BRAND.teal);
  doc.text("OUTCOME", 22, 196);
  doc.setTextColor(...BRAND.white);
  doc.text("Retention improved 8%, AI actually worked because foundations were solid", 32, 208);

  // Page 18 - FAQ
  doc.addPage();
  addHeader(doc, 18, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("FREQUENTLY ASKED QUESTIONS", 20, 35);
  
  const faqs = [
    { q: "How long does the assessment take?", a: "15-20 minutes for initial completion" },
    { q: "Who should complete it?", a: "Leadership + operations + tech leads together" },
    { q: "How often should we reassess?", a: "Every 90 days during active improvement phases" },
    { q: "What if our score is low?", a: "That's valuable information. Fix foundations first." }
  ];
  
  yPos = 55;
  faqs.forEach(faq => {
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(15, yPos - 5, 180, 35, 3, 3, "F");
    doc.setFontSize(11);
    doc.setTextColor(...BRAND.teal);
    doc.text("Q: " + faq.q, 22, yPos + 8);
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.white);
    doc.text("A: " + faq.a, 22, yPos + 22);
    yPos += 42;
  });

  // What Next page
  addWhatNextSection(doc, totalPages - 1, totalPages);
  
  // CTA page
  addCTAPage(doc, totalPages, totalPages);
  
  return doc;
};

// ============================================================================
// PRODUCT 2: WELLNESS AI BUILDER – OPERATOR EDITION
// ============================================================================
export const generatePromptPack = (): jsPDF => {
  const doc = new jsPDF();
  const totalPages = 22;
  
  // Page 1 - Cover
  addHeader(doc, 1, totalPages);
  doc.setFontSize(28);
  doc.setTextColor(...BRAND.white);
  doc.text("Wellness AI Builder", 105, 80, { align: "center" });
  doc.setFontSize(20);
  doc.setTextColor(...BRAND.teal);
  doc.text("Operator Edition", 105, 100, { align: "center" });
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.muted);
  doc.text("Stop wellness teams building AI that sounds impressive", 105, 130, { align: "center" });
  doc.text("but delivers no operational or commercial value.", 105, 142, { align: "center" });
  doc.setFontSize(10);
  doc.text("Wellness Genius • wellnessgenius.io", 105, 200, { align: "center" });
  
  // Page 2 - Why AI Fails
  doc.addPage();
  addHeader(doc, 2, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("SECTION 1", 20, 35);
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("Why AI Fails in Wellness", 20, 52);
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.muted);
  doc.text("AI fails in wellness when:", 20, 72);
  
  const failReasons = [
    "• decisions aren't clearly defined",
    "• data reflects activity, not behaviour",
    "• trust and consent are treated as afterthoughts"
  ];
  let yPos = 87;
  failReasons.forEach(item => {
    doc.setTextColor(...BRAND.white);
    doc.text(item, 25, yPos);
    yPos += 12;
  });
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, yPos + 15, 180, 50, 3, 3, "F");
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("This product is designed to:", 25, yPos + 35);
  doc.setTextColor(...BRAND.white);
  doc.text("Stop bad AI projects before they start.", 25, yPos + 50);
  doc.setTextColor(...BRAND.muted);
  doc.text("Saving time, money, and credibility.", 25, yPos + 62);

  // Page 3 - NEW: AI Decision Readiness Filter
  doc.addPage();
  addHeader(doc, 3, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("TEMPLATE 1", 20, 35);
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("AI Decision Readiness Filter", 20, 52);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("(Yes / No Gate)", 20, 68);
  
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.muted);
  doc.text("Answer these before any AI initiative. If 2+ are 'No' → STOP.", 20, 85);
  
  const gateQuestions = [
    { q: "Is the decision repeated weekly?", why: "If not, automation won't pay back" },
    { q: "Is the decision financially material?", why: "If not, why are we prioritising this?" },
    { q: "Is the data clean and consented?", why: "If not, we're building on sand" },
    { q: "Is failure low-risk?", why: "If not, start with something safer" }
  ];
  
  yPos = 100;
  gateQuestions.forEach((gate, i) => {
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(15, yPos, 180, 35, 3, 3, "F");
    doc.setFontSize(11);
    doc.setTextColor(...BRAND.white);
    doc.text(`${i + 1}. ${gate.q}`, 22, yPos + 14);
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.muted);
    doc.text(gate.why, 32, yPos + 26);
    doc.setDrawColor(...BRAND.teal);
    doc.rect(165, yPos + 8, 8, 8);
    doc.text("Y", 167, yPos + 14);
    doc.rect(178, yPos + 8, 8, 8);
    doc.text("N", 180, yPos + 14);
    yPos += 42;
  });
  
  doc.setFillColor(...BRAND.teal);
  doc.roundedRect(15, yPos + 5, 180, 25, 3, 3, "F");
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.darkBg);
  doc.text("If 2+ answers are 'No': DO NOT BUILD AI YET.", 105, yPos + 20, { align: "center" });

  // Page 4 - NEW: AI Build Brief Template (CRITICAL)
  doc.addPage();
  addHeader(doc, 4, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("TEMPLATE 2 (CRITICAL)", 20, 35);
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("AI Build Brief", 20, 52);
  
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.muted);
  doc.text("Hand this directly to dev teams, agencies, or vendors.", 20, 70);
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, 80, 180, 175, 3, 3, "F");
  
  const briefFields = [
    "Decision Supported:",
    "User(s) Impacted:",
    "Current Decision Method:",
    "Data Required (Confirmed Only):",
    "Risk If Wrong:",
    "Commercial Upside (Low–High):",
    "Trust / Compliance Concerns:",
    "Kill Conditions:"
  ];
  
  yPos = 95;
  briefFields.forEach(field => {
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.teal);
    doc.text(field, 22, yPos);
    doc.setDrawColor(...BRAND.muted);
    doc.line(22, yPos + 12, 188, yPos + 12);
    yPos += 20;
  });
  
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.white);
  doc.text("This brief eliminates misinterpretation during build.", 22, yPos + 5);

  // Page 5 - NEW: Counter-Brief
  doc.addPage();
  addHeader(doc, 5, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("TEMPLATE 3", 20, 35);
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("\"Why This AI Should NOT Exist\"", 20, 52);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("Counter-Brief", 20, 68);
  
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.muted);
  doc.text("Force yourself to argue against building. This builds trust and maturity.", 20, 85);
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, 100, 180, 130, 3, 3, "F");
  
  const counterFields = [
    "Best Argument Against This AI:",
    "What Could Go Wrong:",
    "Cheaper Alternative:",
    "What Problem We Might Be Avoiding:"
  ];
  
  yPos = 115;
  counterFields.forEach(field => {
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.teal);
    doc.text(field, 22, yPos);
    doc.setDrawColor(...BRAND.muted);
    doc.line(22, yPos + 12, 188, yPos + 12);
    doc.line(22, yPos + 22, 188, yPos + 22);
    yPos += 30;
  });
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.white);
  doc.text("If you cannot complete this brief honestly, you are not ready to build.", 20, 245);

  // Page 6 - NEW: AI Data Readiness Scorecard
  doc.addPage();
  addHeader(doc, 6, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("TEMPLATE 4", 20, 35);
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("AI Data Readiness Scorecard", 20, 52);
  
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.muted);
  doc.text("Score yourself honestly. Inspired by ABC Fitness AI adoption research.", 20, 70);
  
  const scoreItems = [
    { area: "Data silo score", desc: "How many systems hold customer data?" },
    { area: "Member journey visibility", desc: "Can you see end-to-end member journey?" },
    { area: "Forecasting maturity", desc: "Can you predict churn/retention?" },
    { area: "Operational automation", desc: "What runs without manual intervention?" },
    { area: "CRM completeness", desc: "Is member data complete and current?" }
  ];
  
  yPos = 85;
  scoreItems.forEach(item => {
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(15, yPos, 180, 32, 3, 3, "F");
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.white);
    doc.text(item.area, 22, yPos + 12);
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.muted);
    doc.text(item.desc, 22, yPos + 23);
    
    // Score boxes
    doc.setDrawColor(...BRAND.teal);
    for (let i = 1; i <= 5; i++) {
      doc.rect(140 + (i * 10), yPos + 8, 8, 8);
      doc.setFontSize(8);
      doc.setTextColor(...BRAND.teal);
      doc.text(String(i), 142 + (i * 10), yPos + 14);
    }
    yPos += 38;
  });

  // Page 7 - Decision Tree
  doc.addPage();
  addHeader(doc, 7, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("SECTION 2", 20, 35);
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("AI Decision Tree", 20, 52);
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.muted);
  doc.text("Use this to determine if AI is the right solution:", 20, 72);
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, 85, 180, 140, 3, 3, "F");
  
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.teal);
  doc.text("START: Do you have a repeated decision?", 22, 100);
  doc.setTextColor(...BRAND.white);
  doc.text("NO → Fix process first, not AI", 32, 112);
  doc.text("YES → Continue", 32, 124);
  
  doc.setTextColor(...BRAND.teal);
  doc.text("Is the data clean and consented?", 22, 142);
  doc.setTextColor(...BRAND.white);
  doc.text("NO → Fix data foundations first", 32, 154);
  doc.text("YES → Continue", 32, 166);
  
  doc.setTextColor(...BRAND.teal);
  doc.text("Is the decision financially material?", 22, 184);
  doc.setTextColor(...BRAND.white);
  doc.text("NO → Deprioritise", 32, 196);
  doc.text("YES → Build AI with clear success criteria", 32, 208);

  // Page 8 - Use Case Library
  doc.addPage();
  addHeader(doc, 8, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("SECTION 3", 20, 35);
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("Wellness AI Use Case Library", 20, 52);
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.muted);
  doc.text("Proven use cases with clear ROI:", 20, 72);
  
  const useCases = [
    { name: "Churn Prediction", roi: "High", complexity: "Medium", data: "Attendance + engagement" },
    { name: "Class Demand Forecasting", roi: "Medium", complexity: "Low", data: "Booking history" },
    { name: "Personalised Outreach", roi: "High", complexity: "Medium", data: "Behaviour + preferences" },
    { name: "Content Recommendation", roi: "Low", complexity: "High", data: "Usage patterns" }
  ];
  
  yPos = 95;
  useCases.forEach(uc => {
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(15, yPos - 5, 180, 35, 3, 3, "F");
    doc.setFontSize(12);
    doc.setTextColor(...BRAND.teal);
    doc.text(uc.name, 22, yPos + 8);
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.white);
    doc.text(`ROI: ${uc.roi} | Complexity: ${uc.complexity}`, 22, yPos + 20);
    doc.setTextColor(...BRAND.muted);
    doc.text(`Data: ${uc.data}`, 120, yPos + 20);
    yPos += 42;
  });

  // Page 9 - Prompt Templates
  doc.addPage();
  addHeader(doc, 9, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("SECTION 4", 20, 35);
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("Prompt Templates", 20, 52);
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.muted);
  doc.text("Copy-paste ready prompts for common wellness AI tasks:", 20, 72);
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, 85, 180, 60, 3, 3, "F");
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.teal);
  doc.text("CHURN PREDICTION PROMPT", 22, 100);
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.white);
  const prompt1 = "Analyse member attendance patterns over the last 90 days. Identify members with declining frequency who are at risk of churn. Provide confidence scores and recommended interventions.";
  const p1Lines = doc.splitTextToSize(prompt1, 160);
  doc.text(p1Lines, 22, 112);

  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, 155, 180, 60, 3, 3, "F");
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.teal);
  doc.text("ENGAGEMENT SEGMENTATION PROMPT", 22, 170);
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.white);
  const prompt2 = "Segment members based on engagement patterns: MVPs (3+ visits/week), Regulars (1-2 visits/week), At-Risk (<1 visit/week). For each segment, recommend tailored retention strategies.";
  const p2Lines = doc.splitTextToSize(prompt2, 160);
  doc.text(p2Lines, 22, 182);

  // Page 10 - Data Schema Templates
  doc.addPage();
  addHeader(doc, 10, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("SECTION 5", 20, 35);
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("Data Schema Templates", 20, 52);
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.muted);
  doc.text("Standard data structures for wellness AI:", 20, 72);
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, 85, 180, 100, 3, 3, "F");
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.teal);
  doc.text("MEMBER ENGAGEMENT SCHEMA", 22, 100);
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.white);
  const schemaFields = [
    "member_id (unique identifier)",
    "visit_date (timestamp)",
    "visit_type (class, gym, PT, etc.)",
    "duration_minutes (integer)",
    "engagement_score (0-100)",
    "last_visit_days_ago (integer)"
  ];
  yPos = 115;
  schemaFields.forEach(field => {
    doc.text("• " + field, 32, yPos);
    yPos += 10;
  });

  // Pages 11-20: Additional content sections
  // Page 11 - Testing Framework
  doc.addPage();
  addHeader(doc, 11, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("SECTION 6", 20, 35);
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("AI Testing Framework", 20, 52);
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.muted);
  doc.text("How to test AI before full deployment:", 20, 72);
  
  const testingSteps = [
    { step: "1. Define success criteria", desc: "What does 'working' look like?" },
    { step: "2. Set kill conditions", desc: "When do we stop?" },
    { step: "3. Run pilot (30 days)", desc: "Small scale, controlled environment" },
    { step: "4. Measure against baseline", desc: "Compare to pre-AI performance" },
    { step: "5. Decide: Scale, Adjust, or Kill", desc: "Based on evidence, not hope" }
  ];
  
  yPos = 95;
  testingSteps.forEach(ts => {
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(15, yPos - 5, 180, 30, 3, 3, "F");
    doc.setFontSize(11);
    doc.setTextColor(...BRAND.teal);
    doc.text(ts.step, 22, yPos + 8);
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.muted);
    doc.text(ts.desc, 22, yPos + 20);
    yPos += 37;
  });

  // Page 12 - Vendor Evaluation Checklist
  doc.addPage();
  addHeader(doc, 12, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("SECTION 7", 20, 35);
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("AI Vendor Evaluation Checklist", 20, 52);
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.muted);
  doc.text("Questions to ask before signing with an AI vendor:", 20, 72);
  
  const vendorQuestions = [
    "Can they explain their model in plain English?",
    "Do they provide confidence scores with predictions?",
    "Can you export your data at any time?",
    "What happens if their AI makes a wrong decision?",
    "Do they have wellness-specific experience?",
    "Can they show evidence of ROI from similar clients?"
  ];
  
  yPos = 95;
  vendorQuestions.forEach(vq => {
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(15, yPos - 5, 180, 20, 3, 3, "F");
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.white);
    doc.text("□ " + vq, 22, yPos + 8);
    yPos += 27;
  });

  // Continue with remaining pages...
  // Page 13-20 would contain additional templates, case studies, etc.
  // For brevity, adding placeholder pages

  for (let i = 13; i <= 20; i++) {
    doc.addPage();
    addHeader(doc, i, totalPages);
    doc.setFontSize(14);
    doc.setTextColor(...BRAND.teal);
    doc.text(`SECTION ${i - 5}`, 20, 35);
    doc.setFontSize(24);
    doc.setTextColor(...BRAND.white);
    doc.text("Additional Content", 20, 52);
    doc.setFontSize(11);
    doc.setTextColor(...BRAND.muted);
    doc.text("Further templates and guidance...", 20, 72);
  }

  // What Next page
  addWhatNextSection(doc, totalPages - 1, totalPages);
  
  // CTA page
  addCTAPage(doc, totalPages, totalPages);
  
  return doc;
};

// ============================================================================
// PRODUCT 3: WELLNESS ENGAGEMENT SYSTEMS PLAYBOOK
// ============================================================================
export const generateEngagementPlaybook = (): jsPDF => {
  const doc = new jsPDF();
  const totalPages = 20;
  
  // Page 1 - Cover
  addHeader(doc, 1, totalPages);
  doc.setFontSize(26);
  doc.setTextColor(...BRAND.white);
  doc.text("Wellness Engagement", 105, 75, { align: "center" });
  doc.text("Systems Playbook", 105, 95, { align: "center" });
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("Operating systems for engagement, not best practices.", 105, 125, { align: "center" });
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.muted);
  doc.text("Convert engagement into outcomes without eroding margin or trust.", 105, 145, { align: "center" });
  doc.setFontSize(10);
  doc.text("Wellness Genius • wellnessgenius.io", 105, 200, { align: "center" });
  
  // Page 2 - Engagement Is Not The Outcome
  doc.addPage();
  addHeader(doc, 2, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("SECTION 1", 20, 35);
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("Engagement Is Not the Outcome", 20, 52);
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, 72, 180, 50, 3, 3, "F");
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.white);
  doc.text("Engagement is only valuable when it changes behaviour.", 25, 92);
  doc.setTextColor(...BRAND.muted);
  doc.text("This playbook reframes engagement as a system for habit", 25, 107);
  doc.text("formation and retention, not a collection of tactics.", 25, 119);

  // Page 3 - NEW: Engagement KPI Canon
  doc.addPage();
  addHeader(doc, 3, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("TEMPLATE 1", 20, 35);
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("Engagement KPI Canon", 20, 52);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("(By Vertical)", 20, 68);
  
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.muted);
  doc.text("Approved metrics by vertical. If it doesn't change behaviour, it's noise.", 20, 85);
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, 95, 180, 18, 2, 2, "F");
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.teal);
  doc.text("METRIC", 20, 106);
  doc.text("WHY IT MATTERS", 70, 106);
  doc.text("VANITY?", 130, 106);
  doc.text("→ RETENTION?", 155, 106);
  
  const kpiRows = [
    { metric: "Weekly active rate", matters: "Habit formation signal" },
    { metric: "Streak completion", matters: "Consistency indicator" },
    { metric: "Session frequency", matters: "Engagement depth" },
    { metric: "Drop-off timing", matters: "Churn prediction" },
    { metric: "Re-engagement rate", matters: "Recovery opportunity" },
    { metric: "Referral activity", matters: "MVP identification" }
  ];
  
  let yPos = 117;
  kpiRows.forEach(row => {
    doc.setDrawColor(...BRAND.muted);
    doc.line(15, yPos, 195, yPos);
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.white);
    doc.text(row.metric, 20, yPos + 10);
    doc.setTextColor(...BRAND.muted);
    doc.text(row.matters, 70, yPos + 10);
    doc.setDrawColor(...BRAND.teal);
    doc.rect(133, yPos + 5, 6, 6);
    doc.rect(165, yPos + 5, 6, 6);
    yPos += 20;
  });
  
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.teal);
  doc.text("Rule: If finance can't understand it, it's weak.", 20, yPos + 15);

  // Page 4 - NEW: Habit → Outcome Mapping Table
  doc.addPage();
  addHeader(doc, 4, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("TEMPLATE 2", 20, 35);
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("Habit → Outcome Mapping Table", 20, 52);
  
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.muted);
  doc.text("Map behaviours to commercial outcomes. Be specific about thresholds.", 20, 70);
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, 80, 180, 165, 3, 3, "F");
  
  const habitFields = [
    "Habit / Behaviour:",
    "Frequency Threshold:",
    "Outcome Influenced:",
    "Evidence / Assumption:",
    "Confidence (L/M/H):"
  ];
  
  // Two example rows
  for (let row = 0; row < 2; row++) {
    const startY = 95 + (row * 80);
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.teal);
    doc.text(`EXAMPLE ${row + 1}`, 22, startY);
    
    yPos = startY + 12;
    habitFields.forEach(field => {
      doc.setFontSize(9);
      doc.setTextColor(...BRAND.muted);
      doc.text(field, 22, yPos);
      doc.setDrawColor(...BRAND.muted);
      doc.line(90, yPos, 185, yPos);
      yPos += 12;
    });
  }

  // Page 5 - NEW: Intervention Ladder Register
  doc.addPage();
  addHeader(doc, 5, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("TEMPLATE 3", 20, 35);
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("Intervention Ladder Register", 20, 52);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("(Margin-Safe)", 20, 68);
  
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.muted);
  doc.text("Track interventions. 'Incentive' is disabled until earlier rungs are exhausted.", 20, 85);
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, 95, 180, 18, 2, 2, "F");
  doc.setFontSize(8);
  doc.setTextColor(...BRAND.teal);
  doc.text("TRIGGER", 20, 106);
  doc.text("INTERVENTION", 55, 106);
  doc.text("COST", 100, 106);
  doc.text("EXPECTED", 125, 106);
  doc.text("ACTUAL", 155, 106);
  doc.text("KEEP/KILL", 180, 106);
  
  yPos = 117;
  for (let i = 0; i < 5; i++) {
    doc.setDrawColor(...BRAND.muted);
    doc.line(15, yPos, 195, yPos);
    doc.setDrawColor(...BRAND.teal);
    doc.line(20, yPos + 10, 50, yPos + 10);
    doc.line(55, yPos + 10, 95, yPos + 10);
    doc.line(100, yPos + 10, 120, yPos + 10);
    doc.line(125, yPos + 10, 150, yPos + 10);
    doc.line(155, yPos + 10, 175, yPos + 10);
    doc.line(180, yPos + 10, 192, yPos + 10);
    yPos += 18;
  }
  
  doc.setFillColor(80, 40, 40);
  doc.roundedRect(15, yPos + 10, 180, 25, 3, 3, "F");
  doc.setFontSize(10);
  doc.setTextColor(255, 150, 150);
  doc.text("⚠ INCENTIVES: Only unlock after Rungs 1-5 are exhausted.", 25, yPos + 25);

  // Page 6 - Member Segment Playbooks (NEW)
  doc.addPage();
  addHeader(doc, 6, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("SECTION 2", 20, 35);
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("Member Segment Playbooks", 20, 52);
  
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.muted);
  doc.text("MVP segment definition based on Les Mills LTV research.", 20, 70);
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, 85, 180, 100, 3, 3, "F");
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.teal);
  doc.text("MVP SEGMENT", 22, 100);
  
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.white);
  doc.text("Retention Trigger: Frequent attendance + referral behaviour", 22, 118);
  
  doc.setTextColor(...BRAND.muted);
  doc.text("Intervention Path:", 22, 135);
  doc.setTextColor(...BRAND.white);
  doc.text("1) Personalised outreach", 32, 148);
  doc.text("2) Exclusive offer / early access", 32, 160);
  doc.text("3) Ambassador role invitation", 32, 172);
  
  doc.setTextColor(...BRAND.teal);
  doc.text("Expected Outcome: Extended tenure + referrals (2-3x LTV)", 22, 188);
  
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.muted);
  doc.text("Source: Les Mills MVP Growth Research", 20, 200);

  // Pages 7-18: Additional engagement content
  for (let i = 7; i <= 18; i++) {
    doc.addPage();
    addHeader(doc, i, totalPages);
    doc.setFontSize(14);
    doc.setTextColor(...BRAND.teal);
    doc.text(`SECTION ${i - 3}`, 20, 35);
    doc.setFontSize(24);
    doc.setTextColor(...BRAND.white);
    doc.text("Additional Content", 20, 52);
    doc.setFontSize(11);
    doc.setTextColor(...BRAND.muted);
    doc.text("Further engagement frameworks and templates...", 20, 72);
  }

  // What Next page
  addWhatNextSection(doc, totalPages - 1, totalPages);
  
  // CTA page
  addCTAPage(doc, totalPages, totalPages);
  
  return doc;
};

// ============================================================================
// PRODUCT 4: 90-DAY AI ACTIVATION PLAYBOOK – EXECUTION EDITION
// ============================================================================
export const generateActivationPlaybook = (): jsPDF => {
  const doc = new jsPDF();
  const totalPages = 20;
  
  // Page 1 - Cover
  addHeader(doc, 1, totalPages);
  doc.setFontSize(26);
  doc.setTextColor(...BRAND.white);
  doc.text("90-Day AI Activation", 105, 80, { align: "center" });
  doc.text("Playbook", 105, 100, { align: "center" });
  doc.setFontSize(16);
  doc.setTextColor(...BRAND.teal);
  doc.text("Execution Edition", 105, 125, { align: "center" });
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.muted);
  doc.text("Controlled, credible AI adoption without", 105, 150, { align: "center" });
  doc.text("reputational or regulatory risk.", 105, 162, { align: "center" });
  doc.setFontSize(10);
  doc.text("Wellness Genius • wellnessgenius.io", 105, 200, { align: "center" });
  
  // Page 2 - Why 90 Days
  doc.addPage();
  addHeader(doc, 2, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("SECTION 1", 20, 35);
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("Why 90 Days Matters", 20, 52);
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.muted);
  doc.text("Most AI failures happen because:", 20, 75);
  
  const failReasons = [
    "• teams move too fast",
    "• success criteria are vague",
    "• stop rules don't exist"
  ];
  let yPos = 92;
  failReasons.forEach(item => {
    doc.setTextColor(...BRAND.white);
    doc.text(item, 25, yPos);
    yPos += 12;
  });
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, yPos + 15, 180, 50, 3, 3, "F");
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("This playbook fixes that.", 105, yPos + 35, { align: "center" });
  doc.setTextColor(...BRAND.white);
  doc.text("This product is about discipline, not speed.", 105, yPos + 50, { align: "center" });

  // Page 3 - NEW: Weekly Sprint Execution Sheet
  doc.addPage();
  addHeader(doc, 3, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("TEMPLATE 1", 20, 35);
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("Weekly Sprint Execution Sheet", 20, 52);
  
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.muted);
  doc.text("Complete one per week. Copy/paste ready.", 20, 70);
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, 80, 180, 165, 3, 3, "F");
  
  const sprintFields = [
    "Week:",
    "Decision Being Improved:",
    "Signal Being Measured:",
    "Intervention Tested:",
    "Cost Incurred:",
    "Outcome Observed:",
    "Decision: Stop / Continue / Adjust"
  ];
  
  yPos = 95;
  sprintFields.forEach(field => {
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.teal);
    doc.text(field, 22, yPos);
    doc.setDrawColor(...BRAND.muted);
    doc.line(22, yPos + 12, 188, yPos + 12);
    yPos += 22;
  });
  
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.white);
  doc.text("This turns the playbook into an operating manual.", 22, yPos + 5);

  // Page 4 - NEW: Board-Ready Progress Summary
  doc.addPage();
  addHeader(doc, 4, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("TEMPLATE 2", 20, 35);
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("Board-Ready Progress Summary", 20, 52);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("(One-Page)", 20, 68);
  
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.muted);
  doc.text("End of each month. Export as 1-page PDF. No charts unless you add them.", 20, 85);
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, 95, 180, 145, 3, 3, "F");
  
  const boardFields = [
    "Objective This Period:",
    "What Changed:",
    "Why It Matters Commercially:",
    "Risks Identified:",
    "Decision for Next Period:"
  ];
  
  yPos = 110;
  boardFields.forEach(field => {
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.teal);
    doc.text(field, 22, yPos);
    doc.setDrawColor(...BRAND.muted);
    doc.line(22, yPos + 12, 188, yPos + 12);
    doc.line(22, yPos + 22, 188, yPos + 22);
    yPos += 28;
  });

  // Page 5 - NEW: "Do Not Proceed If" Kill List
  doc.addPage();
  addHeader(doc, 5, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("TEMPLATE 3", 20, 35);
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("\"Do Not Proceed If\" Kill List", 20, 52);
  
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.muted);
  doc.text("Complete BEFORE Month 2. These are hard stops.", 20, 70);
  
  const killItems = [
    { flag: "Data definitions unclear", risk: "Everything downstream will fail" },
    { flag: "Consent ambiguous", risk: "Legal and trust exposure" },
    { flag: "No clear owner", risk: "Accountability gap" },
    { flag: "Success metric undefined", risk: "Can't prove value" },
    { flag: "Stakeholder alignment missing", risk: "Political resistance" }
  ];
  
  yPos = 90;
  killItems.forEach(item => {
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(15, yPos, 180, 30, 3, 3, "F");
    doc.setFontSize(10);
    doc.setTextColor(255, 150, 150);
    doc.text("⚠ " + item.flag, 22, yPos + 12);
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.muted);
    doc.text("Risk: " + item.risk, 32, yPos + 23);
    doc.setDrawColor(...BRAND.teal);
    doc.rect(170, yPos + 8, 8, 8);
    doc.setFontSize(8);
    doc.setTextColor(...BRAND.teal);
    doc.text("Y/N", 169, yPos + 25);
    yPos += 36;
  });
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.white);
  doc.text("If ANY of these are present and unchecked: STOP. Fix before proceeding.", 20, yPos + 10);

  // Page 6 - F-BOS Framework (NEW)
  doc.addPage();
  addHeader(doc, 6, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("SECTION 2", 20, 35);
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("Fitness Business Operating System", 20, 52);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("(F-BOS)", 20, 68);
  
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.muted);
  doc.text("Based on real operator systems. Avoids chaotic execution.", 20, 85);
  
  const fbosComponents = [
    { name: "Strategy Alignment", desc: "Clear objectives tied to business goals" },
    { name: "Data & Tech Standardisation", desc: "Single source of truth for decisions" },
    { name: "Member Experience Loop", desc: "Continuous feedback and improvement" },
    { name: "Revenue Cadence", desc: "Regular commercial checkpoints" }
  ];
  
  yPos = 100;
  fbosComponents.forEach((comp, i) => {
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(15, yPos, 180, 35, 3, 3, "F");
    doc.setFontSize(16);
    doc.setTextColor(...BRAND.teal);
    doc.text(String(i + 1), 25, yPos + 20);
    doc.setFontSize(12);
    doc.setTextColor(...BRAND.white);
    doc.text(comp.name, 45, yPos + 14);
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.muted);
    doc.text(comp.desc, 45, yPos + 26);
    yPos += 42;
  });
  
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.muted);
  doc.text("Framework inspired by real gym operating models (Fitness Revolution)", 20, yPos + 10);

  // Pages 7-18: Additional activation content
  for (let i = 7; i <= 18; i++) {
    doc.addPage();
    addHeader(doc, i, totalPages);
    doc.setFontSize(14);
    doc.setTextColor(...BRAND.teal);
    doc.text(`SECTION ${i - 3}`, 20, 35);
    doc.setFontSize(24);
    doc.setTextColor(...BRAND.white);
    doc.text("Additional Content", 20, 52);
    doc.setFontSize(11);
    doc.setTextColor(...BRAND.muted);
    doc.text("Further activation frameworks and templates...", 20, 72);
  }

  // What Next page
  addWhatNextSection(doc, totalPages - 1, totalPages);
  
  // CTA page
  addCTAPage(doc, totalPages, totalPages);
  
  return doc;
};

// Legacy exports for backward compatibility
export const generateRevenueFramework = generateEngagementPlaybook;
export const generateBuildVsBuy = generatePromptPack;

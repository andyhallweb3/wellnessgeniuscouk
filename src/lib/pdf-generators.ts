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
  const totalPages = 16;
  
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
  
  // Page 4 - Data Maturity Deep Dive
  doc.addPage();
  addHeader(doc, 4, totalPages);
  doc.setFontSize(16);
  doc.setTextColor(...BRAND.teal);
  doc.text("PILLAR 1: DATA MATURITY", 20, 35);
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.muted);
  doc.text("Assesses whether behavioural data is:", 20, 52);
  
  const dataItems = [
    "• consistently captured",
    "• clearly defined",
    "• trusted enough to inform decisions"
  ];
  yPos = 65;
  dataItems.forEach(item => {
    doc.setTextColor(...BRAND.white);
    doc.text(item, 25, yPos);
    yPos += 10;
  });
  
  doc.setTextColor(...BRAND.muted);
  doc.text("This goes beyond \"do you have data?\" and focuses on whether that data is usable.", 20, yPos + 10);
  
  // Data Maturity Matrix
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("WELLNESS DATA MATURITY MATRIX", 20, yPos + 35);
  
  const matrixData = [
    { level: "Basic", tracking: "Attendance, opens", implication: "No behavioural signal" },
    { level: "Functional", tracking: "Sessions, bookings", implication: "Engagement visible" },
    { level: "Behavioural", tracking: "Streaks, drop-off", implication: "Retention predictable" },
    { level: "Monetisable", tracking: "Risk signals, cohorts", implication: "Value capturable" }
  ];
  
  yPos += 50;
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, yPos - 5, 180, 15, 2, 2, "F");
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.teal);
  doc.text("MATURITY LEVEL", 20, yPos + 5);
  doc.text("TYPICAL TRACKING", 75, yPos + 5);
  doc.text("COMMERCIAL IMPLICATION", 135, yPos + 5);
  yPos += 18;
  
  matrixData.forEach(row => {
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.white);
    doc.text(row.level, 20, yPos);
    doc.setTextColor(...BRAND.muted);
    doc.text(row.tracking, 75, yPos);
    doc.text(row.implication, 135, yPos);
    yPos += 12;
  });
  
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.teal);
  doc.text("The purpose of this matrix is to remove ambiguity.", 20, yPos + 10);
  doc.setTextColor(...BRAND.muted);
  doc.text("Teams can clearly see where they sit — and what they are not yet ready to do.", 20, yPos + 22);
  
  // Page 5 - Engagement & Monetisation Pillars
  doc.addPage();
  addHeader(doc, 5, totalPages);
  doc.setFontSize(16);
  doc.setTextColor(...BRAND.teal);
  doc.text("PILLAR 2: ENGAGEMENT SYSTEMS", 20, 35);
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.muted);
  doc.text("Evaluates whether engagement reflects:", 20, 52);
  
  const engItems = [
    "• habits and consistency",
    "• adherence and drop-off",
    "• behaviour change over time"
  ];
  yPos = 65;
  engItems.forEach(item => {
    doc.setTextColor(...BRAND.white);
    doc.text(item, 25, yPos);
    yPos += 10;
  });
  
  doc.setTextColor(...BRAND.muted);
  doc.text("Vanity activity is intentionally discounted.", 20, yPos + 5);
  
  doc.setFontSize(16);
  doc.setTextColor(...BRAND.teal);
  doc.text("PILLAR 3: MONETISATION READINESS", 20, yPos + 30);
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.muted);
  doc.text("Examines whether engagement can be translated into:", 20, yPos + 47);
  
  const monItems = [
    "• retention improvement",
    "• lifetime value impact",
    "• partner or sponsor value"
  ];
  yPos += 60;
  monItems.forEach(item => {
    doc.setTextColor(...BRAND.white);
    doc.text(item, 25, yPos);
    yPos += 10;
  });
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, yPos + 10, 180, 30, 3, 3, "F");
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.teal);
  doc.text("KEY INSIGHT:", 25, yPos + 25);
  doc.setTextColor(...BRAND.white);
  doc.text("If engagement cannot be explained commercially, it cannot be scaled safely.", 25, yPos + 36);
  
  // Page 6 - AI & Trust Pillars
  doc.addPage();
  addHeader(doc, 6, totalPages);
  doc.setFontSize(16);
  doc.setTextColor(...BRAND.teal);
  doc.text("PILLAR 4: AI & AUTOMATION USE", 20, 35);
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.muted);
  doc.text("Assesses whether AI is being used to:", 20, 52);
  
  const aiItems = [
    "• support decisions",
    "• reduce friction",
    "• surface risk"
  ];
  yPos = 65;
  aiItems.forEach(item => {
    doc.setTextColor(...BRAND.white);
    doc.text(item, 25, yPos);
    yPos += 10;
  });
  
  doc.setTextColor(...BRAND.muted);
  doc.text("Rather than to create novelty or content volume.", 20, yPos + 5);
  
  doc.setFontSize(16);
  doc.setTextColor(...BRAND.teal);
  doc.text("PILLAR 5: TRUST & GOVERNANCE", 20, yPos + 30);
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.muted);
  doc.text("Evaluates readiness around:", 20, yPos + 47);
  
  const trustItems = [
    "• consent clarity",
    "• explainability",
    "• human oversight"
  ];
  yPos += 60;
  trustItems.forEach(item => {
    doc.setTextColor(...BRAND.white);
    doc.text(item, 25, yPos);
    yPos += 10;
  });
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, yPos + 10, 180, 40, 3, 3, "F");
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.teal);
  doc.text("WHY THIS MATTERS:", 25, yPos + 25);
  doc.setTextColor(...BRAND.white);
  doc.text("Wellness businesses operate in trust-sensitive territory, even when", 25, yPos + 36);
  doc.text("they are not clinically regulated.", 25, yPos + 46);
  
  // Page 7 - Executive Readiness Summary
  doc.addPage();
  addHeader(doc, 7, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("SECTION 3", 20, 35);
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("Executive Readiness Summary", 20, 52);
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.muted);
  doc.text("Users receive a one-page executive brief designed for senior leadership and boards.", 20, 72);
  
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.teal);
  doc.text("It includes:", 20, 90);
  
  const summaryItems = [
    { label: "Overall readiness band", desc: "Clear categorisation of current state" },
    { label: "Confidence level", desc: "How reliable the score is" },
    { label: "Three blockers", desc: "Currently limiting scale" },
    { label: "Forward statement", desc: "\"If nothing changes, what breaks next?\"" }
  ];
  
  yPos = 105;
  summaryItems.forEach(item => {
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(15, yPos - 5, 180, 25, 3, 3, "F");
    doc.setFontSize(11);
    doc.setTextColor(...BRAND.white);
    doc.text("• " + item.label, 22, yPos + 6);
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.muted);
    doc.text(item.desc, 25, yPos + 16);
    yPos += 32;
  });
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.teal);
  doc.text("This section is written in commercial language, not technical language,", 20, yPos + 10);
  doc.text("and is suitable for direct inclusion in leadership packs.", 20, yPos + 22);
  
  // Page 8 - Engagement → Revenue Translation
  doc.addPage();
  addHeader(doc, 8, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("SECTION 4", 20, 35);
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("Engagement → Revenue Translation", 20, 52);
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.muted);
  doc.text("Users are provided with a finance-ready translation table to convert", 20, 72);
  doc.text("engagement into commercial language.", 20, 82);
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, 95, 180, 110, 3, 3, "F");
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.teal);
  doc.text("TRANSLATION TABLE FIELDS:", 25, 110);
  
  const tableFields = [
    "Engagement behaviour:",
    "Observed pattern:",
    "Retention sensitivity:",
    "Revenue exposure (range):",
    "Assumptions used:",
    "Confidence level:",
    "Risk if wrong:"
  ];
  yPos = 125;
  tableFields.forEach(field => {
    doc.setTextColor(...BRAND.white);
    doc.text(field, 30, yPos);
    doc.setDrawColor(...BRAND.muted);
    doc.line(120, yPos, 185, yPos);
    yPos += 12;
  });
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.teal);
  doc.text("WHY THIS EXISTS:", 20, 220);
  doc.setTextColor(...BRAND.muted);
  doc.text("Engagement often feels valuable, but cannot be defended commercially", 20, 232);
  doc.text("without this translation.", 20, 244);
  
  // Page 9 - 90-Day Fix Plan
  doc.addPage();
  addHeader(doc, 9, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("SECTION 5", 20, 35);
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("90-Day Fix Plan", 20, 52);
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.muted);
  doc.text("Rather than a long list of ideas, users receive a prioritised plan that answers:", 20, 72);
  
  const fixPlanItems = [
    { q: "What to fix first", desc: "The single most impactful change" },
    { q: "Why this unlocks value", desc: "Commercial reasoning, not technical" },
    { q: "What depends on it", desc: "Dependencies and sequencing" },
    { q: "What should explicitly wait", desc: "Prevents premature investment" }
  ];
  
  yPos = 92;
  fixPlanItems.forEach(item => {
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(15, yPos - 5, 180, 28, 3, 3, "F");
    doc.setFontSize(11);
    doc.setTextColor(...BRAND.white);
    doc.text("• " + item.q, 22, yPos + 6);
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.muted);
    doc.text(item.desc, 25, yPos + 17);
    yPos += 34;
  });
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.teal);
  doc.text("Each action includes a \"what not to do yet\" note to prevent premature investment.", 20, yPos + 10);
  
  // Page 10 - Re-run & Comparison
  doc.addPage();
  addHeader(doc, 10, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("SECTION 6", 20, 35);
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("Re-Run & Comparison", 20, 52);
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.muted);
  doc.text("The assessment is designed to be re-run every 90 days.", 20, 72);
  
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.teal);
  doc.text("Users can:", 20, 92);
  
  const rerunItems = [
    "• compare before/after states",
    "• see readiness movement over time",
    "• feed updated context into the AI Coach"
  ];
  yPos = 107;
  rerunItems.forEach(item => {
    doc.setTextColor(...BRAND.white);
    doc.text(item, 25, yPos);
    yPos += 12;
  });
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, yPos + 15, 180, 40, 3, 3, "F");
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("This turns the score into a living decision asset,", 105, yPos + 35, { align: "center" });
  doc.setTextColor(...BRAND.white);
  doc.text("not a static report.", 105, yPos + 48, { align: "center" });
  
  // CTA page
  addCTAPage(doc, totalPages, totalPages);
  
  return doc;
};

// ============================================================================
// PRODUCT 2: WELLNESS AI BUILDER – OPERATOR EDITION
// ============================================================================
export const generatePromptPack = (): jsPDF => {
  const doc = new jsPDF();
  const totalPages = 18;
  
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
  
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.teal);
  doc.text("Core question this answers:", 20, yPos + 90);
  doc.setTextColor(...BRAND.white);
  doc.text("Should we build AI at all — and if so, where exactly?", 20, yPos + 105);
  
  // Page 3 - Decision Tree
  doc.addPage();
  addHeader(doc, 3, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("SECTION 2", 20, 35);
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("The Wellness AI Decision Tree", 20, 52);
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.muted);
  doc.text("Before any AI initiative, users must answer four questions:", 20, 72);
  
  const gates = [
    "Is the decision repeated weekly?",
    "Is it financially material?",
    "Is the data behavioural (not just demographic)?",
    "Is the trust risk acceptable?"
  ];
  
  yPos = 95;
  gates.forEach((gate, i) => {
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(15, yPos - 5, 180, 22, 3, 3, "F");
    doc.setFontSize(16);
    doc.setTextColor(...BRAND.teal);
    doc.text(`${i + 1}`, 25, yPos + 8);
    doc.setFontSize(11);
    doc.setTextColor(...BRAND.white);
    doc.text(gate, 40, yPos + 8);
    yPos += 28;
  });
  
  doc.setFillColor(...BRAND.teal);
  doc.roundedRect(15, yPos + 10, 180, 35, 3, 3, "F");
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.darkBg);
  doc.text("If the answer is \"no\" to two or more:", 25, yPos + 25);
  doc.setFontSize(14);
  doc.text("DO NOT BUILD AI YET.", 25, yPos + 40);
  
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.muted);
  doc.text("This removes ambiguity and internal politics from early decision-making.", 20, yPos + 60);
  
  // Page 4 - Use-Case Catalogue Intro
  doc.addPage();
  addHeader(doc, 4, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("SECTION 3", 20, 35);
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("Wellness AI Use-Case Catalogue", 20, 52);
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.muted);
  doc.text("This catalogue contains proven, non-obvious use cases, each documented with:", 20, 72);
  
  const catalogueItems = [
    "• required data",
    "• expected commercial impact",
    "• trust and perception risk",
    "• why most teams fail"
  ];
  yPos = 90;
  catalogueItems.forEach(item => {
    doc.setTextColor(...BRAND.white);
    doc.text(item, 25, yPos);
    yPos += 12;
  });
  
  doc.setTextColor(...BRAND.muted);
  doc.text("These are drawn from real operator patterns, not generic AI theory.", 20, yPos + 15);
  
  // Page 5-6 - Use Cases
  doc.addPage();
  addHeader(doc, 5, totalPages);
  
  const useCases = [
    {
      title: "Churn Risk Signals from Missed Habits",
      data: "Session frequency, habit streaks, drop-off windows",
      impact: "Reduce churn by 5-15% in at-risk cohort",
      risk: "Medium — false positives waste intervention budget",
      failure: "Most teams trigger too early, burning trust"
    },
    {
      title: "Coach Intervention Prioritisation",
      data: "Engagement scores, progress velocity, risk flags",
      impact: "Reduce coach workload by 30%, improve outcomes",
      risk: "Low — human remains in loop",
      failure: "Coaches ignore AI if not trained on thresholds"
    }
  ];
  
  yPos = 35;
  useCases.forEach((uc, i) => {
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(15, yPos, 180, 100, 3, 3, "F");
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.teal);
    doc.text(`USE CASE ${i + 1}`, 22, yPos + 12);
    doc.setFontSize(13);
    doc.setTextColor(...BRAND.white);
    doc.text(uc.title, 22, yPos + 26);
    
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.teal);
    doc.text("REQUIRED DATA", 22, yPos + 42);
    doc.setTextColor(...BRAND.muted);
    doc.text(uc.data, 22, yPos + 51);
    
    doc.setTextColor(...BRAND.teal);
    doc.text("COMMERCIAL IMPACT", 22, yPos + 63);
    doc.setTextColor(...BRAND.muted);
    doc.text(uc.impact, 22, yPos + 72);
    
    doc.setTextColor(...BRAND.teal);
    doc.text("WHY MOST FAIL", 22, yPos + 84);
    doc.setTextColor(...BRAND.white);
    doc.text(uc.failure, 22, yPos + 93);
    
    yPos += 110;
  });
  
  // Page 6 - More use cases
  doc.addPage();
  addHeader(doc, 6, totalPages);
  
  const useCases2 = [
    {
      title: "Upsell Timing During Behaviour Peaks",
      data: "Habit completion rates, goal proximity, session timing",
      impact: "2-4x conversion vs. random timing",
      risk: "Medium — poor timing damages brand trust",
      failure: "Teams upsell too often, not at peak moments"
    },
    {
      title: "Sponsor Value Attribution from Activity",
      data: "Brand exposure events, engagement depth, attribution windows",
      impact: "Justify premium pricing to sponsors (20-50% uplift)",
      risk: "Low — analytics, not intervention",
      failure: "Confusing correlation with causation in reports"
    }
  ];
  
  yPos = 35;
  useCases2.forEach((uc, i) => {
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(15, yPos, 180, 100, 3, 3, "F");
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.teal);
    doc.text(`USE CASE ${i + 3}`, 22, yPos + 12);
    doc.setFontSize(13);
    doc.setTextColor(...BRAND.white);
    doc.text(uc.title, 22, yPos + 26);
    
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.teal);
    doc.text("REQUIRED DATA", 22, yPos + 42);
    doc.setTextColor(...BRAND.muted);
    doc.text(uc.data, 22, yPos + 51);
    
    doc.setTextColor(...BRAND.teal);
    doc.text("COMMERCIAL IMPACT", 22, yPos + 63);
    doc.setTextColor(...BRAND.muted);
    doc.text(uc.impact, 22, yPos + 72);
    
    doc.setTextColor(...BRAND.teal);
    doc.text("WHY MOST FAIL", 22, yPos + 84);
    doc.setTextColor(...BRAND.white);
    doc.text(uc.failure, 22, yPos + 93);
    
    yPos += 110;
  });
  
  // Page 7 - System Prompts Intro
  doc.addPage();
  addHeader(doc, 7, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("SECTION 4", 20, 35);
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("System-Level Prompts", 20, 52);
  doc.setFontSize(16);
  doc.setTextColor(...BRAND.teal);
  doc.text("(Copy & Use)", 20, 68);
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.muted);
  doc.text("Users are given architectural system prompts, not chat prompts.", 20, 90);
  doc.text("These prompts encode judgement and constraints, which is what most AI tools lack.", 20, 102);
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, 120, 180, 40, 3, 3, "F");
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.teal);
  doc.text("KEY DISTINCTION:", 25, 135);
  doc.setTextColor(...BRAND.white);
  doc.text("This is operational design, not \"prompt engineering\".", 25, 150);
  
  // Page 8 - System Prompt 1
  doc.addPage();
  addHeader(doc, 8, totalPages);
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.teal);
  doc.text("SYSTEM PROMPT 01: WELLNESS RETENTION ENGINE", 20, 35);
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, 45, 180, 180, 3, 3, "F");
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.teal);
  doc.text("SYSTEM ROLE:", 22, 60);
  doc.setTextColor(...BRAND.white);
  const role1 = [
    "You are a wellness retention analyst.",
    "Your goal is reducing churn without increasing incentive cost.",
    "You prioritise behavioural nudges over discounts."
  ];
  yPos = 72;
  role1.forEach(line => {
    doc.text(line, 22, yPos);
    yPos += 10;
  });
  
  doc.setTextColor(...BRAND.teal);
  doc.text("OBJECTIVE:", 22, yPos + 8);
  doc.setTextColor(...BRAND.muted);
  doc.text("Reduce churn without increasing incentive spend.", 22, yPos + 20);
  
  doc.setTextColor(...BRAND.teal);
  doc.text("RULES:", 22, yPos + 38);
  doc.setTextColor(...BRAND.white);
  yPos += 50;
  const rules = [
    "1. Never lead with discounts",
    "2. Prefer behavioural nudges",
    "3. Escalate to humans only when confidence >70%",
    "4. Log intervention reason for audit trail"
  ];
  rules.forEach(rule => {
    doc.text(rule, 22, yPos);
    yPos += 10;
  });
  
  // Page 9 - System Prompt 2
  doc.addPage();
  addHeader(doc, 9, totalPages);
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.teal);
  doc.text("SYSTEM PROMPT 02: COACH PRIORITISATION ASSISTANT", 20, 35);
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, 45, 180, 180, 3, 3, "F");
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.teal);
  doc.text("SYSTEM ROLE:", 22, 60);
  doc.setTextColor(...BRAND.white);
  const role2 = [
    "You help coaches focus on members who need attention most.",
    "You surface urgency, not just activity.",
    "You never replace coach judgement, only inform it."
  ];
  yPos = 72;
  role2.forEach(line => {
    doc.text(line, 22, yPos);
    yPos += 10;
  });
  
  doc.setTextColor(...BRAND.teal);
  doc.text("SCORING MODEL:", 22, yPos + 8);
  doc.setTextColor(...BRAND.muted);
  doc.text("priority = (churn_risk × 0.4) + (goal_proximity × 0.3)", 22, yPos + 20);
  doc.text("         + (days_since_contact × 0.2) + (value_tier × 0.1)", 22, yPos + 30);
  
  doc.setTextColor(...BRAND.teal);
  doc.text("OUTPUT FORMAT:", 22, yPos + 48);
  doc.setTextColor(...BRAND.white);
  const output = [
    "Return top 10 members with:",
    "- member_id, priority_score, reason, suggested_action",
    "- Never show raw scores to coaches (confuses them)"
  ];
  yPos += 60;
  output.forEach(line => {
    doc.text(line, 22, yPos);
    yPos += 10;
  });
  
  // Page 10 - Data Schemas
  doc.addPage();
  addHeader(doc, 10, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("SECTION 5", 20, 35);
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("Wellness Data Schemas", 20, 52);
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.muted);
  doc.text("Execution-ready schemas bridge strategy and delivery.", 20, 72);
  doc.text("These can be handed directly to internal developers, external vendors, or data partners.", 20, 84);
  doc.text("This eliminates misinterpretation during build.", 20, 96);
  
  // Page 11 - Schema 1
  doc.addPage();
  addHeader(doc, 11, totalPages);
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.teal);
  doc.text("SCHEMA 01: USER ENGAGEMENT EVENTS", 20, 35);
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, 45, 180, 130, 3, 3, "F");
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.muted);
  const schema1 = [
    "{",
    '  "user_id": "uuid",',
    '  "event_type": "session_start | session_complete | habit_logged",',
    '  "event_timestamp": "ISO 8601",',
    '  "session_duration_seconds": "integer | null",',
    '  "habit_category": "fitness | nutrition | sleep | mindfulness",',
    '  "streak_count": "integer",',
    '  "device_type": "ios | android | web",',
    '  "location_type": "gym | home | outdoor | unknown"',
    "}"
  ];
  yPos = 60;
  schema1.forEach(line => {
    doc.text(line, 22, yPos);
    yPos += 12;
  });
  
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.teal);
  doc.text("Why this matters:", 20, 190);
  doc.setTextColor(...BRAND.white);
  doc.setFontSize(9);
  doc.text("• Consistent event taxonomy = reliable ML training", 20, 202);
  doc.text("• Device/location = personalisation opportunities", 20, 213);
  doc.text("• Streak tracking = retention prediction", 20, 224);
  
  // Page 12 - Schema 2
  doc.addPage();
  addHeader(doc, 12, totalPages);
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.teal);
  doc.text("SCHEMA 02: INTERVENTION TRACKING", 20, 35);
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, 45, 180, 145, 3, 3, "F");
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.muted);
  const schema2 = [
    "{",
    '  "intervention_id": "uuid",',
    '  "user_id": "uuid",',
    '  "trigger_type": "churn_risk | goal_proximity | inactivity",',
    '  "intervention_type": "push | email | coach_alert | in_app",',
    '  "content_variant": "string",',
    '  "sent_at": "ISO 8601",',
    '  "opened_at": "ISO 8601 | null",',
    '  "outcome": "converted | ignored | unsubscribed | unknown",',
    '  "confidence_score": "0.0 - 1.0",',
    '  "model_version": "string"',
    "}"
  ];
  yPos = 60;
  schema2.forEach(line => {
    doc.text(line, 22, yPos);
    yPos += 12;
  });
  
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.teal);
  doc.text("Why this matters:", 20, 205);
  doc.setTextColor(...BRAND.white);
  doc.setFontSize(9);
  doc.text("• Track what works, not just what was sent", 20, 217);
  doc.text("• Model versioning = reproducible experiments", 20, 228);
  doc.text("• Outcome tracking = intervention ROI", 20, 239);
  
  // CTA page
  addCTAPage(doc, totalPages, totalPages);
  
  return doc;
};

// ============================================================================
// PRODUCT 3: WELLNESS ENGAGEMENT SYSTEMS PLAYBOOK
// ============================================================================
export const generateEngagementPlaybook = (): jsPDF => {
  const doc = new jsPDF();
  const totalPages = 16;
  
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
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.muted);
  doc.text("GWI consistently frames sustainable wellbeing around habit formation,", 20, 145);
  doc.text("not content consumption. This playbook is built around that reality.", 20, 157);
  
  // Page 3 - Habit → Outcome Map
  doc.addPage();
  addHeader(doc, 3, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("SECTION 2", 20, 35);
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("Habit → Outcome Mapping Framework", 20, 52);
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.muted);
  doc.text("A practical map showing how user behaviours translate into commercial outcomes.", 20, 72);
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, 85, 180, 120, 3, 3, "F");
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.teal);
  doc.text("THE TRANSLATION CHAIN", 25, 100);
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.white);
  
  const chain = [
    { label: "BEHAVIOUR", items: "Frequency, Consistency, Drop-off" },
    { label: "", items: "↓" },
    { label: "HABIT SIGNALS", items: "Streaks, Return patterns, Adherence" },
    { label: "", items: "↓" },
    { label: "OUTCOMES", items: "Retention, Upsell, Partner value" }
  ];
  let yPos = 115;
  chain.forEach(row => {
    if (row.label) {
      doc.setTextColor(...BRAND.teal);
      doc.text(row.label, 25, yPos);
      doc.setTextColor(...BRAND.white);
      doc.text(row.items, 85, yPos);
    } else {
      doc.setFontSize(16);
      doc.setTextColor(...BRAND.teal);
      doc.text(row.items, 55, yPos);
      doc.setFontSize(11);
    }
    yPos += 18;
  });
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.teal);
  doc.text("This creates a shared language across product, ops, and commercial teams.", 20, 220);
  
  // Page 4 - Behaviour → Value Table
  doc.addPage();
  addHeader(doc, 4, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("BEHAVIOUR → VALUE TRANSLATION TABLE", 20, 35);
  
  const translations = [
    { behaviour: "Activity", metric: "Session frequency, class bookings", outcome: "Baseline engagement health" },
    { behaviour: "Consistency", metric: "Streak length, weekly active rate", outcome: "Retention prediction (+15-30%)" },
    { behaviour: "Recovery", metric: "Re-engagement after 7+ days", outcome: "Churn rescue opportunity" },
    { behaviour: "Drop-off", metric: "Missed sessions, broken streaks", outcome: "Early warning signals" }
  ];
  
  yPos = 55;
  translations.forEach(t => {
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(15, yPos, 180, 48, 3, 3, "F");
    doc.setFontSize(11);
    doc.setTextColor(...BRAND.teal);
    doc.text(t.behaviour.toUpperCase(), 22, yPos + 14);
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.muted);
    doc.text("Metric: " + t.metric, 22, yPos + 28);
    doc.setTextColor(...BRAND.white);
    doc.text("→ " + t.outcome, 22, yPos + 40);
    yPos += 55;
  });
  
  // Page 5 - Intervention Ladder Intro
  doc.addPage();
  addHeader(doc, 5, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("SECTION 3", 20, 35);
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("The Intervention Ladder", 20, 52);
  doc.setFontSize(16);
  doc.setTextColor(...BRAND.teal);
  doc.text("(Margin-Safe)", 20, 68);
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.muted);
  doc.text("A strict escalation model prevents over-incentivisation:", 20, 92);
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, 108, 180, 50, 3, 3, "F");
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.teal);
  doc.text("THE PROBLEM:", 25, 123);
  doc.setTextColor(...BRAND.white);
  doc.text("Most platforms skip straight to discounts.", 25, 138);
  doc.setTextColor(...BRAND.muted);
  doc.text("They burn margin on incentives before trying free options.", 25, 150);
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.white);
  doc.text("HCM regularly highlights how over-incentivisation damages margin without", 20, 175);
  doc.text("improving adherence — this ladder prevents that.", 20, 187);
  
  // Page 6 - The 6 Rungs
  doc.addPage();
  addHeader(doc, 6, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("THE 6-RUNG INTERVENTION LADDER", 20, 35);
  
  const rungs = [
    { num: "1", name: "Timing", desc: "Optimise send times to match peak engagement windows", cost: "£0" },
    { num: "2", name: "Relevance", desc: "Swap generic content for personalised alternatives", cost: "£0" },
    { num: "3", name: "Goal reframing", desc: "Adjust targets to feel achievable. Micro-wins over failures", cost: "£0" },
    { num: "4", name: "Social proof", desc: "Show peer activity, community momentum, shared goals", cost: "£0" },
    { num: "5", name: "Human support", desc: "Coach outreach, personal touch, direct contact", cost: "Low" },
    { num: "6", name: "Incentives", desc: "Rewards, discounts, prizes. LAST RESORT ONLY.", cost: "High" }
  ];
  
  yPos = 50;
  rungs.forEach((rung, i) => {
    const isLast = i === rungs.length - 1;
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(15, yPos, 180, 36, 3, 3, "F");
    doc.setFontSize(18);
    doc.setTextColor(...(isLast ? [255, 150, 100] as [number, number, number] : BRAND.teal));
    doc.text(rung.num, 25, yPos + 22);
    doc.setFontSize(11);
    doc.setTextColor(...BRAND.white);
    doc.text(rung.name, 45, yPos + 13);
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.muted);
    doc.text(rung.desc, 45, yPos + 24);
    doc.setTextColor(...(isLast ? [255, 150, 100] as [number, number, number] : BRAND.teal));
    doc.text("Cost: " + rung.cost, 45, yPos + 33);
    yPos += 40;
  });
  
  // Page 7 - Journey Logic Blueprints Intro
  doc.addPage();
  addHeader(doc, 7, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("SECTION 4", 20, 35);
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("Journey Logic Blueprints", 20, 52);
  doc.setFontSize(16);
  doc.setTextColor(...BRAND.teal);
  doc.text("(Executable)", 20, 68);
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.muted);
  doc.text("Copy-paste logic teams can implement immediately.", 20, 92);
  doc.text("This is system logic, not advice.", 20, 104);
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, 120, 180, 35, 3, 3, "F");
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.teal);
  doc.text("FORMAT:", 25, 135);
  doc.setTextColor(...BRAND.white);
  doc.text("IF [condition] AND [condition] THEN [action]", 25, 148);
  
  // Page 8 - Blueprint 1
  doc.addPage();
  addHeader(doc, 8, totalPages);
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.teal);
  doc.text("BLUEPRINT 01: MISSED SESSION RE-ENGAGEMENT", 20, 35);
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, 45, 180, 160, 3, 3, "F");
  doc.setFontSize(10);
  
  const blueprint1 = [
    { text: "IF user misses 2 sessions in 7 days", type: "condition" },
    { text: "AND habit_score < threshold", type: "condition" },
    { text: "AND last_intervention > 14 days ago", type: "condition" },
    { text: "THEN:", type: "then" },
    { text: "  1. Wait 24 hours (avoid seeming needy)", type: "action" },
    { text: "  2. Send personalised content based on preferences", type: "action" },
    { text: "  3. IF no response in 48 hours:", type: "action" },
    { text: "     → Try different channel (push → email → SMS)", type: "action" },
    { text: "  4. IF still no response:", type: "action" },
    { text: "     → Flag for coach review (do not discount)", type: "action" },
    { text: "", type: "spacer" },
    { text: "SUCCESS = session completed within 7 days", type: "success" },
    { text: "FAILURE = no session → escalate to Ladder Rung 3", type: "failure" }
  ];
  yPos = 60;
  blueprint1.forEach(line => {
    if (line.type === "condition" || line.type === "then") {
      doc.setTextColor(...BRAND.teal);
    } else if (line.type === "success") {
      doc.setTextColor(...BRAND.white);
    } else if (line.type === "failure") {
      doc.setTextColor(255, 150, 150);
    } else {
      doc.setTextColor(...BRAND.muted);
    }
    doc.text(line.text, 25, yPos);
    yPos += 11;
  });
  
  // Page 9 - Blueprint 2
  doc.addPage();
  addHeader(doc, 9, totalPages);
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.teal);
  doc.text("BLUEPRINT 02: UPSELL TIMING ENGINE", 20, 35);
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, 45, 180, 145, 3, 3, "F");
  
  const blueprint2 = [
    { text: "IF user completes 7-day streak", type: "condition" },
    { text: "AND engagement_trend = 'increasing'", type: "condition" },
    { text: "AND has NOT seen upsell in last 30 days", type: "condition" },
    { text: "THEN:", type: "then" },
    { text: "  1. Present relevant upgrade at session end", type: "action" },
    { text: "  2. Frame as 'you've earned this' not 'buy now'", type: "action" },
    { text: "  3. Use social proof from similar users", type: "action" },
    { text: "", type: "spacer" },
    { text: "TIMING RULE:", type: "rule" },
    { text: "  Present AFTER achievement, NEVER during session", type: "action" },
    { text: "", type: "spacer" },
    { text: "ANTI-PATTERN:", type: "warning" },
    { text: "  Showing upsell after missed sessions (kills trust)", type: "action" }
  ];
  yPos = 60;
  blueprint2.forEach(line => {
    if (line.type === "condition" || line.type === "then") {
      doc.setTextColor(...BRAND.teal);
    } else if (line.type === "rule") {
      doc.setTextColor(...BRAND.white);
    } else if (line.type === "warning") {
      doc.setTextColor(255, 150, 150);
    } else {
      doc.setTextColor(...BRAND.muted);
    }
    doc.text(line.text, 25, yPos);
    yPos += 11;
  });
  
  // Page 10 - Blueprint 3
  doc.addPage();
  addHeader(doc, 10, totalPages);
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.teal);
  doc.text("BLUEPRINT 03: CHURN RISK ESCALATION", 20, 35);
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, 45, 180, 175, 3, 3, "F");
  
  const blueprint3 = [
    { text: "IF days_since_last_session > 14", type: "condition" },
    { text: "AND churn_probability > 0.6", type: "condition" },
    { text: "AND member_tenure > 30 days", type: "condition" },
    { text: "THEN:", type: "then" },
    { text: "  1. Trigger Ladder Rung 1 (timing optimisation)", type: "action" },
    { text: "  2. Wait 3 days, measure response", type: "action" },
    { text: "  3. IF no response → Rung 2 (content swap)", type: "action" },
    { text: "  4. Wait 3 days, measure response", type: "action" },
    { text: "  5. IF no response → Rung 3 (social proof)", type: "action" },
    { text: "  6. IF still no response after 14 days:", type: "action" },
    { text: "     → Coach outreach (human touch)", type: "action" },
    { text: "", type: "spacer" },
    { text: "NEVER:", type: "warning" },
    { text: "  Jump to discounts without exhausting ladder", type: "action" },
    { text: "  The member who needs discounts to stay won't stay", type: "action" }
  ];
  yPos = 58;
  blueprint3.forEach(line => {
    if (line.type === "condition" || line.type === "then") {
      doc.setTextColor(...BRAND.teal);
    } else if (line.type === "warning") {
      doc.setTextColor(255, 150, 150);
    } else {
      doc.setTextColor(...BRAND.muted);
    }
    doc.text(line.text, 25, yPos);
    yPos += 11;
  });
  
  // CTA page
  addCTAPage(doc, totalPages, totalPages);
  
  return doc;
};

// ============================================================================
// PRODUCT 4: 90-DAY AI ACTIVATION PLAYBOOK – EXECUTION EDITION
// ============================================================================
export const generateActivationPlaybook = (): jsPDF => {
  const doc = new jsPDF();
  const totalPages = 16;
  
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
  
  // Page 3 - Weekly Sprint Structure
  doc.addPage();
  addHeader(doc, 3, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("SECTION 2", 20, 35);
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("Weekly Sprint Structure", 20, 52);
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.muted);
  doc.text("Each week includes:", 20, 75);
  
  const sprintItems = [
    { label: "Objective", desc: "What we're trying to achieve this week" },
    { label: "Required inputs", desc: "Data and resources needed" },
    { label: "Success signal", desc: "How we know it worked" },
    { label: "Stop criteria", desc: "When to halt and reassess" }
  ];
  
  yPos = 95;
  sprintItems.forEach(item => {
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(15, yPos - 5, 180, 28, 3, 3, "F");
    doc.setFontSize(11);
    doc.setTextColor(...BRAND.teal);
    doc.text("• " + item.label, 22, yPos + 6);
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.muted);
    doc.text(item.desc, 25, yPos + 17);
    yPos += 34;
  });
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.teal);
  doc.text("This ensures momentum without runaway scope.", 20, yPos + 10);
  
  // Page 4 - Month 1
  doc.addPage();
  addHeader(doc, 4, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("MONTH 1", 20, 35);
  doc.setFontSize(28);
  doc.setTextColor(...BRAND.white);
  doc.text("Foundations", 20, 55);
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, 70, 180, 45, 3, 3, "F");
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.muted);
  doc.text("No AI yet. This matters.", 25, 85);
  doc.text("Before you can use AI effectively, you need to understand", 25, 97);
  doc.text("what you actually have.", 25, 109);
  
  const month1Tasks = [
    "Define core engagement events",
    "Clean and document data",
    "Clarify consent and data governance",
    "Map current decision-making processes",
    "Identify critical data gaps"
  ];
  
  yPos = 130;
  month1Tasks.forEach(task => {
    doc.setDrawColor(...BRAND.teal);
    doc.rect(20, yPos - 3, 4, 4);
    doc.setFontSize(11);
    doc.setTextColor(...BRAND.white);
    doc.text(task, 30, yPos);
    yPos += 14;
  });
  
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.teal);
  doc.text("SUCCESS CRITERIA: Can you explain your data estate to a new hire in 10 minutes?", 20, 220);
  
  // Page 5 - Month 2
  doc.addPage();
  addHeader(doc, 5, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("MONTH 2", 20, 35);
  doc.setFontSize(28);
  doc.setTextColor(...BRAND.white);
  doc.text("Journeys", 20, 55);
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, 70, 180, 45, 3, 3, "F");
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.muted);
  doc.text("Now you understand your data, map how users actually", 25, 85);
  doc.text("move through your product or service.", 25, 97);
  
  const month2Tasks = [
    "Design onboarding and reactivation flows",
    "Introduce meaningful segmentation",
    "Test one hypothesis at a time",
    "Measure what matters, not everything",
    "Document learnings systematically"
  ];
  
  yPos = 130;
  month2Tasks.forEach(task => {
    doc.setDrawColor(...BRAND.teal);
    doc.rect(20, yPos - 3, 4, 4);
    doc.setFontSize(11);
    doc.setTextColor(...BRAND.white);
    doc.text(task, 30, yPos);
    yPos += 14;
  });
  
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.teal);
  doc.text("SUCCESS CRITERIA: Can you show which journey changes moved which metrics?", 20, 220);
  
  // Page 6 - Month 3
  doc.addPage();
  addHeader(doc, 6, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("MONTH 3", 20, 35);
  doc.setFontSize(28);
  doc.setTextColor(...BRAND.white);
  doc.text("Monetisation", 20, 55);
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, 70, 180, 45, 3, 3, "F");
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.muted);
  doc.text("Connect engagement to outcomes.", 25, 85);
  doc.text("If you can't link behaviour to revenue or retention, you're guessing.", 25, 97);
  
  const month3Tasks = [
    "Link engagement to commercial outcomes",
    "Test one revenue lever",
    "Measure impact conservatively",
    "Build the business case for AI",
    "Plan next quarter's priorities"
  ];
  
  yPos = 130;
  month3Tasks.forEach(task => {
    doc.setDrawColor(...BRAND.teal);
    doc.rect(20, yPos - 3, 4, 4);
    doc.setFontSize(11);
    doc.setTextColor(...BRAND.white);
    doc.text(task, 30, yPos);
    yPos += 14;
  });
  
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.teal);
  doc.text("SUCCESS CRITERIA: Can you present an ROI case to your board?", 20, 220);
  
  // Page 7 - Board-Safe KPIs
  doc.addPage();
  addHeader(doc, 7, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("SECTION 3", 20, 35);
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("Board-Safe KPIs", 20, 52);
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.muted);
  doc.text("Metrics framed for senior scrutiny. No vanity metrics. Ever.", 20, 72);
  
  const kpis = [
    { metric: "Retention delta", desc: "Change in retention rate attributable to intervention" },
    { metric: "Decision latency", desc: "Time from signal to action (should decrease)" },
    { metric: "Trust exposure", desc: "Risk surface created by AI decisions" },
    { metric: "Cost per outcome", desc: "What did we spend to achieve the result?" },
    { metric: "Confidence accuracy", desc: "When AI said 70% confident, was it right 70% of time?" }
  ];
  
  yPos = 95;
  kpis.forEach(kpi => {
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(15, yPos - 5, 180, 30, 3, 3, "F");
    doc.setFontSize(11);
    doc.setTextColor(...BRAND.teal);
    doc.text(kpi.metric, 22, yPos + 6);
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.muted);
    doc.text(kpi.desc, 22, yPos + 18);
    yPos += 36;
  });
  
  // Page 8 - Red-Flag Register
  doc.addPage();
  addHeader(doc, 8, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("SECTION 4", 20, 35);
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("Red-Flag Register", 20, 52);
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.muted);
  doc.text("A persistent list of failure patterns. These risks are surfaced repeatedly to prevent drift.", 20, 72);
  
  const redFlags = [
    { flag: "AI before decisions", desc: "Implementing AI before clarifying what decisions need support" },
    { flag: "Weak consent models", desc: "Collecting data without clear, specific consent" },
    { flag: "Scaling before trust", desc: "Rolling out widely before validating in controlled tests" },
    { flag: "Vanity over value", desc: "Measuring engagement without commercial attribution" },
    { flag: "Speed over governance", desc: "Moving fast without documenting decisions and risks" }
  ];
  
  yPos = 95;
  redFlags.forEach(rf => {
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(15, yPos - 5, 180, 32, 3, 3, "F");
    doc.setFontSize(11);
    doc.setTextColor(255, 150, 150);
    doc.text("⚠ " + rf.flag, 22, yPos + 8);
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.muted);
    doc.text(rf.desc, 22, yPos + 20);
    yPos += 38;
  });
  
  // Page 9 - Success Criteria Summary
  doc.addPage();
  addHeader(doc, 9, totalPages);
  doc.setFontSize(20);
  doc.setTextColor(...BRAND.white);
  doc.text("Success at 90 Days", 105, 60, { align: "center" });
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(25, 80, 160, 60, 3, 3, "F");
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.muted);
  doc.text('Not "we launched AI"', 105, 100, { align: "center" });
  doc.setFontSize(16);
  doc.setTextColor(...BRAND.teal);
  doc.text('But "we made better decisions faster"', 105, 125, { align: "center" });
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.white);
  doc.text("This playbook reflects GWI guidance on measured, ethical digital", 105, 165, { align: "center" });
  doc.text("adoption in wellbeing contexts.", 105, 177, { align: "center" });
  
  // CTA page
  addCTAPage(doc, totalPages, totalPages);
  
  return doc;
};

// Legacy exports for compatibility
export const generateRevenueFramework = generateEngagementPlaybook;
export const generateBuildVsBuy = generateActivationPlaybook;

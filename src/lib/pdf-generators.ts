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
  doc.text("wellnessgenius.co.uk", 20, 290);
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
  doc.text("wellnessgenius.co.uk/ai-readiness", 105, 180, { align: "center" });
  
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
      doc.text("wellnessgenius.co.uk/ai-readiness", 105, 170, { align: "center" });
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
  doc.text("Take the AI Readiness Score at wellnessgenius.co.uk/ai-readiness", 105, 275, { align: "center" });

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
  doc.text("Wellness Genius • wellnessgenius.co.uk", 105, 200, { align: "center" });
  
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
// PRODUCT 2: WELLNESS GENIUS – AI PROMPT PACK
// ============================================================================
export const generatePromptPack = (): jsPDF => {
  const doc = new jsPDF();
  const totalPages = 14;
  
  // Page 1 - Cover
  addHeader(doc, 1, totalPages);
  doc.setFontSize(28);
  doc.setTextColor(...BRAND.white);
  doc.text("Wellness Genius", 105, 70, { align: "center" });
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.teal);
  doc.text("AI Prompt Pack", 105, 92, { align: "center" });
  doc.setFontSize(16);
  doc.setTextColor(...BRAND.white);
  doc.text("From AI Curiosity to AI That Actually Delivers", 105, 125, { align: "center" });
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.muted);
  doc.text("Designed to work with the Wellness Genius platform,", 105, 150, { align: "center" });
  doc.text("including the AI Readiness Score and industry intelligence.", 105, 162, { align: "center" });
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.teal);
  doc.text("It is not theoretical. It is built for operators who need results.", 105, 185, { align: "center" });
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.muted);
  doc.text("Wellness Genius • wellnessgenius.co.uk", 105, 220, { align: "center" });

  // Page 2 - Core System Prompt
  doc.addPage();
  addHeader(doc, 2, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("PROMPT 1: CORE SYSTEM", 20, 35);
  doc.setFontSize(20);
  doc.setTextColor(...BRAND.white);
  doc.text("The Operating System of Wellness Genius AI", 20, 52);
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, 68, 180, 180, 3, 3, "F");
  
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.teal);
  doc.text("PROMPT:", 22, 83);
  doc.setTextColor(...BRAND.white);
  doc.text("You are a Wellness Genius AI advisor.", 22, 95);
  
  doc.setTextColor(...BRAND.muted);
  const coreDesc = doc.splitTextToSize("You support founders, operators, and commercial leaders across fitness, wellness, hospitality, insurance, rewards, and consumer engagement platforms.", 165);
  doc.text(coreDesc, 22, 108);
  
  doc.setTextColor(...BRAND.teal);
  doc.text("You reference:", 22, 130);
  doc.setTextColor(...BRAND.white);
  doc.text("- The user's Wellness Genius AI Readiness Score", 30, 142);
  doc.text("- Industry benchmarks from the Wellness Genius intelligence layer", 30, 152);
  doc.text("- Proven engagement and monetisation models", 30, 162);
  
  doc.setTextColor(...BRAND.teal);
  doc.text("You prioritise:", 22, 178);
  doc.setTextColor(...BRAND.white);
  doc.text("- Behaviour change", 30, 190);
  doc.text("- Engagement frequency", 30, 200);
  doc.text("- Retention", 30, 210);
  doc.text("- Monetisation", 30, 220);
  
  doc.setFillColor(...BRAND.teal);
  doc.roundedRect(15, 252, 180, 20, 2, 2, "F");
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.darkBg);
  doc.text("Tone: direct, commercially aware, encouraging, sceptical of hype.", 22, 264);

  // Page 3 - AI Readiness Score Deep Dive
  doc.addPage();
  addHeader(doc, 3, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("PROMPT 2: AI READINESS SCORE", 20, 35);
  doc.setFontSize(20);
  doc.setTextColor(...BRAND.white);
  doc.text("AI Readiness Score Deep Dive", 20, 52);
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.teal);
  doc.text("Turning a score into a strategy", 20, 65);
  
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.muted);
  doc.text("This prompt extends the Wellness Genius AI Readiness Score.", 20, 82);
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, 92, 180, 160, 3, 3, "F");
  
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.teal);
  doc.text("PROMPT:", 22, 107);
  doc.setTextColor(...BRAND.white);
  const readinessPrompt = doc.splitTextToSize("Using the user's Wellness Genius AI Readiness Score, break down performance across:", 165);
  doc.text(readinessPrompt, 22, 118);
  
  doc.setTextColor(...BRAND.muted);
  doc.text("- Data readiness", 30, 133);
  doc.text("- Engagement maturity", 30, 143);
  doc.text("- Integration capability", 30, 153);
  doc.text("- Monetisation readiness", 30, 163);
  doc.text("• Governance, privacy, and trust", 30, 173);
  
  doc.setTextColor(...BRAND.teal);
  doc.text("For each dimension:", 22, 188);
  doc.setTextColor(...BRAND.white);
  doc.text("→ Explain what this score means in practical terms", 30, 200);
  doc.text("→ Highlight commercial risks if it stays at this level", 30, 210);
  doc.text("→ Recommend one Wellness Genius tool to improve it", 30, 220);
  
  doc.setTextColor(...BRAND.teal);
  doc.text("End with:", 22, 235);
  doc.setTextColor(...BRAND.white);
  doc.text('"Biggest risk if nothing changes"', 30, 245);

  // Page 4 - Engagement & Behaviour Engine
  doc.addPage();
  addHeader(doc, 4, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("PROMPT 3: ENGAGEMENT ENGINE", 20, 35);
  doc.setFontSize(20);
  doc.setTextColor(...BRAND.white);
  doc.text("Engagement & Behaviour Engine", 20, 52);
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.teal);
  doc.text("Mapped to Wellness Genius capabilities", 20, 65);
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, 78, 180, 175, 3, 3, "F");
  
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.teal);
  doc.text("PROMPT:", 22, 93);
  doc.setTextColor(...BRAND.white);
  doc.text("Design an engagement engine using:", 22, 105);
  doc.setTextColor(...BRAND.muted);
  doc.text("- Activity and behaviour signals", 30, 117);
  doc.text("- Rewards or incentives", 30, 127);
  doc.text("- Nudges and challenges", 30, 137);
  
  doc.setTextColor(...BRAND.teal);
  doc.text("Align the engine to the user's AI Readiness Score band:", 22, 152);
  doc.setTextColor(...BRAND.white);
  doc.text("Low readiness: simple, low-risk engagement loops", 30, 164);
  doc.text("Mid readiness: personalised challenges and incentives", 30, 174);
  doc.text("High readiness: predictive nudging and adaptive rewards", 30, 184);
  
  doc.setTextColor(...BRAND.teal);
  doc.text("Reference relevant Wellness Genius tools:", 22, 199);
  doc.setTextColor(...BRAND.muted);
  doc.text("- Activity tracking SDKs", 30, 211);
  doc.text("- Rewards and incentives logic", 30, 221);
  doc.text("- Engagement analytics", 30, 231);
  
  doc.setFillColor(...BRAND.teal);
  doc.roundedRect(15, 257, 180, 20, 2, 2, "F");
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.darkBg);
  doc.text("This prevents teams overbuilding before they're ready.", 22, 269);

  // Page 5 - Personalisation & Trust
  doc.addPage();
  addHeader(doc, 5, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("PROMPT 4: PERSONALISATION & TRUST", 20, 35);
  doc.setFontSize(20);
  doc.setTextColor(...BRAND.white);
  doc.text("Personalisation & Trust", 20, 52);
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.teal);
  doc.text("Built for GDPR reality, not AI theatre", 20, 65);
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, 78, 180, 175, 3, 3, "F");
  
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.teal);
  doc.text("PROMPT:", 22, 93);
  doc.setTextColor(...BRAND.white);
  doc.text("Create a personalisation strategy based on:", 22, 105);
  doc.setTextColor(...BRAND.muted);
  doc.text("- Behavioural data", 30, 117);
  doc.text("- Usage patterns", 30, 127);
  doc.text("- Engagement frequency", 30, 137);
  
  doc.setTextColor(...BRAND.teal);
  doc.text("Explicitly avoid:", 22, 152);
  doc.setTextColor(255, 150, 150);
  doc.text("X  Medical diagnosis", 30, 164);
  doc.text("X  Sensitive health inference", 30, 174);
  doc.text("X  Opaque decision-making", 30, 184);
  
  doc.setTextColor(...BRAND.white);
  const trustNote = doc.splitTextToSize("Reference how Wellness Genius transparency and data governance principles should be communicated to users in plain English.", 165);
  doc.text(trustNote, 22, 199);
  
  doc.setTextColor(...BRAND.teal);
  doc.text("Flag: trust risks • regulatory risks • reputational risks", 22, 222);
  
  doc.setFillColor(...BRAND.teal);
  doc.roundedRect(15, 257, 180, 20, 2, 2, "F");
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.darkBg);
  doc.text("Critical for enterprise, hospitality, and insurance partners.", 22, 269);

  // Page 6 - Monetisation Prompt
  doc.addPage();
  addHeader(doc, 6, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("PROMPT 5: MONETISATION", 20, 35);
  doc.setFontSize(20);
  doc.setTextColor(...BRAND.white);
  doc.text("Monetisation Prompt", 20, 52);
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.teal);
  doc.text("Connected to real Wellness Genius revenue paths", 20, 65);
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, 78, 180, 175, 3, 3, "F");
  
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.teal);
  doc.text("PROMPT:", 22, 93);
  doc.setTextColor(...BRAND.white);
  const monetPrompt = doc.splitTextToSize("Based on the organisation's AI Readiness Score, recommend:", 165);
  doc.text(monetPrompt, 22, 105);
  
  doc.setTextColor(...BRAND.muted);
  doc.text("- One monetisation model they are ready for today", 30, 120);
  doc.text("- One model they should prepare for", 30, 132);
  doc.text("- One model they should avoid for now", 30, 144);
  
  doc.setTextColor(...BRAND.teal);
  doc.text("Use Wellness Genius-supported approaches:", 22, 162);
  doc.setTextColor(...BRAND.white);
  doc.text("→ B2B licensing", 30, 174);
  doc.text("→ rewards and merchant-funded incentives", 30, 186);
  doc.text("→ premium insight or engagement layers", 30, 198);
  
  doc.setTextColor(...BRAND.teal);
  doc.text("Define:", 22, 216);
  doc.setTextColor(...BRAND.muted);
  doc.text("- Who pays", 30, 228);
  doc.text("- Why they pay", 30, 238);
  doc.text("- The KPI that proves ROI", 30, 248);
  
  doc.setFillColor(80, 40, 40);
  doc.roundedRect(15, 257, 180, 20, 2, 2, "F");
  doc.setFontSize(9);
  doc.setTextColor(255, 150, 150);
  doc.text('Kill any model that relies on "we\'ll monetise later".', 22, 269);

  // Page 7 - Operator Co-Pilot
  doc.addPage();
  addHeader(doc, 7, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("PROMPT 6: OPERATOR CO-PILOT", 20, 35);
  doc.setFontSize(20);
  doc.setTextColor(...BRAND.white);
  doc.text("Operator Co-Pilot", 20, 52);
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.teal);
  doc.text("The human + AI layer Wellness Genius is built for", 20, 65);
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, 78, 180, 175, 3, 3, "F");
  
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.teal);
  doc.text("PROMPT:", 22, 93);
  doc.setTextColor(...BRAND.white);
  const coPrompt = doc.splitTextToSize("Act as an AI co-pilot for a wellness operator using the Wellness Genius platform.", 165);
  doc.text(coPrompt, 22, 105);
  
  doc.setTextColor(...BRAND.teal);
  doc.text("DAILY:", 22, 125);
  doc.setTextColor(...BRAND.muted);
  doc.text("- Reference engagement and readiness indicators", 30, 137);
  doc.text("- Suggest one practical action", 30, 149);
  
  doc.setTextColor(...BRAND.teal);
  doc.text("WEEKLY:", 22, 167);
  doc.setTextColor(...BRAND.muted);
  doc.text("- Summarise trends using Wellness Genius analytics", 30, 179);
  doc.text("- Recommend one experiment", 30, 191);
  
  doc.setTextColor(...BRAND.teal);
  doc.text("MONTHLY:", 22, 209);
  doc.setTextColor(...BRAND.muted);
  doc.text("- Explain how AI readiness has shifted", 30, 221);
  doc.text("- Highlight commercial impact", 30, 233);
  
  doc.setFillColor(...BRAND.teal);
  doc.roundedRect(15, 257, 180, 20, 2, 2, "F");
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.darkBg);
  doc.text("Always connect actions back to the AI Readiness Score.", 22, 269);

  // Page 8 - Investor & Board Translation
  doc.addPage();
  addHeader(doc, 8, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("PROMPT 7: INVESTOR TRANSLATION", 20, 35);
  doc.setFontSize(20);
  doc.setTextColor(...BRAND.white);
  doc.text("Investor & Board Translation", 20, 52);
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.teal);
  doc.text("Wellness Genius, explained without the woo", 20, 65);
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, 78, 180, 140, 3, 3, "F");
  
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.teal);
  doc.text("PROMPT:", 22, 93);
  doc.setTextColor(...BRAND.white);
  doc.text("Explain the organisation's AI position using:", 22, 105);
  doc.setTextColor(...BRAND.muted);
  doc.text("- The Wellness Genius AI Readiness Score", 30, 117);
  doc.text("- Engagement data", 30, 129);
  doc.text("- Monetisation readiness", 30, 141);
  
  doc.setTextColor(...BRAND.teal);
  doc.text("Translate this into:", 22, 159);
  doc.setTextColor(...BRAND.white);
  doc.text("→ growth narrative", 30, 171);
  doc.text("→ defensibility", 30, 183);
  doc.text("→ capital efficiency", 30, 195);
  
  doc.setTextColor(...BRAND.muted);
  const investorNote = doc.splitTextToSize("Avoid technical jargon unless it supports valuation, scalability, or risk mitigation.", 165);
  doc.text(investorNote, 22, 210);
  
  doc.setFillColor(...BRAND.teal);
  doc.roundedRect(15, 230, 180, 20, 2, 2, "F");
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.darkBg);
  doc.text("Built for decks, not demos.", 22, 242);

  // Page 9 - Red-Flag Prompt
  doc.addPage();
  addHeader(doc, 9, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("PROMPT 8: RED-FLAG REGISTER", 20, 35);
  doc.setFontSize(20);
  doc.setTextColor(...BRAND.white);
  doc.text("Red-Flag Prompt", 20, 52);
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.teal);
  doc.text("What Wellness Genius actively warns against", 20, 65);
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, 78, 180, 100, 3, 3, "F");
  
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.teal);
  doc.text("PROMPT:", 22, 93);
  doc.setTextColor(...BRAND.white);
  doc.text("Based on the AI Readiness Score, list:", 22, 105);
  doc.setTextColor(255, 150, 150);
  doc.text("- Features that are premature", 30, 120);
  doc.text("- Tools that will add complexity without ROI", 30, 132);
  doc.text("- Common wellness AI traps", 30, 144);
  
  doc.setTextColor(...BRAND.white);
  const redFlagNote = doc.splitTextToSize("Recommend simpler Wellness Genius-supported alternatives instead.", 165);
  doc.text(redFlagNote, 22, 162);
  
  doc.setFillColor(...BRAND.teal);
  doc.roundedRect(15, 190, 180, 20, 2, 2, "F");
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.darkBg);
  doc.text("This is where trust is earned.", 22, 202);

  // Page 10 - Strategic Positioning
  doc.addPage();
  addHeader(doc, 10, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("STRATEGIC POSITIONING", 20, 35);
  doc.setFontSize(20);
  doc.setTextColor(...BRAND.white);
  doc.text("How This Positions Wellness Genius", 20, 52);
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.muted);
  doc.text("Wellness Genius becomes:", 20, 75);
  
  const positions = [
    { layer: "Diagnostic Layer", desc: "AI Readiness Score" },
    { layer: "Intelligence Layer", desc: "Industry insight + benchmarks" },
    { layer: "Activation Layer", desc: "SDKs, engagement, rewards" },
    { layer: "Decision Layer", desc: "AI co-pilot + prompts" }
  ];
  
  let yPos = 92;
  positions.forEach(pos => {
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(15, yPos, 180, 32, 3, 3, "F");
    doc.setFontSize(12);
    doc.setTextColor(...BRAND.teal);
    doc.text(pos.layer, 25, yPos + 14);
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.white);
    doc.text(pos.desc, 25, yPos + 26);
    yPos += 38;
  });
  
  doc.setFillColor(...BRAND.teal);
  doc.roundedRect(15, yPos + 10, 180, 30, 3, 3, "F");
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.darkBg);
  doc.text('Not "another AI tool".', 25, yPos + 22);
  doc.text("A control panel for wellness AI maturity.", 25, yPos + 34);

  // Page 11 - The Truth
  doc.addPage();
  addHeader(doc, 11, totalPages);
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("Straight Truth", 105, 80, { align: "center" });
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(25, 100, 160, 80, 5, 5, "F");
  
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.white);
  doc.text("Most companies don't need more AI.", 105, 130, { align: "center" });
  doc.setFontSize(16);
  doc.setTextColor(...BRAND.teal);
  doc.text("They need clarity, sequencing,", 105, 155, { align: "center" });
  doc.text("and restraint.", 105, 172, { align: "center" });
  
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.muted);
  doc.text("This Prompt Pack makes Wellness Genius", 105, 210, { align: "center" });
  doc.text("the place where that happens.", 105, 225, { align: "center" });

  // What Next page
  addWhatNextSection(doc, 12, totalPages);
  
  // CTA page
  addCTAPage(doc, 13, totalPages);
  
  // Page 14 - Back Cover
  doc.addPage();
  addHeader(doc, 14, totalPages);
  doc.setFontSize(20);
  doc.setTextColor(...BRAND.teal);
  doc.text("Wellness Genius", 105, 100, { align: "center" });
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.white);
  doc.text("AI Prompt Pack", 105, 120, { align: "center" });
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.muted);
  doc.text("From AI Curiosity to AI That Actually Delivers", 105, 145, { align: "center" });
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.teal);
  doc.text("wellnessgenius.co.uk", 105, 180, { align: "center" });
  
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
  doc.text("Wellness Genius • wellnessgenius.co.uk", 105, 200, { align: "center" });
  
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
  doc.text("Wellness Genius • wellnessgenius.co.uk", 105, 200, { align: "center" });
  
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

// ============================================================================
// PRODUCT: GAMIFICATION, REWARDS & INCENTIVES PLAYBOOK
// ============================================================================
export const generateGamificationPlaybook = (): jsPDF => {
  const doc = new jsPDF();
  const totalPages = 22;
  
  // Page 1 - Cover
  addHeader(doc, 1, totalPages);
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("Wellness Genius", 105, 60, { align: "center" });
  doc.setFontSize(28);
  doc.text("Operator Playbook", 105, 85, { align: "center" });
  doc.setFontSize(18);
  doc.setTextColor(...BRAND.teal);
  doc.text("Gamification, Rewards, Incentives", 105, 110, { align: "center" });
  doc.text("& Hyper-Personalisation", 105, 125, { align: "center" });
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.muted);
  doc.text("With Data and AI Operating System", 105, 150, { align: "center" });
  doc.setFontSize(10);
  doc.text("wellnessgenius.co.uk", 105, 200, { align: "center" });

  // Page 2 - Who This Is For
  doc.addPage();
  addHeader(doc, 2, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("WHO THIS IS FOR", 20, 35);
  doc.setFontSize(20);
  doc.setTextColor(...BRAND.white);
  doc.text("Target Operators", 20, 52);
  
  const audiences = [
    "Gym and studio operators",
    "Wellness apps and platforms",
    "Hospitality wellness operators (hotels, spas)",
    "Corporate wellbeing providers",
    "Any operator driving repeat behaviour without destroying margin"
  ];
  
  let yPos = 75;
  audiences.forEach(audience => {
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(15, yPos - 5, 180, 18, 2, 2, "F");
    doc.setFontSize(11);
    doc.setTextColor(...BRAND.white);
    doc.text("→ " + audience, 25, yPos + 6);
    yPos += 24;
  });
  
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("WHAT SUCCESS LOOKS LIKE", 20, yPos + 15);
  
  const successMetrics = [
    "Behaviour changes you can measure (not vanity engagement)",
    "Increased retention/monetisation with controlled reward cost",
    "Personalisation that improves relevance without crossing privacy lines",
    "A test-and-learn system that prevents 'random acts of gamification'"
  ];
  
  yPos += 35;
  successMetrics.forEach(metric => {
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.muted);
    doc.text("✓ " + metric, 25, yPos);
    yPos += 12;
  });

  // Page 3 - Section 1: Evidence-Led Principles
  doc.addPage();
  addHeader(doc, 3, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("SECTION 1", 20, 35);
  doc.setFontSize(22);
  doc.setTextColor(...BRAND.white);
  doc.text("Evidence-Led Principles", 20, 52);
  
  const principles = [
    {
      title: "1. Gamification can improve physical activity, but design matters",
      evidence: "Systematic reviews find gamified interventions promising for physical activity, with some effects persisting beyond novelty.",
      translation: "Make it an operating loop, not a campaign. Prioritise simplicity and repeatability."
    },
    {
      title: "2. Incentives work short-term; long-term sustainability is less certain",
      evidence: "Reviews of financial incentives show short-term increases, but fewer studies examine long-term persistence.",
      translation: "Use incentives as a 'starter motor', not the engine. Build tapering from day one."
    }
  ];
  
  yPos = 70;
  principles.forEach(p => {
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(15, yPos - 5, 180, 55, 3, 3, "F");
    doc.setFontSize(11);
    doc.setTextColor(...BRAND.teal);
    const titleLines = doc.splitTextToSize(p.title, 165);
    doc.text(titleLines, 22, yPos + 5);
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.muted);
    const evidenceLines = doc.splitTextToSize("Evidence: " + p.evidence, 165);
    doc.text(evidenceLines, 22, yPos + 20);
    doc.setTextColor(...BRAND.white);
    const translationLines = doc.splitTextToSize("Operator Translation: " + p.translation, 165);
    doc.text(translationLines, 22, yPos + 38);
    yPos += 65;
  });

  // Page 4 - More Principles
  doc.addPage();
  addHeader(doc, 4, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("SECTION 1 (CONTINUED)", 20, 35);
  
  const morePrinciples = [
    {
      title: "3. Loss aversion can improve incentive design",
      evidence: "Behavioural economics shows people are more motivated by avoiding losses than acquiring gains.",
      translation: "Consider 'earn-to-keep' mechanics. Never use punitive framing that creates harm."
    },
    {
      title: "4. Hyper-personalisation lifts performance, but only with trust",
      evidence: "Commercial research reports personalisation can drive revenue lift and improve marketing ROI.",
      translation: "Start with simple segmentation. Avoid 'creepy personalisation' that triggers backlash."
    },
    {
      title: "5. UK GDPR guardrail: beware solely automated decisions",
      evidence: "ICO guidance explains restrictions on automated decision-making with significant effects.",
      translation: "Do not use AI to automatically deny benefits without safeguards. Provide human review paths."
    }
  ];
  
  yPos = 55;
  morePrinciples.forEach(p => {
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(15, yPos - 5, 180, 55, 3, 3, "F");
    doc.setFontSize(11);
    doc.setTextColor(...BRAND.teal);
    const titleLines = doc.splitTextToSize(p.title, 165);
    doc.text(titleLines, 22, yPos + 5);
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.muted);
    const evidenceLines = doc.splitTextToSize("Evidence: " + p.evidence, 165);
    doc.text(evidenceLines, 22, yPos + 18);
    doc.setTextColor(...BRAND.white);
    const translationLines = doc.splitTextToSize("Operator Translation: " + p.translation, 165);
    doc.text(translationLines, 22, yPos + 35);
    yPos += 62;
  });

  // Page 5 - Section 2: The Operator Model
  doc.addPage();
  addHeader(doc, 5, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("SECTION 2", 20, 35);
  doc.setFontSize(22);
  doc.setTextColor(...BRAND.white);
  doc.text("The Operator Model", 20, 52);
  doc.setFontSize(12);
  doc.text("6-Layer System for Gamification + Incentives + Personalisation", 20, 68);
  
  const layers = [
    { num: "1", name: "Target Behaviour", desc: "What specific action are you trying to drive?" },
    { num: "2", name: "Measurable Signal", desc: "How will you know when it happens?" },
    { num: "3", name: "Trigger Rules", desc: "What fires the intervention?" },
    { num: "4", name: "Intervention Ladder", desc: "Nudge → Content → Social → Human → Incentive" },
    { num: "5", name: "Reward Economics", desc: "Cost, caps, funding, breakage" },
    { num: "6", name: "Governance", desc: "Consent, fairness, auditability" }
  ];
  
  yPos = 85;
  layers.forEach(layer => {
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(15, yPos - 5, 180, 25, 2, 2, "F");
    doc.setFontSize(16);
    doc.setTextColor(...BRAND.teal);
    doc.text(layer.num, 25, yPos + 10);
    doc.setFontSize(11);
    doc.setTextColor(...BRAND.white);
    doc.text(layer.name, 45, yPos + 6);
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.muted);
    doc.text(layer.desc, 45, yPos + 16);
    yPos += 30;
  });
  
  doc.setFillColor(...BRAND.teal);
  doc.roundedRect(15, yPos + 5, 180, 20, 3, 3, "F");
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.darkBg);
  doc.text("If you can't complete all six layers, you're not ready to launch.", 105, yPos + 17, { align: "center" });

  // Page 6 - Section 3: The Intervention Ladder
  doc.addPage();
  addHeader(doc, 6, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("SECTION 3", 20, 35);
  doc.setFontSize(22);
  doc.setTextColor(...BRAND.white);
  doc.text("The Intervention Ladder", 20, 52);
  doc.setFontSize(12);
  doc.text("How to avoid burning margin with incentives", 20, 68);
  
  const ladderRungs = [
    { num: "1", name: "Timing Optimisation", desc: "When you message, not more messages" },
    { num: "2", name: "Relevance", desc: "Content or prompt that fits the user" },
    { num: "3", name: "Goal Reframing", desc: "Smaller next action" },
    { num: "4", name: "Social Proof / Community", desc: "If appropriate for your context" },
    { num: "5", name: "Human Touch", desc: "Coach / staff intervention" },
    { num: "6", name: "Incentive", desc: "Only when confidence is high and cost is capped" }
  ];
  
  yPos = 85;
  ladderRungs.forEach(rung => {
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(15, yPos - 5, 180, 25, 2, 2, "F");
    doc.setFontSize(14);
    doc.setTextColor(...BRAND.teal);
    doc.text(rung.num, 25, yPos + 10);
    doc.setFontSize(11);
    doc.setTextColor(...BRAND.white);
    doc.text(rung.name, 45, yPos + 6);
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.muted);
    doc.text(rung.desc, 45, yPos + 16);
    yPos += 30;
  });
  
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.muted);
  doc.text("Why this ladder exists: incentives can lift behaviour short-term,", 20, yPos + 10);
  doc.text("but overuse risks dependence and cost spiral.", 20, yPos + 20);

  // Page 7 - Section 4: Reward Economics
  doc.addPage();
  addHeader(doc, 7, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("SECTION 4", 20, 35);
  doc.setFontSize(22);
  doc.setTextColor(...BRAND.white);
  doc.text("Reward Economics", 20, 52);
  doc.setFontSize(12);
  doc.text("Funding sources and margin controls", 20, 68);
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.teal);
  doc.text("ACCEPTABLE FUNDING SOURCES", 20, 90);
  
  const fundingSources = [
    "Partner funded (sponsorship, merchant funded, affiliate)",
    "Margin share (marketplace)",
    "Retention uplift (only if measured and conservative)",
    "Breakage (unredeemed rewards, handled ethically)"
  ];
  
  yPos = 105;
  fundingSources.forEach(source => {
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.white);
    doc.text("• " + source, 25, yPos);
    yPos += 12;
  });
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.teal);
  doc.text("NON-NEGOTIABLE CONTROLS", 20, yPos + 10);
  
  const controls = [
    "Per-user monthly cap",
    "Per-campaign cap",
    "Taper plan (week 1–4 and month 2–3)",
    "Fraud controls (device spoofing, duplicate accounts)",
    "Stop rules (if cost per retained user exceeds threshold)"
  ];
  
  yPos += 25;
  controls.forEach(control => {
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.white);
    doc.text("✓ " + control, 25, yPos);
    yPos += 12;
  });

  // Page 8 - Section 5: Hyper-Personalisation Ladder
  doc.addPage();
  addHeader(doc, 8, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("SECTION 5", 20, 35);
  doc.setFontSize(22);
  doc.setTextColor(...BRAND.white);
  doc.text("Hyper-Personalisation Ladder", 20, 52);
  doc.setFontSize(12);
  doc.text("Do not jump to the top", 20, 68);
  
  const persLevels = [
    { level: "1", name: "Segmentation by Behaviour", desc: "New vs returning, frequency bands, streak status" },
    { level: "2", name: "Preference-Based", desc: "User-selected goals, times, content types" },
    { level: "3", name: "Contextual", desc: "Day/time, location type, schedule patterns" },
    { level: "4", name: "Predictive Triggers", desc: "Drop-off risk, churn windows, recovery of habit" },
    { level: "5", name: "Adaptive Journeys (JITAI)", desc: "Real-time need and context, system-triggered tailoring" }
  ];
  
  yPos = 85;
  persLevels.forEach(level => {
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(15, yPos - 5, 180, 28, 2, 2, "F");
    doc.setFontSize(14);
    doc.setTextColor(...BRAND.teal);
    doc.text("L" + level.level, 25, yPos + 12);
    doc.setFontSize(11);
    doc.setTextColor(...BRAND.white);
    doc.text(level.name, 50, yPos + 6);
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.muted);
    doc.text(level.desc, 50, yPos + 18);
    yPos += 34;
  });
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, yPos + 5, 180, 35, 3, 3, "F");
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.teal);
  doc.text("OPERATOR WARNING", 22, yPos + 18);
  doc.setTextColor(...BRAND.muted);
  doc.text("As you move up levels, you increase: data requirements,", 22, yPos + 30);
  doc.text("compliance risk, explainability needs, operational complexity.", 22, yPos + 40);

  // Page 9 - Section 6: Data and AI Operating System
  doc.addPage();
  addHeader(doc, 9, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("SECTION 6", 20, 35);
  doc.setFontSize(22);
  doc.setTextColor(...BRAND.white);
  doc.text("Data and AI Operating System", 20, 52);
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.teal);
  doc.text("MINIMAL VIABLE DATA (OPERATOR PRACTICAL)", 20, 75);
  
  const minData = [
    "Activity/attendance events",
    "Session completion",
    "Streaks and lapses",
    "Content consumption",
    "Reward issuance and redemption",
    "Drop-off signals (time since last meaningful action)"
  ];
  
  yPos = 90;
  minData.forEach(item => {
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.white);
    doc.text("• " + item, 25, yPos);
    yPos += 10;
  });
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.teal);
  doc.text("AI USE CASES THAT ARE ACTUALLY SANE", 20, yPos + 10);
  
  const aiUseCases = [
    "Drop-off prediction for intervention selection (low risk if used as support)",
    "Personalised challenge recommendations",
    "Reward optimisation (caps, frequency, cost control)"
  ];
  
  yPos += 25;
  aiUseCases.forEach(useCase => {
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.white);
    doc.text("• " + useCase, 25, yPos);
    yPos += 12;
  });
  
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.muted);
  doc.text("Use ICO's UK GDPR automated decision-making and profiling guidance as your baseline.", 20, yPos + 15);

  // Page 10 - Template A: Gamification Loop Canvas
  doc.addPage();
  addHeader(doc, 10, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("TEMPLATE A", 20, 35);
  doc.setFontSize(20);
  doc.setTextColor(...BRAND.white);
  doc.text("Gamification Loop Canvas", 20, 52);
  
  const canvasFields = [
    "Loop Name:",
    "Target Behaviour:",
    "User Segment:",
    "Measurable Signal:",
    "Progress Mechanic (points, streaks, levels):",
    "Feedback (what the user sees):",
    "Social Layer (optional):",
    "Reward (if used):",
    "Cost Cap:",
    "Taper Plan:",
    "Stop Rule:"
  ];
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, 60, 180, 210, 3, 3, "F");
  
  yPos = 75;
  canvasFields.forEach(field => {
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.teal);
    doc.text(field, 22, yPos);
    doc.setDrawColor(...BRAND.muted);
    doc.line(22, yPos + 12, 188, yPos + 12);
    yPos += 18;
  });

  // Page 11 - Template B: Incentive Policy
  doc.addPage();
  addHeader(doc, 11, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("TEMPLATE B", 20, 35);
  doc.setFontSize(20);
  doc.setTextColor(...BRAND.white);
  doc.text("Incentive Policy and Guardrails", 20, 52);
  
  const policyFields = [
    "Reward Type:",
    "Eligibility:",
    "Frequency Cap:",
    "Max Cost Per User / Month:",
    "Fraud Risks:",
    "Taper Plan (week 1–4 / month 2–3):",
    "What We Will NOT Reward:",
    "Human Review Required When:"
  ];
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, 60, 180, 160, 3, 3, "F");
  
  yPos = 75;
  policyFields.forEach(field => {
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.teal);
    doc.text(field, 22, yPos);
    doc.setDrawColor(...BRAND.muted);
    doc.line(22, yPos + 12, 188, yPos + 12);
    yPos += 18;
  });
  
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.muted);
  doc.text("Evidence note: incentives often show short-term lift;", 22, yPos + 10);
  doc.text("build tapering and follow-up design explicitly.", 22, yPos + 20);

  // Page 12 - Template C: Reward Economics Table
  doc.addPage();
  addHeader(doc, 12, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("TEMPLATE C", 20, 35);
  doc.setFontSize(20);
  doc.setTextColor(...BRAND.white);
  doc.text("Reward Economics Table", 20, 52);
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, 65, 180, 18, 2, 2, "F");
  doc.setFontSize(7);
  doc.setTextColor(...BRAND.teal);
  doc.text("REWARD", 20, 76);
  doc.text("UNIT COST", 48, 76);
  doc.text("EXPECTED", 75, 73);
  doc.text("REDEMP.", 75, 79);
  doc.text("MONTHLY", 102, 73);
  doc.text("COST", 102, 79);
  doc.text("FUNDING", 128, 73);
  doc.text("SOURCE", 128, 79);
  doc.text("EXPECTED", 155, 73);
  doc.text("OUTCOME", 155, 79);
  doc.text("CONF.", 185, 76);
  
  yPos = 88;
  for (let i = 0; i < 6; i++) {
    doc.setDrawColor(...BRAND.muted);
    doc.line(15, yPos, 195, yPos);
    doc.setDrawColor(...BRAND.teal);
    doc.line(20, yPos + 15, 45, yPos + 15);
    doc.line(50, yPos + 15, 70, yPos + 15);
    doc.line(77, yPos + 15, 97, yPos + 15);
    doc.line(104, yPos + 15, 124, yPos + 15);
    doc.line(130, yPos + 15, 150, yPos + 15);
    doc.line(157, yPos + 15, 177, yPos + 15);
    doc.line(183, yPos + 15, 192, yPos + 15);
    yPos += 25;
  }

  // Page 13 - Template D: Personalisation Ladder Planner
  doc.addPage();
  addHeader(doc, 13, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("TEMPLATE D", 20, 35);
  doc.setFontSize(20);
  doc.setTextColor(...BRAND.white);
  doc.text("Personalisation Ladder Planner", 20, 52);
  
  const ladderFields = [
    "Current Level (1–5):",
    "Data Required to Move Up:",
    "Consent Requirement:",
    "Explainability Requirement:",
    "Trust Risk:",
    "Operational Complexity:",
    "Next Step:"
  ];
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, 60, 180, 145, 3, 3, "F");
  
  yPos = 75;
  ladderFields.forEach(field => {
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.teal);
    doc.text(field, 22, yPos);
    doc.setDrawColor(...BRAND.muted);
    doc.line(22, yPos + 12, 188, yPos + 12);
    yPos += 18;
  });
  
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.muted);
  doc.text("Evidence note: personalisation lifts vary by sector and execution;", 22, yPos + 10);
  doc.text("treat uplift as hypothesis until measured.", 22, yPos + 20);

  // Page 14 - Template E: Intervention Ladder Register
  doc.addPage();
  addHeader(doc, 14, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("TEMPLATE E", 20, 35);
  doc.setFontSize(20);
  doc.setTextColor(...BRAND.white);
  doc.text("Intervention Ladder Register", 20, 52);
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, 65, 180, 18, 2, 2, "F");
  doc.setFontSize(7);
  doc.setTextColor(...BRAND.teal);
  doc.text("TRIGGER", 20, 76);
  doc.text("NUDGE", 45, 76);
  doc.text("CONTENT", 65, 76);
  doc.text("SOCIAL", 90, 76);
  doc.text("HUMAN", 112, 76);
  doc.text("INCENTIVE", 135, 76);
  doc.text("OUTCOME", 162, 76);
  doc.text("DECISION", 185, 76);
  
  yPos = 88;
  for (let i = 0; i < 6; i++) {
    doc.setDrawColor(...BRAND.muted);
    doc.line(15, yPos, 195, yPos);
    doc.setDrawColor(...BRAND.teal);
    doc.line(20, yPos + 15, 40, yPos + 15);
    doc.line(45, yPos + 15, 60, yPos + 15);
    doc.line(65, yPos + 15, 85, yPos + 15);
    doc.line(90, yPos + 15, 107, yPos + 15);
    doc.line(112, yPos + 15, 130, yPos + 15);
    doc.line(135, yPos + 15, 157, yPos + 15);
    doc.line(162, yPos + 15, 180, yPos + 15);
    doc.line(185, yPos + 15, 192, yPos + 15);
    yPos += 25;
  }
  
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.muted);
  doc.text("Decision options: Keep / Kill / Adjust", 20, yPos + 10);

  // Page 15 - Template F: JITAI Decision Rules
  doc.addPage();
  addHeader(doc, 15, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("TEMPLATE F", 20, 35);
  doc.setFontSize(20);
  doc.setTextColor(...BRAND.white);
  doc.text("JITAI-Style Decision Rules", 20, 52);
  
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.muted);
  doc.text("Just-In-Time Adaptive Interventions: system-triggered, context-adaptive support", 20, 68);
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, 80, 180, 150, 3, 3, "F");
  
  const jitaiTemplate = [
    "IF signal is ______________________________________",
    "",
    "AND context is ____________________________________",
    "",
    "DELIVER [intervention] ____________________________",
    "",
    "WITHIN [time window] ______________________________",
    "",
    "ONLY IF [cooldown rule] ___________________________",
    "",
    "LOG [outcome metric] ______________________________",
    "",
    "EVALUATE WITHIN [window] __________________________"
  ];
  
  yPos = 95;
  jitaiTemplate.forEach(line => {
    doc.setFontSize(10);
    if (line.startsWith("IF") || line.startsWith("AND") || line.startsWith("DELIVER") || 
        line.startsWith("WITHIN") || line.startsWith("ONLY") || line.startsWith("LOG") || 
        line.startsWith("EVALUATE")) {
      doc.setTextColor(...BRAND.teal);
    } else {
      doc.setTextColor(...BRAND.white);
    }
    doc.text(line, 22, yPos);
    yPos += 12;
  });
  
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.muted);
  doc.text("Grounding: JITAI design uses system-triggered, context-adaptive support.", 20, 245);

  // Page 16 - Template G: Compliance and Fairness Checklist
  doc.addPage();
  addHeader(doc, 16, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("TEMPLATE G", 20, 35);
  doc.setFontSize(20);
  doc.setTextColor(...BRAND.white);
  doc.text("Compliance and Fairness Checklist", 20, 52);
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, 65, 180, 18, 2, 2, "F");
  doc.setFontSize(8);
  doc.setTextColor(...BRAND.teal);
  doc.text("ITEM", 20, 76);
  doc.text("PASS/FAIL", 110, 76);
  doc.text("FIX OWNER", 145, 76);
  doc.text("FIX BY", 180, 76);
  
  const complianceItems = [
    "Consent and transparency clear",
    "User understands profiling/personalisation",
    "Opt-out available (where appropriate)",
    "No solely automated 'significant effect' decisions",
    "Human review path exists",
    "Audit trail and logging enabled"
  ];
  
  yPos = 88;
  complianceItems.forEach(item => {
    doc.setDrawColor(...BRAND.muted);
    doc.line(15, yPos, 195, yPos);
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.white);
    doc.text(item, 20, yPos + 10);
    doc.setDrawColor(...BRAND.teal);
    doc.rect(112, yPos + 3, 8, 8);
    doc.line(145, yPos + 10, 170, yPos + 10);
    doc.line(180, yPos + 10, 192, yPos + 10);
    yPos += 22;
  });
  
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.muted);
  doc.text("Grounding: ICO guidance on Article 22 and fairness in automated decision-making.", 20, yPos + 15);

  // Page 17 - Template H: 30-60-90 Launch Plan
  doc.addPage();
  addHeader(doc, 17, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("TEMPLATE H", 20, 35);
  doc.setFontSize(20);
  doc.setTextColor(...BRAND.white);
  doc.text("30-60-90 Launch Plan", 20, 52);
  
  const launchPhases = [
    { days: "30 DAYS", focus: "Define behaviour + signals + caps + pilot cohort" },
    { days: "60 DAYS", focus: "Test loops + taper incentives + measure lift" },
    { days: "90 DAYS", focus: "Scale / kill based on evidence" }
  ];
  
  yPos = 75;
  launchPhases.forEach(phase => {
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(15, yPos - 5, 180, 30, 3, 3, "F");
    doc.setFontSize(12);
    doc.setTextColor(...BRAND.teal);
    doc.text(phase.days, 25, yPos + 8);
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.white);
    doc.text(phase.focus, 25, yPos + 20);
    yPos += 38;
  });
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.teal);
  doc.text("KEY METRICS", 20, yPos + 10);
  
  const metricFields = [
    "Primary Metric:",
    "Secondary Metrics:",
    "Stop Criteria:"
  ];
  
  yPos += 25;
  metricFields.forEach(field => {
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.white);
    doc.text(field, 25, yPos);
    doc.setDrawColor(...BRAND.muted);
    doc.line(80, yPos, 188, yPos);
    yPos += 18;
  });

  // Page 18 - Operator Insights
  doc.addPage();
  addHeader(doc, 18, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("EVIDENCE CALLOUTS", 20, 35);
  doc.setFontSize(20);
  doc.setTextColor(...BRAND.white);
  doc.text("Operator Insights You Can Cite", 20, 52);
  
  const insights = [
    "HFA (formerly IHRSA) publishes operator 'best practice' playbooks with tools/templates.",
    "Gamification meta-analyses show positive effects on physical activity outcomes.",
    "Financial incentive evidence shows short-term lift with fewer long-term follow-up trials.",
    "Personalisation research commonly reports revenue lift ranges and ROI improvements.",
    "ICO guidance defines restrictions and safeguards around solely automated decision-making."
  ];
  
  yPos = 75;
  insights.forEach((insight, i) => {
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(15, yPos - 5, 180, 30, 3, 3, "F");
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.muted);
    const lines = doc.splitTextToSize("• " + insight, 165);
    doc.text(lines, 22, yPos + 8);
    yPos += 38;
  });

  // Page 19 - Pricing Recommendation
  doc.addPage();
  addHeader(doc, 19, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("PRICING GUIDANCE", 20, 35);
  doc.setFontSize(20);
  doc.setTextColor(...BRAND.white);
  doc.text("Commercial Model", 20, 52);
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.muted);
  doc.text("Given this includes a full operating model + templates + compliance guardrails:", 20, 75);
  
  const pricing = [
    { label: "Standalone", price: "£79" },
    { label: "Bundle Add-On Price", price: "£49 (with AI Readiness Score)" },
    { label: "Expert Subscription", price: "Included in downloads library" }
  ];
  
  yPos = 100;
  pricing.forEach(p => {
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(15, yPos - 5, 180, 25, 3, 3, "F");
    doc.setFontSize(11);
    doc.setTextColor(...BRAND.white);
    doc.text(p.label, 25, yPos + 8);
    doc.setFontSize(14);
    doc.setTextColor(...BRAND.teal);
    doc.text(p.price, 160, yPos + 8, { align: "right" });
    yPos += 32;
  });

  // Page 20 - Next Steps
  doc.addPage();
  addHeader(doc, 20, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("NEXT STEPS", 20, 35);
  doc.setFontSize(20);
  doc.setTextColor(...BRAND.white);
  doc.text("Your Journey", 20, 52);
  
  const nextSteps = [
    "1. Choose one behaviour and complete Templates A + B + C",
    "2. Launch a 30-day pilot with caps and stop rules",
    "3. Use the AI Coach (Diagnostic Mode) to stress-test assumptions weekly",
    "4. Re-run your measurement and decide: scale, adjust, or kill",
    "5. Only then move up the personalisation ladder (Template D)"
  ];
  
  yPos = 80;
  nextSteps.forEach(step => {
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(15, yPos - 5, 180, 25, 3, 3, "F");
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.white);
    doc.text(step, 25, yPos + 10);
    yPos += 32;
  });

  // What Next Section
  addWhatNextSection(doc, totalPages - 1, totalPages);
  
  // CTA Page
  addCTAPage(doc, totalPages, totalPages);

  return doc;
};

// AI Readiness Score Report PDF - for saving to downloads
interface PillarScore {
  pillar: string;
  shortName: string;
  score: number;
  status: string;
  statusVariant: "critical" | "warning" | "healthy" | "strong";
  insight: string;
}

interface ReadinessReportData {
  overallScore: number;
  scoreBand: string;
  scoreBandDescription: string;
  pillarScores: PillarScore[];
  completedAt: string;
  userName?: string;
  companyName?: string;
}

export const generateReadinessReport = (data: ReadinessReportData): jsPDF => {
  const doc = new jsPDF();
  const totalPages = 3;
  
  // Page 1 - Cover
  addHeader(doc, 1, totalPages);
  
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.teal);
  doc.text("WELLNESS GENIUS", 105, 40, { align: "center" });
  
  doc.setFontSize(28);
  doc.setTextColor(...BRAND.white);
  doc.text("AI Readiness Score", 105, 65, { align: "center" });
  doc.text("Report", 105, 80, { align: "center" });
  
  // Score Circle (visual representation)
  doc.setFillColor(...BRAND.cardBg);
  doc.circle(105, 130, 35, "F");
  doc.setFontSize(36);
  doc.setTextColor(...BRAND.teal);
  doc.text(String(data.overallScore), 105, 135, { align: "center" });
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.muted);
  doc.text("/ 100", 105, 148, { align: "center" });
  
  // Score Band
  doc.setFillColor(...BRAND.teal);
  doc.roundedRect(55, 175, 100, 20, 3, 3, "F");
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.darkBg);
  doc.text(data.scoreBand, 105, 188, { align: "center" });
  
  // Description
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.muted);
  const descLines = doc.splitTextToSize(data.scoreBandDescription, 140);
  doc.text(descLines, 105, 215, { align: "center" });
  
  // Footer info
  if (data.userName || data.companyName) {
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.muted);
    const infoText = [data.userName, data.companyName].filter(Boolean).join(" - ");
    doc.text(infoText, 105, 250, { align: "center" });
  }
  doc.text(`Completed: ${data.completedAt}`, 105, 262, { align: "center" });
  
  // Page 2 - Pillar Breakdown
  doc.addPage();
  addHeader(doc, 2, totalPages);
  
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("PILLAR BREAKDOWN", 20, 35);
  doc.setFontSize(20);
  doc.setTextColor(...BRAND.white);
  doc.text("Your AI Readiness by Dimension", 20, 52);
  
  let yPos = 75;
  
  data.pillarScores.forEach((pillar) => {
    // Card background
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(15, yPos - 5, 180, 35, 3, 3, "F");
    
    // Pillar name and status
    doc.setFontSize(12);
    doc.setTextColor(...BRAND.white);
    doc.text(pillar.pillar, 25, yPos + 8);
    
    // Status badge color
    const statusColors: Record<string, [number, number, number]> = {
      critical: [239, 68, 68],
      warning: [234, 179, 8],
      healthy: [45, 212, 191],
      strong: [34, 197, 94],
    };
    const statusColor = statusColors[pillar.statusVariant] || BRAND.muted;
    doc.setTextColor(...statusColor);
    doc.setFontSize(10);
    doc.text(pillar.status, 25, yPos + 20);
    
    // Score
    doc.setFontSize(16);
    doc.setTextColor(...BRAND.teal);
    doc.text(`${pillar.score}%`, 180, yPos + 12, { align: "right" });
    
    // Progress bar
    doc.setFillColor(60, 60, 66);
    doc.roundedRect(100, yPos + 16, 75, 4, 2, 2, "F");
    doc.setFillColor(...BRAND.teal);
    doc.roundedRect(100, yPos + 16, (pillar.score / 100) * 75, 4, 2, 2, "F");
    
    yPos += 42;
  });
  
  // Page 3 - Insights & Next Steps
  doc.addPage();
  addHeader(doc, 3, totalPages);
  
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("INSIGHTS", 20, 35);
  doc.setFontSize(20);
  doc.setTextColor(...BRAND.white);
  doc.text("Key Observations", 20, 52);
  
  yPos = 75;
  
  // Show insights for critical/warning pillars
  const priorityPillars = data.pillarScores
    .filter(p => p.statusVariant === "critical" || p.statusVariant === "warning")
    .slice(0, 3);
  
  priorityPillars.forEach((pillar) => {
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(15, yPos - 5, 180, 30, 3, 3, "F");
    
    doc.setFontSize(11);
    doc.setTextColor(...BRAND.teal);
    doc.text(pillar.shortName + ":", 25, yPos + 8);
    
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.muted);
    const insightLines = doc.splitTextToSize(pillar.insight, 155);
    doc.text(insightLines, 25, yPos + 18);
    
    yPos += 38;
  });
  
  // Next Steps
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("NEXT STEPS", 20, yPos + 15);
  
  const nextSteps = [
    "Use the AI Advisor to explore your weakest pillars",
    "Download the 90-Day Activation Playbook for implementation",
    "Consider the full AI Readiness Report for detailed recommendations",
  ];
  
  yPos += 30;
  nextSteps.forEach((step) => {
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(15, yPos, 180, 18, 3, 3, "F");
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.white);
    doc.text("- " + step, 25, yPos + 11);
    yPos += 24;
  });
  
  // CTA
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.teal);
  doc.text("wellnessgenius.co.uk/genie", 105, yPos + 20, { align: "center" });

  return doc;
};

// Structured AI for Wellness Operators - Executive Brief
export const generateStructuredAIEbook = (): jsPDF => {
  const doc = new jsPDF();
  const totalPages = 12;
  
  // Page 1 - Cover
  addHeader(doc, 1, totalPages);
  
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("EXECUTIVE BRIEF", 105, 70, { align: "center" });
  
  doc.setFontSize(36);
  doc.setTextColor(...BRAND.white);
  doc.text("Structured AI for", 105, 100, { align: "center" });
  doc.text("Wellness Operators", 105, 120, { align: "center" });
  
  doc.setFontSize(18);
  doc.setTextColor(...BRAND.muted);
  doc.text("From Chatbots to Decision Infrastructure", 105, 150, { align: "center" });
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(50, 180, 110, 50, 5, 5, "F");
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.muted);
  doc.text("Sources include:", 105, 195, { align: "center" });
  doc.setTextColor(...BRAND.white);
  doc.text("Global Wellness Institute • Leisure Database Company", 105, 210, { align: "center" });
  doc.text("Health Club Management • MVP Index", 105, 222, { align: "center" });
  
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.teal);
  doc.text("Wellness Genius", 105, 260, { align: "center" });
  doc.text("wellnessgenius.co.uk", 105, 270, { align: "center" });
  
  // Page 2 - Why This Matters Now
  doc.addPage();
  addHeader(doc, 2, totalPages);
  
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("Why This Matters Now", 20, 40);
  
  doc.setFillColor(...BRAND.teal);
  doc.roundedRect(20, 55, 170, 35, 3, 3, "F");
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.darkBg);
  doc.text("The global wellness economy is valued at $5.6 trillion", 105, 70, { align: "center" });
  doc.text("and continues to outpace global GDP growth.", 105, 82, { align: "center" });
  
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.muted);
  doc.text("Source: Global Wellness Institute — globalwellnessinstitute.org", 20, 100);
  
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.white);
  doc.text("Yet despite rapid growth, operators face:", 20, 125);
  
  const challenges = [
    "Rising operational complexity",
    "Margin pressure from all directions",
    "Increased demand for proof of impact"
  ];
  
  let yPos = 145;
  challenges.forEach(challenge => {
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(25, yPos - 8, 160, 20, 3, 3, "F");
    doc.setFontSize(12);
    doc.setTextColor(...BRAND.white);
    doc.text("• " + challenge, 35, yPos + 3);
    yPos += 28;
  });
  
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.muted);
  const aiNote = doc.splitTextToSize(
    "AI adoption is accelerating — but mostly as chatbots and content tools, not as systems that improve decision quality.",
    160
  );
  doc.text(aiNote, 20, 240);
  
  // Page 3 - The Core Problem
  doc.addPage();
  addHeader(doc, 3, totalPages);
  
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("The Core Problem", 20, 40);
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(20, 55, 170, 50, 5, 5, "F");
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.white);
  doc.text("Most wellness businesses don't have", 105, 75, { align: "center" });
  doc.text("a technology gap.", 105, 90, { align: "center" });
  doc.setTextColor(...BRAND.teal);
  doc.setFontSize(16);
  doc.text("They have a decision-quality gap.", 105, 105, { align: "center" });
  
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.white);
  doc.text("Industry reporting consistently shows:", 20, 130);
  
  const gaps = [
    { exists: "Data exists", missing: "but insight does not" },
    { exists: "Tools exist", missing: "but clarity does not" },
    { exists: "AI outputs are generated", missing: "but they're generic and hard to trust" }
  ];
  
  yPos = 150;
  gaps.forEach(gap => {
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(25, yPos - 5, 160, 22, 3, 3, "F");
    doc.setFontSize(11);
    doc.setTextColor(...BRAND.white);
    doc.text(gap.exists, 35, yPos + 5);
    doc.setTextColor(...BRAND.muted);
    doc.text(" — " + gap.missing, 35 + doc.getTextWidth(gap.exists), yPos + 5);
    yPos += 30;
  });
  
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.muted);
  doc.text("Source: Health Club Management — healthclubmanagement.co.uk", 20, 250);
  
  // Page 4 - The Insight
  doc.addPage();
  addHeader(doc, 4, totalPages);
  
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("The Insight", 20, 40);
  
  doc.setFillColor(...BRAND.teal);
  doc.roundedRect(20, 55, 170, 30, 5, 5, "F");
  doc.setFontSize(18);
  doc.setTextColor(...BRAND.darkBg);
  doc.text("AI performance scales with structure.", 105, 75, { align: "center" });
  
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.muted);
  doc.text("Unstructured input", 50, 110);
  doc.text("→", 105, 110, { align: "center" });
  doc.text("generic output", 160, 110, { align: "right" });
  
  doc.setTextColor(...BRAND.white);
  doc.text("Structured input", 50, 135);
  doc.setTextColor(...BRAND.teal);
  doc.text("→", 105, 135, { align: "center" });
  doc.text("decision-ready intelligence", 160, 135, { align: "right" });
  
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.muted);
  const gwiNote = doc.splitTextToSize(
    "This mirrors GWI's systems-based approach to wellness innovation: clear intent, context awareness, guardrails, and measurable outcomes.",
    160
  );
  doc.text(gwiNote, 20, 170);
  
  doc.setFontSize(10);
  doc.text("Source: Global Wellness Institute — globalwellnessinstitute.org/industry-research", 20, 200);
  
  // Page 5 - Framework: Intent
  doc.addPage();
  addHeader(doc, 5, totalPages);
  
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.teal);
  doc.text("WELLNESS AI OPERATING FRAMEWORK", 20, 35);
  
  doc.setFontSize(28);
  doc.setTextColor(...BRAND.white);
  doc.text("1. Intent", 20, 60);
  
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.muted);
  doc.text("What decision are we improving?", 20, 80);
  
  const intentAreas = ["Retention", "Yield per member", "Workforce stability", "Utilisation"];
  yPos = 100;
  intentAreas.forEach(area => {
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(25, yPos - 5, 80, 20, 3, 3, "F");
    doc.setFontSize(12);
    doc.setTextColor(...BRAND.white);
    doc.text(area, 35, yPos + 7);
    yPos += 28;
  });
  
  doc.setFillColor(...BRAND.teal);
  doc.setDrawColor(...BRAND.teal);
  doc.roundedRect(20, 210, 170, 40, 3, 3, "F");
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.darkBg);
  const mvpNote = doc.splitTextToSize(
    "Research shows higher engagement = longer retention and higher lifetime value. Intent must be tied to measurable outcomes.",
    160
  );
  doc.text(mvpNote, 30, 225);
  
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.muted);
  doc.text("Source: MVP Index — themvpindex.com", 20, 265);
  
  // Page 6 - Framework: Context
  doc.addPage();
  addHeader(doc, 6, totalPages);
  
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.teal);
  doc.text("WELLNESS AI OPERATING FRAMEWORK", 20, 35);
  
  doc.setFontSize(28);
  doc.setTextColor(...BRAND.white);
  doc.text("2. Context", 20, 60);
  
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.muted);
  doc.text("AI must understand:", 20, 80);
  
  const contextAreas = [
    { label: "Business Model", desc: "How you make money" },
    { label: "Market", desc: "Who you compete with" },
    { label: "Demographics", desc: "Who your members are" },
    { label: "Data Reality", desc: "What you can actually measure" }
  ];
  
  yPos = 100;
  contextAreas.forEach(area => {
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(25, yPos - 5, 160, 25, 3, 3, "F");
    doc.setFontSize(12);
    doc.setTextColor(...BRAND.teal);
    doc.text(area.label, 35, yPos + 5);
    doc.setTextColor(...BRAND.muted);
    doc.text(area.desc, 35, yPos + 16);
    yPos += 32;
  });
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.muted);
  const ldbNote = doc.splitTextToSize(
    "Retention, penetration, and usage vary significantly by model and region. Generic AI advice fails without this context.",
    160
  );
  doc.text(ldbNote, 20, 240);
  
  doc.setFontSize(10);
  doc.text("Source: Leisure Database Company — leisuredatabase.com", 20, 265);
  
  // Page 7 - Framework: Constraints
  doc.addPage();
  addHeader(doc, 7, totalPages);
  
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.teal);
  doc.text("WELLNESS AI OPERATING FRAMEWORK", 20, 35);
  
  doc.setFontSize(28);
  doc.setTextColor(...BRAND.white);
  doc.text("3. Constraints", 20, 60);
  
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.muted);
  doc.text("What must NOT happen:", 20, 80);
  
  const constraints = [
    { label: "Unsafe health claims", risk: "Regulatory and reputational risk" },
    { label: "Data misuse", risk: "Privacy violations and trust damage" },
    { label: "Brand inconsistency", risk: "Diluted positioning and confusion" }
  ];
  
  yPos = 105;
  constraints.forEach(c => {
    doc.setFillColor(80, 30, 30);
    doc.roundedRect(25, yPos - 5, 160, 30, 3, 3, "F");
    doc.setFontSize(12);
    doc.setTextColor(...BRAND.white);
    doc.text("✕ " + c.label, 35, yPos + 7);
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.muted);
    doc.text(c.risk, 45, yPos + 19);
    yPos += 38;
  });
  
  doc.setFillColor(...BRAND.teal);
  doc.roundedRect(20, 225, 170, 30, 3, 3, "F");
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.darkBg);
  doc.text("Trust is repeatedly identified as a critical driver of", 30, 238);
  doc.text("wellness engagement. Constraints protect it.", 30, 248);
  
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.muted);
  doc.text("Source: GWI — Trust & the Wellness Consumer", 20, 270);
  
  // Page 8 - Framework: Output Contracts
  doc.addPage();
  addHeader(doc, 8, totalPages);
  
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.teal);
  doc.text("WELLNESS AI OPERATING FRAMEWORK", 20, 35);
  
  doc.setFontSize(28);
  doc.setTextColor(...BRAND.white);
  doc.text("4. Output Contracts", 20, 60);
  
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.muted);
  doc.text("What does 'good' look like?", 20, 80);
  
  const outputs = [
    { label: "Clear prioritisation", desc: "Not everything at once — what matters most" },
    { label: "Practical next steps", desc: "Actionable, not theoretical" },
    { label: "Decision-ready insight", desc: "Ready to act on, not just interesting" }
  ];
  
  yPos = 105;
  outputs.forEach(o => {
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(25, yPos - 5, 160, 30, 3, 3, "F");
    doc.setFontSize(12);
    doc.setTextColor(...BRAND.teal);
    doc.text("✓ " + o.label, 35, yPos + 7);
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.muted);
    doc.text(o.desc, 45, yPos + 19);
    yPos += 38;
  });
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.muted);
  const hcmNote = doc.splitTextToSize(
    "Industry reporting highlights that operators struggle most with turning insight into action, not collecting data.",
    160
  );
  doc.text(hcmNote, 20, 235);
  
  doc.setFontSize(10);
  doc.text("Source: Health Club Management", 20, 260);
  
  // Page 9 - The Outcome
  doc.addPage();
  addHeader(doc, 9, totalPages);
  
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("The Outcome", 20, 40);
  
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.muted);
  doc.text("When you apply structure, AI becomes:", 20, 65);
  
  const outcomes = [
    { icon: "🎯", label: "A decision-support system", desc: "Not just a content generator" },
    { icon: "🔄", label: "A consistency layer across teams", desc: "Same quality, every time" },
    { icon: "🛡️", label: "A safer use of AI", desc: "Guardrails baked in" }
  ];
  
  yPos = 90;
  outcomes.forEach(o => {
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(25, yPos - 5, 160, 35, 3, 3, "F");
    doc.setFontSize(14);
    doc.setTextColor(...BRAND.white);
    doc.text(o.icon + " " + o.label, 35, yPos + 10);
    doc.setFontSize(11);
    doc.setTextColor(...BRAND.muted);
    doc.text(o.desc, 50, yPos + 24);
    yPos += 45;
  });
  
  doc.setFillColor(...BRAND.teal);
  doc.roundedRect(20, 230, 170, 40, 5, 5, "F");
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.darkBg);
  const positioning = doc.splitTextToSize(
    '"We turn AI from a chatbot into a structured thinking system for wellness businesses — so decisions get better, faster, and safer."',
    155
  );
  doc.text(positioning, 28, 245);
  
  // Page 10 - Supplier Value
  doc.addPage();
  addHeader(doc, 10, totalPages);
  
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.teal);
  doc.text("FOR SUPPLIERS & PARTNERS", 20, 35);
  
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("Structured AI as a Growth Lever", 20, 55);
  
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.muted);
  doc.text("Move from product delivery → intelligence delivery", 20, 75);
  
  const supplierHooks = [
    { title: "Standardised Intelligence at Scale", hook: "Deliver expert-level insight without scaling headcount." },
    { title: "Faster Client Adoption", hook: "Your product becomes easier to justify and harder to replace." },
    { title: "Data → Insight → Story", hook: "Stop selling features. Start selling outcomes." },
    { title: "Partner Differentiation", hook: "We improve how our clients make decisions." }
  ];
  
  yPos = 95;
  supplierHooks.forEach(h => {
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(25, yPos - 5, 160, 35, 3, 3, "F");
    doc.setFontSize(11);
    doc.setTextColor(...BRAND.white);
    doc.text(h.title, 35, yPos + 7);
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.teal);
    doc.text('"' + h.hook + '"', 35, yPos + 20);
    yPos += 42;
  });
  
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.muted);
  doc.text("Source: GWI — Wellness Ecosystems research", 20, 270);
  
  // Page 11 - Commercial Impact
  doc.addPage();
  addHeader(doc, 11, totalPages);
  
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("Commercial Impact", 20, 40);
  
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.muted);
  doc.text("Structured AI enables:", 20, 65);
  
  const commercialBenefits = [
    "Platform partnerships",
    "Enterprise contracts",
    "Multi-site deployments",
    "Recurring intelligence subscriptions"
  ];
  
  yPos = 90;
  commercialBenefits.forEach(benefit => {
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(25, yPos - 5, 160, 22, 3, 3, "F");
    doc.setFontSize(12);
    doc.setTextColor(...BRAND.white);
    doc.text("→ " + benefit, 35, yPos + 7);
    yPos += 30;
  });
  
  doc.setFillColor(...BRAND.teal);
  doc.roundedRect(20, 210, 170, 35, 5, 5, "F");
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.darkBg);
  doc.text("Because you're no longer selling tools —", 30, 225);
  doc.text("you're selling operational clarity.", 30, 238);
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.muted);
  doc.text("Industry data sources: Leisure DB, Health Club Management", 20, 265);
  
  // Page 12 - Final Close
  doc.addPage();
  addHeader(doc, 12, totalPages);
  
  doc.setFontSize(28);
  doc.setTextColor(...BRAND.white);
  doc.text("Final Thought", 105, 70, { align: "center" });
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(30, 90, 150, 80, 5, 5, "F");
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.white);
  doc.text("AI isn't replacing operators or suppliers.", 105, 115, { align: "center" });
  doc.setTextColor(...BRAND.teal);
  doc.setFontSize(16);
  doc.text("It's replacing poor decision-making.", 105, 140, { align: "center" });
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.white);
  doc.text("Structure is how we do that — together.", 105, 160, { align: "center" });
  
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.muted);
  doc.text("Ready to apply this framework?", 105, 200, { align: "center" });
  
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("wellnessgenius.co.uk/genie", 105, 220, { align: "center" });
  
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.muted);
  doc.text("Wellness Genius — Practical AI for Wellness Leaders", 105, 250, { align: "center" });
  
  return doc;
};

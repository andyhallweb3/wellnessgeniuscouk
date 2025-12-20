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

// Wellness AI Builder – Operator Edition
export const generatePromptPack = (): jsPDF => {
  const doc = new jsPDF();
  const totalPages = 14;
  
  // Page 1 - Cover
  addHeader(doc, 1, totalPages);
  doc.setFontSize(32);
  doc.setTextColor(...BRAND.white);
  doc.text("Wellness AI Builder", 105, 85, { align: "center" });
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.teal);
  doc.text("Operator Edition", 105, 105, { align: "center" });
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.muted);
  doc.text("Decision systems. Not prompts.", 105, 130, { align: "center" });
  doc.text("Build what matters. Stop what doesn't.", 105, 145, { align: "center" });
  doc.setFontSize(10);
  doc.text("Wellness Genius • wellnessgenius.io", 105, 200, { align: "center" });
  
  // Page 2 - What's Inside
  doc.addPage();
  addHeader(doc, 2, totalPages);
  doc.setFontSize(22);
  doc.setTextColor(...BRAND.white);
  doc.text("What's Inside", 20, 40);
  
  const contents = [
    { num: "01", title: "The Decision Tree", desc: "Stop bad projects before they start" },
    { num: "02", title: "Use-Case Catalogue", desc: "Non-obvious wellness AI applications" },
    { num: "03", title: "System Prompt Blocks", desc: "Architectural prompts, not ChatGPT fluff" },
    { num: "04", title: "Data Schema Templates", desc: "Production-ready wellness data structures" },
  ];
  
  let yPos = 60;
  contents.forEach(item => {
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(15, yPos - 5, 180, 35, 3, 3, "F");
    doc.setFontSize(24);
    doc.setTextColor(...BRAND.teal);
    doc.text(item.num, 25, yPos + 15);
    doc.setFontSize(14);
    doc.setTextColor(...BRAND.white);
    doc.text(item.title, 50, yPos + 10);
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.muted);
    doc.text(item.desc, 50, yPos + 22);
    yPos += 45;
  });
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.teal);
  doc.text("This is not content. This is operating logic.", 105, 250, { align: "center" });
  
  // Page 3 - Decision Tree Title
  doc.addPage();
  addHeader(doc, 3, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("SECTION 01", 20, 40);
  doc.setFontSize(28);
  doc.setTextColor(...BRAND.white);
  doc.text("The Wellness AI", 20, 60);
  doc.text("Decision Tree", 20, 78);
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.muted);
  doc.text("A hard yes/no filter to stop bad projects before they waste budget.", 20, 100);
  doc.text("If you cannot pass this tree, do not build.", 20, 115);
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, 135, 180, 80, 3, 3, "F");
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.teal);
  doc.text("THE FOUR GATES", 25, 150);
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.white);
  const gates = [
    "1. Is this decision repeated weekly or more?",
    "2. Is this decision financially material (>£10k/year impact)?",
    "3. Is this decision risky if made wrongly?",
    "4. Does this decision depend on behavioural data?"
  ];
  yPos = 165;
  gates.forEach(gate => {
    doc.text(gate, 25, yPos);
    yPos += 12;
  });
  
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("If NO to 2+ gates → DO NOT BUILD AI", 25, 230);
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.muted);
  doc.text("Most wellness AI projects fail this test. That's the point.", 25, 250);
  
  // Page 4 - Decision Tree Visual
  doc.addPage();
  addHeader(doc, 4, totalPages);
  doc.setFontSize(16);
  doc.setTextColor(...BRAND.white);
  doc.text("Decision Flow", 105, 35, { align: "center" });
  
  // Visual flow boxes
  const flowBoxes = [
    { y: 50, text: "Is decision repeated weekly?", yes: 75, no: "STOP" },
    { y: 85, text: "Is impact >£10k/year?", yes: 110, no: "STOP" },
    { y: 120, text: "Is there risk if wrong?", yes: 145, no: "STOP" },
    { y: 155, text: "Does it need behavioural data?", yes: 180, no: "STOP" },
  ];
  
  flowBoxes.forEach((box, i) => {
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(30, box.y, 150, 25, 3, 3, "F");
    doc.setFontSize(11);
    doc.setTextColor(...BRAND.white);
    doc.text(box.text, 40, box.y + 15);
    
    // Yes arrow
    if (typeof box.yes === "number") {
      doc.setDrawColor(...BRAND.teal);
      doc.setLineWidth(0.5);
      doc.line(105, box.y + 25, 105, box.yes);
      doc.setFontSize(8);
      doc.setTextColor(...BRAND.teal);
      doc.text("YES", 110, box.y + 32);
    }
    
    // No path
    doc.setFontSize(8);
    doc.setTextColor(...BRAND.muted);
    doc.text("NO → STOP", 185, box.y + 15);
  });
  
  // Final proceed box
  doc.setFillColor(...BRAND.teal);
  doc.roundedRect(50, 195, 110, 30, 3, 3, "F");
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.darkBg);
  doc.text("PROCEED TO BUILD", 105, 213, { align: "center" });
  
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.muted);
  doc.text("Only ~20% of proposed wellness AI projects pass all four gates.", 105, 245, { align: "center" });
  doc.text("That's a feature, not a bug.", 105, 257, { align: "center" });
  
  // Page 5 - Use-Case Catalogue Title
  doc.addPage();
  addHeader(doc, 5, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("SECTION 02", 20, 40);
  doc.setFontSize(28);
  doc.setTextColor(...BRAND.white);
  doc.text("Wellness AI", 20, 60);
  doc.text("Use-Case Catalogue", 20, 78);
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.muted);
  doc.text("Not chatbots. Not content generation.", 20, 100);
  doc.text("These are the use-cases that actually move money.", 20, 115);
  
  // Page 6 - Use Cases 1-2
  doc.addPage();
  addHeader(doc, 6, totalPages);
  
  const useCases = [
    {
      title: "Churn Risk Signals from Missed Habits",
      data: "Session frequency, habit streaks, drop-off windows",
      risk: "Medium — false positives waste intervention budget",
      monetisation: "Reduce churn by 5-15% in at-risk cohort",
      failure: "Most teams trigger too early, burning trust"
    },
    {
      title: "Coach Intervention Prioritisation",
      data: "Engagement scores, progress velocity, risk flags",
      risk: "Low — human remains in loop",
      monetisation: "Reduce coach workload by 30%, improve outcomes",
      failure: "Coaches ignore AI if not trained on thresholds"
    }
  ];
  
  yPos = 35;
  useCases.slice(0, 2).forEach((uc, i) => {
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(15, yPos, 180, 105, 3, 3, "F");
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.teal);
    doc.text(`USE CASE ${i + 1}`, 22, yPos + 12);
    doc.setFontSize(14);
    doc.setTextColor(...BRAND.white);
    const titleLines = doc.splitTextToSize(uc.title, 165);
    doc.text(titleLines, 22, yPos + 26);
    
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.teal);
    doc.text("REQUIRED DATA", 22, yPos + 45);
    doc.setTextColor(...BRAND.muted);
    doc.text(uc.data, 22, yPos + 54);
    
    doc.setTextColor(...BRAND.teal);
    doc.text("RISK LEVEL", 22, yPos + 66);
    doc.setTextColor(...BRAND.muted);
    doc.text(uc.risk, 22, yPos + 75);
    
    doc.setTextColor(...BRAND.teal);
    doc.text("WHY MOST FAIL", 22, yPos + 87);
    doc.setTextColor(...BRAND.white);
    doc.text(uc.failure, 22, yPos + 96);
    
    yPos += 115;
  });
  
  // Page 7 - Use Cases 3-4
  doc.addPage();
  addHeader(doc, 7, totalPages);
  
  const useCases2 = [
    {
      title: "Upsell Timing During Behaviour Peaks",
      data: "Habit completion rates, goal proximity, session timing",
      risk: "Medium — poor timing damages brand trust",
      monetisation: "2-4x conversion vs. random timing",
      failure: "Teams upsell too often, not at peak moments"
    },
    {
      title: "Sponsor Value Attribution from Activity",
      data: "Brand exposure events, engagement depth, attribution windows",
      risk: "Low — analytics, not intervention",
      monetisation: "Justify premium pricing to sponsors (20-50% uplift)",
      failure: "Confusing correlation with causation in reports"
    }
  ];
  
  yPos = 35;
  useCases2.forEach((uc, i) => {
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(15, yPos, 180, 105, 3, 3, "F");
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.teal);
    doc.text(`USE CASE ${i + 3}`, 22, yPos + 12);
    doc.setFontSize(14);
    doc.setTextColor(...BRAND.white);
    const titleLines = doc.splitTextToSize(uc.title, 165);
    doc.text(titleLines, 22, yPos + 26);
    
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.teal);
    doc.text("REQUIRED DATA", 22, yPos + 45);
    doc.setTextColor(...BRAND.muted);
    doc.text(uc.data, 22, yPos + 54);
    
    doc.setTextColor(...BRAND.teal);
    doc.text("RISK LEVEL", 22, yPos + 66);
    doc.setTextColor(...BRAND.muted);
    doc.text(uc.risk, 22, yPos + 75);
    
    doc.setTextColor(...BRAND.teal);
    doc.text("WHY MOST FAIL", 22, yPos + 87);
    doc.setTextColor(...BRAND.white);
    doc.text(uc.failure, 22, yPos + 96);
    
    yPos += 115;
  });
  
  // Page 8 - System Prompts Title
  doc.addPage();
  addHeader(doc, 8, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("SECTION 03", 20, 40);
  doc.setFontSize(28);
  doc.setTextColor(...BRAND.white);
  doc.text("Build-Ready", 20, 60);
  doc.text("System Prompt Blocks", 20, 78);
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.muted);
  doc.text("These are SYSTEM prompts, not user prompts.", 20, 100);
  doc.text("They define how your AI behaves, not what it answers.", 20, 115);
  doc.text("Copy. Paste. Deploy.", 20, 135);
  
  // Page 9 - Prompt Block 1
  doc.addPage();
  addHeader(doc, 9, totalPages);
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.teal);
  doc.text("SYSTEM PROMPT BLOCK 01", 20, 35);
  doc.setFontSize(18);
  doc.setTextColor(...BRAND.white);
  doc.text("Wellness Retention Engine", 20, 52);
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, 62, 180, 160, 3, 3, "F");
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.teal);
  doc.text("SYSTEM ROLE:", 22, 75);
  doc.setTextColor(...BRAND.white);
  const role1 = [
    "You are a wellness retention analyst.",
    "Your goal is reducing churn without increasing incentive cost.",
    "You prioritise behavioural nudges over discounts."
  ];
  yPos = 85;
  role1.forEach(line => {
    doc.text(line, 22, yPos);
    yPos += 9;
  });
  
  doc.setTextColor(...BRAND.teal);
  doc.text("INPUTS:", 22, yPos + 5);
  doc.setTextColor(...BRAND.muted);
  yPos += 15;
  const inputs1 = ["- habit_streaks", "- missed_sessions (last 14 days)", "- historical_churn_windows", "- last_intervention_date"];
  inputs1.forEach(line => {
    doc.text(line, 22, yPos);
    yPos += 9;
  });
  
  doc.setTextColor(...BRAND.teal);
  doc.text("RULES:", 22, yPos + 5);
  doc.setTextColor(...BRAND.white);
  yPos += 15;
  const rules1 = [
    "1. Never recommend discounts as first action",
    "2. Prefer behavioural nudges (timing, content, social)",
    "3. Escalate to human only when confidence < 70%",
    "4. Log intervention reason for audit trail"
  ];
  rules1.forEach(line => {
    doc.text(line, 22, yPos);
    yPos += 9;
  });
  
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.teal);
  doc.text("This is architectural prompting. Not ChatGPT conversation.", 22, 235);
  
  // Page 10 - Prompt Block 2
  doc.addPage();
  addHeader(doc, 10, totalPages);
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.teal);
  doc.text("SYSTEM PROMPT BLOCK 02", 20, 35);
  doc.setFontSize(18);
  doc.setTextColor(...BRAND.white);
  doc.text("Coach Prioritisation Assistant", 20, 52);
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, 62, 180, 155, 3, 3, "F");
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.teal);
  doc.text("SYSTEM ROLE:", 22, 75);
  doc.setTextColor(...BRAND.white);
  const role2 = [
    "You help coaches focus on members who need attention most.",
    "You surface urgency, not just activity.",
    "You never replace coach judgement, only inform it."
  ];
  yPos = 85;
  role2.forEach(line => {
    doc.text(line, 22, yPos);
    yPos += 9;
  });
  
  doc.setTextColor(...BRAND.teal);
  doc.text("SCORING MODEL:", 22, yPos + 5);
  doc.setTextColor(...BRAND.muted);
  yPos += 15;
  const scoring = [
    "priority = (churn_risk × 0.4) + (goal_proximity × 0.3)",
    "         + (days_since_contact × 0.2) + (value_tier × 0.1)"
  ];
  scoring.forEach(line => {
    doc.text(line, 22, yPos);
    yPos += 9;
  });
  
  doc.setTextColor(...BRAND.teal);
  doc.text("OUTPUT FORMAT:", 22, yPos + 5);
  doc.setTextColor(...BRAND.white);
  yPos += 15;
  const output = [
    "Return top 10 members with:",
    "- member_id, priority_score, reason, suggested_action",
    "- Never show raw scores to coaches (confuses them)"
  ];
  output.forEach(line => {
    doc.text(line, 22, yPos);
    yPos += 9;
  });
  
  // Page 11 - Data Schema Title
  doc.addPage();
  addHeader(doc, 11, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("SECTION 04", 20, 40);
  doc.setFontSize(28);
  doc.setTextColor(...BRAND.white);
  doc.text("Data Schema", 20, 60);
  doc.text("Templates", 20, 78);
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.muted);
  doc.text("Most teams have never seen wellness data structured properly.", 20, 100);
  doc.text("These schemas are production-ready.", 20, 115);
  
  // Page 12 - Schema 1
  doc.addPage();
  addHeader(doc, 12, totalPages);
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.teal);
  doc.text("SCHEMA 01: USER ENGAGEMENT EVENTS", 20, 35);
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, 45, 180, 120, 3, 3, "F");
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
  yPos = 58;
  schema1.forEach(line => {
    doc.text(line, 22, yPos);
    yPos += 11;
  });
  
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.teal);
  doc.text("Why this matters:", 20, 180);
  doc.setTextColor(...BRAND.white);
  doc.setFontSize(9);
  doc.text("• Consistent event taxonomy = reliable ML training", 20, 192);
  doc.text("• Device/location = personalisation opportunities", 20, 203);
  doc.text("• Streak tracking = retention prediction", 20, 214);
  
  // Page 13 - Schema 2
  doc.addPage();
  addHeader(doc, 13, totalPages);
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.teal);
  doc.text("SCHEMA 02: INTERVENTION TRACKING", 20, 35);
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, 45, 180, 130, 3, 3, "F");
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
  yPos = 58;
  schema2.forEach(line => {
    doc.text(line, 22, yPos);
    yPos += 11;
  });
  
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.teal);
  doc.text("Why this matters:", 20, 195);
  doc.setTextColor(...BRAND.white);
  doc.setFontSize(9);
  doc.text("• Track what works, not just what was sent", 20, 207);
  doc.text("• Model versioning = reproducible experiments", 20, 218);
  doc.text("• Outcome tracking = intervention ROI", 20, 229);
  
  // Page 14 - CTA
  doc.addPage();
  addHeader(doc, 14, totalPages);
  
  doc.setFontSize(22);
  doc.setTextColor(...BRAND.white);
  doc.text("Ready to go deeper?", 105, 90, { align: "center" });
  
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.muted);
  doc.text("Take the AI Readiness Score to benchmark", 105, 120, { align: "center" });
  doc.text("your wellness business against the industry.", 105, 135, { align: "center" });
  
  doc.setFontSize(16);
  doc.setTextColor(...BRAND.teal);
  doc.text("wellnessgenius.io/ai-readiness", 105, 170, { align: "center" });
  
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.muted);
  doc.text("Wellness Genius", 105, 220, { align: "center" });
  doc.text("Operating intelligence for wellness businesses.", 105, 232, { align: "center" });

  return doc;
};

// Engagement → Revenue Translation Framework
export const generateRevenueFramework = (): jsPDF => {
  const doc = new jsPDF();
  
  const pages = [
    { isTitle: true },
    {
      title: "Core Principle",
      content: [
        "Engagement only matters if it changes behaviour.",
        "",
        "Behaviour only matters if it changes outcomes."
      ]
    },
    {
      title: "What to Measure",
      items: [
        "Frequency of meaningful actions",
        "Time-to-habit",
        "Drop-off points",
        "Retention cohorts"
      ],
      warning: "Avoid vanity metrics."
    },
    {
      title: "Translating for Finance",
      before: '"Users loved it"',
      after: '"Users with X behaviour stayed Y% longer"',
      note: "This is the language that travels."
    },
    {
      title: "Common Failure",
      content: [
        "Reporting engagement without action.",
        "",
        "If insight doesn't change behaviour, it's noise."
      ]
    }
  ];

  pages.forEach((page, index) => {
    if (index > 0) doc.addPage();
    addHeader(doc, index + 1, pages.length);

    if (page.isTitle) {
      doc.setFontSize(28);
      doc.setTextColor(...BRAND.white);
      doc.text("Engagement", 105, 90, { align: "center" });
      doc.setFontSize(36);
      doc.setTextColor(...BRAND.teal);
      doc.text("→", 105, 115, { align: "center" });
      doc.setFontSize(28);
      doc.setTextColor(...BRAND.white);
      doc.text("Revenue", 105, 140, { align: "center" });
      doc.setFontSize(16);
      doc.setTextColor(...BRAND.muted);
      doc.text("Translation Framework", 105, 165, { align: "center" });
      doc.setFontSize(10);
      doc.text("Wellness Genius • wellnessgenius.io", 105, 200, { align: "center" });
    } else if (page.items) {
      doc.setFontSize(20);
      doc.setTextColor(...BRAND.white);
      doc.text(page.title || "", 20, 50);
      
      let yPos = 75;
      page.items.forEach(item => {
        doc.setFillColor(...BRAND.cardBg);
        doc.roundedRect(20, yPos - 5, 170, 25, 3, 3, "F");
        doc.setFontSize(14);
        doc.setTextColor(...BRAND.white);
        doc.text("• " + item, 30, yPos + 9);
        yPos += 35;
      });
      
      if (page.warning) {
        doc.setFontSize(12);
        doc.setTextColor(...BRAND.teal);
        doc.text(page.warning, 20, yPos + 10);
      }
    } else if (page.before && page.after) {
      doc.setFontSize(20);
      doc.setTextColor(...BRAND.white);
      doc.text(page.title || "", 20, 50);
      
      // Before box
      doc.setFillColor(...BRAND.cardBg);
      doc.roundedRect(20, 70, 170, 40, 3, 3, "F");
      doc.setFontSize(10);
      doc.setTextColor(...BRAND.muted);
      doc.text("REPLACE:", 30, 85);
      doc.setFontSize(14);
      doc.setTextColor(...BRAND.white);
      doc.text(page.before, 30, 100);
      
      // Arrow
      doc.setFontSize(24);
      doc.setTextColor(...BRAND.teal);
      doc.text("↓", 105, 125, { align: "center" });
      
      // After box
      doc.setFillColor(...BRAND.cardBg);
      doc.roundedRect(20, 135, 170, 40, 3, 3, "F");
      doc.setFontSize(10);
      doc.setTextColor(...BRAND.muted);
      doc.text("WITH:", 30, 150);
      doc.setFontSize(14);
      doc.setTextColor(...BRAND.white);
      doc.text(page.after, 30, 165);
      
      doc.setFontSize(12);
      doc.setTextColor(...BRAND.teal);
      doc.text(page.note || "", 20, 200);
    } else if (page.content) {
      doc.setFontSize(20);
      doc.setTextColor(...BRAND.white);
      doc.text(page.title || "", 105, 80, { align: "center" });
      
      doc.setFontSize(16);
      doc.setTextColor(...BRAND.muted);
      let yPos = 120;
      page.content.forEach(line => {
        doc.text(line, 105, yPos, { align: "center" });
        yPos += 16;
      });
    }
  });

  addCTAPage(doc, pages.length + 1, pages.length + 1);
  return doc;
};

// Build vs Buy: AI in Wellness
export const generateBuildVsBuy = (): jsPDF => {
  const doc = new jsPDF();
  
  const pages = [
    { isTitle: true },
    {
      title: "The Decision Most Teams Avoid",
      content: [
        "Not every AI idea should be built.",
        "",
        "Sometimes the smartest move is:",
        "• partner",
        "• wait",
        "• or not build at all"
      ]
    },
    {
      title: "Build If:",
      items: [
        "The decision is core to your business",
        "You own the data",
        "You can maintain it"
      ]
    },
    {
      title: "Buy If:",
      items: [
        "Speed matters more than control",
        "Differentiation is low"
      ]
    },
    {
      title: "Partner If:",
      items: [
        "The value is shared",
        "The risk is high",
        "The capability is specialist"
      ]
    },
    {
      title: "Don't Build If:",
      items: [
        "The outcome is unclear",
        "The data is weak",
        "The cost is underestimated"
      ],
      isWarning: true
    }
  ];

  pages.forEach((page, index) => {
    if (index > 0) doc.addPage();
    addHeader(doc, index + 1, pages.length);

    if (page.isTitle) {
      doc.setFontSize(28);
      doc.setTextColor(...BRAND.white);
      doc.text("Build vs Buy:", 105, 95, { align: "center" });
      doc.setFontSize(24);
      doc.setTextColor(...BRAND.teal);
      doc.text("AI in Wellness", 105, 120, { align: "center" });
      doc.setFontSize(12);
      doc.setTextColor(...BRAND.muted);
      doc.text("A decision guide for boards and execs", 105, 150, { align: "center" });
      doc.text("Wellness Genius • wellnessgenius.io", 105, 200, { align: "center" });
    } else if (page.items) {
      doc.setFontSize(24);
      if (page.isWarning) {
        doc.setTextColor(255, 100, 100);
      } else {
        doc.setTextColor(...BRAND.teal);
      }
      doc.text(page.title || "", 20, 50);
      
      let yPos = 80;
      page.items.forEach(item => {
        doc.setFillColor(...BRAND.cardBg);
        doc.roundedRect(20, yPos - 5, 170, 30, 3, 3, "F");
        doc.setFontSize(14);
        doc.setTextColor(...BRAND.white);
        doc.text("• " + item, 30, yPos + 12);
        yPos += 40;
      });
    } else if (page.content) {
      doc.setFontSize(20);
      doc.setTextColor(...BRAND.white);
      doc.text(page.title || "", 20, 50);
      
      doc.setFontSize(14);
      doc.setTextColor(...BRAND.muted);
      let yPos = 80;
      page.content.forEach(line => {
        if (line.startsWith("•")) {
          doc.setTextColor(...BRAND.white);
        } else {
          doc.setTextColor(...BRAND.muted);
        }
        doc.text(line, 20, yPos);
        yPos += 14;
      });
    }
  });

  addCTAPage(doc, pages.length + 1, pages.length + 1);
  return doc;
};

// 90-Day AI Activation Playbook - Premium 25-page
export const generateActivationPlaybook = (): jsPDF => {
  const doc = new jsPDF();
  const totalPages = 12;
  
  // Title page
  addHeader(doc, 1, totalPages);
  doc.setFontSize(28);
  doc.setTextColor(...BRAND.white);
  doc.text("90-Day", 105, 90, { align: "center" });
  doc.text("AI Activation Playbook", 105, 115, { align: "center" });
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("A structured programme for wellness leaders", 105, 145, { align: "center" });
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.muted);
  doc.text("Wellness Genius • wellnessgenius.io", 105, 200, { align: "center" });
  
  // Month 1 intro
  doc.addPage();
  addHeader(doc, 2, totalPages);
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.teal);
  doc.text("MONTH 1", 20, 40);
  doc.setFontSize(28);
  doc.setTextColor(...BRAND.white);
  doc.text("Foundations", 20, 60);
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(20, 80, 170, 60, 3, 3, "F");
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.muted);
  const month1Intro = doc.splitTextToSize("No AI yet. This matters. Before you can use AI effectively, you need to understand what you actually have.", 150);
  doc.text(month1Intro, 30, 100);
  
  const month1Tasks = [
    "Define core engagement events",
    "Clean and document data",
    "Clarify consent",
    "Map current decision-making processes",
    "Identify data gaps"
  ];
  
  let yPos = 160;
  month1Tasks.forEach(task => {
    doc.setDrawColor(...BRAND.teal);
    doc.rect(20, yPos - 3, 4, 4);
    doc.setFontSize(12);
    doc.setTextColor(...BRAND.white);
    doc.text(task, 30, yPos);
    yPos += 15;
  });
  
  // Month 2
  doc.addPage();
  addHeader(doc, 3, totalPages);
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.teal);
  doc.text("MONTH 2", 20, 40);
  doc.setFontSize(28);
  doc.setTextColor(...BRAND.white);
  doc.text("Journeys", 20, 60);
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(20, 80, 170, 60, 3, 3, "F");
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.muted);
  const month2Intro = doc.splitTextToSize("Now you understand your data, map how users actually move through your product or service.", 150);
  doc.text(month2Intro, 30, 100);
  
  const month2Tasks = [
    "Design onboarding and reactivation flows",
    "Introduce meaningful segmentation",
    "Test one hypothesis at a time",
    "Measure what matters, not everything",
    "Document learnings"
  ];
  
  yPos = 160;
  month2Tasks.forEach(task => {
    doc.setDrawColor(...BRAND.teal);
    doc.rect(20, yPos - 3, 4, 4);
    doc.setFontSize(12);
    doc.setTextColor(...BRAND.white);
    doc.text(task, 30, yPos);
    yPos += 15;
  });
  
  // Month 3
  doc.addPage();
  addHeader(doc, 4, totalPages);
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.teal);
  doc.text("MONTH 3", 20, 40);
  doc.setFontSize(28);
  doc.setTextColor(...BRAND.white);
  doc.text("Monetisation", 20, 60);
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(20, 80, 170, 60, 3, 3, "F");
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.muted);
  const month3Intro = doc.splitTextToSize("Connect engagement to outcomes. If you can't link behaviour to revenue or retention, you're guessing.", 150);
  doc.text(month3Intro, 30, 100);
  
  const month3Tasks = [
    "Link engagement to outcomes",
    "Test one revenue lever",
    "Measure impact conservatively",
    "Build the business case",
    "Plan next quarter"
  ];
  
  yPos = 160;
  month3Tasks.forEach(task => {
    doc.setDrawColor(...BRAND.teal);
    doc.rect(20, yPos - 3, 4, 4);
    doc.setFontSize(12);
    doc.setTextColor(...BRAND.white);
    doc.text(task, 30, yPos);
    yPos += 15;
  });
  
  // Success Criteria
  doc.addPage();
  addHeader(doc, 5, totalPages);
  doc.setFontSize(20);
  doc.setTextColor(...BRAND.white);
  doc.text("Success Criteria", 105, 80, { align: "center" });
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(30, 100, 150, 40, 3, 3, "F");
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.muted);
  doc.text('Not "we launched AI"', 105, 115, { align: "center" });
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text('But "we made better decisions faster"', 105, 130, { align: "center" });
  
  addCTAPage(doc, 6, totalPages);
  
  return doc;
};

// Wellness Engagement Systems Playbook - £79
export const generateEngagementPlaybook = (): jsPDF => {
  const doc = new jsPDF();
  const totalPages = 12;
  
  // Page 1 - Cover
  addHeader(doc, 1, totalPages);
  doc.setFontSize(28);
  doc.setTextColor(...BRAND.white);
  doc.text("Wellness Engagement", 105, 80, { align: "center" });
  doc.text("Systems Playbook", 105, 100, { align: "center" });
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("Operating systems, not best practices.", 105, 125, { align: "center" });
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.muted);
  doc.text("This replaces intuition with logic.", 105, 145, { align: "center" });
  doc.setFontSize(10);
  doc.text("Wellness Genius • wellnessgenius.io", 105, 200, { align: "center" });
  
  // Page 2 - What's Inside
  doc.addPage();
  addHeader(doc, 2, totalPages);
  doc.setFontSize(22);
  doc.setTextColor(...BRAND.white);
  doc.text("What's Inside", 20, 40);
  
  const contents = [
    { num: "01", title: "The Habit → Outcome Map", desc: "How behaviour translates to commercial value" },
    { num: "02", title: "The Intervention Ladder", desc: "What to do before you burn margin on incentives" },
    { num: "03", title: "Journey Blueprints", desc: "Ready-to-use IF/THEN logic for engagement systems" },
  ];
  
  let yPos = 65;
  contents.forEach(item => {
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(15, yPos - 5, 180, 40, 3, 3, "F");
    doc.setFontSize(24);
    doc.setTextColor(...BRAND.teal);
    doc.text(item.num, 25, yPos + 18);
    doc.setFontSize(14);
    doc.setTextColor(...BRAND.white);
    doc.text(item.title, 55, yPos + 12);
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.muted);
    doc.text(item.desc, 55, yPos + 26);
    yPos += 52;
  });
  
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.teal);
  doc.text("This is how wellness platforms retain members profitably.", 105, 240, { align: "center" });
  
  // Page 3 - Habit → Outcome Map Title
  doc.addPage();
  addHeader(doc, 3, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("SECTION 01", 20, 40);
  doc.setFontSize(28);
  doc.setTextColor(...BRAND.white);
  doc.text("The Habit → Outcome", 20, 60);
  doc.text("Map", 20, 78);
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.muted);
  doc.text("This is the missing link in wellness tech.", 20, 100);
  doc.text("How user behaviours translate into commercial outcomes.", 20, 115);
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, 135, 180, 100, 3, 3, "F");
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.teal);
  doc.text("THE TRANSLATION CHAIN", 25, 150);
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.white);
  
  const chain = [
    "Activity (sessions, check-ins, interactions)",
    "      ↓",
    "Consistency (streaks, frequency, habit formation)",
    "      ↓",
    "Recovery (return after drop-off, re-engagement)",
    "      ↓",
    "Commercial Outcomes (retention, upsell, sponsor value)"
  ];
  yPos = 165;
  chain.forEach(line => {
    if (line.includes("↓")) {
      doc.setTextColor(...BRAND.teal);
    } else {
      doc.setTextColor(...BRAND.white);
    }
    doc.text(line, 25, yPos);
    yPos += 12;
  });
  
  // Page 4 - Outcome Map Detail
  doc.addPage();
  addHeader(doc, 4, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("BEHAVIOUR → VALUE TRANSLATION", 20, 35);
  
  const translations = [
    { behaviour: "Activity", metric: "Session frequency, class bookings", outcome: "Baseline engagement health" },
    { behaviour: "Consistency", metric: "Streak length, weekly active rate", outcome: "Retention prediction (+15-30%)" },
    { behaviour: "Recovery", metric: "Re-engagement after 7+ days", outcome: "Churn rescue opportunity" },
    { behaviour: "Drop-off", metric: "Missed sessions, broken streaks", outcome: "Early warning signals" },
  ];
  
  yPos = 50;
  translations.forEach((t, i) => {
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(15, yPos, 180, 50, 3, 3, "F");
    doc.setFontSize(12);
    doc.setTextColor(...BRAND.teal);
    doc.text(t.behaviour.toUpperCase(), 22, yPos + 14);
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.muted);
    doc.text("Metric: " + t.metric, 22, yPos + 28);
    doc.setTextColor(...BRAND.white);
    doc.text("→ " + t.outcome, 22, yPos + 42);
    yPos += 58;
  });
  
  // Page 5 - Intervention Ladder Title
  doc.addPage();
  addHeader(doc, 5, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("SECTION 02", 20, 40);
  doc.setFontSize(28);
  doc.setTextColor(...BRAND.white);
  doc.text("The Intervention", 20, 60);
  doc.text("Ladder", 20, 78);
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.muted);
  doc.text("Most platforms jump to discounts and burn margin.", 20, 100);
  doc.text("This ladder forces you to try everything else first.", 20, 115);
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, 135, 180, 30, 3, 3, "F");
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.white);
  doc.text("Rule: Only escalate when the previous rung fails.", 25, 153);
  
  // Page 6 - Intervention Ladder Detail
  doc.addPage();
  addHeader(doc, 6, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("THE 5-RUNG LADDER", 20, 35);
  
  const rungs = [
    { num: "1", name: "Notification Timing", desc: "Move send times to match peak engagement windows. Cost: £0" },
    { num: "2", name: "Content Swap", desc: "Replace generic content with personalised alternatives. Cost: £0" },
    { num: "3", name: "Social Proof", desc: "Show peer activity, community momentum, shared goals. Cost: £0" },
    { num: "4", name: "Goal Re-framing", desc: "Adjust targets to feel achievable. Micro-wins > big failures. Cost: £0" },
    { num: "5", name: "Incentives (Last Resort)", desc: "Rewards, discounts, prizes. High cost. Use sparingly." },
  ];
  
  yPos = 50;
  rungs.forEach((rung, i) => {
    const isLast = i === rungs.length - 1;
    doc.setFillColor(...BRAND.cardBg);
    doc.roundedRect(15, yPos, 180, 42, 3, 3, "F");
    doc.setFontSize(20);
    doc.setTextColor(...(isLast ? [255, 180, 100] as [number, number, number] : BRAND.teal));
    doc.text(rung.num, 25, yPos + 25);
    doc.setFontSize(12);
    doc.setTextColor(...BRAND.white);
    doc.text(rung.name, 45, yPos + 15);
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.muted);
    const descLines = doc.splitTextToSize(rung.desc, 140);
    doc.text(descLines, 45, yPos + 28);
    yPos += 47;
  });
  
  // Page 7 - Why Ladder Matters
  doc.addPage();
  addHeader(doc, 7, totalPages);
  doc.setFontSize(16);
  doc.setTextColor(...BRAND.white);
  doc.text("Why This Ladder Matters", 105, 50, { align: "center" });
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(20, 70, 170, 60, 3, 3, "F");
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.teal);
  doc.text("THE PROBLEM", 30, 85);
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.white);
  doc.text("Most platforms skip straight to Rung 5.", 30, 100);
  doc.setTextColor(...BRAND.muted);
  doc.text("They burn margin on discounts before trying free options.", 30, 115);
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(20, 145, 170, 60, 3, 3, "F");
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.teal);
  doc.text("THE RESULT", 30, 160);
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.white);
  doc.text("Members expect discounts to stay.", 30, 175);
  doc.setTextColor(...BRAND.muted);
  doc.text("LTV decreases. Retention becomes transactional.", 30, 190);
  
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("The ladder forces discipline. Exhaust cheap before expensive.", 105, 230, { align: "center" });
  
  // Page 8 - Journey Blueprints Title
  doc.addPage();
  addHeader(doc, 8, totalPages);
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.teal);
  doc.text("SECTION 03", 20, 40);
  doc.setFontSize(28);
  doc.setTextColor(...BRAND.white);
  doc.text("Journey Blueprints", 20, 60);
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.muted);
  doc.text("Ready-to-use IF/THEN logic.", 20, 85);
  doc.text("This is not prose. It's operating code.", 20, 100);
  
  // Page 9 - Blueprint 1
  doc.addPage();
  addHeader(doc, 9, totalPages);
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.teal);
  doc.text("BLUEPRINT 01: MISSED SESSION RE-ENGAGEMENT", 20, 35);
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, 45, 180, 140, 3, 3, "F");
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.muted);
  
  const blueprint1 = [
    "IF user misses 2 sessions in 7 days",
    "AND habit_score < 60",
    "AND last_intervention > 14 days ago",
    "THEN:",
    "  1. Wait 24 hours (avoid seeming needy)",
    "  2. Send personalised content based on preferences",
    "  3. IF no response in 48 hours:",
    "     → Try different channel (push → email → SMS)",
    "  4. IF still no response:",
    "     → Flag for coach review (do not discount)",
    "",
    "SUCCESS = session completed within 7 days",
    "FAILURE = no session → escalate to Ladder Rung 3"
  ];
  yPos = 60;
  blueprint1.forEach(line => {
    if (line.startsWith("IF") || line.startsWith("AND") || line.startsWith("THEN")) {
      doc.setTextColor(...BRAND.teal);
    } else if (line.startsWith("SUCCESS") || line.startsWith("FAILURE")) {
      doc.setTextColor(...BRAND.white);
    } else {
      doc.setTextColor(...BRAND.muted);
    }
    doc.text(line, 25, yPos);
    yPos += 10;
  });
  
  // Page 10 - Blueprint 2
  doc.addPage();
  addHeader(doc, 10, totalPages);
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.teal);
  doc.text("BLUEPRINT 02: UPSELL TIMING ENGINE", 20, 35);
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, 45, 180, 130, 3, 3, "F");
  
  const blueprint2 = [
    "IF user completes 7-day streak",
    "AND engagement_trend = 'increasing'",
    "AND has NOT seen upsell in last 30 days",
    "THEN:",
    "  1. Present relevant upgrade at session end",
    "  2. Frame as 'you've earned this' not 'buy now'",
    "  3. Use social proof from similar users",
    "",
    "TIMING RULE:",
    "  Present AFTER achievement, NEVER during session",
    "",
    "ANTI-PATTERN:",
    "  Showing upsell after missed sessions (kills trust)"
  ];
  yPos = 60;
  blueprint2.forEach(line => {
    if (line.startsWith("IF") || line.startsWith("AND") || line.startsWith("THEN")) {
      doc.setTextColor(...BRAND.teal);
    } else if (line.startsWith("TIMING") || line.startsWith("ANTI-PATTERN")) {
      doc.setTextColor(...BRAND.white);
    } else {
      doc.setTextColor(...BRAND.muted);
    }
    doc.text(line, 25, yPos);
    yPos += 10;
  });
  
  // Page 11 - Blueprint 3
  doc.addPage();
  addHeader(doc, 11, totalPages);
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.teal);
  doc.text("BLUEPRINT 03: CHURN RISK ESCALATION", 20, 35);
  
  doc.setFillColor(...BRAND.cardBg);
  doc.roundedRect(15, 45, 180, 155, 3, 3, "F");
  
  const blueprint3 = [
    "IF days_since_last_session > 14",
    "AND churn_probability > 0.6",
    "AND member_tenure > 30 days",
    "THEN:",
    "  1. Trigger Ladder Rung 1 (timing optimisation)",
    "  2. Wait 3 days, measure response",
    "  3. IF no response → Rung 2 (content swap)",
    "  4. Wait 3 days, measure response",
    "  5. IF no response → Rung 3 (social proof)",
    "  6. IF still no response after 14 days:",
    "     → Coach outreach (human touch)",
    "",
    "NEVER:",
    "  Jump to discounts without exhausting ladder",
    "  The member who needs discounts to stay won't stay"
  ];
  yPos = 58;
  blueprint3.forEach(line => {
    if (line.startsWith("IF") || line.startsWith("AND") || line.startsWith("THEN")) {
      doc.setTextColor(...BRAND.teal);
    } else if (line.startsWith("NEVER")) {
      doc.setTextColor(255, 150, 150);
    } else {
      doc.setTextColor(...BRAND.muted);
    }
    doc.text(line, 25, yPos);
    yPos += 10;
  });
  
  // Page 12 - CTA
  doc.addPage();
  addHeader(doc, 12, totalPages);
  
  doc.setFontSize(22);
  doc.setTextColor(...BRAND.white);
  doc.text("Ready to diagnose your gaps?", 105, 90, { align: "center" });
  
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.muted);
  doc.text("Take the AI Readiness Score to benchmark", 105, 120, { align: "center" });
  doc.text("your engagement systems against the industry.", 105, 135, { align: "center" });
  
  doc.setFontSize(16);
  doc.setTextColor(...BRAND.teal);
  doc.text("wellnessgenius.io/ai-readiness", 105, 170, { align: "center" });
  
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.muted);
  doc.text("Wellness Genius", 105, 220, { align: "center" });
  doc.text("Operating intelligence for wellness businesses.", 105, 232, { align: "center" });

  return doc;
};

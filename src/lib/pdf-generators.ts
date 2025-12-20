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

// Wellness AI Builder – Prompt Pack
export const generatePromptPack = (): jsPDF => {
  const doc = new jsPDF();
  
  const pages = [
    {
      isTitle: true,
      title: "Wellness AI Builder",
      subtitle: "Prompt Pack"
    },
    {
      isIntro: true,
      content: [
        "Most AI projects fail because they start with",
        "technology instead of decisions.",
        "",
        "This prompt pack exists to force clarity",
        "before you build anything.",
        "",
        "Use it slowly.",
        "Rushing defeats the purpose."
      ]
    },
    {
      prompt: "Prompt 1",
      title: "One-Sentence Purpose",
      question: "What is the single decision this AI tool should make easier, faster, or safer?",
      warning: "If you cannot answer this clearly, stop."
    },
    {
      prompt: "Prompt 2",
      title: "User × Decision Map",
      question: "Who uses this system, and what decision do they currently make with instinct or incomplete data?",
      warning: "If the decision isn't real, the tool won't be either."
    },
    {
      prompt: "Prompt 3",
      title: "Data Reality Check",
      question: "What data do we ACTUALLY have today that is clean, consented, and trusted?",
      warning: "Exclude: planned data, hypothetical integrations. Build for reality, not roadmaps."
    },
    {
      prompt: "Prompt 4",
      title: "Use-Case Filter",
      question: "Does this AI reduce cost, increase retention, speed decisions, or reduce risk?",
      warning: "If none apply, this is a demo."
    },
    {
      prompt: "Prompt 5",
      title: "Monetisation First",
      question: "If this works perfectly, where does money move?",
      warning: "If money doesn't move, value is unclear."
    },
    {
      prompt: "Prompt 6",
      title: "Governance Stress Test",
      question: "What would a regulator, customer, or journalist criticise?",
      warning: "Design around that criticism now."
    }
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
      doc.text(page.subtitle || "", 105, 125, { align: "center" });
      doc.setFontSize(10);
      doc.setTextColor(...BRAND.muted);
      doc.text("Force clarity before you build anything.", 105, 160, { align: "center" });
      doc.text("Wellness Genius • wellnessgenius.io", 105, 200, { align: "center" });
    } else if (page.isIntro) {
      doc.setFontSize(16);
      doc.setTextColor(...BRAND.white);
      let yPos = 80;
      page.content?.forEach(line => {
        doc.text(line, 105, yPos, { align: "center" });
        yPos += 14;
      });
    } else {
      // Prompt page
      doc.setFontSize(12);
      doc.setTextColor(...BRAND.teal);
      doc.text(page.prompt || "", 20, 40);
      
      doc.setFontSize(24);
      doc.setTextColor(...BRAND.white);
      doc.text(page.title || "", 20, 60);
      
      // Question box
      doc.setFillColor(...BRAND.cardBg);
      doc.roundedRect(20, 80, 170, 60, 3, 3, "F");
      
      doc.setFontSize(10);
      doc.setTextColor(...BRAND.teal);
      doc.text("THE QUESTION", 30, 95);
      
      doc.setFontSize(14);
      doc.setTextColor(...BRAND.white);
      const questionLines = doc.splitTextToSize(page.question || "", 150);
      doc.text(questionLines, 30, 112);
      
      // Warning
      doc.setFontSize(12);
      doc.setTextColor(...BRAND.muted);
      const warningLines = doc.splitTextToSize(page.warning || "", 170);
      doc.text(warningLines, 20, 165);
    }
  });

  // CTA page
  addCTAPage(doc, pages.length + 1, pages.length + 1);

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

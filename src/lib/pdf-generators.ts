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

// Download helper
export const downloadPDF = (doc: jsPDF, filename: string) => {
  doc.save(filename);
};

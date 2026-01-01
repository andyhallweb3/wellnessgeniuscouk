import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What exactly does the AI Advisor do?",
    answer:
      "It's like having a strategic business consultant available 24/7. Ask it anything about your wellness business — pricing decisions, retention strategies, competitor analysis, 90-day planning. It remembers your business context and gives tailored advice, not generic answers.",
  },
  {
    question: "How is this different from ChatGPT?",
    answer:
      "Three key differences: (1) It's trained specifically on wellness industry data, benchmarks, and best practices. (2) It remembers your business context across sessions — your size, goals, challenges. (3) It has 8 specialised modes for different tasks, from quick questions to board-ready analysis.",
  },
  {
    question: "What can I do with 10 free credits?",
    answer:
      "Enough to properly test the product. You could do 10 quick questions, 5 daily briefings, or 2 deep decision analyses. Most users know within 3-4 uses whether it's valuable for them. No credit card required to start.",
  },
  {
    question: "Do credits expire?",
    answer:
      "No. Credits never expire. Buy them when you need them, use them when you're ready. There's no subscription, no monthly fee, and no pressure to use them by a certain date.",
  },
  {
    question: "Is my business data secure?",
    answer:
      "Yes. Your data is encrypted, never shared with third parties, and never used to train AI models. You can delete your business memory at any time. We're GDPR compliant and take data privacy seriously.",
  },
  {
    question: "Who is this for — and who is it NOT for?",
    answer:
      "It's for wellness operators (gyms, spas, studios, wellness brands) who want strategic guidance without hiring consultants. It's NOT for people looking for basic fitness advice, marketing automation tools, or booking software. This is a thinking partner, not an execution tool.",
  },
  {
    question: "What if I need more hands-on help?",
    answer:
      "That's what our consulting services are for. We offer AI Readiness Sprints (from £1,500), team training, and custom AI agent builds. Book a call and we'll figure out the right level of support for your situation.",
  },
  {
    question: "Can I try before committing to consulting?",
    answer:
      "Absolutely. Start with the free AI Readiness Assessment and 10 free Advisor credits. If you find value, you can buy more credits or book a discovery call. No pressure, no sales tactics.",
  },
];

const FAQSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-wide">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">
              Common Questions
            </p>
            <h2 className="text-3xl lg:text-4xl mb-4 tracking-tight">
              Frequently asked questions
            </h2>
            <p className="text-muted-foreground text-lg">
              Quick answers to the questions we hear most often.
            </p>
          </div>

          {/* FAQ Accordion */}
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-border">
                <AccordionTrigger className="text-left hover:text-accent">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Still have questions */}
          <div className="mt-12 text-center p-6 rounded-xl bg-card border border-border">
            <p className="font-medium mb-2">Still have questions?</p>
            <p className="text-sm text-muted-foreground mb-4">
              Book a free 15-minute call and we'll answer anything.
            </p>
            <a
              href="#contact"
              className="text-accent hover:underline text-sm font-medium"
            >
              Book a call →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;

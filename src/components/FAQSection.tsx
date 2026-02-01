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
              Get instant answers on Telegram or book a call.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="https://t.me/Wellnessgenius_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0088cc]/10 border border-[#0088cc]/30 text-[#0088cc] hover:bg-[#0088cc]/20 transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                Chat on Telegram
              </a>
              <span className="text-muted-foreground hidden sm:inline">or</span>
              <a
                href="#contact"
                className="text-accent hover:underline text-sm font-medium"
              >
                Book a call →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;

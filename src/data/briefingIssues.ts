/**
 * Andy's Briefing: archive of Andy Hall's LinkedIn newsletter "Wellness, Web3 and AI".
 * Newsletter: https://www.linkedin.com/newsletters/wellness-web3-and-ai-7063427227111038976
 *
 * This file is the single source for the archive and for repurposed content later
 * (audio snippets, quote cards, social posts). Add one object per issue.
 * Only use real LinkedIn URLs. Leave optional fields out if you do not have them.
 */
export interface BriefingIssue {
  slug: string;              // URL id, e.g. "wellness-web3-ai-news-round-up-2024-06"
  title: string;
  date: string;              // ISO date, e.g. "2024-06-28"
  summary: string;
  linkedinUrl: string;       // real LinkedIn article URL
  sectors?: string[];        // sector slugs from src/data/sectors.ts
  tags?: string[];
  audioUrl?: string;         // optional audio snippet (mp3/m4a URL)
  audioTitle?: string;
  keyTakeaways?: string[];   // spin-off content: bullet takeaways
  quotes?: string[];         // spin-off content: pull quotes for social cards
  repurposed?: { channel: string; text: string; url?: string }[]; // spin-off posts
}

export const LINKEDIN_NEWSLETTER_URL =
  "https://www.linkedin.com/newsletters/wellness-web3-and-ai-7063427227111038976";

export const BRIEFING_ISSUES: BriefingIssue[] = [
  {
    slug: "recovery-circuit-hotel-wellness-standard",
    title: "The Recovery Circuit Is Becoming the New Hotel Wellness Standard",
    date: "2026-10-12",
    summary: "Cold, oxygen and light are moving from the spa menu into one guest programme.",
    linkedinUrl: "https://www.linkedin.com/pulse/recovery-circuit-becoming-new-hotel-wellness-standard-andy-hall-ycm6e",
    sectors: ["hotels-spas"],
  },
  {
    slug: "hyperbaric-boardroom-decision",
    title: "The Room That Makes Hyperbaric a Boardroom Decision, Not a Clinical One",
    date: "2026-09-09",
    summary: "Why hyperbaric oxygen is following cryo and red light into hospitality and fitness, and what that means for investment decisions.",
    linkedinUrl: "https://www.linkedin.com/pulse/room-makes-hyperbaric-boardroom-decision-clinical-one-andy-hall-z6xpe",
    sectors: ["hotels-spas", "clinics", "fitness"],
  },
  {
    slug: "hotels-wellness-membership-business",
    title: "Hotels are turning wellness into a membership business",
    date: "2026-08-11",
    summary: "Sheraton Stockholm's renovation as a preview of where premium hospitality wellness is heading.",
    linkedinUrl: "https://www.linkedin.com/pulse/hotels-turning-wellness-membership-business-andy-hall-toaje",
    sectors: ["hotels-spas", "country-clubs"],
  },
  {
    slug: "three-modalities-sequence",
    title: "Three modalities are not the product. The sequence is.",
    date: "2026-06-22",
    summary: "Lessons from months of conferences, buyer events and site visits with fitness and wellness operators.",
    linkedinUrl: "https://www.linkedin.com/pulse/three-modalities-product-sequence-andy-hall-83tpe",
    sectors: ["fitness", "hotels-spas", "clinics"],
  },
  {
    slug: "wellness-retention-problem",
    title: "Wellness Has a Retention Problem, Not an Engagement Problem",
    date: "2026-02-23",
    summary: "The fitness industry does not have an engagement crisis. It has a retention economics problem.",
    linkedinUrl: "https://www.linkedin.com/pulse/wellness-has-retention-problemnot-engagement-problem-andy-hall-ss5ge",
    sectors: ["fitness", "country-clubs"],
  },
  {
    slug: "openai-health-play",
    title: "OpenAI's Health Play: What ChatGPT Health Means for Operators and Consumers",
    date: "2026-01-12",
    summary: "What ChatGPT Health could mean for wellness operators and their customers.",
    linkedinUrl: "https://www.linkedin.com/pulse/openais-health-play-what-chatgpt-means-operators-consumers-andy-hall-eh4me",
    sectors: ["clinics", "fitness"],
  },
  {
    slug: "new-year-ai-strategy-gift",
    title: "Happy New Year: A Wellness Genius Gift to Kickstart Your 2025 AI Strategy",
    date: "2026-01-03",
    summary: "Most wellness operators want to use AI. Few know where to start.",
    linkedinUrl: "https://www.linkedin.com/pulse/happy-new-year-wellness-genius-gift-kickstart-your-2025-andy-hall-2upbe",
  },
  {
    slug: "ai-wellness-experimentation-to-execution",
    title: "AI, Wellness and the Shift from Experimentation to Execution",
    date: "2025-12-29",
    summary: "What the week's AI, fitness, fintech and health signals say about where the industry is heading.",
    linkedinUrl: "https://www.linkedin.com/pulse/ai-wellness-shift-from-experimentation-execution-andy-hall-zipje",
  },
  {
    slug: "wellness-web3-ai-news-round-up-2024-06",
    title: "Wellness Web3 and AI: Latest News Round-Up",
    date: "2024-06-28",
    summary: "A round-up of the month's stories across wellness, Web3 and AI.",
    linkedinUrl: "https://www.linkedin.com/pulse/wellness-web3-ai-latest-news-round-up-andy-hall-l6ore",
  },
];

export const getIssue = (slug?: string) => BRIEFING_ISSUES.find((i) => i.slug === slug);
export const sortedIssues = () => [...BRIEFING_ISSUES].sort((a, b) => b.date.localeCompare(a.date));

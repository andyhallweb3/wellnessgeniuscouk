export interface Sector {
  slug: string;
  name: string;
  headline: string;
  intro: string;
  challenges: string[];
  resources: { label: string; href: string; description: string }[];
}

const common = {
  readiness: { label: "AI Readiness Score", href: "/ai-readiness", description: "Free 10 minute assessment. See where you stand on data, people, process and risk." },
  privacy: { label: "Privacy Readiness Check", href: "/privacy-readiness", description: "Check how ready you are to use guest and member data with AI safely." },
  news: { label: "News and Operator Intel", href: "/news", description: "The week's wellness, hospitality and AI news, filtered for operators." },
  articles: { label: "Articles", href: "/insights", description: "Practical articles on AI, engagement and operations." },
  briefing: { label: "Andy's Briefing", href: "/briefing", description: "Archive of Andy Hall's LinkedIn newsletter issues." },
  resources: { label: "Free playbooks and downloads", href: "/resources", description: "Checklists, decks and guides. Free with your email." },
};

export const SECTORS: Sector[] = [
  {
    slug: "hotels-spas",
    name: "Hotels & Spas",
    headline: "AI and wellness intelligence for hotels and spas",
    intro: "Free briefings and tools for hotel, resort and spa leaders who want wellness to drive bookings, spend and loyalty.",
    challenges: [
      "Turning spa and wellness into a reason to book, not just an amenity",
      "Using guest data well without breaking trust or GDPR",
      "Knowing which AI tools are worth piloting this year",
    ],
    resources: [common.readiness, common.privacy, common.briefing, common.news, common.resources],
  },
  {
    slug: "fitness",
    name: "Fitness Operators",
    headline: "AI and engagement intelligence for gyms and studios",
    intro: "Free resources for gym, studio and leisure operators focused on retention, engagement and smarter operations.",
    challenges: [
      "Spotting members who are drifting before they cancel",
      "Getting value from engagement, rewards and gamification",
      "Cutting admin time without losing the personal touch",
    ],
    resources: [common.readiness, common.resources, common.articles, common.news, common.briefing],
  },
  {
    slug: "clinics",
    name: "Wellness Clinics",
    headline: "AI intelligence for wellness and longevity clinics",
    intro: "Free briefings for clinic owners and medical wellness teams weighing up new technology, data and patient journeys.",
    challenges: [
      "Handling sensitive health data responsibly",
      "Deciding which recovery and longevity technologies to invest in",
      "Keeping patients engaged between visits",
    ],
    resources: [common.privacy, common.readiness, common.briefing, common.news, common.articles],
  },
  {
    slug: "country-clubs",
    name: "Country Clubs",
    headline: "Wellness and AI intelligence for country and private clubs",
    intro: "Free resources for club managers building wellness offers that grow membership value and member engagement.",
    challenges: [
      "Growing wellness as a membership benefit and revenue line",
      "Engaging members across golf, leisure, spa and dining",
      "Making sense of member data spread across systems",
    ],
    resources: [common.readiness, common.resources, common.briefing, common.news, common.privacy],
  },
];

export const getSector = (slug?: string) => SECTORS.find((s) => s.slug === slug);

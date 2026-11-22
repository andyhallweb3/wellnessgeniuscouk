import type { RSSFeed } from './news-logic.ts';

export const RSS_FEEDS: RSSFeed[] = [
  // === SECTOR SOURCES (added Oct 2026, each verified to return RSS) ===
  // Hotels & Spas
  { url: 'https://www.hospitalitynet.org/news/global.xml', category: 'Hospitality', sourceName: 'Hospitality Net', sectors: ['hotels-spas'] },
  { url: 'https://hoteldesigns.net/feed/', category: 'Hospitality', sourceName: 'Hotel Designs', sectors: ['hotels-spas'] },
  { url: 'https://www.hotelowner.co.uk/feed/', category: 'Hospitality', sourceName: 'Hotel Owner', sectors: ['hotels-spas'] },
  { url: 'https://www.hoteliermiddleeast.com/feed', category: 'Hospitality', sourceName: 'Hotelier Middle East', sectors: ['hotels-spas'] },
  { url: 'https://www.globalwellnesssummit.com/feed/', category: 'Wellness', sourceName: 'Global Wellness Summit', sectors: ['hotels-spas', 'clinics'] },
  { url: 'https://news.google.com/rss/search?q=%22hotel+spa%22+OR+%22wellness+resort%22&hl=en-GB&gl=GB&ceid=GB:en', category: 'Hospitality', sourceName: 'Google News: hotel spa', sectors: ['hotels-spas'], maxAgeDays: 21 },
  // Wellness Clinics
  { url: 'https://www.aestheticsjournal.com/rss', category: 'Clinics', sourceName: 'Aesthetics Journal', sectors: ['clinics'] },
  { url: 'https://www.aestheticmed.co.uk/rss', category: 'Clinics', sourceName: 'Aesthetic Medicine' }, // keyword-tagged: mixes beauty and clinic news
  { url: 'https://www.lifespan.io/feed/', category: 'Clinics', sourceName: 'Lifespan.io', sectors: ['clinics'] },
  { url: 'https://news.google.com/rss/search?q=%22medspa%22+OR+%22med+spa%22+OR+%22longevity+clinic%22&hl=en-GB&gl=GB&ceid=GB:en', category: 'Clinics', sourceName: 'Google News: clinics', sectors: ['clinics'], maxAgeDays: 21 },
  // Country Clubs
  { url: 'https://clubandresortbusiness.com/feed/', category: 'Clubs', sourceName: 'Club + Resort Business', sectors: ['country-clubs'] },
  { url: 'https://news.google.com/rss/search?q=%28%22country+club%22+OR+%22private+club%22%29+%28membership+OR+%22club+manager%22+OR+%22general+manager%22+OR+clubhouse%29+-college+-university+-NCAA&hl=en-GB&gl=GB&ceid=GB:en', category: 'Clubs', sourceName: 'Google News: country clubs', sectors: ['country-clubs'], maxAgeDays: 21 },

  // === OPERATOR & B2B FOCUSED (Priority Sources) ===
  
  // Fitness Industry Trade (Gyms, Health Clubs, Studios)
  // HCM Magazine removed Nov 2026: hcmmag.com/feed/ returns HTTP 500, never wrote a row, and Google News does not index the site.
  { url: 'https://clubindustry.com/rss.xml', category: 'Fitness', sourceName: 'Club Industry', sectors: ['fitness'] },
  { url: 'https://athletechnews.com/feed/', category: 'Fitness', sourceName: 'Athletech News', sectors: ['fitness'] },
  { url: 'https://www.athleticbusiness.com/rss', category: 'Fitness', sourceName: 'Athletic Business', sectors: ['fitness'] },
  { url: 'https://insider.fitt.co/rss/', category: 'Fitness', sourceName: 'Fitt Insider', sectors: ['fitness'] },
  
  // Spa & Wellness Industry Trade
  // Spa Business's own feed (spabusiness.com/rss) returns HTTP 500 and has never written a row; read it via Google News instead.
  // Spa Foresight (spaforesight.com) is a static trends site from the same publisher with no RSS feed; its coverage appears on spabusiness.com.
  { url: 'https://news.google.com/rss/search?q=site:spabusiness.com+when:14d&hl=en-GB&gl=GB&ceid=GB:en', category: 'Wellness', sourceName: 'Spa Business', sectors: ['hotels-spas'], maxAgeDays: 21 },
  { url: 'https://europeanspamagazine.com/feed/', category: 'Wellness', sourceName: 'European Spa', sectors: ['hotels-spas'] }, // added Nov 2026, verified RSS
  { url: 'https://globalwellnessinstitute.org/feed/', category: 'Wellness', sourceName: 'Global Wellness Institute', sectors: ['hotels-spas', 'clinics'] },
  { url: 'https://longevity.technology/news/feed/', category: 'Wellness', sourceName: 'Longevity Technology' },
  
  // Hospitality & Hotels
  { url: 'https://skift.com/feed/', category: 'Hospitality', sourceName: 'Skift' },
  { url: 'https://www.hotelmanagement.net/rss.xml', category: 'Hospitality', sourceName: 'Hotel Management', sectors: ['hotels-spas'] },
  { url: 'https://www.phocuswire.com/rss.xml', category: 'Hospitality', sourceName: 'Phocuswire' },
  { url: 'https://www.travelextra.ie/feed/', category: 'Hospitality', sourceName: 'Travel Extra', strongTagsOnly: true, skipTitle: /^TODAY from TRAVEL Extra/i }, // added Nov 2026, verified RSS; general travel, so keyword-tagged
  
  // Corporate Wellness & HR
  { url: 'https://www.benefitnews.com/feed', category: 'Corporate Wellness', sourceName: 'Employee Benefit News' },
  { url: 'https://www.hrdive.com/feeds/news/', category: 'Corporate Wellness', sourceName: 'HR Dive' },
  { url: 'https://www.shrm.org/rss/pages/rss.aspx', category: 'Corporate Wellness', sourceName: 'SHRM' },
  
  // === AI & TECH (Curated for Business Value) ===
  { url: 'https://techcrunch.com/category/artificial-intelligence/feed/', category: 'AI', sourceName: 'TechCrunch' },
  { url: 'https://venturebeat.com/category/ai/feed/', category: 'AI', sourceName: 'VentureBeat' },
  { url: 'https://www.technologyreview.com/feed/', category: 'Technology', sourceName: 'MIT Tech Review' },
  { url: 'https://blog.google/technology/ai/rss/', category: 'AI', sourceName: 'Google AI' },
  
  // Health Tech & Digital Health
  { url: 'https://www.mobihealthnews.com/feed', category: 'Technology', sourceName: 'MobiHealthNews' },
  { url: 'https://www.healthcareitnews.com/rss.xml', category: 'Technology', sourceName: 'Healthcare IT News' },
  { url: 'https://www.statnews.com/feed/', category: 'Technology', sourceName: 'STAT News' },
  { url: 'https://www.fiercehealthcare.com/rss/xml', category: 'Technology', sourceName: 'Fierce Healthcare' },
  
  // Investment & Funding
  { url: 'https://news.crunchbase.com/sections/health-wellness-biotech/rss/', category: 'Investment', sourceName: 'Crunchbase Health' },
  { url: 'https://news.crunchbase.com/feed/', category: 'Investment', sourceName: 'Crunchbase' },
  { url: 'https://sifted.eu/feed', category: 'Investment', sourceName: 'Sifted' },
  
  // Business Strategy
  { url: 'https://www.fastcompany.com/section/health/rss', category: 'Technology', sourceName: 'Fast Company' },
  { url: 'https://www.forbes.com/health/feed/', category: 'Wellness', sourceName: 'Forbes Health' },
];
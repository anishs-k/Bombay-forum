/**
 * The Bombay Forum — System Constants & Configuration
 */

module.exports = {
  SITE_NAME: 'The Bombay Forum',
  SITE_TAGLINE: 'Business · Wealth · Luxury · Culture in Modern India',
  SITE_URL: process.env.SITE_URL || 'https://thebombayforum.com',
  DEFAULT_OG_IMAGE: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&h=630&q=80',

  CATEGORIES: [
    {
      slug: 'founders',
      name: 'The Founders',
      shortName: 'Founders',
      path: '/founders',
      tagline: 'The Architects of India’s New Economy',
      description: 'Startup founders, entrepreneurs, business builders, company stories, funding journeys, and operator playbooks.',
      tone: 'Authoritative, ambitious. Written for people who are building something.',
      primaryFormats: ['profile', 'feature'],
      secondaryFormats: ['brief', 'list']
    },
    {
      slug: 'creators',
      name: 'Creators',
      shortName: 'Creators',
      path: '/creators',
      tagline: 'Culture, Influence & the Creative Enterprise',
      description: 'Content creators, filmmakers, artists, designers, musicians, and chefs. The creator economy as serious business.',
      tone: 'Cultural, energetic, young — but still premium.',
      primaryFormats: ['profile', 'feature'],
      secondaryFormats: ['edit', 'list']
    },
    {
      slug: 'wealth',
      name: 'Wealth',
      shortName: 'Wealth',
      path: '/wealth',
      tagline: 'Capital, Markets & Private Fortune',
      description: 'Markets, investing, personal finance, real estate, private wealth, funding rounds, and global macroeconomic perspective.',
      tone: 'Premium financial editorial. FT Weekend, not Bloomberg terminal. Perspective over raw data.',
      primaryFormats: ['brief', 'feature'],
      secondaryFormats: ['opinion', 'explainer']
    },
    {
      slug: 'future',
      name: 'Future',
      shortName: 'Future',
      path: '/future',
      tagline: 'Technology, AI & the Next Decade',
      description: 'Artificial intelligence, deep tech, frontier innovation, emerging scientific breakthroughs, and societal shifts.',
      tone: 'Intelligent, curious, slightly provocative. The smartest section on the site.',
      primaryFormats: ['explainer', 'feature'],
      secondaryFormats: ['brief', 'opinion']
    },
    {
      slug: 'suite',
      name: 'The Suite',
      shortName: 'The Suite',
      path: '/suite',
      tagline: 'Luxury, Leisure & Exceptional Living',
      description: 'Hotels, design, bespoke travel, horology, fine dining, architecture, and personal style curated with discerning taste.',
      tone: 'Aspirational, visual, magazine-like. Image-heavy and refined.',
      primaryFormats: ['edit', 'feature'],
      secondaryFormats: ['list']
    },
    {
      slug: 'bombay',
      name: 'Bombay',
      shortName: 'Bombay',
      path: '/bombay',
      tagline: 'The Soul, Grit & Glamour of Maximum City',
      description: 'The city itself — people, iconic places, street culture, culinary legends, neighbourhoods, and civic narratives.',
      tone: 'Warm, alive, cultural. TBF’s identity anchor and soul.',
      primaryFormats: ['feature', 'list'],
      secondaryFormats: ['brief', 'profile']
    }
  ],

  FORMATS: [
    { slug: 'brief', name: 'The Brief', words: '250–400 words', cadence: '3–4 per day', purpose: 'Fast, factual. What happened and why it matters.' },
    { slug: 'feature', name: 'The Feature', words: '800–1,200 words', cadence: '3–4 per week', purpose: 'The core TBF article. Analysis with a point of view.' },
    { slug: 'profile', name: 'The Profile', words: '1,500–2,500 words', cadence: '1–2 per week', purpose: 'Long-form on a founder, creator or business. Flagship format.' },
    { slug: 'edit', name: 'The Edit', words: '600–900 words', cadence: '2 per week', purpose: 'Curated selection with commentary. Image-heavy.' },
    { slug: 'opinion', name: 'The Opinion', words: '700–1,000 words', cadence: '1 per week', purpose: 'Signed, first-person argument. Takes a real position.' },
    { slug: 'explainer', name: 'The Explainer', words: '500–800 words', cadence: '1–2 per week', purpose: 'Answers a complex question with clarity.' },
    { slug: 'list', name: 'The List', words: '400–700 words', cadence: '1 per week', purpose: 'Ranked or curated recurring franchise.' }
  ],

  FRANCHISES: [
    { name: 'The Saturday Communiqué', category: 'newsletter', cadence: 'Weekly, Saturday', format: 'newsletter' },
    { name: 'Bombay This Week', category: 'bombay', cadence: 'Weekly, Monday', format: 'list' },
    { name: 'Market Pulse', category: 'wealth', cadence: 'Weekly, Friday', format: 'brief' },
    { name: 'Signal vs Noise', category: 'future', cadence: 'Weekly', format: 'opinion' },
    { name: 'Ones to Watch', category: 'founders', cadence: 'Monthly', format: 'list' },
    { name: 'Faces of Bombay', category: 'bombay', cadence: 'Fortnightly', format: 'profile' },
    { name: 'The Suite Edit', category: 'suite', cadence: 'Weekly', format: 'edit' },
    { name: 'Creator Economy', category: 'creators', cadence: 'Fortnightly', format: 'feature' }
  ],

  DEFAULT_LLM_PROMPT: `You are a senior editor at The Bombay Forum, a premium Indian editorial platform covering business, wealth, luxury and culture.

Write an original article based on the source material below.

RULES:
- Do NOT copy any sentence from the source. Rewrite completely.
- Write in TBF voice: authoritative, precise, never breathless.
- No clickbait. No "you won't believe". No exclamation marks in body.
- Indian English spelling and context (crores, lakhs, Mumbai/Bombay nuances where appropriate).
- Assume the reader is intelligent and already informed.
- Include one compelling pull quote and key takeaways.

CATEGORY: {category}
SOURCE MATERIAL: {source_text}
SOURCE URL: {source_url}

RETURN ONLY VALID JSON:
{
  "title": "string, under 70 chars, no clickbait",
  "deck": "string, one sentence summary, under 160 chars",
  "body": "string, markdown, 500-900 words",
  "pullQuote": "string, one striking line from the piece",
  "tags": ["array", "of", "3-5", "lowercase", "tags"],
  "metaTitle": "string, under 60 chars",
  "metaDesc": "string, under 160 chars",
  "confidence": 0.85
}`
};

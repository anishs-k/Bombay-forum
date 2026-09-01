const bcrypt = require('bcryptjs');
const { Article, Profile, HomepageConfig, Source, User, Setting, Subscriber } = require('../models');
const { DEFAULT_LLM_PROMPT } = require('../config/constants');

async function seedDatabase() {
  console.log('Checking database seeding status...');

  // 1. Seed Admin User
  const existingUser = await User.findOne({ email: 'admin@thebombayforum.com' });
  if (!existingUser) {
    const passwordHash = await bcrypt.hash('tbfadmin2026', 10);
    await User.create({
      email: 'admin@thebombayforum.com',
      passwordHash,
      name: 'Editor-in-Chief',
      role: 'admin'
    });
    console.log('✓ Created default admin user: admin@thebombayforum.com');
  }

  // 2. Seed Settings
  const existingPrompt = await Setting.findOne({ key: 'llm_prompt_template' });
  if (!existingPrompt) {
    await Setting.create({ key: 'llm_prompt_template', value: DEFAULT_LLM_PROMPT });
    await Setting.create({ key: 'confidence_threshold', value: 0.7 });
    console.log('✓ Seeded LLM Prompt Template and configuration');
  }

  // 3. Seed Sources (from Brief Section 4.5 and 4.3)
  const sourceCount = await Source.countDocuments();
  if (sourceCount === 0) {
    const seedSources = [
      { name: 'Inc42', url: 'https://inc42.com/feed/', category: 'founders', type: 'rss', active: true, pollIntervalMinutes: 240 },
      { name: 'Entrackr', url: 'https://entrackr.com/feed/', category: 'founders', type: 'rss', active: true, pollIntervalMinutes: 240 },
      { name: 'YourStory', url: 'https://yourstory.com/feed', category: 'founders', type: 'rss', active: true, pollIntervalMinutes: 240 },
      { name: 'Livemint Markets', url: 'https://www.livemint.com/rss/markets', category: 'wealth', type: 'rss', active: true, pollIntervalMinutes: 240 },
      { name: 'Economic Times Markets', url: 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms', category: 'wealth', type: 'rss', active: true, pollIntervalMinutes: 240 },
      { name: 'Moneycontrol Business', url: 'https://www.moneycontrol.com/rss/business.xml', category: 'wealth', type: 'rss', active: true, pollIntervalMinutes: 240 },
      { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'future', type: 'rss', active: true, pollIntervalMinutes: 240 },
      { name: 'Analytics India Magazine', url: 'https://analyticsindiamag.com/feed/', category: 'future', type: 'rss', active: true, pollIntervalMinutes: 240 },
      { name: 'Condé Nast Traveller India', url: 'https://www.cntraveller.in/feed/', category: 'suite', type: 'rss', active: true, pollIntervalMinutes: 240 },
      { name: 'Mid-Day Mumbai', url: 'https://www.mid-day.com/rss/mumbai', category: 'bombay', type: 'rss', active: true, pollIntervalMinutes: 240 },
      // Google News Query Feeds (Brief 4.3)
      { name: 'GNews - Indian Startups', url: 'https://news.google.com/rss/search?q=indian+startup+funding+OR+indian+founder&hl=en-IN&gl=IN&ceid=IN:en', category: 'founders', type: 'gnews', active: true, pollIntervalMinutes: 240 },
      { name: 'GNews - Indian Markets', url: 'https://news.google.com/rss/search?q=sensex+nifty+OR+indian+markets+OR+india+wealth&hl=en-IN&gl=IN&ceid=IN:en', category: 'wealth', type: 'gnews', active: true, pollIntervalMinutes: 240 },
      { name: 'GNews - India AI & Tech', url: 'https://news.google.com/rss/search?q=india+AI+OR+indian+technology+OR+india+innovation&hl=en-IN&gl=IN&ceid=IN:en', category: 'future', type: 'gnews', active: true, pollIntervalMinutes: 240 },
      { name: 'GNews - Luxury India', url: 'https://news.google.com/rss/search?q=luxury+india+OR+indian+luxury+hotel+OR+india+travel&hl=en-IN&gl=IN&ceid=IN:en', category: 'suite', type: 'gnews', active: true, pollIntervalMinutes: 240 },
      { name: 'GNews - Mumbai City', url: 'https://news.google.com/rss/search?q=mumbai+OR+bombay+OR+maharashtra+business&hl=en-IN&gl=IN&ceid=IN:en', category: 'bombay', type: 'gnews', active: true, pollIntervalMinutes: 240 },
      { name: 'GNews - Creator Economy', url: 'https://news.google.com/rss/search?q=indian+creator+economy+OR+indian+influencer&hl=en-IN&gl=IN&ceid=IN:en', category: 'creators', type: 'gnews', active: true, pollIntervalMinutes: 240 }
    ];

    await Source.insertMany(seedSources);
    console.log(`✓ Seeded ${seedSources.length} content ingestion sources`);
  }

  // 4. Seed Profiles (Founders & Creators)
  const profileCount = await Profile.countDocuments();
  if (profileCount === 0) {
    const seedProfiles = [
      {
        name: 'Tarun Mehta',
        slug: 'tarun-mehta',
        type: 'founder',
        company: 'Ather Energy',
        role: 'Co-Founder & CEO',
        location: 'Bengaluru / Mumbai',
        heroImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&h=1000&q=80',
        quote: 'Building hardware in India isn’t an exercise in cost cutting; it is an exercise in proving that Indian engineering can lead globally.',
        bio: [
          'Tarun Mehta co-founded Ather Energy in 2013 with a vision to build India’s first truly smart electric two-wheeler from the ground up.',
          'Under his leadership, Ather has pioneered indigenous battery architecture, vertically integrated manufacturing in Hosur, and expanded the fast-charging Ather Grid across major Indian metros.'
        ],
        stats: {
          founded: '2013',
          teamSize: '3,500+',
          valuation: '₹10,500 Cr',
          markets: '140+ Cities',
          structure: 'Private Limited / IPO Bound'
        },
        platforms: {
          linkedin: 'https://linkedin.com/in/tarunmehta',
          twitter: 'https://twitter.com/tarunsmehta',
          website: 'https://atherenergy.com'
        },
        content: `## The Architecture of Patience\n\nWhen Tarun Mehta and Swapnil Jain graduated from IIT Madras in 2012, the conventional wisdom suggested building software. SaaS was ascending, capital was liquid, and unit economics could be tweaked with a line of code. Choosing instead to build high-performance electric hardware in India was widely viewed as reckless.\n\nYet, a decade later, Ather Energy stands as an archetype of deep-tech resilience. The company did not assemble imported Chinese kits; it engineered proprietary battery thermal management systems capable of surviving Indian ambient temperatures of 45°C and monsoon waterlogging.\n\n> Hardware teaches humility quickly. When a component fails in the field, you cannot push an over-the-air update to repair melted plastic.\n\n## The Next Horizon\n\nWith public markets beckoning, Ather's strategic posture has pivoted toward scale without sacrificing engineering purity. As domestic EV adoption crosses inflection points, Mehta’s play remains firmly anchored on software-defined vehicles and robust energy infrastructure.`,
        metaTitle: 'Tarun Mehta Profile: Building Ather Energy | TBF',
        metaDesc: 'How Tarun Mehta engineered Ather Energy into India’s premier electric two-wheeler pioneer.',
        status: 'published'
      },
      {
        name: 'Deepinder Goyal',
        slug: 'deepinder-goyal',
        type: 'founder',
        company: 'Zomato & Blinkit',
        role: 'Founder & CEO',
        location: 'Gurugram / Mumbai',
        heroImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&h=1000&q=80',
        quote: 'Quick commerce is not a feature of retail; it is the total architectural rewiring of urban consumer convenience.',
        bio: [
          'Deepinder Goyal founded Zomato in 2008 as a restaurant discovery portal, eventually steering it into India’s dominant food delivery and quick commerce conglomerate.',
          'His acquisition and aggressive scaling of Blinkit has reshaped India’s retail landscape and set a new standard for hyper-local logistical execution.'
        ],
        stats: {
          founded: '2008',
          teamSize: '5,000+',
          valuation: '₹2,10,000 Cr Market Cap',
          markets: 'Pan-India',
          structure: 'NSE / BSE Listed (ZOMATO)'
        },
        platforms: {
          twitter: 'https://twitter.com/deepigoyal',
          linkedin: 'https://linkedin.com/in/deepindergoyal',
          website: 'https://zomato.com'
        },
        content: `## The Second Act: Hyper-Local Dominance\n\nWhen Zomato went public in 2021, skeptics questioned whether food delivery alone could sustain long-term operating margins. Goyal's answer was not defensive cost-cutting, but an aggressive expansion into quick commerce through the acquisition of Blinkit.\n\nToday, dark stores across Mumbai and Delhi process tens of thousands of orders every ten minutes, redefining consumer expectations from groceries to high-end electronics.\n\n> The only moat in high-frequency logistics is density. Density drives delivery speed, which drives customer retention, which pays for the real estate.`,
        metaTitle: 'Deepinder Goyal Profile: The Quick Commerce Moat | TBF',
        metaDesc: 'Inside Deepinder Goyal’s relentless execution with Zomato and Blinkit.',
        status: 'published'
      },
      {
        name: 'Yashraj Mukhate',
        slug: 'yashraj-mukhate',
        type: 'creator',
        medium: 'Music Producer & Cultural Satirist',
        location: 'Mumbai / Aurangabad',
        heroImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&h=1000&q=80',
        quote: 'The internet does not reward perfection; it rewards emotional resonance captured in a ten-second musical loop.',
        bio: [
          'Yashraj Mukhate transformed Indian digital pop culture by transforming everyday dialogues and television tropes into viral musical symphonies.',
          'With millions of subscribers across platforms, he has built an independent production house that collaborates with premier cinematic brands, streaming giants, and commercial labels.'
        ],
        stats: {
          founded: '2020 (Independent IP)',
          teamSize: '12 Production Creatives',
          valuation: 'Top-tier Creator Brand',
          markets: 'Global Diaspora',
          structure: 'Independent Studio'
        },
        platforms: {
          instagram: 'https://instagram.com/yashrajmukhate',
          youtube: 'https://youtube.com/yashrajmukhate',
          website: 'https://yashrajmukhate.com'
        },
        content: `## Turning the Absurd into Art\n\nIn August 2020, a thirty-second track featuring rhythmic synth pads and an autotuned television soap opera monologue swept Indian smartphones. Yashraj Mukhate was an engineer and music composer from Aurangabad whose viral spark proved that audio-first humor had immense enterprise value.\n\nIn the years since, Mukhate has evolved beyond meme virality into a prolific commercial composer and digital brand builder.\n\n> The line between sound design and comedy in digital spaces is rhythm. When you sync conversational cadence to a four-on-the-floor beat, humor becomes addictive.`,
        metaTitle: 'Yashraj Mukhate Profile: The Rhythmic Economy | TBF',
        metaDesc: 'How Yashraj Mukhate built an independent creative studio on the foundation of digital sound design.',
        status: 'published'
      }
    ];

    await Profile.insertMany(seedProfiles);
    console.log(`✓ Seeded ${seedProfiles.length} Founder and Creator profiles`);
  }

  // 5. Seed Core Articles for all 6 Pillars & 7 Formats
  const articleCount = await Article.countDocuments();
  if (articleCount === 0) {
    const seedArticles = [
      {
        title: 'The Sovereign Wealth Playbook: How Indian Family Offices Are Rethinking Private Equity in 2026',
        slug: 'indian-family-offices-private-equity-2026',
        category: 'wealth',
        format: 'feature',
        author: 'Viraj Mehta',
        heroImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1600&h=900&q=80',
        heroCaption: 'Nariman Point, Mumbai · Private wealth desks managing inter-generational balance sheets.',
        excerpt: 'As liquidity cycles tighten globally, India’s top tier single-family offices are bypassing traditional venture funds to lead direct, structured equity rounds in industrial champions.',
        content: `The quietest rooms in Mumbai financial circles are not on the trading floors of the Bandra-Kurla Complex; they are located in low-key private suites overlooking Marine Drive and Cuffe Parade. Here, managing partners of India’s most storied single-family offices (SFOs) are orchestrating a profound capital realignment.

For the better part of the past decade, family offices treated technology venture funds as an obligatory allocation—a high-beta sleeve that offered diversification and marquee bragging rights. Today, that playbook has been comprehensively dismantled.

> In an era of compressed public multiples, the goal is no longer chasing paper valuations. Sophisticated domestic capital wants cash-flow visibility, structural governance, and direct board representation.

## The Direct Deal Paradigm

The catalyst behind this transition is both structural and generational. Second- and third-generation wealth stewards, armed with ivy-league finance credentials and operational experience, are demanding direct co-investment rights rather than passive LP commitments.

\`\`\`
Key Capital Movements (2025–2026):
• Direct Co-Investments: +44% Year-on-Year
• Blind Pool LP Commitments: -18% Year-on-Year
• Manufacturing & Deep-Tech Inflows: ₹24,000 Cr
\`\`\`

Rather than deploying capital into high-burn consumer tech, domestic balance sheets are underwriting capital expenditures in advanced manufacturing, renewable infrastructure, and specialised chemical supply chains. These are businesses with robust order books, clear domestic moats, and export tailwinds supported by production-linked incentives.

## Governance as the New Alpha

The defining characteristic of this new capital wave is an uncompromising insistence on governance. Family offices are deploying proprietary diligence teams to scrutinise related-party transactions, revenue recognition policies, and cash conversion cycles before committing term sheets.

For founders seeking long-term, patient capital that does not come with artificial seven-year fund life constraints, Indian family offices have emerged as the most formidable partners in the subcontinent.`,
        pullQuotes: [
          'In an era of compressed public multiples, the goal is no longer chasing paper valuations. Sophisticated domestic capital wants cash-flow visibility, structural governance, and direct board representation.'
        ],
        keyStats: [
          { value: '₹24,000 Cr', label: 'Domestic SFO Capital Inflows into Deep Manufacturing' },
          { value: '+44%', label: 'Year-on-Year Increase in Direct Co-Investment Deals' }
        ],
        tags: ['wealth', 'family-offices', 'private-equity', 'investing', 'mumbai'],
        metaTitle: 'Indian Family Offices & Private Equity 2026 | The Bombay Forum',
        metaDesc: 'How Indian family offices are bypassing venture funds to deploy patient capital directly into cash-generating industrial assets.',
        status: 'published',
        confidence: 0.95,
        views: 1420,
        publishedAt: new Date('2026-08-25T08:30:00Z')
      },
      {
        title: 'Building for the Trillion-Dollar Grid: The Unseen Founders Modernising Indian Logistics',
        slug: 'unseen-founders-modernising-indian-logistics',
        category: 'founders',
        format: 'feature',
        author: 'Arjun Singhania',
        heroImage: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1600&h=900&q=80',
        heroCaption: 'JNPT Port terminals and automated supply corridors outside Mumbai.',
        excerpt: 'Away from the consumer hype cycle, a determined cohort of industrial founders is rewiring India’s freight corridors, cold chains, and multi-modal transport networks.',
        content: `When discussions turn to Indian technology champions, public consciousness invariably drifts toward consumer applications and quick-commerce dark stores. Yet the most consequential enterprise value being created today resides in the dusty freight corridors connecting Nhava Sheva to the industrial hinterlands of Gujarat and Maharashtra.

Here, a new breed of industrial operators is building the physical and digital rails that will carry India’s merchandise exports past the trillion-dollar threshold.

> Efficiency in freight is not won through sleek consumer interfaces. It is won on weighbridges, diesel optimisation curves, and yard turn-around algorithms.

## The Multi-Modal Revolution

Take the dedicated freight corridors (DFC) that now link western ports with northern manufacturing clusters. Founders operating in this space are integrating GPS telematics, RFID container tracking, and automated customs clearance to compress transit times by more than 50 percent.

The economic ramifications are substantial. Logistics costs in India, historically hovering around 13–14% of GDP, are steadily trending toward single digits, unlocking immense competitive leverage for domestic manufacturers.`,
        pullQuotes: [
          'Efficiency in freight is not won through sleek consumer interfaces. It is won on weighbridges, diesel optimisation curves, and yard turn-around algorithms.'
        ],
        tags: ['founders', 'logistics', 'supply-chain', 'infrastructure', 'india'],
        metaTitle: 'Modernising Indian Logistics: The Founders | TBF',
        metaDesc: 'How industrial founders are rewiring India’s freight corridors and multi-modal logistics networks.',
        status: 'published',
        confidence: 0.92,
        views: 980,
        publishedAt: new Date('2026-08-24T10:00:00Z')
      },
      {
        title: 'The Great Architectural Renaissance of South Bombay: Inside the Restored Heritage Enclaves',
        slug: 'architectural-renaissance-south-bombay-heritage',
        category: 'bombay',
        format: 'feature',
        author: 'Sunaina Rao',
        heroImage: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1600&h=900&q=80',
        heroCaption: 'Victorian Gothic and Art Deco facades along Oval Maidan, Fort, Mumbai.',
        excerpt: 'From Ballard Estate to Kala Ghoda, meticulous conservation projects and visionary design ateliers are breathing modern commercial vitality into Bombay’s historic stone structures.',
        content: `To walk through the arcades of Ballard Estate at dawn is to witness a city negotiating its identity with grace. The basalt porticos and neoclassical keystones, built during the maritime boom of the 1920s, have survived decades of bureaucratic neglect. Today, they are undergoing what urbanists describe as the most ambitious privately-funded heritage revival in modern Asia.

Ateliers, bespoke law chambers, contemporary art foundations, and subterranean dining rooms are occupying restored stone vaults with reverence.

> True conservation is never about turning buildings into sterile museum pieces. A structure only survives when it remains economically indispensable to the modern city.

## Fort & Kala Ghoda: The Cultural Anchor

In Kala Ghoda, the intersection of colonial architecture and contemporary Indian fashion has created a shopping district that rivals London’s Mayfair or Tokyo’s Ginza in tactile intimacy. Restorers have stripped away decades of synthetic paint to reveal teak beams, Belgian stained glass, and hand-cast iron banisters.

The result is a distinctively Bombay aesthetic: grand, textured, uncompromisingly authentic, and rooted in the soil of the Arabian Sea.`,
        pullQuotes: [
          'True conservation is never about turning buildings into sterile museum pieces. A structure only survives when it remains economically indispensable to the modern city.'
        ],
        tags: ['bombay', 'architecture', 'heritage', 'design', 'culture'],
        metaTitle: 'South Bombay Heritage Renaissance | The Bombay Forum',
        metaDesc: 'Inside the historic conservation and architectural revival of South Mumbai’s heritage enclaves.',
        status: 'published',
        confidence: 0.94,
        views: 2150,
        publishedAt: new Date('2026-08-23T14:15:00Z')
      },
      {
        title: 'Frontier AI & The Vernacular Frontier: Why India’s LLM Sovereignty Hinges on Local Context',
        slug: 'frontier-ai-vernacular-india-llm-sovereignty',
        category: 'future',
        format: 'explainer',
        author: 'Dr. Kabir Sen',
        heroImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1600&h=900&q=80',
        heroCaption: 'Neural compute architecture and multi-lingual dataset pipelines.',
        excerpt: 'Global foundation models remain fundamentally anglophone in their tokenisation and cultural assumptions. India’s sovereign AI mission is rewriting the rulebook from first principles.',
        content: `When generative AI models parse Western text, token efficiency is optimised around English morphology. A single concept requires one or two tokens. When that same architecture attempts to parse Hindi, Tamil, Marathi, or Bengali, token consumption skyrockets by a factor of four or five, exponentially escalating inference costs while degrading semantic nuance.

This linguistic taxation is why Indian AI research labs are building sovereign tokenisers and specialized foundation architectures tailored for the subcontinent.

> Sovereignty in artificial intelligence is not merely a matter of data center geography; it is the philosophical alignment of cognitive models with the cultural semantics of the population they serve.

## Tokenomics & Synthetic Data

By creating curated datasets reflecting agricultural nuances, regional legal jurisprudence, and colloquial dialects, domestic engineers are demonstrating that smaller, highly-specialised models can outperform massive frontier models on domestic tasks at a fraction of the compute cost.`,
        pullQuotes: [
          'Sovereignty in artificial intelligence is not merely a matter of data center geography; it is the philosophical alignment of cognitive models with the cultural semantics of the population they serve.'
        ],
        tags: ['future', 'ai', 'technology', 'deeptech', 'india'],
        metaTitle: 'Vernacular AI & Indian LLM Sovereignty | TBF',
        metaDesc: 'Why India’s linguistic diversity demands sovereign foundation models built from first principles.',
        status: 'published',
        confidence: 0.91,
        views: 1890,
        publishedAt: new Date('2026-08-22T09:00:00Z')
      },
      {
        title: 'Five Himalayan Sanctuary Hotels That Define Modern Indian Hospitality',
        slug: 'five-himalayan-sanctuary-hotels-modern-luxury',
        category: 'suite',
        format: 'edit',
        author: 'Priya Chawla',
        heroImage: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&h=900&q=80',
        heroCaption: 'Architectural retreats nestled across the cedar ridges of Himachal and Ladakh.',
        excerpt: 'A curated edit of high-altitude retreats where brutalist cedar architecture, hyper-local gastronomy, and quiet luxury converge.',
        content: `The modern Indian luxury traveller is no longer satisfied by ostentatious chandeliers and gold-leaf banquets. The contemporary definition of luxury has shifted decisively toward privacy, architectural poise, stillness, and profound connection with the landscape.

Nowhere is this philosophy more exquisitely articulated than in the high-altitude sanctuaries of the northern Himalayas.

> Luxury today is the luxury of silence, bespoke craft, and spaces designed with restraint rather than excess.

## 1. The Postcard Hideaway, Mashobra
Perched on a pine-cloaked ridge, this sanctuary pairs floor-to-ceiling glass expanses with unpolished deodar timber and quiet fireplaces.

## 2. Shakti Ladakh, Indus Valley
Village-style sustainable luxury that seamlessly immerses guests into the sacred rhythms of high-altitude monastic landscapes.

## 3. Mary Budden Estate, Binsar
A five-acre forest retreat powered entirely by solar energy and nestled in the untamed wilderness of the Kumaon hills.`,
        pullQuotes: [
          'Luxury today is the luxury of silence, bespoke craft, and spaces designed with restraint rather than excess.'
        ],
        tags: ['suite', 'luxury', 'hotels', 'travel', 'design'],
        metaTitle: 'Five Himalayan Sanctuary Hotels | The Suite · TBF',
        metaDesc: 'A curated edit of high-altitude retreats defining modern Indian hospitality and architectural restraint.',
        status: 'published',
        confidence: 0.96,
        views: 1620,
        publishedAt: new Date('2026-08-21T11:45:00Z')
      },
      {
        title: 'The Creator Holding Company: How Independent Digital Filmmakers Are Building Media Empires',
        slug: 'creator-holding-company-digital-filmmakers-empires',
        category: 'creators',
        format: 'feature',
        author: 'Rohan Talwar',
        heroImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1600&h=900&q=80',
        heroCaption: 'Digital production sets in Bandra, Mumbai.',
        excerpt: 'Top Indian content creators are transitioning from single-person influencer brands into multi-vehicle media holdings with production studios, merchandise lines, and equity arms.',
        content: `The term 'influencer' has become woefully inadequate to describe the operations of India's leading digital storytellers. In studio spaces across Bandra and Andheri, creators who once began with smartphone cameras are running full-scale commercial production enterprises.

They manage dedicated writers' rooms, post-production audio suites, talent management divisions, and direct-to-consumer product lines.

> The platform provides the audience; the holding company creates the enterprise value.

## Diversification Beyond the Algorithm

By owning their intellectual property and diversifying revenue streams into licensing, syndication, and venture investments, India’s top creators are insulating themselves from algorithmic volatility and building lasting media institutions.`,
        pullQuotes: [
          'The platform provides the audience; the holding company creates the enterprise value.'
        ],
        tags: ['creators', 'media', 'creator-economy', 'film', 'business'],
        metaTitle: 'The Creator Holding Company | TBF',
        metaDesc: 'How independent digital filmmakers are building institutional media holdings in Mumbai.',
        status: 'published',
        confidence: 0.93,
        views: 1340,
        publishedAt: new Date('2026-08-20T16:00:00Z')
      },
      {
        title: 'Market Pulse: Sensex Rebounds as FII Inflows Return to Banking and Power Titans',
        slug: 'market-pulse-sensex-fii-inflows-banking-power',
        category: 'wealth',
        format: 'brief',
        author: 'TBF Markets Desk',
        heroImage: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1600&h=900&q=80',
        heroCaption: 'BSE Towers, Dalal Street, Mumbai.',
        excerpt: 'Benchmark indices gained 640 points in Friday trading, buoyed by institutional accumulation in credit leaders and robust quarterly capital expenditure prints.',
        content: `Indian benchmark indices concluded the trading week with sharp gains as foreign institutional investors (FIIs) resumed net buying across private banking giants and capital goods leaders.

The S&P BSE Sensex closed at 83,420, while the Nifty 50 comfortably defended the 25,400 mark. Analysts cite easing crude prices and resilient domestic credit demand as key tailwinds underpinning broader market confidence.

Institutional desk notes highlight that domestic mutual fund SIP inflows continue to provide an unprecedented liquidity cushion, muting external global volatility and establishing a higher valuation floor for frontline equities.`,
        tags: ['wealth', 'markets', 'sensex', 'nifty', 'dalal-street'],
        metaTitle: 'Market Pulse: Sensex Rebounds on FII Inflows | TBF',
        metaDesc: 'Weekly breakdown of market movements, benchmark performance, and institutional capital flows on Dalal Street.',
        status: 'published',
        confidence: 0.95,
        views: 890,
        publishedAt: new Date('2026-08-25T17:00:00Z')
      },
      {
        title: 'Bombay This Week: Gallery Openings, Monsoonal Jazz, and The New Bandra Speakeasy',
        slug: 'bombay-this-week-august-2026-culture-edit',
        category: 'bombay',
        format: 'list',
        author: 'TBF City Desk',
        heroImage: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?auto=format&fit=crop&w=1600&h=900&q=80',
        heroCaption: 'Evening lights along Bandra Bandstand and Carter Road.',
        excerpt: 'Your curated cultural guide to the finest openings, culinary debuts, and live performances across the city this week.',
        content: `Every Monday, The Bombay Forum curates the essential cultural and social calendar for discerning city dwellers.

### 1. Modernist Retrospective at DAG Colaba
An extraordinary exhibition bringing together seminal post-independence canvases from the Progressive Artists' Group, with rare archival sketches by MF Husain and FN Souza.

### 2. Monsoonal Acoustic Sessions at The Quarter
Royal Opera House’s intimate music space hosts a three-night series featuring indie jazz ensembles and contemporary Indian classical fusion.

### 3. The Library Room at Bandra West
A discreet, reservation-only speakeasy celebrating botanicals from the Western Ghats and single-estate Himalayan coffees.`,
        tags: ['bombay', 'culture', 'events', 'dining', 'city-guide'],
        metaTitle: 'Bombay This Week: Cultural & Culinary Edit | TBF',
        metaDesc: 'The essential weekly guide to art openings, dining debuts, and cultural events across Mumbai.',
        status: 'published',
        confidence: 0.94,
        views: 1780,
        publishedAt: new Date('2026-08-25T07:00:00Z')
      }
    ];

    await Article.insertMany(seedArticles);
    console.log(`✓ Seeded ${seedArticles.length} published articles across all 6 categories & formats`);
  }

  // 6. Seed Homepage Configuration
  const existingConfig = await HomepageConfig.findOne({});
  if (!existingConfig) {
    const articles = await Article.find({ status: 'published' });
    const coverArticle = articles[0] || null;
    const pick1 = articles[1] || null;
    const pick2 = articles[2] || null;
    const pick3 = articles[3] || null;
    const feat1 = articles[4] || null;
    const feat2 = articles[5] || null;
    const feat3 = articles[6] || null;

    await HomepageConfig.create({
      coverStoryId: coverArticle ? coverArticle._id.toString() : '',
      editorsPickIds: [pick1?._id.toString(), pick2?._id.toString(), pick3?._id.toString()].filter(Boolean),
      featuredThisWeekIds: [feat1?._id.toString(), feat2?._id.toString(), feat3?._id.toString()].filter(Boolean),
      sponsoredStrip: {
        enabled: true,
        label: 'Partner Dispatch',
        text: 'Private wealth advisory and bespoke estate planning for India’s next-generation business families.',
        linkUrl: '/spotlight',
        sponsorName: 'Kotak Private'
      },
      active: true
    });
    console.log('✓ Seeded homepage configuration layout');
  }

  // 7. Seed Newsletter Subscribers
  const subscriberCount = await Subscriber.countDocuments();
  if (subscriberCount === 0) {
    await Subscriber.create({ email: 'ayush@example.com', name: 'Ayush', status: 'active' });
    await Subscriber.create({ email: 'editorial@thebombayforum.com', name: 'TBF Desk', status: 'active' });
  }

  console.log('Database seeding finished successfully.');
}

module.exports = { seedDatabase };

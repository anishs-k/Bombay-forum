# The Bombay Forum — Content Ecosystem & Developer Brief

**Version 1.1 · Prepared for the MJX Labs development team**
**Live URL:** `https://tbf-website-83870312789.us-central1.run.app`
**Target domain:** `thebombayforum.com`

---

## 1. What We Are Building

The Bombay Forum (TBF) is a premium editorial platform covering business, wealth, luxury, culture and the people building modern India.

The goal is a **content ecosystem** — not a manually-updated blog. Content is pulled automatically from external sources, rewritten in TBF's editorial voice, reviewed by a human, and published. The site should stay alive with minimal daily effort.

**Three layers:**

| Layer | What it does |
|---|---|
| **Ingestion** | Pulls raw content from Instagram, Google News, RSS feeds, and APIs |
| **Processing** | Rewrites in TBF voice via LLM, assigns category, generates SEO fields |
| **Publishing** | Human review in admin panel → publish → auto-distribute to RSS, newsletter, social |

---

## 2. Content Architecture — The Six Pillars

Every article on TBF belongs to exactly one category. The category determines the source pool, the tone, and the page it appears on.

### 2.1 The Founders
`slug: founders` · `/founders`

**Covers:** Startup founders, entrepreneurs, business builders, company stories, funding journeys, operator lessons.

**Tone:** Authoritative, ambitious. Written for people who are building something.

**Content types:** Founder profiles, company deep-dives, funding analysis, operator playbooks, "Ones to Watch" lists.

---

### 2.2 Creators
`slug: creators` · `/creators`

**Covers:** Content creators, filmmakers, artists, designers, musicians, chefs, photographers. The creator economy as a business.

**Tone:** Cultural, energetic, young — but still premium.

**Content types:** Creator profiles, work showcases, creator-economy business analysis, platform trend pieces.

---

### 2.3 Wealth
`slug: wealth` · `/wealth`

**Covers:** Markets, investing, personal finance, real estate, private wealth, funding rounds, global business.

**Tone:** Premium financial editorial. FT Weekend, not Bloomberg terminal. Perspective over raw data.

**Content types:** Market analysis, wealth management, property market, personal investing, opinion essays.

---

### 2.4 Future
`slug: future` · `/future`

**Covers:** Technology, AI, innovation, emerging trends, the next decade.

**Tone:** Intelligent, curious, slightly provocative. The smartest section on the site.

**Content types:** Tech analysis, AI coverage, trend pieces, the "Signal vs Noise" opinion format.

---

### 2.5 The Suite
`slug: suite` · `/suite`

**Covers:** Luxury, lifestyle, hotels, design, travel, watches, fine dining, style.

**Tone:** Aspirational, visual, magazine-like. Image-heavy.

**Content types:** Hotel and retreat reviews, design features, travel editorial, product and watch coverage, restaurant features.

---

### 2.6 Bombay
`slug: bombay` · `/bombay`

**Covers:** The city itself — people, places, culture, food, art, neighbourhoods, street stories.

**Tone:** Warm, alive, cultural. This is TBF's identity anchor and the section no competitor can copy.

**Content types:** City features, "Faces of Bombay" profiles, "Bombay This Week" event roundups, neighbourhood deep-dives, restaurant and venue coverage.

---

## 3. Content Types — What TBF Publishes

### 3.1 The Seven Formats

Every article is one of these seven formats. The format determines length, structure and how often it runs.

| # | Format | Length | Cadence | Purpose |
|---|---|---|---|---|
| 1 | **The Brief** | 250–400 words | 3–4 per day | Fast, factual. What happened and why it matters. The daily heartbeat. |
| 2 | **The Feature** | 800–1,200 words | 3–4 per week | The core TBF article. Analysis with a point of view. |
| 3 | **The Profile** | 1,500–2,500 words | 1–2 per week | Long-form on a founder, creator or business. The flagship format. |
| 4 | **The Edit** | 600–900 words | 2 per week | Curated list — hotels, watches, restaurants, books. Image-heavy. |
| 5 | **The Opinion** | 700–1,000 words | 1 per week | First-person argument. Signed. Takes a real position. |
| 6 | **The Explainer** | 500–800 words | 1–2 per week | Breaks down a complex thing simply. Strong SEO performer. |
| 7 | **The List** | 400–700 words | 1 per week | Ranked or curated. "Ones to Watch", "Bombay This Week". |

**Weekly target:** roughly 25–30 pieces. Around 20 Briefs, 4 Features, 1–2 Profiles, plus the rest.

---

### 3.2 Format Mix by Category

| Category | Primary formats | Secondary |
|---|---|---|
| **The Founders** | Profile, Feature | Brief, List |
| **Creators** | Profile, Feature | Edit, List |
| **Wealth** | Brief, Feature | Opinion, Explainer |
| **Future** | Explainer, Feature | Brief, Opinion |
| **The Suite** | Edit, Feature | List |
| **Bombay** | Feature, List | Brief, Profile |

---

### 3.3 Content Types in Detail

**The Brief**
Single-topic, no fluff. Opens with the fact, second paragraph explains why it matters, third gives context. No pull quote needed. This is what the ingestion pipeline produces best — most auto-drafted content becomes Briefs.

**The Feature**
The workhorse. Has a thesis, not just information. Structure: hook → context → evidence → what it means. Must contain at least one pull quote and one inline image. Every Feature should leave the reader with a view they didn't have before.

**The Profile**
Long-form on a person or company. Structure: scene-setting opener → the beginning → the philosophy → the work → what comes next. Needs 2 pull quotes, 2–3 inline images, and at least one key stat. This is the format that defines TBF's quality bar.

**The Edit**
Curated selection with commentary. "Five Hotels Worth the Flight." Each item gets a photo, 60–100 words, and a reason it's on the list. Visual-first — image quality matters more than word count.

**The Opinion**
Signed, first-person, argues something. Must be genuinely arguable — if nobody could disagree, it isn't an opinion piece. Runs with the author's portrait and a standing "Opinion" label so readers know it's a view, not reporting.

**The Explainer**
Answers a question the reader has. "How Do Startup Valuations Actually Work?" Plain language, no jargon without definition. These rank well in search and bring in new readers.

**The List**
Ranked or curated. Short entries. Works as a recurring franchise — "Ones to Watch" monthly, "Bombay This Week" weekly.

---

### 3.4 Recurring Franchises

Named, repeating features build the habit of coming back. Each has a fixed slot and cadence.

| Franchise | Category | Cadence | Format |
|---|---|---|---|
| **The Saturday Communiqué** | Newsletter | Weekly, Saturday | Newsletter |
| **Bombay This Week** | Bombay | Weekly, Monday | List |
| **Market Pulse** | Wealth | Weekly, Friday | Brief |
| **Signal vs Noise** | Future | Weekly | Opinion |
| **Ones to Watch** | Founders | Monthly | List |
| **Faces of Bombay** | Bombay | Fortnightly | Profile |
| **The Suite Edit** | Suite | Weekly | Edit |
| **Creator Economy** | Creators | Fortnightly | Feature |

---

### 3.5 Editorial Standards

**TBF publishes:**
- Original analysis with a clear point of view
- Reporting on people and companies actually building things
- Luxury and lifestyle coverage that assumes taste, not aspiration
- Explainers that respect the reader's intelligence
- City coverage that no national outlet would bother with

**TBF does not publish:**
- Rewritten press releases dressed as news
- Listicles with no editorial judgement behind the ranking
- Clickbait headlines, "you won't believe", numbered curiosity gaps
- Cryptocurrency promotion or unvetted investment advice
- Political commentary — TBF covers business, culture and the city, not party politics
- Anything a reader could get identically elsewhere

**Voice rules:**
- Assume the reader is intelligent and already informed
- Indian English spelling and context
- No exclamation marks in body copy
- Never breathless, never fawning
- Say the thing directly rather than building suspense
- Numbers and specifics over adjectives

---

### 3.6 Image Requirements

| Use | Dimensions | Notes |
|---|---|---|
| Hero image | 1600×900 | Required for all published articles |
| Inline image | 1600×1000 | Optional, caption required |
| OG image | 1200×630 | Required for SEO |
| Founder portrait | 800×1000 | Greyscale, high contrast |
| Creator portrait | 800×1000 | Warm tone, slightly desaturated |
| Suite / product | 1200×1200 | Square, clean background |

Never publish an article without a hero image. A missing image on a premium editorial site reads as broken, not minimal.

---

## 4. Source Ecosystem

### 4.1 Sourcing Principles

1. **Never republish.** Sources are inputs for original TBF articles, not content to copy. Every published piece must be substantially rewritten in TBF voice.
2. **Attribute where required.** If a source's reporting is the basis of a piece, link to it.
3. **Verify before publishing.** Auto-drafted content is always reviewed by a human before it goes live.
4. **Respect terms of service.** Use official APIs where available. Do not scrape platforms that prohibit it.

---

### 4.2 Source Map by Category

| Category | Primary Sources | Method |
|---|---|---|
| **The Founders** | Inc42, Entrackr, YourStory, TechCrunch India, Moneycontrol Startups, LinkedIn founder posts | RSS + API |
| **Creators** | Instagram Graph API, YouTube Data API, creator newsletters, Substack | API + RSS |
| **Wealth** | Economic Times Markets, Mint, Bloomberg Quint, Moneycontrol, NSE/BSE feeds, Reuters Business | RSS + API |
| **Future** | TechCrunch, The Verge, MIT Tech Review, Analytics India Magazine, arXiv (AI) | RSS |
| **The Suite** | Condé Nast Traveller India, Architectural Digest India, GQ India, hotel and brand press releases | RSS + manual |
| **Bombay** | Mumbai Mirror, Mid-Day, Hindustan Times Mumbai, Zomato/Google Places, Insider.in events, BMC announcements | RSS + API + manual |

---

### 4.3 Google News Integration

Google News RSS is the widest net and requires no API key.

**Endpoint pattern:**
```
https://news.google.com/rss/search?q={QUERY}&hl=en-IN&gl=IN&ceid=IN:en
```

**Recommended queries per category:**

```
Founders   → "indian startup funding" OR "indian founder" OR "startup india"
Wealth     → "sensex nifty" OR "indian markets" OR "india wealth"
Future     → "india AI" OR "indian technology" OR "india innovation"
Suite      → "luxury india" OR "indian luxury hotel" OR "india travel"
Bombay     → "mumbai" OR "bombay" OR "maharashtra business"
Creators   → "indian creator economy" OR "indian influencer"
```

**Frequency:** Poll every 4 hours. Deduplicate against existing article URLs before drafting.

---

### 4.4 Instagram Integration

**Use the official Instagram Graph API.** Scraping Instagram violates their terms and gets accounts banned.

**Requirements:**
- Facebook Developer App with Instagram Graph API product enabled
- Instagram Business or Creator account connected to a Facebook Page
- Long-lived access token (60 days, refreshable)

**Two use cases:**

**A. Publishing to TBF's own Instagram**
- `POST /{ig-user-id}/media` — create container
- `POST /{ig-user-id}/media_publish` — publish it
- Used to auto-post published articles as feed posts and stories

**B. Discovering creator content**
- `GET /{ig-user-id}?fields=business_discovery.username({username})` — public data for any business account
- Returns follower count, media count, recent posts
- Used to source and enrich Creator profiles

**Note:** Business Discovery only works for Business/Creator accounts, not personal accounts.

---

### 4.5 Standard RSS Sources

Store these in a `sources` collection so they can be managed from the admin panel without a code change.

```json
{
  "name": "Inc42",
  "url": "https://inc42.com/feed/",
  "category": "founders",
  "active": true,
  "pollIntervalMinutes": 240,
  "lastPolledAt": "2026-08-25T06:00:00Z"
}
```

**Seed list:**

| Source | Feed | Category |
|---|---|---|
| Inc42 | `https://inc42.com/feed/` | founders |
| Entrackr | `https://entrackr.com/feed/` | founders |
| YourStory | `https://yourstory.com/feed` | founders |
| Mint | `https://www.livemint.com/rss/markets` | wealth |
| Economic Times Markets | `https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms` | wealth |
| Moneycontrol | `https://www.moneycontrol.com/rss/business.xml` | wealth |
| TechCrunch | `https://techcrunch.com/feed/` | future |
| Analytics India Magazine | `https://analyticsindiamag.com/feed/` | future |
| Condé Nast Traveller India | `https://www.cntraveller.in/feed/` | suite |
| Mid-Day Mumbai | `https://www.mid-day.com/rss/mumbai` | bombay |

*Developers: verify each feed URL is live before adding. Feed paths change.*

---

## 5. Ingestion Pipeline

### 5.1 Flow

```
┌─────────────────────────────────────────────┐
│  1. FETCH (every 4 hours, per source)       │
│     RSS parser / Google News / IG Graph API │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│  2. DEDUPLICATE                             │
│     Hash source URL + title                 │
│     Skip if hash exists in `ingested` coll. │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│  3. CLASSIFY                                │
│     LLM assigns one of 6 categories         │
│     Reject if relevance score < threshold   │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│  4. REWRITE                                 │
│     LLM writes original TBF-voice article   │
│     Generates: title, deck, body, pullquote │
│     tags, metaTitle, metaDesc, slug         │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│  5. SAVE AS DRAFT                           │
│     POST /api/articles  status: "draft"     │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│  6. HUMAN REVIEW  ← MANDATORY GATE          │
│     Editor opens /admin/articles            │
│     Edits, adds images, approves            │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│  7. PUBLISH                                 │
│     status: "published", publishedAt set    │
│     → appears on site                       │
│     → enters /rss feed                      │
│     → enters /sitemap.xml                   │
│     → triggers social + newsletter webhook  │
└─────────────────────────────────────────────┘
```

### 5.2 Non-Negotiable Rule

**Nothing publishes without human approval.** Step 6 is a hard gate. There is no auto-publish path in v1. A media brand's credibility dies the first time it publishes something false.

---

### 5.3 LLM Rewrite Prompt Template

Store this server-side, versioned, editable from admin.

```
You are a senior editor at The Bombay Forum, a premium Indian
editorial platform covering business, wealth, luxury and culture.

Write an original article based on the source material below.

RULES:
- Do NOT copy any sentence from the source. Rewrite completely.
- Write in TBF voice: authoritative, precise, never breathless.
- No clickbait. No "you won't believe". No exclamation marks.
- Indian English spelling and context.
- Assume the reader is intelligent and already informed.

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
  "confidence": 0.0-1.0
}
```

Reject and flag any response with `confidence < 0.7` for manual writing instead.

---

## 6. Data Model

### 6.1 Article

```javascript
{
  title:        String,   // required
  slug:         String,   // required, unique, auto from title
  category:     String,   // enum: founders|creators|wealth|future|suite|bombay
  author:       String,   // required
  heroImage:    String,   // URL
  heroCaption:  String,
  excerpt:      String,   // the deck / subheadline
  content:      String,   // markdown body
  pullQuotes:   [String],
  inlineImages: [{ url: String, caption: String, position: Number }],
  keyStats:     [{ value: String, label: String }],
  tags:         [String],
  metaTitle:    String,   // ≤ 60 chars
  metaDesc:     String,   // ≤ 160 chars
  ogImage:      String,
  status:       String,   // enum: draft|published|scheduled|archived
  sourceUrl:    String,   // original source, for attribution
  views:        Number,
  publishedAt:  Date,
  createdAt:    Date,
  updatedAt:    Date
}
```

### 6.2 Profile (Founders & Creators)

```javascript
{
  name:        String,
  slug:        String,   // unique
  type:        String,   // enum: founder|creator
  company:     String,   // founders
  role:        String,   // founders
  medium:      String,   // creators — e.g. "Filmmaker"
  location:    String,
  heroImage:   String,
  quote:       String,   // signature pull quote
  bio:         [String], // array of paragraphs
  stats:       Object,   // { founded, teamSize, markets, structure }
  platforms:   Object,   // { instagram, youtube, newsletter, website }
  articles:    [ObjectId],
  metaTitle:   String,
  metaDesc:    String,
  status:      String    // draft|published
}
```

### 6.3 Additional Collections

| Collection | Purpose |
|---|---|
| `homepageconfigs` | Cover story, editor's picks, featured-this-week, sponsored strip |
| `subscribers` | Newsletter email list |
| `spotlights` | Paid brand features — package, deliverables, status |
| `sources` | RSS/API source registry, managed from admin |
| `ingested` | Dedup hashes of already-processed source items |

---

## 7. Article Format Specification

Every TBF article is assembled from these six building blocks. The editor toolbar must support all six.

| # | Element | Rendering |
|---|---|---|
| 1 | **Paragraph** | Manrope, 18px, line-height 1.75, 90% opacity |
| 2 | **Bold emphasis** | Inline `<strong>` — used for turning points and key claims |
| 3 | **Pull quote** | Serif italic, 40–48px, 4px teal left border, 48px left padding, generous vertical margin |
| 4 | **Subheading** | Serif, 30px, primary navy, 64px top margin |
| 5 | **Inline image** | Full column width, 16:9, caption below in 10px italic muted |
| 6 | **Key stat** | Large serif number in teal (72px) + 10px uppercase label below, on a light container background |

**Pull quote is TBF's signature element.** It should appear at least once in every article over 600 words. It is the thing that makes the page feel like a magazine rather than a blog.

---

## 8. UI Structure

### 8.1 Public Pages

| Route | Page | Key sections |
|---|---|---|
| `/` | Homepage | Cover story · Editor's Picks · Featured This Week · Sponsored strip · The Suite preview · Newsletter |
| `/founders` | The Founders | Section header · Featured founder · Story grid · Ones to Watch |
| `/creators` | Creators | Section header · Featured creator · Story grid · Creator Economy · Faces |
| `/wealth` | Wealth | Hero + market indicators · Lead story · Market Pulse · Story grid · Opinion |
| `/future` | Future | Hero · Lead story · Signal vs Noise · Story grid |
| `/suite` | The Suite | Hero · Sub-nav (Hotels/Design/Travel/Style/Dining) · Product grid · Featured editorial |
| `/bombay` | Bombay | Cinematic hero · Editorial grid · Bombay This Week · Faces of Bombay |
| `/article/:slug` | Article | Header · Hero image · Body · Author bio · Related · Newsletter |
| `/founder-profile/:slug` | Founder profile | Split hero · Stats strip · Long-form body · Archive · More founders |
| `/creator-profile/:slug` | Creator profile | Split hero · Platform pills · Long-form body · Work grid · More creators |
| `/about` | About | Manifesto · Mission quote · Sections grid · Beliefs · CTA |
| `/spotlight` | Spotlight | Hero · What you get · Packages · Past spotlights · Apply form |
| `/policies` | Policies | Privacy · Terms · Cookies (tabbed) |
| `/404` | Not found | Message · Suggested stories |

### 8.2 Admin Pages

| Route | Purpose |
|---|---|
| `/admin` | Login |
| `/admin/dashboard` | Stats overview · Recent articles · Engagement chart |
| `/admin/articles` | Article list · Filters · Bulk actions |
| `/admin/editor` | Create / edit article — full editor with SEO sidebar |
| `/admin/profiles` | Founders & Creators list |
| `/admin/profile-editor` | Create / edit profile |
| `/admin/homepage` | Homepage slot controller |
| `/admin/seo` | Site-wide SEO manager · Keyword tracker |

---

## 9. Design System

Non-negotiable. Every new page must match these.

| Token | Value | Used for |
|---|---|---|
| Navy | `#0E2130` | Navbar, footer, dark sections |
| Admin sidebar | `#091C2A` | Admin nav |
| Teal accent | `#4A8090` / `#8BB0B8` | Category tags, links, pull-quote border |
| Sage | `#B8D4CC` | Text on dark backgrounds |
| Cream | `#FAFAF5` | Page background |
| Surface | `#EEEEE9` | Cards, containers |

**Fonts:** Newsreader / Playfair Display (serif) for all headlines · Manrope (sans) for all body and UI text.

**Border radius: zero, everywhere.** Sharp edges are part of the brand. No rounded cards, no rounded buttons.

**Section dividers:** background colour shifts, not border lines.

---

## 10. Publishing Workflow — Editor Guide

### Creating an article manually

1. `/admin/dashboard` → click **New Article**
2. Enter **category tag**, **headline**, **deck**
3. Write body using the toolbar (bold · pull quote · subheading · image · key stat)
4. Right sidebar → upload **featured image** (1600×900)
5. Right sidebar → fill **SEO block**:
   - Meta title (≤ 60 chars — watch the counter)
   - Meta description (≤ 160 chars)
   - URL slug (auto-generated, editable)
   - Focus keyword
6. Add **tags** (3–5)
7. **Save Draft** → review the preview
8. **Publish**

### Reviewing an auto-drafted article

1. `/admin/articles` → filter status = **Draft**
2. Open the draft. Auto-drafts are marked with their `sourceUrl`.
3. **Verify every factual claim against the source.** This is the editor's core job.
4. Rewrite anything that reads like AI output.
5. Add a hero image — auto-drafts have none.
6. Check SEO fields, adjust if generic.
7. Publish or discard.

### Publishing a founder or creator profile

1. `/admin/profiles` → **Add New Profile**
2. Choose type: **Founder** or **Creator**
3. Fill name, company/medium, location
4. Add the **signature quote** — this is the most important field on the page
5. Add 2–3 **bio paragraphs**
6. Fill the **stats** (founders) or **platform links** (creators)
7. Write the **long-form body**
8. Upload portrait (800×1000, high contrast — greyscale for founders, warm tone for creators)
9. Complete SEO block
10. Publish

### Updating the homepage

1. `/admin/homepage`
2. Change **Cover Story** — the single most visible slot on the site
3. Set 3 **Editor's Picks**
4. Set 3 **Featured This Week** (drag to reorder)
5. Configure or disable the **Sponsored strip**
6. **Save & Publish Changes**

---

## 11. SEO Requirements

Every published article and profile must have these before it can go live. Enforce as validation in the API, not just in the UI.

| Field | Rule |
|---|---|
| `metaTitle` | Required · ≤ 60 characters · contains focus keyword |
| `metaDesc` | Required · ≤ 160 characters |
| `slug` | Required · lowercase · hyphenated · no stop words |
| `ogImage` | Required · 1200×630 |
| `heroImage` | Required for published status |
| Schema | Article schema on articles · Person schema on profiles · BreadcrumbList on all |

**Auto-generated endpoints:**
- `/rss` — RSS 2.0, latest 20 published articles
- `/sitemap.xml` — all static pages + all published articles and profiles

Submit the sitemap to Google Search Console once the domain is live.

---

## 12. Distribution Automation

Trigger on article status change to `published`:

| Channel | Action |
|---|---|
| **RSS** | Automatic — article enters `/rss` |
| **Sitemap** | Automatic — article enters `/sitemap.xml` |
| **Instagram** | Webhook → n8n → generate branded card → post to feed + story |
| **Newsletter** | Article queued for next Saturday Communiqué |
| **LinkedIn** | Webhook → n8n → post with link |

**Newsletter cadence:** weekly, Saturday. Name: *The Saturday Communiqué*.

---

## 13. Current Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Static HTML + Tailwind CSS (CDN) |
| Backend | Node.js + Express |
| Database | MongoDB Atlas — `cluster0.oyrf2y7.mongodb.net` |
| Auth | JWT, 24h expiry |
| Hosting | Google Cloud Run — project `the-bombay-forum-492223`, region `us-central1` |
| Automation | n8n |
| LLM | Claude API / Gemini API |

**Deploy command:**
```bash
gcloud run deploy tbf-website \
  --project the-bombay-forum-492223 \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1
```

---

## 14. Build Priority

| Phase | Scope |
|---|---|
| **1** | Fix nav links · dynamic date · favicon · meta tags on all pages · connect domain |
| **2** | Wire admin panel to live API — article CRUD working end to end |
| **3** | RSS ingestion for 3 sources · dedup · LLM rewrite · save as draft |
| **4** | Expand to all sources · Instagram Graph API · profile management |
| **5** | Distribution automation — Instagram, newsletter, LinkedIn |
| **6** | Spotlight monetisation flow · payment integration |

---

## 15. Open Items for Developers

- [ ] Verify every RSS feed URL is live before adding to the source registry
- [ ] Set up Facebook Developer App and obtain Instagram Graph API long-lived token
- [ ] Add `0.0.0.0/0` to MongoDB Atlas IP Access List so Cloud Run can connect
- [ ] Move admin auth off client-side localStorage to server-verified JWT on every route
- [ ] Add rate limiting to all public API endpoints
- [ ] Set up image upload and CDN — currently images are external URLs
- [ ] Configure Google Search Console and submit sitemap
- [ ] Decide image hosting: Cloudflare Images, Cloudinary, or GCS bucket

---

*Prepared for MJX Labs · The Bombay Forum · v1.1*

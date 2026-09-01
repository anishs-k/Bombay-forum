# The Bombay Forum (TBF) — Content Ecosystem & Editorial Platform

[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org/)
[![Google Cloud Run](https://img.shields.io/badge/Deploy-Google%20Cloud%20Run-blue.svg)](https://cloud.google.com/run)
[![License](https://img.shields.io/badge/License-Proprietary%20%C2%B7%20MJX%20Labs-navy.svg)](#)

The Bombay Forum is a premium editorial platform covering business, wealth, luxury, culture, and the people building modern India.

---

## 1. System Architecture & The Three Layers

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. INGESTION LAYER                                                     │
│    • 16 Pre-Configured RSS & Google News Search Feeds                  │
│    • 4-Hour Background Polling Cron (node-cron) + Instant Admin Trigger │
│    • SHA256 Deduplication Hashing (`ingested` collection)               │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 2. PROCESSING LAYER                                                    │
│    • Category Classification & Tone Mapping (The 6 Pillars)            │
│    • LLM Rewriting in TBF Editorial Voice (Gemini API + Core Heuristic)│
│    • 6 Building Block Formatting: Pull Quotes, Key Stats, Subheadings  │
│    • Strict Rule 5.2 Enforcement: Mandatory `status: "draft"`          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 3. PUBLISHING & DISTRIBUTION LAYER (Mandatory Human Gate)              │
│    • Senior Editor Reviews, Edits, and Approves via `/admin/editor`    │
│    • Live Public Publication with Zero Border Radius Design System     │
│    • Automatic RSS 2.0 (`/rss`) & Dynamic XML Sitemap (`/sitemap.xml`) │
│    • Outgoing Webhooks for n8n Automation & The Saturday Communiqué    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Content Pillars & Routes

| Pillar | Route | Description & Tone | Primary Formats |
|---|---|---|---|
| **The Founders** | `/founders` | Startup founders, builders, funding journeys | Profile, Feature |
| **Creators** | `/creators` | Creator economy, filmmakers, artists, digital IP | Profile, Feature |
| **Wealth** | `/wealth` | Markets, family offices, investing, private equity | Brief, Feature, Opinion |
| **Future** | `/future` | AI, deep tech, frontier innovation, tokenomics | Explainer, Feature, Opinion |
| **The Suite** | `/suite` | Luxury hotels, horology, architecture, dining | Edit, Feature, List |
| **Bombay** | `/bombay` | Maximum City culture, heritage, neighbourhoods | Feature, List, Profile |

---

## 3. Quick Start & Local Development

### Prerequisites
- Node.js 18+ (tested on Node 20 & 24)
- npm 9+

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Start the server (Zero external dependencies needed!)
npm start
# or for live reload during development:
node server.js
```

### Default Local URLs
- **Public Website:** `http://localhost:8080/`
- **Admin Editorial Console:** `http://localhost:8080/admin`
- **RSS 2.0 XML Feed:** `http://localhost:8080/rss`
- **Dynamic XML Sitemap:** `http://localhost:8080/sitemap.xml`
- **Robots.txt:** `http://localhost:8080/robots.txt`

### Admin Credentials (Pre-seeded)
- **Email:** `admin@thebombayforum.com`
- **Password:** `tbfadmin2026`

---

## 4. Google Cloud Run Deployment

Deploy directly to Google Cloud Run as specified in Section 13:

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

## 5. Design System Tokens (Sharp Edges Non-Negotiable)

- **Navy:** `#0E2130` (Header, footer, dark sections)
- **Admin Sidebar:** `#091C2A`
- **Teal Accent:** `#4A8090` / `#8BB0B8` (Badges, pull-quote borders, stat numbers)
- **Sage:** `#B8D4CC` (Text on dark backgrounds)
- **Cream:** `#FAFAF5` (Page background)
- **Surface:** `#EEEEE9` (Card containers)
- **Border Radius:** **`0px` everywhere** (No rounded corners on buttons, cards, or images)
- **Typography:** Newsreader & Cormorant Garamond (Serif headlines & pull quotes), Manrope (Sans body text)

---

## 6. Article Building Blocks (Brief Section 7)

Every article is constructed using TBF's 6 signature elements:
1. **Paragraph:** Manrope, 18px, line-height 1.8, 92% opacity.
2. **Bold Emphasis:** `<strong>` for structural turning points.
3. **Pull Quote:** Serif italic, 40px, 4px teal left border, 48px padding.
4. **Subheading:** Serif, 30px, primary navy `#0E2130`, generous top margin.
5. **Inline Image:** 16:9 full column width with 11px muted italic caption.
6. **Key Stat:** 68px serif number in teal + 11px uppercase label on surface background.

---

*The Bombay Forum · Developed for MJX Labs · Version 1.1*

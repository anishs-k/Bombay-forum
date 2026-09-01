const express = require('express');
const router = express.Router();

const { Article, Profile, HomepageConfig, Source, Subscriber, Ingested } = require('../models');
const { CATEGORIES, FORMATS, FRANCHISES, SITE_NAME, SITE_TAGLINE, SITE_URL } = require('../config/constants');
const { requireAdminPageAuth } = require('../utils/auth');
const { formatDate, calculateReadingTime, renderArticleContent } = require('../utils/helpers');
const distributionService = require('../services/distributionService');

// Make constants and helpers globally available in templates
router.use((req, res, next) => {
  res.locals.categories = CATEGORIES;
  res.locals.formats = FORMATS;
  res.locals.franchises = FRANCHISES;
  res.locals.siteName = SITE_NAME;
  res.locals.siteTagline = SITE_TAGLINE;
  res.locals.siteUrl = SITE_URL;
  res.locals.currentPath = req.path;
  res.locals.formatDate = formatDate;
  res.locals.calculateReadingTime = calculateReadingTime;
  res.locals.renderArticleContent = renderArticleContent;

  // Dynamic Current Date for Bombay Top Bar
  const now = new Date();
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' };
  res.locals.currentDateBombay = `${now.toLocaleDateString('en-IN', options)} · Mumbai`;

  next();
});

// --- Public Pages ---

// Homepage
router.get('/', async (req, res) => {
  try {
    const config = await HomepageConfig.findOne({ active: true }) || await HomepageConfig.findOne({});

    let coverStory = config?.coverStoryId ? await Article.findById(config.coverStoryId) : null;
    if (!coverStory || coverStory.status !== 'published') {
      coverStory = await Article.findOne({ status: 'published' });
    }

    let editorsPicks = [];
    if (config?.editorsPickIds?.length) {
      for (const id of config.editorsPickIds) {
        const art = await Article.findById(id);
        if (art && art.status === 'published' && art._id !== coverStory?._id) editorsPicks.push(art);
      }
    }
    if (editorsPicks.length < 3) {
      const morePicks = await Article.find({ status: 'published', _id: { $ne: coverStory?._id } }, { publishedAt: -1 }, 3);
      editorsPicks = morePicks;
    }

    let featuredThisWeek = [];
    if (config?.featuredThisWeekIds?.length) {
      for (const id of config.featuredThisWeekIds) {
        const art = await Article.findById(id);
        if (art && art.status === 'published') featuredThisWeek.push(art);
      }
    }
    if (featuredThisWeek.length < 3) {
      const moreFeats = await Article.find({ status: 'published' }, { views: -1 }, 3);
      featuredThisWeek = moreFeats;
    }

    // Category latest dispatches
    const categoryArticles = {};
    for (const cat of CATEGORIES) {
      categoryArticles[cat.slug] = await Article.find({ category: cat.slug, status: 'published' }, { publishedAt: -1 }, 4);
    }

    // Featured Profiles
    const featuredFounders = await Profile.find({ type: 'founder', status: 'published' }, { createdAt: -1 }, 2);
    const featuredCreators = await Profile.find({ type: 'creator', status: 'published' }, { createdAt: -1 }, 2);

    res.render('index', {
      pageTitle: `${SITE_NAME} — ${SITE_TAGLINE}`,
      metaDescription: 'The Bombay Forum is a premium editorial platform covering business, wealth, luxury, culture and the people building modern India.',
      ogImage: coverStory?.heroImage || 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&h=630&q=80',
      coverStory,
      editorsPicks,
      featuredThisWeek,
      sponsoredStrip: config?.sponsoredStrip || { enabled: false },
      categoryArticles,
      featuredFounders,
      featuredCreators
    });
  } catch (err) {
    console.error('Homepage error:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Category Pillar Pages (/founders, /creators, /wealth, /future, /suite, /bombay)
CATEGORIES.forEach(cat => {
  router.get(`/${cat.slug}`, async (req, res) => {
    try {
      const articles = await Article.find({ category: cat.slug, status: 'published' }, { publishedAt: -1 });
      const leadStory = articles[0] || null;
      const secondaryStories = articles.slice(1, 4);
      const remainingStories = articles.slice(4);

      let profiles = [];
      if (cat.slug === 'founders') {
        profiles = await Profile.find({ type: 'founder', status: 'published' }, { createdAt: -1 }, 6);
      } else if (cat.slug === 'creators') {
        profiles = await Profile.find({ type: 'creator', status: 'published' }, { createdAt: -1 }, 6);
      }

      res.render('category', {
        category: cat,
        pageTitle: `${cat.name} — ${SITE_NAME}`,
        metaDescription: cat.description,
        leadStory,
        secondaryStories,
        remainingStories,
        profiles
      });
    } catch (err) {
      console.error(`Category ${cat.slug} error:`, err);
      res.status(500).send('Internal Server Error');
    }
  });
});

// Article Detail Page
router.get('/article/:slug', async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug });
    if (!article || (article.status !== 'published' && !req.cookies?.tbf_admin_token)) {
      return res.status(404).render('404', { pageTitle: 'Article Not Found — The Bombay Forum' });
    }

    // Increment view count asynchronously
    Article.findByIdAndUpdate(article._id, { views: (article.views || 0) + 1 }).catch(() => {});

    // Related Articles in same category
    const relatedArticles = await Article.find(
      { category: article.category, status: 'published', _id: { $ne: article._id } },
      { publishedAt: -1 },
      3
    );

    const categoryInfo = CATEGORIES.find(c => c.slug === article.category) || CATEGORIES[0];

    res.render('article', {
      article,
      categoryInfo,
      relatedArticles,
      pageTitle: `${article.metaTitle || article.title} — ${SITE_NAME}`,
      metaDescription: article.metaDesc || article.excerpt,
      ogImage: article.ogImage || article.heroImage
    });
  } catch (err) {
    console.error('Article detail error:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Founder Profile Page
router.get('/founder-profile/:slug', async (req, res) => {
  try {
    const profile = await Profile.findOne({ slug: req.params.slug, type: 'founder' });
    if (!profile) {
      return res.status(404).render('404', { pageTitle: 'Profile Not Found — The Bombay Forum' });
    }

    const moreFounders = await Profile.find(
      { type: 'founder', status: 'published', _id: { $ne: profile._id } },
      { createdAt: -1 },
      3
    );

    res.render('profile', {
      profile,
      moreProfiles: moreFounders,
      pageTitle: `${profile.name} — Founder Profile · ${SITE_NAME}`,
      metaDescription: profile.metaDesc || profile.quote,
      ogImage: profile.heroImage
    });
  } catch (err) {
    console.error('Founder profile error:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Creator Profile Page
router.get('/creator-profile/:slug', async (req, res) => {
  try {
    const profile = await Profile.findOne({ slug: req.params.slug, type: 'creator' });
    if (!profile) {
      return res.status(404).render('404', { pageTitle: 'Profile Not Found — The Bombay Forum' });
    }

    const moreCreators = await Profile.find(
      { type: 'creator', status: 'published', _id: { $ne: profile._id } },
      { createdAt: -1 },
      3
    );

    res.render('profile', {
      profile,
      moreProfiles: moreCreators,
      pageTitle: `${profile.name} — Creator Profile · ${SITE_NAME}`,
      metaDescription: profile.metaDesc || profile.quote,
      ogImage: profile.heroImage
    });
  } catch (err) {
    console.error('Creator profile error:', err);
    res.status(500).send('Internal Server Error');
  }
});

// About Page
router.get('/about', (req, res) => {
  res.render('about', {
    pageTitle: `About — ${SITE_NAME}`,
    metaDescription: 'The Bombay Forum manifesto, editorial standards, masthead, and mission to chronicle modern India.'
  });
});

// Spotlight (Brand Partnerships) Page
router.get('/spotlight', (req, res) => {
  res.render('spotlight', {
    pageTitle: `TBF Spotlight — Bespoke Editorial & Brand Partnerships`,
    metaDescription: 'Partner with The Bombay Forum to tell your brand story to India’s most influential founders, investors, and tastemakers.'
  });
});

// Policies Page (Tabbed: Privacy, Terms, Cookies, AI Disclosure)
router.get('/policies', (req, res) => {
  res.render('policies', {
    pageTitle: `Policies, Ethics & Disclosures — ${SITE_NAME}`,
    metaDescription: 'Editorial standards, privacy policy, terms of service, and AI content disclosures for The Bombay Forum.'
  });
});

// Search Page
router.get('/search', async (req, res) => {
  const query = req.query.q || '';
  let results = [];
  if (query.trim()) {
    results = await Article.find({
      status: 'published',
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { excerpt: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } }
      ]
    }, { publishedAt: -1 }, 30);
  }

  res.render('search', {
    query,
    results,
    pageTitle: `Search: "${query}" — ${SITE_NAME}`,
    metaDescription: `Search results for ${query} across The Bombay Forum.`
  });
});

// --- Dynamic Distribution Endpoints ---

// RSS 2.0 XML Feed
router.get('/rss', async (req, res) => {
  try {
    const xml = await distributionService.generateRssXml();
    res.set('Content-Type', 'application/rss+xml; charset=utf-8');
    res.send(xml);
  } catch (err) {
    console.error('RSS generation error:', err);
    res.status(500).send('Error generating RSS feed');
  }
});

// XML Sitemap
router.get('/sitemap.xml', async (req, res) => {
  try {
    const xml = await distributionService.generateSitemapXml();
    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.send(xml);
  } catch (err) {
    console.error('Sitemap generation error:', err);
    res.status(500).send('Error generating Sitemap');
  }
});

// Robots.txt
router.get('/robots.txt', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(`User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`);
});

// --- Admin Pages ---

router.get('/admin', (req, res) => {
  const token = req.cookies?.tbf_admin_token;
  if (token) return res.redirect('/admin/dashboard');
  res.redirect('/admin/login');
});

router.get('/admin/login', (req, res) => {
  res.render('admin/login', { pageTitle: 'Admin Access — The Bombay Forum' });
});

router.get('/admin/dashboard', requireAdminPageAuth, async (req, res) => {
  res.render('admin/dashboard', { pageTitle: 'Editorial Dashboard — TBF Admin' });
});

router.get('/admin/articles', requireAdminPageAuth, async (req, res) => {
  res.render('admin/articles', { pageTitle: 'Article Management — TBF Admin' });
});

router.get('/admin/editor', requireAdminPageAuth, async (req, res) => {
  res.render('admin/editor', { pageTitle: 'New Article — TBF Editor', articleId: null });
});

router.get('/admin/editor/:id', requireAdminPageAuth, async (req, res) => {
  res.render('admin/editor', { pageTitle: 'Edit Article — TBF Editor', articleId: req.params.id });
});

router.get('/admin/profiles', requireAdminPageAuth, async (req, res) => {
  res.render('admin/profiles', { pageTitle: 'Profiles — TBF Admin' });
});

router.get('/admin/profile-editor', requireAdminPageAuth, async (req, res) => {
  res.render('admin/profile-editor', { pageTitle: 'New Profile — TBF Admin', profileId: null });
});

router.get('/admin/profile-editor/:id', requireAdminPageAuth, async (req, res) => {
  res.render('admin/profile-editor', { pageTitle: 'Edit Profile — TBF Admin', profileId: req.params.id });
});

router.get('/admin/homepage', requireAdminPageAuth, async (req, res) => {
  res.render('admin/homepage', { pageTitle: 'Homepage Slot Controller — TBF Admin' });
});

router.get('/admin/ingestion', requireAdminPageAuth, async (req, res) => {
  res.render('admin/ingestion', { pageTitle: 'Content Ingestion & Sources — TBF Admin' });
});

router.get('/admin/sources', requireAdminPageAuth, (req, res) => {
  res.redirect('/admin/ingestion');
});

router.get('/admin/subscribers', requireAdminPageAuth, async (req, res) => {
  res.render('admin/subscribers', { pageTitle: 'Newsletter Subscribers — TBF Admin' });
});

router.get('/admin/spotlights', requireAdminPageAuth, async (req, res) => {
  res.render('admin/spotlights', { pageTitle: 'Brand Spotlights — TBF Admin' });
});

router.get('/admin/seo', requireAdminPageAuth, async (req, res) => {
  res.render('admin/seo', { pageTitle: 'SEO & Distribution — TBF Admin' });
});

// 404 handler
router.use((req, res) => {
  res.status(404).render('404', { pageTitle: 'Page Not Found — The Bombay Forum' });
});

module.exports = router;

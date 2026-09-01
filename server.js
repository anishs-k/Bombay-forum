require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const { connectDB } = require('./src/config/db');
const { seedDatabase } = require('./src/utils/seed');

const apiRoutes = require('./src/routes/api');
const pageRoutes = require('./src/routes/pages');

const app = express();
const PORT = process.env.PORT || 8080;

// Detect environment: Vercel injects VERCEL=1 into every function invocation.
const IS_VERCEL = !!process.env.VERCEL;

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Security & Parsing Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Allows Google Fonts, Tailwind CDN, and external editorial imagery
  crossOriginEmbedderPolicy: false
}));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Static Files
app.use(express.static(path.join(__dirname, 'public')));

// Rate Limiter for Public APIs & Auth
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests from this IP, please try again later.' }
});
app.use('/api/', publicLimiter);

// ---------------------------------------------------------------------------
// DB bootstrap
//
// On a persistent server (local / Docker / Cloud Run) this runs once at
// startup. On Vercel there is no "startup" — every route hits a serverless
// function, and a cold-started function may reuse a warm container on the
// next request. So instead of connecting once up front, we lazily connect
// on the first request that comes into a given container, and cache the
// promise so concurrent/subsequent requests in that same warm container
// reuse the same connection instead of reconnecting every time.
// ---------------------------------------------------------------------------
let bootstrapPromise = null;
function ensureBootstrapped() {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      await connectDB();
      await seedDatabase();
    })().catch(err => {
      // If bootstrap fails, clear the cache so the next request can retry
      // instead of every future request failing on a poisoned promise.
      bootstrapPromise = null;
      throw err;
    });
  }
  return bootstrapPromise;
}

app.use((req, res, next) => {
  ensureBootstrapped().then(() => next()).catch(next);
});

// Mount Routes
app.use('/api', apiRoutes);
app.use('/', pageRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  if (req.path.startsWith('/api/')) {
    return res.status(500).json({ success: false, error: 'Internal Server Error', message: err.message });
  }
  res.status(500).render('404', { pageTitle: 'Server Error — The Bombay Forum' });
});

// ---------------------------------------------------------------------------
// Local / traditional-host mode only.
//
// On Vercel, this file is never "run" directly — it's imported as the
// serverless function handler (see the "builds" entry in vercel.json).
// Calling app.listen() there would be a no-op at best and a resource leak
// at worst, so it's gated behind the VERCEL env check.
//
// node-cron is NOT started here anymore — Vercel functions don't stay
// alive between requests, so a setInterval-style scheduler would never
// actually fire. Ingestion is now triggered via a dedicated route
// (see src/routes/api.js -> /api/cron/ingest) invoked by Vercel Cron
// (vercel.json) and/or an external scheduler.
// ---------------------------------------------------------------------------
if (!IS_VERCEL && require.main === module) {
  ensureBootstrapped()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`=======================================================`);
        console.log(`🏛️  THE BOMBAY FORUM — Content Ecosystem & Platform`);
        console.log(`🌐 Server running on: http://localhost:${PORT}`);
        console.log(`📰 Public Site:       http://localhost:${PORT}/`);
        console.log(`⚙️  Admin Console:     http://localhost:${PORT}/admin`);
        console.log(`📡 RSS Feed:          http://localhost:${PORT}/rss`);
        console.log(`🗺️  Sitemap:           http://localhost:${PORT}/sitemap.xml`);
        console.log(`=======================================================`);
      });

      // Only start the interval-based cron when actually running as a
      // long-lived process (local/Docker/Cloud Run), never on Vercel.
      const schedulerService = require('./src/services/schedulerService');
      schedulerService.init();
    })
    .catch(err => {
      console.error('Fatal startup error:', err);
      process.exit(1);
    });
}

module.exports = app;
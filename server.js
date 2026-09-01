require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const { connectDB } = require('./src/config/db');
const { seedDatabase } = require('./src/utils/seed');
const schedulerService = require('./src/services/schedulerService');

const apiRoutes = require('./src/routes/api');
const pageRoutes = require('./src/routes/pages');

const app = express();
const PORT = process.env.PORT || 8080;

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

// Boot Server
async function startServer() {
  try {
    // 1. Connect to Database (Atlas or local fallback)
    await connectDB();

    // 2. Run initial seeder
    await seedDatabase();

    // 3. Initialize background ingestion cron
    schedulerService.init();

    // 4. Start Listening
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
  } catch (err) {
    console.error('Fatal startup error:', err);
    process.exit(1);
  }
}

startServer();

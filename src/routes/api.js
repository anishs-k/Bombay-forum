const express = require('express');
const router = express.Router();

const { requireAdminApiAuth } = require('../utils/auth');

// Controllers
const authController = require('../controllers/authController');
const articleController = require('../controllers/articleController');
const profileController = require('../controllers/profileController');
const homepageController = require('../controllers/homepageController');
const sourceController = require('../controllers/sourceController');
const ingestionController = require('../controllers/ingestionController');
const subscriberController = require('../controllers/subscriberController');
const spotlightController = require('../controllers/spotlightController');
const analyticsController = require('../controllers/analyticsController');

// --- Auth Routes ---
router.post('/auth/login', authController.login);
router.post('/auth/logout', authController.logout);
router.get('/auth/me', requireAdminApiAuth, authController.me);
router.post('/auth/password', requireAdminApiAuth, authController.updatePassword);

// --- Articles API ---
router.get('/articles', articleController.listArticles);
router.get('/articles/slug/:slug', articleController.getArticleBySlug);
router.get('/articles/:id', articleController.getArticleById);
router.post('/articles', requireAdminApiAuth, articleController.createArticle);
router.put('/articles/:id', requireAdminApiAuth, articleController.updateArticle);
router.delete('/articles/:id', requireAdminApiAuth, articleController.deleteArticle);
router.post('/articles/bulk', requireAdminApiAuth, articleController.bulkAction);
router.post('/articles/:id/view', articleController.incrementView);

// --- Profiles API ---
router.get('/profiles', profileController.listProfiles);
router.get('/profiles/slug/:slug', profileController.getProfileBySlug);
router.get('/profiles/:id', profileController.getProfileById);
router.post('/profiles', requireAdminApiAuth, profileController.createProfile);
router.put('/profiles/:id', requireAdminApiAuth, profileController.updateProfile);
router.delete('/profiles/:id', requireAdminApiAuth, profileController.deleteProfile);

// --- Homepage API ---
router.get('/homepage', homepageController.getHomepageConfig);
router.put('/homepage', requireAdminApiAuth, homepageController.updateHomepageConfig);

// --- Sources API (Admin) ---
router.get('/sources', requireAdminApiAuth, sourceController.listSources);
router.post('/sources', requireAdminApiAuth, sourceController.createSource);
router.put('/sources/:id', requireAdminApiAuth, sourceController.updateSource);
router.delete('/sources/:id', requireAdminApiAuth, sourceController.deleteSource);
router.post('/sources/:id/toggle', requireAdminApiAuth, sourceController.toggleSource);

// --- Ingestion Pipeline API (Admin) ---
router.post('/ingestion/trigger', requireAdminApiAuth, ingestionController.triggerIngestion);
router.get('/ingestion/logs', requireAdminApiAuth, ingestionController.getIngestionLogs);
router.get('/ingestion/history', requireAdminApiAuth, ingestionController.getIngestedList);
router.get('/ingestion/settings', requireAdminApiAuth, ingestionController.getSettings);
router.put('/ingestion/settings', requireAdminApiAuth, ingestionController.updateSettings);

// --- Newsletter Subscribers API ---
router.post('/subscribers', subscriberController.subscribe);
router.get('/subscribers', requireAdminApiAuth, subscriberController.listSubscribers);
router.get('/subscribers/export', requireAdminApiAuth, subscriberController.exportSubscribersCsv);

// --- Spotlight (Brand Features) API ---
router.post('/spotlights', spotlightController.submitInquiry);
router.get('/spotlights', requireAdminApiAuth, spotlightController.listSpotlights);
router.put('/spotlights/:id', requireAdminApiAuth, spotlightController.updateSpotlightStatus);

// --- Analytics API (Admin) ---
router.get('/analytics/dashboard', requireAdminApiAuth, analyticsController.getDashboardStats);

module.exports = router;

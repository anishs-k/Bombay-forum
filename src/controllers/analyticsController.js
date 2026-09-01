const { Article, Profile, Source, Subscriber, Ingested, Spotlight } = require('../models');

async function getDashboardStats(req, res) {
  try {
    const totalArticles = await Article.countDocuments();
    const publishedArticles = await Article.countDocuments({ status: 'published' });
    const draftArticles = await Article.countDocuments({ status: 'draft' });
    const totalProfiles = await Profile.countDocuments();
    const totalSources = await Source.countDocuments({ active: true });
    const totalSubscribers = await Subscriber.countDocuments({ status: 'active' });
    const totalIngested = await Ingested.countDocuments();
    const pendingSpotlights = await Spotlight.countDocuments({ status: 'new' });

    // Calculate total views
    const allArticles = await Article.find({});
    const totalViews = allArticles.reduce((acc, a) => acc + (a.views || 0), 0);

    // Breakdown by Category
    const categoryCounts = {
      founders: 0,
      creators: 0,
      wealth: 0,
      future: 0,
      suite: 0,
      bombay: 0
    };

    allArticles.forEach(a => {
      if (categoryCounts[a.category] !== undefined) {
        categoryCounts[a.category]++;
      }
    });

    // Recent Drafts (Awaiting Review Gate)
    const recentDrafts = await Article.find({ status: 'draft' }, { createdAt: -1 }, 8);

    // Top Performing Published Articles
    const topArticles = await Article.find({ status: 'published' }, { views: -1 }, 5);

    res.json({
      success: true,
      data: {
        stats: {
          totalArticles,
          publishedArticles,
          draftArticles,
          totalProfiles,
          totalSources,
          totalSubscribers,
          totalIngested,
          pendingSpotlights,
          totalViews
        },
        categoryCounts,
        recentDrafts,
        topArticles
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  getDashboardStats
};

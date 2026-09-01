const { HomepageConfig, Article } = require('../models');

async function getHomepageConfig(req, res) {
  try {
    let config = await HomepageConfig.findOne({ active: true });
    if (!config) {
      config = await HomepageConfig.findOne({});
    }

    // Populate actual article items
    let coverStory = null;
    if (config?.coverStoryId) {
      coverStory = await Article.findById(config.coverStoryId);
    }
    if (!coverStory) {
      coverStory = await Article.findOne({ status: 'published' });
    }

    let editorsPicks = [];
    if (config?.editorsPickIds && config.editorsPickIds.length > 0) {
      for (const id of config.editorsPickIds) {
        const art = await Article.findById(id);
        if (art && art.status === 'published') editorsPicks.push(art);
      }
    }
    if (editorsPicks.length < 3) {
      const fallbackPicks = await Article.find(
        { status: 'published', _id: { $ne: coverStory?._id } },
        { publishedAt: -1 },
        3
      );
      editorsPicks = fallbackPicks;
    }

    let featuredThisWeek = [];
    if (config?.featuredThisWeekIds && config.featuredThisWeekIds.length > 0) {
      for (const id of config.featuredThisWeekIds) {
        const art = await Article.findById(id);
        if (art && art.status === 'published') featuredThisWeek.push(art);
      }
    }
    if (featuredThisWeek.length < 3) {
      const fallbackFeats = await Article.find(
        { status: 'published' },
        { views: -1 },
        3
      );
      featuredThisWeek = fallbackFeats;
    }

    res.json({
      success: true,
      data: {
        config,
        coverStory,
        editorsPicks,
        featuredThisWeek
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function updateHomepageConfig(req, res) {
  try {
    const { coverStoryId, editorsPickIds, featuredThisWeekIds, sponsoredStrip } = req.body;

    let config = await HomepageConfig.findOne({});
    if (!config) {
      config = await HomepageConfig.create({
        coverStoryId: coverStoryId || '',
        editorsPickIds: editorsPickIds || [],
        featuredThisWeekIds: featuredThisWeekIds || [],
        sponsoredStrip: sponsoredStrip || {},
        active: true
      });
    } else {
      config = await HomepageConfig.findByIdAndUpdate(config._id, {
        coverStoryId: coverStoryId !== undefined ? coverStoryId : config.coverStoryId,
        editorsPickIds: editorsPickIds !== undefined ? editorsPickIds : config.editorsPickIds,
        featuredThisWeekIds: featuredThisWeekIds !== undefined ? featuredThisWeekIds : config.featuredThisWeekIds,
        sponsoredStrip: sponsoredStrip !== undefined ? sponsoredStrip : config.sponsoredStrip
      });
    }

    res.json({ success: true, data: config, message: 'Homepage slots updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  getHomepageConfig,
  updateHomepageConfig
};

const { Article } = require('../models');
const { generateSlug, calculateReadingTime } = require('../utils/helpers');
const distributionService = require('../services/distributionService');

async function listArticles(req, res) {
  try {
    const { category, status, format, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (category) query.category = category;
    if (status) query.status = status;
    if (format) query.format = format;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const total = await Article.countDocuments(query);
    const articles = await Article.find(query, { createdAt: -1 }, limitNum, skip);

    res.json({
      success: true,
      data: articles,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function getArticleById(req, res) {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ success: false, error: 'Article not found' });
    res.json({ success: true, data: article });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function getArticleBySlug(req, res) {
  try {
    const article = await Article.findOne({ slug: req.params.slug });
    if (!article) return res.status(404).json({ success: false, error: 'Article not found' });
    res.json({ success: true, data: article });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function createArticle(req, res) {
  try {
    const data = req.body;

    if (!data.title || !data.category || !data.content) {
      return res.status(400).json({ success: false, error: 'Title, category, and content are required' });
    }

    // Slug validation / generation
    let slug = data.slug ? generateSlug(data.slug) : generateSlug(data.title);
    const existing = await Article.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    // Validation for published state (Brief 11)
    if (data.status === 'published') {
      if (!data.heroImage) {
        return res.status(400).json({ success: false, error: 'Hero image is required for published articles' });
      }
      if (!data.metaTitle) {
        data.metaTitle = `${data.title.substring(0, 50)} | TBF`;
      }
      if (!data.metaDesc) {
        data.metaDesc = data.excerpt ? data.excerpt.substring(0, 160) : data.title;
      }
    }

    const newArticle = await Article.create({
      title: data.title,
      slug: slug,
      category: data.category,
      format: data.format || 'feature',
      author: data.author || 'TBF Editorial Desk',
      heroImage: data.heroImage || 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1600&h=900&q=80',
      heroCaption: data.heroCaption || '',
      excerpt: data.excerpt || data.title,
      content: data.content,
      pullQuotes: Array.isArray(data.pullQuotes) ? data.pullQuotes : (data.pullQuotes ? [data.pullQuotes] : []),
      inlineImages: data.inlineImages || [],
      keyStats: data.keyStats || [],
      tags: Array.isArray(data.tags) ? data.tags : (data.tags ? data.tags.split(',').map(t => t.trim()) : [data.category]),
      metaTitle: data.metaTitle || `${data.title.substring(0, 50)} | TBF`,
      metaDesc: data.metaDesc || (data.excerpt || data.title).substring(0, 160),
      ogImage: data.ogImage || data.heroImage,
      status: data.status || 'draft',
      sourceUrl: data.sourceUrl || '',
      sourceName: data.sourceName || '',
      confidence: data.confidence !== undefined ? data.confidence : 1.0,
      views: 0,
      publishedAt: data.status === 'published' ? (data.publishedAt || new Date().toISOString()) : null
    });

    if (newArticle.status === 'published') {
      distributionService.onArticlePublished(newArticle);
    }

    res.status(201).json({ success: true, data: newArticle });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function updateArticle(req, res) {
  try {
    const articleId = req.params.id;
    const existing = await Article.findById(articleId);
    if (!existing) return res.status(404).json({ success: false, error: 'Article not found' });

    const updateData = { ...req.body };

    // Format tags if string
    if (typeof updateData.tags === 'string') {
      updateData.tags = updateData.tags.split(',').map(t => t.trim()).filter(Boolean);
    }

    // Format pullquotes if string
    if (typeof updateData.pullQuotes === 'string') {
      updateData.pullQuotes = [updateData.pullQuotes];
    }

    // If publishing now
    if (updateData.status === 'published' && existing.status !== 'published') {
      if (!updateData.heroImage && !existing.heroImage) {
        return res.status(400).json({ success: false, error: 'Hero image is required for published articles' });
      }
      if (!updateData.publishedAt) {
        updateData.publishedAt = new Date().toISOString();
      }
    }

    const updated = await Article.findByIdAndUpdate(articleId, updateData);

    if (updated.status === 'published' && existing.status !== 'published') {
      distributionService.onArticlePublished(updated);
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function deleteArticle(req, res) {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) return res.status(404).json({ success: false, error: 'Article not found' });
    res.json({ success: true, message: 'Article deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function bulkAction(req, res) {
  try {
    const { action, ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, error: 'No IDs provided for bulk action' });
    }

    if (action === 'publish') {
      for (const id of ids) {
        const art = await Article.findById(id);
        if (art) {
          await Article.findByIdAndUpdate(id, {
            status: 'published',
            publishedAt: art.publishedAt || new Date().toISOString()
          });
          distributionService.onArticlePublished(art);
        }
      }
      return res.json({ success: true, message: `Published ${ids.length} articles` });
    } else if (action === 'archive') {
      for (const id of ids) {
        await Article.findByIdAndUpdate(id, { status: 'archived' });
      }
      return res.json({ success: true, message: `Archived ${ids.length} articles` });
    } else if (action === 'delete') {
      for (const id of ids) {
        await Article.findByIdAndDelete(id);
      }
      return res.json({ success: true, message: `Deleted ${ids.length} articles` });
    }

    res.status(400).json({ success: false, error: 'Invalid bulk action specified' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function incrementView(req, res) {
  try {
    const article = await Article.findById(req.params.id);
    if (article) {
      await Article.findByIdAndUpdate(req.params.id, { views: (article.views || 0) + 1 });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  listArticles,
  getArticleById,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
  bulkAction,
  incrementView
};

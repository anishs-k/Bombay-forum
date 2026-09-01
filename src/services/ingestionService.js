const Parser = require('rss-parser');
const { Source, Ingested, Article } = require('../models');
const { generateHash, generateSlug } = require('../utils/helpers');
const llmService = require('./llmService');

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 TheBombayForum/1.1'
  }
});

// Curated Editorial Image Presets for Category Fallbacks
const CATEGORY_DEFAULT_IMAGES = {
  founders: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1600&h=900&q=80',
  creators: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1600&h=900&q=80',
  wealth: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1600&h=900&q=80',
  future: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1600&h=900&q=80',
  suite: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&h=900&q=80',
  bombay: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1600&h=900&q=80'
};

class IngestionService {
  constructor() {
    this.isRunning = false;
    this.lastRunLog = [];
  }

  log(message, type = 'info') {
    const entry = {
      timestamp: new Date().toISOString(),
      type,
      message
    };
    this.lastRunLog.unshift(entry);
    if (this.lastRunLog.length > 200) this.lastRunLog.pop();
    console.log(`[Ingestion ${type.toUpperCase()}] ${message}`);
  }

  getLogs() {
    return this.lastRunLog;
  }

  async runPipeline(sourceId = null) {
    if (this.isRunning) {
      return { success: false, message: 'Ingestion pipeline is already running.' };
    }

    this.isRunning = true;
    this.log('🚀 Starting TBF Content Ingestion Pipeline...', 'info');

    let totalFetched = 0;
    let totalDrafted = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    try {
      let query = { active: true };
      if (sourceId) {
        query = { _id: sourceId };
      }

      const sources = await Source.find(query);
      this.log(`Found ${sources.length} active source(s) to process.`, 'info');

      for (const source of sources) {
        this.log(`Fetching feed for "${source.name}" (${source.url})...`, 'info');

        try {
          const feed = await parser.parseURL(source.url);
          const items = (feed.items || []).slice(0, 8); // Process up to 8 top recent items per source
          this.log(`Retrieved ${items.length} items from ${source.name}.`, 'info');

          let sourceFetchedCount = 0;

          for (const item of items) {
            totalFetched++;
            const itemUrl = item.link || item.guid || '';
            const itemTitle = item.title || '';
            const itemContent = item.contentSnippet || item.content || item.summary || '';

            if (!itemUrl || !itemTitle) {
              totalSkipped++;
              continue;
            }

            // 1. Deduplicate check
            const hash = generateHash(itemUrl, itemTitle);
            const existing = await Ingested.findOne({ hash });

            if (existing) {
              totalSkipped++;
              continue;
            }

            this.log(`Processing new candidate: "${itemTitle.substring(0, 50)}..."`, 'info');

            // 2. Classify & LLM Rewrite
            const rewritten = await llmService.rewriteArticle({
              title: itemTitle,
              sourceText: itemContent,
              sourceUrl: itemUrl,
              category: source.category,
              sourceName: source.name
            });

            // 3. Extract or fallback hero image
            let heroImage = item.enclosure?.url || (item['media:content'] && item['media:content'].$ ? item['media:content'].$.url : null);
            if (!heroImage || !heroImage.startsWith('http')) {
              heroImage = CATEGORY_DEFAULT_IMAGES[source.category] || CATEGORY_DEFAULT_IMAGES.bombay;
            }

            // 4. Generate unique slug
            let baseSlug = generateSlug(rewritten.title);
            let slug = baseSlug;
            let counter = 1;
            while (await Article.findOne({ slug })) {
              slug = `${baseSlug}-${counter++}`;
            }

            // 5. Save as DRAFT (Strict Human Review Gate)
            const newArticle = await Article.create({
              title: rewritten.title,
              slug: slug,
              category: source.category,
              format: rewritten.format || 'brief',
              author: 'TBF Editorial Desk',
              heroImage: heroImage,
              heroCaption: `Archival / Source dispatch via ${source.name}`,
              excerpt: rewritten.deck,
              content: rewritten.body,
              pullQuotes: rewritten.pullQuote ? [rewritten.pullQuote] : [],
              tags: rewritten.tags || [source.category],
              metaTitle: rewritten.metaTitle,
              metaDesc: rewritten.metaDesc,
              ogImage: heroImage,
              status: 'draft', // MANDATORY GATE: Always draft
              sourceUrl: itemUrl,
              sourceName: source.name,
              confidence: rewritten.confidence || 0.88,
              views: 0,
              publishedAt: null
            });

            // 6. Record in Ingested collection
            await Ingested.create({
              hash: hash,
              sourceUrl: itemUrl,
              title: itemTitle,
              sourceName: source.name,
              category: source.category,
              status: 'drafted',
              articleId: newArticle._id,
              confidence: rewritten.confidence || 0.88
            });

            totalDrafted++;
            sourceFetchedCount++;
            this.log(`✓ Auto-drafted [${source.category.toUpperCase()}]: "${rewritten.title}" (ID: ${newArticle._id})`, 'success');
          }

          // Update Source record
          await Source.findByIdAndUpdate(source._id, {
            lastPolledAt: new Date().toISOString(),
            itemsFetched: (source.itemsFetched || 0) + sourceFetchedCount,
            lastError: ''
          });

        } catch (sourceErr) {
          totalErrors++;
          this.log(`Error parsing source "${source.name}": ${sourceErr.message}`, 'error');
          await Source.findByIdAndUpdate(source._id, {
            lastPolledAt: new Date().toISOString(),
            lastError: sourceErr.message
          });
        }
      }

      this.log(`🎉 Pipeline completed! Fetched: ${totalFetched}, Drafted: ${totalDrafted}, Skipped (Duplicates): ${totalSkipped}, Errors: ${totalErrors}`, 'success');

      return {
        success: true,
        summary: {
          totalFetched,
          totalDrafted,
          totalSkipped,
          totalErrors
        }
      };

    } catch (pipelineErr) {
      this.log(`Critical Pipeline Error: ${pipelineErr.message}`, 'error');
      return { success: false, error: pipelineErr.message };
    } finally {
      this.isRunning = false;
    }
  }
}

module.exports = new IngestionService();

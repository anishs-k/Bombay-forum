const { Article, Profile, Setting } = require('../models');
const { SITE_NAME, SITE_TAGLINE, SITE_URL, CATEGORIES } = require('../config/constants');
const axios = require('axios');

class DistributionService {
  /**
   * Generate valid RSS 2.0 XML Feed
   */
  async generateRssXml() {
    const articles = await Article.find(
      { status: 'published' },
      { publishedAt: -1 },
      20
    );

    const siteUrl = SITE_URL.replace(/\/$/, '');
    const buildDate = new Date().toUTCString();

    const itemsXml = articles.map(article => {
      const articleUrl = `${siteUrl}/article/${article.slug}`;
      const pubDate = new Date(article.publishedAt || article.createdAt).toUTCString();
      const description = (article.excerpt || article.title).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const title = article.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

      return `    <item>
      <title>${title}</title>
      <link>${articleUrl}</link>
      <guid isPermaLink="true">${articleUrl}</guid>
      <description>${description}</description>
      <category>${article.category}</category>
      <author>${article.author || 'TBF Editorial'}</author>
      <pubDate>${pubDate}</pubDate>
      ${article.heroImage ? `<enclosure url="${article.heroImage}" type="image/jpeg" length="0" />` : ''}
    </item>`;
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_NAME}</title>
    <link>${siteUrl}</link>
    <description>${SITE_TAGLINE}</description>
    <language>en-IN</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${siteUrl}/rss" rel="self" type="application/rss+xml" />
${itemsXml}
  </channel>
</rss>`;
  }

  /**
   * Generate valid XML Sitemap
   */
  async generateSitemapXml() {
    const siteUrl = SITE_URL.replace(/\/$/, '');
    const now = new Date().toISOString().split('T')[0];

    const staticRoutes = [
      { url: '/', changefreq: 'hourly', priority: '1.0' },
      { url: '/founders', changefreq: 'daily', priority: '0.9' },
      { url: '/creators', changefreq: 'daily', priority: '0.9' },
      { url: '/wealth', changefreq: 'daily', priority: '0.9' },
      { url: '/future', changefreq: 'daily', priority: '0.9' },
      { url: '/suite', changefreq: 'daily', priority: '0.9' },
      { url: '/bombay', changefreq: 'daily', priority: '0.9' },
      { url: '/about', changefreq: 'monthly', priority: '0.7' },
      { url: '/spotlight', changefreq: 'monthly', priority: '0.7' },
      { url: '/policies', changefreq: 'monthly', priority: '0.5' }
    ];

    const articles = await Article.find({ status: 'published' }, { publishedAt: -1 });
    const profiles = await Profile.find({ status: 'published' }, { updatedAt: -1 });

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Static pages
    for (const route of staticRoutes) {
      xml += `  <url>
    <loc>${siteUrl}${route.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>\n`;
    }

    // Article URLs
    for (const article of articles) {
      const lastmod = (article.updatedAt || article.publishedAt || new Date()).toString().split('T')[0];
      xml += `  <url>
    <loc>${siteUrl}/article/${article.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
    }

    // Profile URLs
    for (const profile of profiles) {
      const lastmod = (profile.updatedAt || new Date()).toString().split('T')[0];
      const prefix = profile.type === 'founder' ? 'founder-profile' : 'creator-profile';
      xml += `  <url>
    <loc>${siteUrl}/${prefix}/${profile.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
    }

    xml += `</urlset>`;
    return xml;
  }

  /**
   * Publish Hook Dispatcher (n8n, Webhooks, Socials)
   */
  async onArticlePublished(article) {
    console.log(`[Distribution] Article published: "${article.title}" (${article.slug})`);

    const webhookSetting = await Setting.findOne({ key: 'publish_webhook_url' });
    if (webhookSetting?.value) {
      try {
        await axios.post(webhookSetting.value, {
          event: 'article.published',
          article: {
            id: article._id,
            title: article.title,
            slug: article.slug,
            url: `${SITE_URL}/article/${article.slug}`,
            category: article.category,
            deck: article.excerpt,
            heroImage: article.heroImage,
            pullQuote: article.pullQuotes?.[0] || '',
            author: article.author,
            publishedAt: article.publishedAt
          }
        }, { timeout: 5000 });
        console.log(`[Distribution] Successfully dispatched publish webhook to ${webhookSetting.value}`);
      } catch (err) {
        console.warn(`[Distribution] Webhook dispatch warning: ${err.message}`);
      }
    }
  }
}

module.exports = new DistributionService();

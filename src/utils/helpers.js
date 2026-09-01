const crypto = require('crypto');
const { marked } = require('marked');
const sanitizeHtml = require('sanitize-html');

function generateSlug(text) {
  if (!text) return 'untitled-' + Date.now();
  
  // Clean string, remove stop words, create clean slug
  const stopWords = new Set(['a', 'an', 'the', 'and', 'or', 'but', 'is', 'if', 'then', 'else', 'when', 'at', 'from', 'by', 'on', 'off', 'for', 'in', 'out', 'over', 'to', 'into', 'with']);
  
  let cleaned = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim();
  
  const words = cleaned.split(/\s+/).filter(w => !stopWords.has(w) || cleaned.split(/\s+/).length <= 3);
  let slug = words.join('-').substring(0, 70).replace(/-+$/, '');
  
  if (!slug) slug = 'article-' + Date.now().toString(36);
  return slug;
}

function calculateReadingTime(text = '') {
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 220));
  return `${minutes} min read`;
}

function generateHash(sourceUrl, title) {
  const raw = `${(sourceUrl || '').trim().toLowerCase()}|${(title || '').trim().toLowerCase()}`;
  return crypto.createHash('sha256').update(raw).digest('hex');
}

function formatDate(dateInput, formatType = 'full') {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';

  const optionsFull = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Kolkata' };
  const optionsShort = { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'Asia/Kolkata' };
  const optionsEditorial = { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' };

  if (formatType === 'weekday') {
    return date.toLocaleDateString('en-IN', optionsFull);
  }
  if (formatType === 'short') {
    return date.toLocaleDateString('en-IN', optionsShort);
  }
  return date.toLocaleDateString('en-IN', optionsEditorial);
}

function truncate(text = '', maxLength = 120) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength).trim() + '...';
}

/**
 * Custom Markdown Parser for TBF 6 Building Blocks
 */
function renderArticleContent(markdownText = '', pullQuotes = [], keyStats = [], inlineImages = []) {
  if (!markdownText) return '';

  // Configure marked options
  marked.setOptions({
    gfm: true,
    breaks: true
  });

  // Custom transformations for TBF elements
  let processed = markdownText;

  // Transform blockquotes into TBF Signature Pull Quotes if not already rendered
  // Also inject explicit pull quotes and key stats if defined in article metadata
  let html = marked.parse(processed);

  // Sanitize
  const clean = sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'figure', 'figcaption', 'h1', 'h2', 'h3', 'h4', 'blockquote', 'hr', 'section', 'div', 'span', 'strong', 'em']),
    allowedAttributes: {
      '*': ['class', 'id', 'style'],
      'a': ['href', 'name', 'target', 'rel'],
      'img': ['src', 'alt', 'title', 'loading']
    }
  });

  return clean;
}

module.exports = {
  generateSlug,
  calculateReadingTime,
  generateHash,
  formatDate,
  truncate,
  renderArticleContent
};

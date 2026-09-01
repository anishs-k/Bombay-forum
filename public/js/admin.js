/**
 * The Bombay Forum — Admin Panel Management Script
 */

document.addEventListener('DOMContentLoaded', () => {
  initAdminAuth();
  
  const path = window.location.pathname;
  if (path.includes('/admin/dashboard')) {
    initDashboard();
  } else if (path.includes('/admin/articles')) {
    initArticlesList();
  } else if (path.includes('/admin/editor')) {
    initArticleEditor();
  } else if (path.includes('/admin/profiles')) {
    initProfilesList();
  } else if (path.includes('/admin/profile-editor')) {
    initProfileEditor();
  } else if (path.includes('/admin/homepage')) {
    initHomepageManager();
  } else if (path.includes('/admin/ingestion') || path.includes('/admin/sources')) {
    initIngestionManager();
  } else if (path.includes('/admin/subscribers')) {
    initSubscribersManager();
  } else if (path.includes('/admin/spotlights')) {
    initSpotlightsManager();
  }
});

// Admin Toast Helper
function adminToast(msg, isError = false) {
  let toast = document.getElementById('admin-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'admin-toast';
    toast.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#091C2A;color:#FAFAF5;padding:14px 24px;border-left:4px solid #4A8090;font-size:13px;font-weight:600;z-index:99999;box-shadow:0 8px 24px rgba(0,0,0,0.3);';
    document.body.appendChild(toast);
  }
  toast.innerText = msg;
  toast.style.borderLeftColor = isError ? '#E53E3E' : '#4A8090';
  toast.style.display = 'block';
  setTimeout(() => { toast.style.display = 'none'; }, 4000);
}

// Authentication Check & Logout
function initAdminAuth() {
  const logoutBtn = document.getElementById('admin-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/admin/login';
      } catch (err) {
        window.location.href = '/admin/login';
      }
    });
  }
}

// --- Dashboard ---
async function initDashboard() {
  const statsContainer = document.getElementById('dashboard-stats-grid');
  if (!statsContainer) return;

  try {
    const res = await fetch('/api/analytics/dashboard');
    const json = await res.json();
    if (!json.success) return;

    const data = json.data;
    const stats = data.stats;

    document.getElementById('stat-total-articles').innerText = stats.totalArticles;
    document.getElementById('stat-published-articles').innerText = stats.publishedArticles;
    document.getElementById('stat-draft-articles').innerText = stats.draftArticles;
    document.getElementById('stat-total-subscribers').innerText = stats.totalSubscribers;
    document.getElementById('stat-total-sources').innerText = stats.totalSources;
    document.getElementById('stat-total-views').innerText = stats.totalViews.toLocaleString();

    // Render Drafts Awaiting Review Gate
    const draftsContainer = document.getElementById('dashboard-drafts-list');
    if (draftsContainer) {
      if (data.recentDrafts.length === 0) {
        draftsContainer.innerHTML = '<div class="p-6 text-center text-gray-500 italic text-sm">No drafts currently awaiting review. All ingested content is up to date.</div>';
      } else {
        draftsContainer.innerHTML = data.recentDrafts.map(draft => `
          <div class="p-4 border-b border-tbf-border flex items-center justify-between hover:bg-surface">
            <div class="max-w-2xl">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs font-bold uppercase text-tbf-teal tracking-wider">${draft.category}</span>
                <span class="text-xs text-gray-400">• ${draft.format || 'brief'}</span>
                ${draft.sourceName ? `<span class="text-xs bg-gray-200 px-2 py-0.5 text-gray-700">Source: ${draft.sourceName}</span>` : ''}
              </div>
              <h4 class="font-serif font-bold text-base text-tbf-navy">${draft.title}</h4>
              <p class="text-xs text-gray-500 truncate mt-1">${draft.excerpt || ''}</p>
            </div>
            <div class="flex items-center gap-3">
              <a href="/admin/editor/${draft._id}" class="tbf-btn-secondary text-xs px-3 py-1.5">Review & Edit</a>
            </div>
          </div>
        `).join('');
      }
    }

    // Category Distribution Progress Bars
    const catTotal = Object.values(data.categoryCounts).reduce((a, b) => a + b, 0) || 1;
    for (const [cat, count] of Object.entries(data.categoryCounts)) {
      const el = document.getElementById(`cat-pct-${cat}`);
      const countEl = document.getElementById(`cat-count-${cat}`);
      if (el) el.style.width = `${(count / catTotal) * 100}%`;
      if (countEl) countEl.innerText = count;
    }

  } catch (err) {
    console.error('Failed to load dashboard data:', err);
  }
}

// --- Article Management ---
let currentArticleFilter = { status: '', category: '', format: '', search: '', page: 1 };

async function initArticlesList() {
  loadArticles();

  // Search input
  const searchInput = document.getElementById('article-search-input');
  if (searchInput) {
    let timeout = null;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        currentArticleFilter.search = e.target.value;
        currentArticleFilter.page = 1;
        loadArticles();
      }, 300);
    });
  }

  // Category filter
  const catFilter = document.getElementById('article-category-filter');
  if (catFilter) {
    catFilter.addEventListener('change', (e) => {
      currentArticleFilter.category = e.target.value;
      currentArticleFilter.page = 1;
      loadArticles();
    });
  }

  // Status Tabs
  const statusTabs = document.querySelectorAll('.article-status-tab');
  statusTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      statusTabs.forEach(t => t.classList.remove('border-b-2', 'border-tbf-navy', 'font-bold', 'text-tbf-navy'));
      tab.classList.add('border-b-2', 'border-tbf-navy', 'font-bold', 'text-tbf-navy');
      currentArticleFilter.status = tab.dataset.status || '';
      currentArticleFilter.page = 1;
      loadArticles();
    });
  });

  // Bulk Actions
  const bulkBtn = document.getElementById('article-bulk-apply');
  if (bulkBtn) {
    bulkBtn.addEventListener('click', async () => {
      const action = document.getElementById('article-bulk-select')?.value;
      if (!action) return adminToast('Please select a bulk action', true);

      const checked = Array.from(document.querySelectorAll('.article-checkbox:checked')).map(cb => cb.value);
      if (checked.length === 0) return adminToast('No articles selected', true);

      if (confirm(`Apply "${action}" to ${checked.length} selected articles?`)) {
        try {
          const res = await fetch('/api/articles/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, ids: checked })
          });
          const json = await res.json();
          if (json.success) {
            adminToast(json.message);
            loadArticles();
          } else {
            adminToast(json.error, true);
          }
        } catch (err) {
          adminToast('Bulk action failed', true);
        }
      }
    });
  }

  // Select all checkbox
  const selectAll = document.getElementById('article-select-all');
  if (selectAll) {
    selectAll.addEventListener('change', (e) => {
      document.querySelectorAll('.article-checkbox').forEach(cb => cb.checked = e.target.checked);
    });
  }
}

async function loadArticles() {
  const tableBody = document.getElementById('articles-table-body');
  if (!tableBody) return;

  tableBody.innerHTML = '<tr><td colspan="7" class="p-8 text-center text-gray-500">Loading articles...</td></tr>';

  try {
    const params = new URLSearchParams(currentArticleFilter);
    const res = await fetch(`/api/articles?${params.toString()}`);
    const json = await res.json();
    if (!json.success) return;

    const { data: articles, pagination } = json;

    if (articles.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="7" class="p-8 text-center text-gray-500 italic">No articles matching criteria.</td></tr>';
      return;
    }

    tableBody.innerHTML = articles.map(art => {
      const statusClass = art.status === 'published' ? 'bg-emerald-100 text-emerald-800' : (art.status === 'draft' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800');
      const dateStr = new Date(art.publishedAt || art.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

      return `
        <tr class="border-b border-tbf-border hover:bg-surface text-sm">
          <td class="p-4 w-8"><input type="checkbox" value="${art._id}" class="article-checkbox"></td>
          <td class="p-4">
            <div class="font-serif font-bold text-tbf-navy text-base hover:text-tbf-teal">
              <a href="/admin/editor/${art._id}">${art.title}</a>
            </div>
            <div class="text-xs text-gray-500 mt-1 flex items-center gap-2">
              <span>slug: /${art.slug}</span>
              ${art.sourceUrl ? `<span class="bg-gray-200 px-1.5 py-0.5 text-gray-700">Source: ${art.sourceName || 'Auto-Ingested'}</span>` : ''}
              ${art.confidence ? `<span class="text-tbf-teal font-mono">conf: ${Math.round(art.confidence * 100)}%</span>` : ''}
            </div>
          </td>
          <td class="p-4">
            <span class="text-xs font-bold uppercase tracking-wider text-tbf-teal">${art.category}</span>
          </td>
          <td class="p-4 capitalize text-gray-600 text-xs">${art.format || 'feature'}</td>
          <td class="p-4">
            <span class="text-xs px-2.5 py-1 font-bold uppercase tracking-wider ${statusClass}">${art.status}</span>
          </td>
          <td class="p-4 text-xs text-gray-500">${art.views || 0}</td>
          <td class="p-4 text-xs text-gray-500 whitespace-nowrap">${dateStr}</td>
          <td class="p-4 text-right">
            <div class="flex items-center justify-end gap-2">
              <a href="/admin/editor/${art._id}" class="text-xs font-bold text-tbf-navy hover:text-tbf-teal px-2 py-1 bg-white border border-tbf-border">Edit</a>
              ${art.status === 'published' ? `<a href="/article/${art.slug}" target="_blank" class="text-xs font-bold text-tbf-teal hover:underline px-2 py-1">View</a>` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Pagination info
    const pageInfo = document.getElementById('article-pagination-info');
    if (pageInfo) {
      pageInfo.innerText = `Showing ${articles.length} of ${pagination.total} articles (Page ${pagination.page} of ${pagination.totalPages || 1})`;
    }

  } catch (err) {
    tableBody.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-red-500">Failed to load articles: ${err.message}</td></tr>`;
  }
}

// --- Article Editor ---
async function initArticleEditor() {
  const form = document.getElementById('tbf-article-editor-form');
  if (!form) return;

  const articleId = form.dataset.articleId;

  // Real-time SEO Counters
  const metaTitleInput = document.getElementById('editor-meta-title');
  const metaDescInput = document.getElementById('editor-meta-desc');
  const titleInput = document.getElementById('editor-title');
  const slugInput = document.getElementById('editor-slug');

  function updateMetaCounters() {
    const titleCount = document.getElementById('meta-title-counter');
    const descCount = document.getElementById('meta-desc-counter');

    if (titleCount && metaTitleInput) {
      const len = metaTitleInput.value.length;
      titleCount.innerText = `${len} / 60 chars`;
      titleCount.className = len > 60 ? 'text-red-500 text-xs font-bold' : 'text-emerald-600 text-xs';
    }

    if (descCount && metaDescInput) {
      const len = metaDescInput.value.length;
      descCount.innerText = `${len} / 160 chars`;
      descCount.className = len > 160 ? 'text-red-500 text-xs font-bold' : 'text-emerald-600 text-xs';
    }
  }

  if (metaTitleInput) metaTitleInput.addEventListener('input', updateMetaCounters);
  if (metaDescInput) metaDescInput.addEventListener('input', updateMetaCounters);

  // Auto-slug generator from title if slug is empty
  if (titleInput && slugInput) {
    titleInput.addEventListener('input', () => {
      if (!articleId) {
        const auto = titleInput.value.toLowerCase().replace(/[^\w\s-]/g, '').trim().split(/\s+/).slice(0, 8).join('-');
        slugInput.value = auto;
      }
      if (!metaTitleInput.value || !articleId) {
        metaTitleInput.value = `${titleInput.value.substring(0, 50)} | TBF`;
        updateMetaCounters();
      }
    });
  }

  // Load existing article data if editing
  if (articleId) {
    try {
      const res = await fetch(`/api/articles/${articleId}`);
      const json = await res.json();
      if (json.success && json.data) {
        const art = json.data;
        document.getElementById('editor-title').value = art.title || '';
        document.getElementById('editor-slug').value = art.slug || '';
        document.getElementById('editor-category').value = art.category || 'founders';
        document.getElementById('editor-format').value = art.format || 'feature';
        document.getElementById('editor-author').value = art.author || 'TBF Editorial Desk';
        document.getElementById('editor-excerpt').value = art.excerpt || '';
        document.getElementById('editor-content').value = art.content || '';
        document.getElementById('editor-hero-image').value = art.heroImage || '';
        document.getElementById('editor-hero-caption').value = art.heroCaption || '';
        document.getElementById('editor-pullquote').value = (art.pullQuotes && art.pullQuotes[0]) || '';
        document.getElementById('editor-tags').value = (art.tags || []).join(', ');
        document.getElementById('editor-meta-title').value = art.metaTitle || '';
        document.getElementById('editor-meta-desc').value = art.metaDesc || '';
        document.getElementById('editor-status').value = art.status || 'draft';

        if (art.sourceUrl) {
          const sourceBlock = document.getElementById('editor-source-block');
          if (sourceBlock) {
            sourceBlock.classList.remove('hidden');
            document.getElementById('editor-source-url').href = art.sourceUrl;
            document.getElementById('editor-source-url').innerText = art.sourceUrl;
          }
        }
        updateMetaCounters();
      }
    } catch (err) {
      console.error('Failed to load article:', err);
    }
  }

  // Formatting Toolbar Helpers
  window.insertEditorBlock = function(blockType) {
    const textarea = document.getElementById('editor-content');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    let insertion = '';
    if (blockType === 'pullquote') {
      insertion = `\n\n> ${selected || 'Insert signature italic pull quote here.'}\n\n`;
    } else if (blockType === 'keystat') {
      insertion = `\n\n\`\`\`\nKEY STAT:\nValue: ₹24,000 Cr\nLabel: TOTAL DOMESTIC CAPITAL ALLOCATED\n\`\`\`\n\n`;
    } else if (blockType === 'heading') {
      insertion = `\n\n## ${selected || 'Section Subheading'}\n\n`;
    } else if (blockType === 'bold') {
      insertion = `**${selected || 'bold text'}**`;
    } else if (blockType === 'image') {
      insertion = `\n\n![Full column image caption](https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1600&h=900&q=80)\n\n`;
    } else if (blockType === 'divider') {
      insertion = `\n\n---\n\n`;
    }

    textarea.value = text.substring(0, start) + insertion + text.substring(end);
    textarea.focus();
  };

  // Form Submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitter = e.submitter;
    const targetStatus = submitter?.dataset?.status || document.getElementById('editor-status').value || 'draft';

    const payload = {
      title: document.getElementById('editor-title').value.trim(),
      slug: document.getElementById('editor-slug').value.trim(),
      category: document.getElementById('editor-category').value,
      format: document.getElementById('editor-format').value,
      author: document.getElementById('editor-author').value.trim(),
      excerpt: document.getElementById('editor-excerpt').value.trim(),
      content: document.getElementById('editor-content').value,
      heroImage: document.getElementById('editor-hero-image').value.trim(),
      heroCaption: document.getElementById('editor-hero-caption').value.trim(),
      pullQuotes: document.getElementById('editor-pullquote').value.trim() ? [document.getElementById('editor-pullquote').value.trim()] : [],
      tags: document.getElementById('editor-tags').value.split(',').map(t => t.trim()).filter(Boolean),
      metaTitle: document.getElementById('editor-meta-title').value.trim(),
      metaDesc: document.getElementById('editor-meta-desc').value.trim(),
      status: targetStatus
    };

    if (!payload.title || !payload.content) {
      return adminToast('Title and content are required', true);
    }

    const url = articleId ? `/api/articles/${articleId}` : '/api/articles';
    const method = articleId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        adminToast(targetStatus === 'published' ? '🎉 Article published successfully!' : 'Draft saved successfully.');
        if (!articleId && json.data?._id) {
          window.location.href = `/admin/editor/${json.data._id}`;
        }
      } else {
        adminToast(json.error || 'Save failed', true);
      }
    } catch (err) {
      adminToast('Error saving article', true);
    }
  });
}

// --- Homepage Slot Controller ---
async function initHomepageManager() {
  const form = document.getElementById('homepage-config-form');
  if (!form) return;

  try {
    // Populate article dropdown selectors
    const resArticles = await fetch('/api/articles?status=published&limit=100');
    const jsonArticles = await resArticles.json();
    const articles = jsonArticles.data || [];

    const articleOptionsHtml = articles.map(a => `<option value="${a._id}">[${a.category.toUpperCase()}] ${a.title}</option>`).join('');

    const coverSelect = document.getElementById('slot-cover-story');
    const pick1 = document.getElementById('slot-pick-1');
    const pick2 = document.getElementById('slot-pick-2');
    const pick3 = document.getElementById('slot-pick-3');
    const feat1 = document.getElementById('slot-feat-1');
    const feat2 = document.getElementById('slot-feat-2');
    const feat3 = document.getElementById('slot-feat-3');

    [coverSelect, pick1, pick2, pick3, feat1, feat2, feat3].forEach(sel => {
      if (sel) sel.innerHTML = `<option value="">-- Select Published Article --</option>` + articleOptionsHtml;
    });

    // Fetch current homepage config
    const res = await fetch('/api/homepage');
    const json = await res.json();
    if (json.success && json.data) {
      const { config, coverStory, editorsPicks, featuredThisWeek } = json.data;

      if (coverSelect && coverStory) coverSelect.value = coverStory._id;
      if (pick1 && editorsPicks[0]) pick1.value = editorsPicks[0]._id;
      if (pick2 && editorsPicks[1]) pick2.value = editorsPicks[1]._id;
      if (pick3 && editorsPicks[2]) pick3.value = editorsPicks[2]._id;
      if (feat1 && featuredThisWeek[0]) feat1.value = featuredThisWeek[0]._id;
      if (feat2 && featuredThisWeek[1]) feat2.value = featuredThisWeek[1]._id;
      if (feat3 && featuredThisWeek[2]) feat3.value = featuredThisWeek[2]._id;

      if (config?.sponsoredStrip) {
        document.getElementById('sponsored-enabled').checked = !!config.sponsoredStrip.enabled;
        document.getElementById('sponsored-label').value = config.sponsoredStrip.label || '';
        document.getElementById('sponsored-sponsor').value = config.sponsoredStrip.sponsorName || '';
        document.getElementById('sponsored-text').value = config.sponsoredStrip.text || '';
        document.getElementById('sponsored-link').value = config.sponsoredStrip.linkUrl || '';
      }
    }
  } catch (err) {
    console.error('Failed to load homepage manager:', err);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
      coverStoryId: document.getElementById('slot-cover-story')?.value,
      editorsPickIds: [
        document.getElementById('slot-pick-1')?.value,
        document.getElementById('slot-pick-2')?.value,
        document.getElementById('slot-pick-3')?.value
      ].filter(Boolean),
      featuredThisWeekIds: [
        document.getElementById('slot-feat-1')?.value,
        document.getElementById('slot-feat-2')?.value,
        document.getElementById('slot-feat-3')?.value
      ].filter(Boolean),
      sponsoredStrip: {
        enabled: document.getElementById('sponsored-enabled')?.checked,
        label: document.getElementById('sponsored-label')?.value,
        sponsorName: document.getElementById('sponsored-sponsor')?.value,
        text: document.getElementById('sponsored-text')?.value,
        linkUrl: document.getElementById('sponsored-link')?.value
      }
    };

    try {
      const res = await fetch('/api/homepage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        adminToast('Homepage slots saved & updated!');
      } else {
        adminToast(json.error, true);
      }
    } catch (err) {
      adminToast('Error updating homepage slots', true);
    }
  });
}

// --- Content Ingestion & Sources ---
async function initIngestionManager() {
  loadSources();
  loadIngestionHistory();
  loadIngestionSettings();

  // Trigger Manual Ingestion
  const triggerBtn = document.getElementById('trigger-ingestion-btn');
  if (triggerBtn) {
    triggerBtn.addEventListener('click', async () => {
      triggerBtn.disabled = true;
      triggerBtn.innerText = '⚡ Running Pipeline...';

      try {
        const res = await fetch('/api/ingestion/trigger', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
        const json = await res.json();
        adminToast(json.message || 'Ingestion started');
        startLogPolling();
      } catch (err) {
        adminToast('Failed to trigger ingestion', true);
      } finally {
        setTimeout(() => {
          triggerBtn.disabled = false;
          triggerBtn.innerText = '⚡ Trigger Content Ingestion Now';
        }, 5000);
      }
    });
  }

  // Add Source Form
  const addSourceForm = document.getElementById('add-source-form');
  if (addSourceForm) {
    addSourceForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        name: document.getElementById('new-source-name')?.value,
        url: document.getElementById('new-source-url')?.value,
        category: document.getElementById('new-source-category')?.value,
        type: document.getElementById('new-source-type')?.value,
        pollIntervalMinutes: parseInt(document.getElementById('new-source-interval')?.value, 10) || 240
      };

      try {
        const res = await fetch('/api/sources', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (json.success) {
          adminToast('Source registered successfully');
          addSourceForm.reset();
          loadSources();
        } else {
          adminToast(json.error, true);
        }
      } catch (err) {
        adminToast('Failed to create source', true);
      }
    });
  }

  // Save Settings Form
  const settingsForm = document.getElementById('ingestion-settings-form');
  if (settingsForm) {
    settingsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        promptTemplate: document.getElementById('setting-prompt-template')?.value,
        confidenceThreshold: document.getElementById('setting-confidence-threshold')?.value,
        geminiApiKey: document.getElementById('setting-gemini-key')?.value,
        publishWebhookUrl: document.getElementById('setting-webhook-url')?.value
      };

      try {
        const res = await fetch('/api/ingestion/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (json.success) {
          adminToast('Ingestion settings saved successfully');
        } else {
          adminToast(json.error, true);
        }
      } catch (err) {
        adminToast('Failed to save settings', true);
      }
    });
  }
}

// Log Polling Helper
let logPollInterval = null;
function startLogPolling() {
  const terminal = document.getElementById('ingestion-log-terminal');
  if (!terminal) return;

  if (logPollInterval) clearInterval(logPollInterval);

  logPollInterval = setInterval(async () => {
    try {
      const res = await fetch('/api/ingestion/logs');
      const json = await res.json();
      if (json.success) {
        terminal.innerHTML = json.data.map(l => {
          const color = l.type === 'success' ? 'text-emerald-400' : (l.type === 'error' ? 'text-rose-400' : 'text-gray-300');
          return `<div class="${color} font-mono text-xs mb-1">[${new Date(l.timestamp).toLocaleTimeString()}] ${l.message}</div>`;
        }).join('');

        if (!json.isRunning) {
          clearInterval(logPollInterval);
          loadSources();
          loadIngestionHistory();
        }
      }
    } catch (e) {}
  }, 1500);
}

async function loadSources() {
  const table = document.getElementById('sources-table-body');
  if (!table) return;

  try {
    const res = await fetch('/api/sources');
    const json = await res.json();
    if (!json.success) return;

    table.innerHTML = json.data.map(s => `
      <tr class="border-b border-tbf-border hover:bg-surface text-sm">
        <td class="p-4 font-bold text-tbf-navy">${s.name}</td>
        <td class="p-4 font-mono text-xs text-gray-600 truncate max-w-xs">${s.url}</td>
        <td class="p-4 uppercase text-xs font-bold text-tbf-teal">${s.category}</td>
        <td class="p-4 text-xs">${s.pollIntervalMinutes}m</td>
        <td class="p-4">
          <span class="text-xs px-2 py-0.5 font-bold uppercase ${s.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'}">
            ${s.active ? 'Active' : 'Paused'}
          </span>
        </td>
        <td class="p-4 text-xs text-gray-500">${s.lastPolledAt ? new Date(s.lastPolledAt).toLocaleTimeString() : 'Never'}</td>
        <td class="p-4 text-right">
          <button onclick="toggleSource('${s._id}')" class="text-xs font-bold text-tbf-navy hover:text-tbf-teal px-2 py-1 border border-tbf-border mr-2">
            ${s.active ? 'Pause' : 'Activate'}
          </button>
          <button onclick="deleteSource('${s._id}')" class="text-xs font-bold text-red-600 hover:underline">Delete</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {}
}

window.toggleSource = async function(id) {
  try {
    await fetch(`/api/sources/${id}/toggle`, { method: 'POST' });
    loadSources();
  } catch (e) {}
};

window.deleteSource = async function(id) {
  if (confirm('Delete this source feed?')) {
    try {
      await fetch(`/api/sources/${id}`, { method: 'DELETE' });
      loadSources();
    } catch (e) {}
  }
};

async function loadIngestionHistory() {
  const table = document.getElementById('ingested-history-table-body');
  if (!table) return;

  try {
    const res = await fetch('/api/ingestion/history?limit=25');
    const json = await res.json();
    if (!json.success) return;

    table.innerHTML = json.data.map(item => `
      <tr class="border-b border-tbf-border hover:bg-surface text-xs">
        <td class="p-3 font-bold text-tbf-navy">${item.title}</td>
        <td class="p-3 text-gray-500">${item.sourceName || 'RSS Feed'}</td>
        <td class="p-3 uppercase text-tbf-teal font-bold">${item.category}</td>
        <td class="p-3 font-mono text-gray-400">${item.hash.substring(0, 12)}...</td>
        <td class="p-3 font-bold ${item.confidence >= 0.85 ? 'text-emerald-600' : 'text-amber-600'}">${Math.round(item.confidence * 100)}%</td>
        <td class="p-3 text-gray-500">${new Date(item.createdAt).toLocaleDateString()}</td>
      </tr>
    `).join('');
  } catch (e) {}
}

async function loadIngestionSettings() {
  try {
    const res = await fetch('/api/ingestion/settings');
    const json = await res.json();
    if (json.success && json.data) {
      const d = json.data;
      if (document.getElementById('setting-prompt-template')) document.getElementById('setting-prompt-template').value = d.promptTemplate || '';
      if (document.getElementById('setting-confidence-threshold')) document.getElementById('setting-confidence-threshold').value = d.confidenceThreshold || 0.7;
      if (document.getElementById('setting-gemini-key')) document.getElementById('setting-gemini-key').placeholder = d.geminiApiKey || 'Paste Google Gemini API Key';
      if (document.getElementById('setting-webhook-url')) document.getElementById('setting-webhook-url').value = d.publishWebhookUrl || '';
    }
  } catch (e) {}
}

// --- Profiles List & Editor ---
async function initProfilesList() {
  const container = document.getElementById('profiles-grid');
  if (!container) return;

  try {
    const res = await fetch('/api/profiles');
    const json = await res.json();
    if (!json.success) return;

    container.innerHTML = json.data.map(p => `
      <div class="bg-white border border-tbf-border p-6 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-4">
            <span class="text-xs font-bold uppercase tracking-widest text-tbf-teal">${p.type}</span>
            <span class="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 font-bold uppercase">${p.status}</span>
          </div>
          <div class="flex items-center gap-4 mb-4">
            <img src="${p.heroImage}" class="w-16 h-20 object-cover ${p.type === 'founder' ? 'grayscale' : ''}" alt="${p.name}">
            <div>
              <h3 class="font-serif font-bold text-lg text-tbf-navy">${p.name}</h3>
              <p class="text-xs text-gray-500">${p.role || p.medium || ''} · ${p.company || p.location || ''}</p>
            </div>
          </div>
          <p class="text-xs italic text-gray-600 line-clamp-3 mb-4 font-serif">"${p.quote}"</p>
        </div>
        <div class="pt-4 border-t border-tbf-border flex items-center justify-between">
          <a href="/admin/profile-editor/${p._id}" class="tbf-btn-secondary text-xs px-3 py-1.5">Edit Profile</a>
          <a href="/${p.type === 'founder' ? 'founder-profile' : 'creator-profile'}/${p.slug}" target="_blank" class="text-xs text-tbf-teal font-bold hover:underline">View Live</a>
        </div>
      </div>
    `).join('');
  } catch (e) {}
}

async function initProfileEditor() {
  const form = document.getElementById('tbf-profile-editor-form');
  if (!form) return;

  const profileId = form.dataset.profileId;
  if (profileId) {
    try {
      const res = await fetch(`/api/profiles/${profileId}`);
      const json = await res.json();
      if (json.success && json.data) {
        const p = json.data;
        document.getElementById('profile-name').value = p.name || '';
        document.getElementById('profile-slug').value = p.slug || '';
        document.getElementById('profile-type').value = p.type || 'founder';
        document.getElementById('profile-company').value = p.company || '';
        document.getElementById('profile-role').value = p.role || '';
        document.getElementById('profile-medium').value = p.medium || '';
        document.getElementById('profile-location').value = p.location || '';
        document.getElementById('profile-hero-image').value = p.heroImage || '';
        document.getElementById('profile-quote').value = p.quote || '';
        document.getElementById('profile-bio').value = (p.bio || []).join('\n\n');
        document.getElementById('profile-content').value = p.content || '';
        document.getElementById('profile-status').value = p.status || 'published';
      }
    } catch (e) {}
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      name: document.getElementById('profile-name').value.trim(),
      slug: document.getElementById('profile-slug').value.trim(),
      type: document.getElementById('profile-type').value,
      company: document.getElementById('profile-company').value.trim(),
      role: document.getElementById('profile-role').value.trim(),
      medium: document.getElementById('profile-medium').value.trim(),
      location: document.getElementById('profile-location').value.trim(),
      heroImage: document.getElementById('profile-hero-image').value.trim(),
      quote: document.getElementById('profile-quote').value.trim(),
      bio: document.getElementById('profile-bio').value.split('\n\n').map(p => p.trim()).filter(Boolean),
      content: document.getElementById('profile-content').value,
      status: document.getElementById('profile-status').value
    };

    const url = profileId ? `/api/profiles/${profileId}` : '/api/profiles';
    const method = profileId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        adminToast('Profile saved successfully');
        if (!profileId && json.data?._id) {
          window.location.href = `/admin/profile-editor/${json.data._id}`;
        }
      } else {
        adminToast(json.error, true);
      }
    } catch (e) {
      adminToast('Error saving profile', true);
    }
  });
}

// --- Subscribers ---
async function initSubscribersManager() {
  const table = document.getElementById('subscribers-table-body');
  if (!table) return;

  try {
    const res = await fetch('/api/subscribers?limit=100');
    const json = await res.json();
    if (!json.success) return;

    table.innerHTML = json.data.map(s => `
      <tr class="border-b border-tbf-border hover:bg-surface text-sm">
        <td class="p-4 font-bold text-tbf-navy">${s.email}</td>
        <td class="p-4 text-gray-600">${s.name || '—'}</td>
        <td class="p-4">
          <span class="text-xs px-2 py-0.5 font-bold uppercase ${s.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'}">${s.status}</span>
        </td>
        <td class="p-4 text-xs text-gray-500">${new Date(s.subscribedAt || s.createdAt).toLocaleDateString()}</td>
      </tr>
    `).join('');
  } catch (e) {}
}

// --- Spotlights ---
async function initSpotlightsManager() {
  const table = document.getElementById('spotlights-table-body');
  if (!table) return;

  try {
    const res = await fetch('/api/spotlights');
    const json = await res.json();
    if (!json.success) return;

    table.innerHTML = json.data.map(sp => `
      <tr class="border-b border-tbf-border hover:bg-surface text-sm">
        <td class="p-4 font-bold text-tbf-navy">${sp.brandName}</td>
        <td class="p-4 text-xs">${sp.contactName} (${sp.contactEmail})</td>
        <td class="p-4 text-xs font-bold text-tbf-teal">${sp.package}</td>
        <td class="p-4 text-xs text-gray-600">${sp.budget || '—'}</td>
        <td class="p-4">
          <span class="text-xs px-2 py-0.5 font-bold uppercase bg-amber-100 text-amber-800">${sp.status}</span>
        </td>
        <td class="p-4 text-xs text-gray-500">${new Date(sp.createdAt).toLocaleDateString()}</td>
      </tr>
    `).join('');
  } catch (e) {}
}

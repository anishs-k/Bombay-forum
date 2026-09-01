const axios = require('axios');

const BASE_URL = 'http://localhost:8080';

async function runTests() {
  console.log('🧪 Starting The Bombay Forum Comprehensive Verification Suite...\n');
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name} ->`, err.response?.data || err.message);
      failed++;
    }
  }

  // 1. Test Public HTML Pages
  console.log('--- 1. Testing Public Editorial Pages ---');
  const pages = [
    '/',
    '/founders',
    '/creators',
    '/wealth',
    '/future',
    '/suite',
    '/bombay',
    '/article/indian-family-offices-private-equity-2026',
    '/founder-profile/tarun-mehta',
    '/creator-profile/yashraj-mukhate',
    '/about',
    '/spotlight',
    '/policies',
    '/search?q=mumbai'
  ];

  for (const p of pages) {
    await test(`Page: ${p}`, async () => {
      const res = await axios.get(`${BASE_URL}${p}`);
      if (res.status !== 200 || !res.data.includes('THE BOMBAY FORUM')) {
        throw new Error(`Invalid response for ${p}`);
      }
    });
  }

  // 2. Test Dynamic Feeds & SEO
  console.log('\n--- 2. Testing Dynamic Distribution Feeds ---');
  await test('RSS 2.0 XML Feed (/rss)', async () => {
    const res = await axios.get(`${BASE_URL}/rss`);
    if (res.status !== 200 || !res.data.includes('<rss version="2.0"') || !res.data.includes('<channel>')) {
      throw new Error('Invalid RSS 2.0 XML output');
    }
  });

  await test('Dynamic XML Sitemap (/sitemap.xml)', async () => {
    const res = await axios.get(`${BASE_URL}/sitemap.xml`);
    if (res.status !== 200 || !res.data.includes('<urlset') || !res.data.includes('/article/')) {
      throw new Error('Invalid Sitemap XML output');
    }
  });

  await test('Robots.txt (/robots.txt)', async () => {
    const res = await axios.get(`${BASE_URL}/robots.txt`);
    if (res.status !== 200 || !res.data.includes('Sitemap:')) {
      throw new Error('Invalid Robots.txt output');
    }
  });

  // 3. Test Public APIs
  console.log('\n--- 3. Testing Public REST APIs ---');
  await test('GET /api/articles', async () => {
    const res = await axios.get(`${BASE_URL}/api/articles`);
    if (!res.data.success || !Array.isArray(res.data.data) || res.data.data.length === 0) {
      throw new Error('Failed to retrieve articles');
    }
  });

  await test('GET /api/profiles', async () => {
    const res = await axios.get(`${BASE_URL}/api/profiles`);
    if (!res.data.success || !Array.isArray(res.data.data) || res.data.data.length === 0) {
      throw new Error('Failed to retrieve profiles');
    }
  });

  await test('GET /api/homepage', async () => {
    const res = await axios.get(`${BASE_URL}/api/homepage`);
    if (!res.data.success || !res.data.data.coverStory) {
      throw new Error('Failed to retrieve homepage config');
    }
  });

  await test('POST /api/subscribers (Newsletter signup)', async () => {
    const res = await axios.post(`${BASE_URL}/api/subscribers`, {
      email: `test_${Date.now()}@example.com`
    });
    if (!res.data.success) throw new Error('Subscription failed');
  });

  await test('POST /api/spotlights (Brand inquiry)', async () => {
    const res = await axios.post(`${BASE_URL}/api/spotlights`, {
      brandName: 'Test Brand Bombay',
      contactName: 'Rohan Desk',
      contactEmail: 'rohan@brand.com',
      package: 'Dedicated Editorial',
      message: 'Interested in Q4 campaign.'
    });
    if (!res.data.success) throw new Error('Spotlight inquiry failed');
  });

  // 4. Test Admin Authentication & Protected Endpoints
  console.log('\n--- 4. Testing Admin Authentication & Dashboard ---');
  let adminToken = '';

  await test('POST /api/auth/login (Admin Credentials)', async () => {
    const res = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@thebombayforum.com',
      password: 'tbfadmin2026'
    });
    if (!res.data.success || !res.data.token) throw new Error('Admin login failed');
    adminToken = res.data.token;
  });

  const authHeaders = () => ({ headers: { Authorization: `Bearer ${adminToken}` } });

  await test('GET /api/analytics/dashboard (Protected)', async () => {
    const res = await axios.get(`${BASE_URL}/api/analytics/dashboard`, authHeaders());
    if (!res.data.success || res.data.data.stats.totalArticles === 0) {
      throw new Error('Failed to retrieve dashboard analytics');
    }
  });

  await test('GET /api/sources (Protected Source Registry)', async () => {
    const res = await axios.get(`${BASE_URL}/api/sources`, authHeaders());
    if (!res.data.success || res.data.data.length === 0) {
      throw new Error('Failed to retrieve sources');
    }
  });

  // 5. Test Ingestion Pipeline
  console.log('\n--- 5. Testing Content Ingestion Pipeline ---');
  await test('POST /api/ingestion/trigger (Execute Ingestion)', async () => {
    const res = await axios.post(`${BASE_URL}/api/ingestion/trigger`, {}, authHeaders());
    if (!res.data.success) throw new Error('Failed to trigger ingestion');
  });

  await test('GET /api/ingestion/logs (Live Log Stream)', async () => {
    // Wait 2 seconds for pipeline to log initial steps
    await new Promise(r => setTimeout(r, 2000));
    const res = await axios.get(`${BASE_URL}/api/ingestion/logs`, authHeaders());
    if (!res.data.success || !Array.isArray(res.data.data)) {
      throw new Error('Failed to retrieve logs');
    }
  });

  // 6. Test Article Lifecycle (CRUD & Rule 5.2 Mandatory Draft Gate)
  console.log('\n--- 6. Testing Article Lifecycle & Publishing Gate ---');
  let createdArticleId = '';

  await test('POST /api/articles (Create Draft)', async () => {
    const res = await axios.post(`${BASE_URL}/api/articles`, {
      title: 'Automated Test Article: The Future of Nariman Point',
      category: 'bombay',
      format: 'brief',
      excerpt: 'A testing deck for automated end-to-end verification.',
      content: 'Paragraph 1 test content.\n\n> Signature Pull Quote Test\n\n## Subheading Test\n\nFinal test paragraph.',
      status: 'draft' // Mandatory gate test
    }, authHeaders());

    if (!res.data.success || res.data.data.status !== 'draft') {
      throw new Error('Failed to create draft article');
    }
    createdArticleId = res.data.data._id;
  });

  await test('PUT /api/articles/:id (Publish Draft via Human Gate)', async () => {
    const res = await axios.put(`${BASE_URL}/api/articles/${createdArticleId}`, {
      status: 'published',
      heroImage: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1600&h=900&q=80'
    }, authHeaders());

    if (!res.data.success || res.data.data.status !== 'published') {
      throw new Error('Failed to publish article');
    }
  });

  await test('DELETE /api/articles/:id (Clean up test article)', async () => {
    const res = await axios.delete(`${BASE_URL}/api/articles/${createdArticleId}`, authHeaders());
    if (!res.data.success) throw new Error('Failed to delete test article');
  });

  console.log(`\n=======================================================`);
  console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`=======================================================`);
}

runTests();

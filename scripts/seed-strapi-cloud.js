'use strict';

/**
 * Strapi Cloud Seed Script
 *
 * Seeds Strapi Cloud via REST API with Open HR content.
 * Uses Full Access API Token for authentication.
 *
 * Run with: node scripts/seed-strapi-cloud.js
 */

const seedData = require('../data/openhr-seed-data.json');

const STRAPI_URL = process.env.STRAPI_CLOUD_URL || 'https://peaceful-art-36523a4d49.strapiapp.com';
const API_TOKEN = process.env.STRAPI_CLOUD_API_TOKEN;

if (!API_TOKEN) {
  console.error('Error: STRAPI_CLOUD_API_TOKEN environment variable is required');
  console.error('Set it with: export STRAPI_CLOUD_API_TOKEN=your_full_access_token');
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${API_TOKEN}`,
};

async function apiRequest(method, endpoint, data = null) {
  const url = `${STRAPI_URL}/api${endpoint}`;
  const options = {
    method,
    headers,
  };

  if (data) {
    options.body = JSON.stringify({ data });
  }

  const response = await fetch(url, options);
  const json = await response.json();

  if (!response.ok) {
    console.error(`API Error [${method} ${endpoint}]:`, JSON.stringify(json, null, 2));
    throw new Error(`API request failed: ${response.status}`);
  }

  return json;
}

async function findOne(endpoint, filters = {}, status = 'published') {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    params.append(`filters[${key}][$eq]`, value);
  }
  params.append('pagination[limit]', '1');
  params.append('status', status);

  const url = `${endpoint}?${params.toString()}`;
  const result = await apiRequest('GET', url);
  return result.data?.[0] || null;
}

async function createOrUpdate(endpoint, data, findBy = null) {
  let existing = null;

  // Search in both published and draft
  if (findBy) {
    const filters = {};
    filters[findBy] = data[findBy];
    // Try draft first
    existing = await findOne(endpoint, filters, 'draft');
    if (!existing) {
      existing = await findOne(endpoint, filters, 'published');
    }
  }

  let result;
  if (existing) {
    console.log(`  Updating existing entry (documentId: ${existing.documentId})`);
    result = await apiRequest('PUT', `${endpoint}/${existing.documentId}`, data);
  } else {
    console.log(`  Creating new entry`);
    result = await apiRequest('POST', endpoint, data);
  }

  // Publish the content by setting publishedAt
  const documentId = result.data?.documentId || existing?.documentId;
  if (documentId) {
    try {
      await apiRequest('PUT', `${endpoint}/${documentId}`, {
        publishedAt: new Date().toISOString(),
      });
      console.log(`  Published entry`);
    } catch (e) {
      // Might already be published or endpoint doesn't support it
    }
  }

  return result;
}

async function seedSiteSettings() {
  console.log('\nSeeding site settings...');
  const data = seedData.siteSettings;

  // Check if site settings exist
  const existing = await apiRequest('GET', '/site-setting');

  if (existing.data) {
    console.log('  Updating existing site settings');
    await apiRequest('PUT', `/site-setting`, data);
  } else {
    console.log('  Creating site settings');
    await apiRequest('POST', '/site-setting', data);
  }
  console.log('  Done');
}

async function seedFooter() {
  console.log('\nSeeding footer...');
  const data = seedData.footer;

  const existing = await apiRequest('GET', '/footer');

  if (existing.data) {
    console.log('  Updating existing footer');
    await apiRequest('PUT', `/footer`, data);
  } else {
    console.log('  Creating footer');
    await apiRequest('POST', '/footer', data);
  }
  console.log('  Done');
}

async function seedNavigationItems() {
  console.log('\nSeeding navigation items...');

  for (const item of seedData.navigationItems) {
    console.log(`  Processing: ${item.label}`);
    await createOrUpdate('/navigation-items', item, 'href');
  }
  console.log('  Done');
}

async function seedPagesAndSections() {
  console.log('\nSeeding pages and sections...');

  // Store page documentIds for section relations
  const pageMap = {};

  // First, create all pages and get their numeric IDs
  for (const pageData of seedData.pages) {
    console.log(`\n  Creating page: ${pageData.title}`);
    const result = await createOrUpdate('/pages', pageData, 'slug');
    const documentId = result.data?.documentId;
    const numericId = result.data?.id;
    pageMap[pageData.slug] = { documentId, id: numericId };
    console.log(`    documentId: ${documentId}, id: ${numericId}`);
  }

  // Then, create sections WITHOUT page relations first
  const sectionMap = {}; // anchor -> documentId

  for (const [pageSlug, sections] of Object.entries(seedData.sections)) {
    console.log(`\n  Creating sections for page: ${pageSlug}`);

    for (const sectionData of sections) {
      // Use composite key for unique anchors across pages
      const uniqueAnchor = `${pageSlug}-${sectionData.anchor}`;
      console.log(`    Section: ${sectionData.type} (${uniqueAnchor})`);

      // Build section payload WITHOUT page relation
      const sectionPayload = {
        ...sectionData,
        anchor: uniqueAnchor, // Make anchor unique per page
      };
      delete sectionPayload.page; // Remove any page relation

      // Check if section exists by anchor (draft or published)
      let existing = await findOne('/sections', { anchor: uniqueAnchor }, 'draft');
      if (!existing) {
        existing = await findOne('/sections', { anchor: uniqueAnchor }, 'published');
      }

      let sectionDocumentId;
      if (existing) {
        console.log(`      Updating existing section (documentId: ${existing.documentId})`);
        await apiRequest('PUT', `/sections/${existing.documentId}`, sectionPayload);
        sectionDocumentId = existing.documentId;
      } else {
        console.log(`      Creating new section`);
        const result = await apiRequest('POST', '/sections', sectionPayload);
        sectionDocumentId = result.data?.documentId;
      }

      // Publish the section by setting publishedAt
      try {
        await apiRequest('PUT', `/sections/${sectionDocumentId}`, {
          publishedAt: new Date().toISOString(),
        });
        console.log(`      Published section`);
      } catch (e) {
        // May already be published
      }

      sectionMap[uniqueAnchor] = { documentId: sectionDocumentId, pageSlug };
      console.log(`      documentId: ${sectionDocumentId}`);
    }
  }

  // Connect sections to pages using the INVERSE relation (page.sections)
  // This works around Strapi 5 "locale null" bug when updating section.page
  console.log('\n  Connecting sections to pages via inverse relation...');

  // Group sections by page
  const sectionsByPage = {};
  for (const [anchor, info] of Object.entries(sectionMap)) {
    if (!sectionsByPage[info.pageSlug]) {
      sectionsByPage[info.pageSlug] = [];
    }
    sectionsByPage[info.pageSlug].push(info.documentId);
  }

  // Update each page with its sections
  for (const [pageSlug, sectionDocIds] of Object.entries(sectionsByPage)) {
    const pageInfo = pageMap[pageSlug];
    console.log(`    Connecting ${sectionDocIds.length} sections to page ${pageSlug}`);

    try {
      await apiRequest('PUT', `/pages/${pageInfo.documentId}`, {
        sections: {
          connect: sectionDocIds,
        },
      });
      console.log(`      Connected successfully`);
    } catch (error) {
      console.log(`      Warning: Could not connect relation - ${error.message}`);
    }
  }

  console.log('\n  Done');
}

async function main() {
  console.log('='.repeat(50));
  console.log('Strapi Cloud Seed Script');
  console.log(`Target: ${STRAPI_URL}`);
  console.log('='.repeat(50));

  try {
    // Test connection
    console.log('\nTesting API connection...');
    await apiRequest('GET', '/pages?pagination[limit]=1');
    console.log('  Connection successful!');

    await seedSiteSettings();
    await seedFooter();
    await seedNavigationItems();
    await seedPagesAndSections();

    console.log('\n' + '='.repeat(50));
    console.log('Seeding completed successfully!');
    console.log('='.repeat(50));
  } catch (error) {
    console.error('\nSeeding failed:', error.message);
    process.exit(1);
  }
}

main();

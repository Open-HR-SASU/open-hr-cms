'use strict';

/**
 * Open HR Seed Script
 *
 * Seeds the Strapi CMS with Open HR content:
 * - Site Settings (single type)
 * - Footer (single type)
 * - Navigation Items (collection type)
 * - Pages (collection type)
 * - Sections (collection type, linked to pages)
 *
 * Run with: npm run seed:openhr
 * Or directly: node scripts/seed-openhr.js
 */

const fs = require('fs-extra');
const path = require('path');

// Load seed data
const seedData = require('../data/openhr-seed-data.json');

async function seedOpenHR() {
  const shouldImportSeedData = await isFirstRun();

  if (!shouldImportSeedData) {
    console.log('Seed data has already been imported.');
    console.log('To re-import, clear the database or reset the initHasRun flag.');
    return;
  }

  try {
    console.log('Starting Open HR seed...');

    // Step 1: Set up API permissions
    console.log('Setting up API permissions...');
    await setPublicPermissions({
      'page': ['find', 'findOne'],
      'section': ['find', 'findOne'],
      'navigation-item': ['find', 'findOne'],
      'footer': ['find'],
      'site-setting': ['find'],
    });

    // Step 2: Attach existing media files
    console.log('Looking for existing media files...');
    const favicon = await findMediaByName('favicon');
    const logo = await findMediaByName('openhr-mark-full-open');

    // Step 3: Create Site Settings
    console.log('Creating site settings...');
    await createSiteSettings(seedData.siteSettings, { favicon, logo });

    // Step 4: Create Footer
    console.log('Creating footer...');
    await createFooter(seedData.footer);

    // Step 5: Create Navigation Items
    console.log('Creating navigation items...');
    await createNavigationItems(seedData.navigationItems);

    // Step 6: Create Pages and Sections
    console.log('Creating pages and sections...');
    await createPagesWithSections(seedData.pages, seedData.sections);

    console.log('Open HR seed completed successfully!');
  } catch (error) {
    console.error('Seed failed:', error);
    throw error;
  }
}

async function isFirstRun() {
  const pluginStore = strapi.store({
    environment: strapi.config.environment,
    type: 'type',
    name: 'setup',
  });
  const initHasRun = await pluginStore.get({ key: 'openhrInitHasRun' });
  await pluginStore.set({ key: 'openhrInitHasRun', value: true });
  return !initHasRun;
}

async function setPublicPermissions(newPermissions) {
  // Find the ID of the public role
  const publicRole = await strapi.query('plugin::users-permissions.role').findOne({
    where: { type: 'public' },
  });

  if (!publicRole) {
    console.warn('Public role not found, skipping permission setup');
    return;
  }

  // Create the new permissions and link them to the public role
  const allPermissionsToCreate = [];

  for (const [controller, actions] of Object.entries(newPermissions)) {
    for (const action of actions) {
      // Check if permission already exists
      const existingPermission = await strapi.query('plugin::users-permissions.permission').findOne({
        where: {
          action: `api::${controller}.${controller}.${action}`,
          role: publicRole.id,
        },
      });

      if (!existingPermission) {
        allPermissionsToCreate.push(
          strapi.query('plugin::users-permissions.permission').create({
            data: {
              action: `api::${controller}.${controller}.${action}`,
              role: publicRole.id,
            },
          })
        );
      }
    }
  }

  await Promise.all(allPermissionsToCreate);
  console.log(`Created ${allPermissionsToCreate.length} new permissions`);
}

async function findMediaByName(name) {
  const file = await strapi.query('plugin::upload.file').findOne({
    where: {
      name: { $containsi: name },
    },
  });
  return file || null;
}

async function createSiteSettings(data, media) {
  // Check if site settings already exist
  const existing = await strapi.documents('api::site-setting.site-setting').findFirst();

  const siteSettingsData = {
    siteName: data.siteName,
    tagline: data.tagline,
    logoAlt: data.logoAlt,
    defaultMetaDescription: data.defaultMetaDescription,
    socialLinks: data.socialLinks,
  };

  // Attach media if available
  if (media.favicon) {
    siteSettingsData.favicon = media.favicon.id;
  }
  if (media.logo) {
    siteSettingsData.logo = media.logo.id;
  }

  if (existing) {
    await strapi.documents('api::site-setting.site-setting').update({
      documentId: existing.documentId,
      data: siteSettingsData,
    });
    console.log('Updated existing site settings');
  } else {
    await strapi.documents('api::site-setting.site-setting').create({
      data: siteSettingsData,
    });
    console.log('Created site settings');
  }
}

async function createFooter(data) {
  // Check if footer already exists
  const existing = await strapi.documents('api::footer.footer').findFirst();

  const footerData = {
    copyrightText: data.copyrightText,
    columns: data.columns,
    publishedAt: new Date(),
  };

  if (existing) {
    await strapi.documents('api::footer.footer').update({
      documentId: existing.documentId,
      data: footerData,
    });
    console.log('Updated existing footer');
  } else {
    await strapi.documents('api::footer.footer').create({
      data: footerData,
    });
    console.log('Created footer');
  }
}

async function createNavigationItems(items) {
  for (const item of items) {
    // Check if navigation item already exists
    const existing = await strapi.documents('api::navigation-item.navigation-item').findFirst({
      filters: { href: item.href },
    });

    const navData = {
      label: item.label,
      href: item.href,
      order: item.order,
      openInNewTab: item.openInNewTab || false,
      publishedAt: new Date(),
    };

    if (existing) {
      await strapi.documents('api::navigation-item.navigation-item').update({
        documentId: existing.documentId,
        data: navData,
      });
      console.log(`Updated navigation item: ${item.label}`);
    } else {
      await strapi.documents('api::navigation-item.navigation-item').create({
        data: navData,
      });
      console.log(`Created navigation item: ${item.label}`);
    }
  }
}

async function createPagesWithSections(pages, sectionsData) {
  for (const pageData of pages) {
    // Check if page already exists
    const existingPage = await strapi.documents('api::page.page').findFirst({
      filters: { slug: pageData.slug },
    });

    const pageEntry = {
      title: pageData.title,
      slug: pageData.slug,
      locale: pageData.locale || 'fr',
      metaTitle: pageData.metaTitle,
      metaDescription: pageData.metaDescription,
      ogImageAlt: pageData.ogImageAlt,
    };

    let page;
    if (existingPage) {
      page = await strapi.documents('api::page.page').update({
        documentId: existingPage.documentId,
        data: pageEntry,
        status: 'published',
      });
      console.log(`Updated page: ${pageData.title}`);
    } else {
      page = await strapi.documents('api::page.page').create({
        data: pageEntry,
        status: 'published',
      });
      console.log(`Created page: ${pageData.title} (documentId: ${page.documentId})`);
    }

    // Create sections for this page
    const pageSections = sectionsData[pageData.slug] || [];
    for (const sectionData of pageSections) {
      await createSection(sectionData, page.documentId);
    }
  }
}

async function createSection(data, pageDocumentId) {
  // Check if section already exists by anchor
  const existingSection = await strapi.documents('api::section.section').findFirst({
    filters: {
      anchor: data.anchor,
    },
  });

  // Create section data without the relation first
  const sectionEntry = {
    type: data.type,
    eyebrow: data.eyebrow || null,
    heading: data.heading || null,
    subheading: data.subheading || null,
    body: data.body || null,
    ctaText: data.ctaText || null,
    ctaLink: data.ctaLink || null,
    ctaStyle: data.ctaStyle || 'primary',
    ctaText2: data.ctaText2 || null,
    ctaLink2: data.ctaLink2 || null,
    backgroundStyle: data.backgroundStyle || 'light',
    anchor: data.anchor || null,
    ariaLabel: data.ariaLabel || null,
    helpText: data.helpText || null,
    order: data.order || 0,
    features: data.features || [],
    pricingTiers: data.pricingTiers || [],
  };

  let section;
  if (existingSection) {
    section = await strapi.documents('api::section.section').update({
      documentId: existingSection.documentId,
      data: sectionEntry,
      status: 'published',
    });
    console.log(`  Updated section: ${data.type} (${data.anchor})`);
  } else {
    section = await strapi.documents('api::section.section').create({
      data: sectionEntry,
      status: 'published',
    });
    console.log(`  Created section: ${data.type} (${data.anchor})`);
  }

  // Connect the relation using Query Engine API
  // First get the internal IDs
  const sectionRecord = await strapi.db.query('api::section.section').findOne({
    where: { documentId: section.documentId },
  });
  const pageRecord = await strapi.db.query('api::page.page').findOne({
    where: { documentId: pageDocumentId },
  });

  if (sectionRecord && pageRecord) {
    await strapi.db.query('api::section.section').update({
      where: { id: sectionRecord.id },
      data: { page: pageRecord.id },
    });
  }
}

async function main() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi');

  console.log('Compiling Strapi...');
  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();

  app.log.level = 'error';

  try {
    await seedOpenHR();
  } finally {
    await app.destroy();
  }

  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

// Document types
import page from './page'
import section from './section'
import navigationItem from './navigationItem'
import siteSettings from './siteSettings'
import footer from './footer'

// Object types
import seo from './objects/seo'
import portableText from './objects/portableText'
import announcementBar from './objects/announcementBar'
import emptyState from './objects/emptyState'
import feature from './objects/feature'
import footerLink from './objects/footerLink'
import footerColumn from './objects/footerColumn'
import pricingFeature from './objects/pricingFeature'
import pricingTier from './objects/pricingTier'
import socialLink from './objects/socialLink'
import localeConfig from './objects/localeConfig'

export const schemaTypes = [
  // Documents
  page,
  section,
  navigationItem,
  siteSettings,
  footer,
  // Objects
  seo,
  portableText,
  announcementBar,
  emptyState,
  feature,
  footerLink,
  footerColumn,
  pricingFeature,
  pricingTier,
  socialLink,
  localeConfig,
]

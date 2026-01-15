import type { Schema, Struct } from '@strapi/strapi';

export interface SharedAnnouncementBar extends Struct.ComponentSchema {
  collectionName: 'components_shared_announcement_bars';
  info: {
    description: 'Site-wide announcement banner';
    displayName: 'Announcement Bar';
    icon: 'bell';
  };
  attributes: {
    enabled: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>;
    link: Schema.Attribute.String;
    linkLabel: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 20;
      }>;
    message: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 80;
      }>;
    style: Schema.Attribute.Enumeration<['info', 'success', 'warning']> &
      Schema.Attribute.DefaultTo<'info'>;
  };
}

export interface SharedEmptyState extends Struct.ComponentSchema {
  collectionName: 'components_shared_empty_states';
  info: {
    description: 'Fallback content when section has no items';
    displayName: 'Empty State';
    icon: 'file';
  };
  attributes: {
    body: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 150;
      }>;
    ctaLink: Schema.Attribute.String;
    ctaText: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 25;
      }>;
    heading: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
  };
}

export interface SharedFeature extends Struct.ComponentSchema {
  collectionName: 'components_shared_features';
  info: {
    description: 'Individual feature item for features sections';
    displayName: 'Feature';
    icon: 'star';
  };
  attributes: {
    description: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 150;
      }>;
    heading: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    icon: Schema.Attribute.Enumeration<
      [
        'checkmark',
        'shield',
        'clock',
        'users',
        'chart',
        'star',
        'lock',
        'globe',
        'briefcase',
        'award',
        'trending-up',
        'file-check',
        'message-circle',
        'zap',
        'target',
        'layers',
      ]
    > &
      Schema.Attribute.Required;
    link: Schema.Attribute.String;
    linkLabel: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 25;
      }>;
  };
}

export interface SharedFooterColumn extends Struct.ComponentSchema {
  collectionName: 'components_shared_footer_columns';
  info: {
    description: 'Column of links in footer';
    displayName: 'Footer Column';
    icon: 'layout';
  };
  attributes: {
    links: Schema.Attribute.Component<'shared.footer-link', true>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 25;
      }>;
  };
}

export interface SharedFooterLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_footer_links';
  info: {
    description: 'Individual link in footer column';
    displayName: 'Footer Link';
    icon: 'link';
  };
  attributes: {
    href: Schema.Attribute.String & Schema.Attribute.Required;
    label: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 30;
      }>;
  };
}

export interface SharedPricingFeature extends Struct.ComponentSchema {
  collectionName: 'components_shared_pricing_features';
  info: {
    description: 'Individual feature in pricing tier';
    displayName: 'Pricing Feature';
    icon: 'check';
  };
  attributes: {
    included: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<true>;
    text: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
    tooltip: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 150;
      }>;
  };
}

export interface SharedPricingTier extends Struct.ComponentSchema {
  collectionName: 'components_shared_pricing_tiers';
  info: {
    description: 'Pricing tier card (feature lists only - prices code-driven)';
    displayName: 'Pricing Tier';
    icon: 'priceTag';
  };
  attributes: {
    badge: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 20;
      }>;
    description: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    features: Schema.Attribute.Component<'shared.pricing-feature', true>;
    highlighted: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 30;
      }>;
    tierKey: Schema.Attribute.Enumeration<['essential', 'professional']> &
      Schema.Attribute.Required;
  };
}

export interface SharedSocialLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_social_links';
  info: {
    description: 'Social media profile link';
    displayName: 'Social Link';
    icon: 'earth';
  };
  attributes: {
    platform: Schema.Attribute.Enumeration<['linkedin', 'twitter']> &
      Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'shared.announcement-bar': SharedAnnouncementBar;
      'shared.empty-state': SharedEmptyState;
      'shared.feature': SharedFeature;
      'shared.footer-column': SharedFooterColumn;
      'shared.footer-link': SharedFooterLink;
      'shared.pricing-feature': SharedPricingFeature;
      'shared.pricing-tier': SharedPricingTier;
      'shared.social-link': SharedSocialLink;
    }
  }
}

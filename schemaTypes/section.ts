import {defineType, defineField} from 'sanity'

const LANGUAGES = [
  {title: 'Français', value: 'fr'},
  {title: 'English (UK)', value: 'en-GB'},
  {title: 'English (US)', value: 'en-US'},
  {title: 'Deutsch', value: 'de'},
  {title: 'Italiano', value: 'it'},
  {title: 'Español', value: 'es'},
]

const SECTION_TYPES = [
  {title: 'Hero', value: 'hero'},
  {title: 'Features', value: 'features'},
  {title: 'CTA', value: 'cta'},
  {title: 'Testimonials', value: 'testimonials'},
  {title: 'FAQ', value: 'faq'},
  {title: 'Stats', value: 'stats'},
  {title: 'Content', value: 'content'},
  {title: 'Pricing', value: 'pricing'},
  {title: 'Logos', value: 'logos'},
  {title: 'Process', value: 'process'},
  {title: 'Comparison', value: 'comparison'},
]

const CTA_STYLES = [
  {title: 'Primary', value: 'primary'},
  {title: 'Secondary', value: 'secondary'},
  {title: 'Ghost', value: 'ghost'},
  {title: 'Destructive', value: 'destructive'},
]

const BACKGROUND_STYLES = [
  {title: 'Light', value: 'light'},
  {title: 'Dark', value: 'dark'},
  {title: 'Brand', value: 'brand'},
  {title: 'Gradient', value: 'gradient'},
]

export default defineType({
  name: 'section',
  title: 'Section',
  type: 'document',
  fields: [
    defineField({
      name: 'language',
      title: 'Language',
      type: 'string',
      options: {list: LANGUAGES},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'sectionType',
      title: 'Section Type',
      type: 'string',
      options: {list: SECTION_TYPES, layout: 'dropdown'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      validation: (rule) => rule.max(30),
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: 'subheading',
      title: 'Subheading',
      type: 'string',
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'portableText',
    }),
    defineField({
      name: 'features',
      title: 'Features',
      type: 'array',
      of: [{type: 'feature'}],
      hidden: ({document}) => document?.sectionType !== 'features',
    }),
    defineField({
      name: 'pricingTiers',
      title: 'Pricing Tiers',
      type: 'array',
      of: [{type: 'pricingTier'}],
      hidden: ({document}) => document?.sectionType !== 'pricing',
    }),
    defineField({
      name: 'emptyState',
      title: 'Empty State',
      type: 'emptyState',
    }),
    defineField({
      name: 'ctaText',
      title: 'Primary CTA Text',
      type: 'string',
      validation: (rule) => rule.max(25),
    }),
    defineField({
      name: 'ctaLink',
      title: 'Primary CTA Link',
      type: 'string',
      hidden: ({document}) => !document?.ctaText,
    }),
    defineField({
      name: 'ctaStyle',
      title: 'Primary CTA Style',
      type: 'string',
      options: {list: CTA_STYLES, layout: 'radio'},
      hidden: ({document}) => !document?.ctaText,
    }),
    defineField({
      name: 'ctaText2',
      title: 'Secondary CTA Text',
      type: 'string',
      validation: (rule) => rule.max(25),
    }),
    defineField({
      name: 'ctaLink2',
      title: 'Secondary CTA Link',
      type: 'string',
      hidden: ({document}) => !document?.ctaText2,
    }),
    defineField({
      name: 'backgroundStyle',
      title: 'Background Style',
      type: 'string',
      options: {list: BACKGROUND_STYLES, layout: 'radio'},
    }),
    defineField({
      name: 'anchor',
      title: 'Anchor ID',
      type: 'slug',
    }),
    defineField({
      name: 'ariaLabel',
      title: 'ARIA Label',
      type: 'string',
      validation: (rule) => rule.max(100),
    }),
    defineField({
      name: 'helpText',
      title: 'Internal Help Text',
      type: 'text',
      validation: (rule) => rule.max(200),
    }),
    defineField({
      name: 'hideMobile',
      title: 'Hide on Mobile',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      heading: 'heading',
      sectionType: 'sectionType',
      language: 'language',
    },
    prepare({heading, sectionType, language}) {
      return {
        title: heading || sectionType || 'Untitled Section',
        subtitle: `${sectionType?.toUpperCase()} · ${language?.toUpperCase()}`,
      }
    },
  },
})

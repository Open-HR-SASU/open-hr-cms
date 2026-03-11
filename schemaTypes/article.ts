import {defineType, defineField, defineArrayMember} from 'sanity'
import {DocumentTextIcon} from '@sanity/icons'

const LANGUAGES = [
  {title: 'Francais', value: 'fr'},
  {title: 'English (UK)', value: 'en-GB'},
  {title: 'English (US)', value: 'en-US'},
  {title: 'Deutsch', value: 'de'},
  {title: 'Italiano', value: 'it'},
  {title: 'Espanol', value: 'es'},
]

const SERIES_TYPES = [
  {title: 'Pillar Article', value: 'pillar'},
  {title: 'Glossary ("What is…?")', value: 'glossary'},
  {title: 'Myth vs. Fact', value: 'myth-vs-fact'},
  {title: 'Compliance Brief', value: 'compliance'},
  {title: 'Research Digest', value: 'research-digest'},
  {title: 'Ask Open HR (FAQ)', value: 'faq'},
]

export default defineType({
  name: 'article',
  title: 'Insight Article',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    // --- Core ---
    defineField({
      name: 'language',
      title: 'Language',
      type: 'string',
      options: {list: LANGUAGES},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'seriesType',
      title: 'Content Series',
      type: 'string',
      options: {list: SERIES_TYPES, layout: 'radio'},
      initialValue: 'pillar',
      validation: (rule) => rule.required(),
      description: 'Determines URL path, template variant, and JSON-LD schema type.',
    }),
    defineField({
      name: 'relatedPillar',
      title: 'Related Pillar Article',
      type: 'reference',
      to: [{type: 'article'}],
      description: 'Link to the parent pillar article for internal linking and topical authority.',
      options: {
        filter: 'seriesType == "pillar"',
      },
      hidden: ({parent}) => parent?.seriesType === 'pillar',
    }),
    defineField({
      name: 'verdict',
      title: 'Myth Verdict',
      type: 'string',
      options: {
        list: [
          {title: 'False', value: 'false'},
          {title: 'Mostly False', value: 'mostly-false'},
          {title: 'Half True', value: 'half-true'},
          {title: 'Mostly True', value: 'mostly-true'},
          {title: 'True', value: 'true'},
        ],
        layout: 'radio',
      },
      hidden: ({parent}) => parent?.seriesType !== 'myth-vs-fact',
      description: 'Verdict rating for ClaimReview JSON-LD (myth-vs-fact articles only).',
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (rule) =>
        rule.required().custom((slug) => {
          if (!slug?.current) return 'Required'
          if (!/^[a-z0-9-]+$/.test(slug.current)) {
            return 'Slug must be lowercase with hyphens only'
          }
          return true
        }),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required().max(200),
      description:
        'Short summary for listing cards and meta description fallback. Keep under 200 characters.',
    }),

    // --- Authorship ---
    defineField({
      name: 'author',
      title: 'Lead Author',
      type: 'reference',
      to: [{type: 'author'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'reviewedBy',
      title: 'Reviewed By',
      type: 'reference',
      to: [{type: 'author'}],
      description: 'Optional. Adds "Reviewed by" attribution (E-E-A-T signal).',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      validation: (rule) => rule.required(),
    }),

    // --- Cover ---
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: {hotspot: true},
      description: 'Used as hero image and Open Graph image fallback.',
    }),

    // --- Body ---
    defineField({
      name: 'tldr',
      title: 'TL;DR',
      type: 'text',
      rows: 4,
      description:
        'GEO-optimised summary block displayed at the top of the article. Direct, concise. Required for pillar and research-digest articles.',
      validation: (rule) =>
        rule.max(500).custom((value, context) => {
          const parent = context.parent as {seriesType?: string} | undefined
          const series = parent?.seriesType
          if ((series === 'pillar' || series === 'research-digest') && !value) {
            return 'TL;DR is required for pillar articles and research digests.'
          }
          return true
        }),
    }),
    defineField({
      name: 'body',
      title: 'Article Body',
      type: 'portableText',
      validation: (rule) => rule.required(),
    }),

    // --- FAQ (GEO/AEO) ---
    defineField({
      name: 'faq',
      title: 'FAQ Section',
      type: 'array',
      description:
        'Questions and answers rendered as FAQ section and FAQPage JSON-LD schema. Required (3-7 items) for pillar articles; optional for other series.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'faqItem',
          title: 'FAQ Item',
          fields: [
            defineField({
              name: 'question',
              title: 'Question',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'answer',
              title: 'Answer',
              type: 'text',
              rows: 4,
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: {title: 'question'},
          },
        }),
      ],
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as {seriesType?: string} | undefined
          if (parent?.seriesType === 'pillar') {
            if (!value || value.length < 3) return 'Pillar articles require 3-7 FAQ items.'
            if (value.length > 7) return 'Maximum 7 FAQ items for optimal GEO performance.'
          }
          return true
        }),
    }),

    // --- Academic references ---
    defineField({
      name: 'references',
      title: 'Academic References',
      type: 'array',
      description: 'Formatted citations displayed at the end of the article (E-E-A-T signal).',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'citation',
          title: 'Citation',
          fields: [
            defineField({
              name: 'text',
              title: 'Citation Text',
              type: 'text',
              rows: 2,
              description: 'Full APA-style citation.',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'doi',
              title: 'DOI URL',
              type: 'url',
              description: 'Optional. Link to the paper.',
              validation: (rule) =>
                rule.uri({scheme: ['https', 'http']}),
            }),
          ],
          preview: {
            select: {title: 'text'},
          },
        }),
      ],
    }),

    // --- SEO ---
    defineField({
      name: 'seo',
      title: 'SEO Settings',
      type: 'seo',
    }),
  ],

  orderings: [
    {
      title: 'Published (newest)',
      name: 'publishedDesc',
      by: [{field: 'publishedAt', direction: 'desc'}],
    },
  ],

  preview: {
    select: {
      title: 'title',
      language: 'language',
      seriesType: 'seriesType',
      authorName: 'author.name',
      media: 'coverImage',
    },
    prepare({title, language, seriesType, authorName, media}) {
      const seriesLabels: Record<string, string> = {
        pillar: 'Pillar',
        glossary: 'Glossary',
        'myth-vs-fact': 'Myth vs. Fact',
        compliance: 'Compliance',
        'research-digest': 'Research',
        faq: 'FAQ',
      }
      const series = seriesType ? seriesLabels[seriesType] || seriesType : ''
      return {
        title: title || 'Untitled',
        subtitle: [language?.toUpperCase(), series, authorName].filter(Boolean).join(' | '),
        media,
      }
    },
  },
})

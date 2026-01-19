import {defineType, defineField} from 'sanity'

const LANGUAGES = [
  {title: 'Français', value: 'fr'},
  {title: 'English (UK)', value: 'en-GB'},
  {title: 'English (US)', value: 'en-US'},
  {title: 'Deutsch', value: 'de'},
  {title: 'Italiano', value: 'it'},
  {title: 'Español', value: 'es'},
]

export default defineType({
  name: 'navigationItem',
  title: 'Navigation Item',
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
      name: 'label',
      title: 'Label',
      type: 'string',
      validation: (rule) => rule.required().max(30),
    }),
    defineField({
      name: 'href',
      title: 'Link',
      type: 'string',
    }),
    defineField({
      name: 'page',
      title: 'Page Reference',
      type: 'reference',
      to: [{type: 'page'}],
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
    }),
    defineField({
      name: 'isExternal',
      title: 'External Link',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'showInHeader',
      title: 'Show in Header',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'showInFooter',
      title: 'Show in Footer',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'showInMobile',
      title: 'Show in Mobile Menu',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'highlight',
      title: 'Highlight (CTA Style)',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'ariaLabel',
      title: 'ARIA Label',
      type: 'string',
    }),
  ],
  orderings: [
    {
      title: 'Order',
      name: 'orderAsc',
      by: [{field: 'order', direction: 'asc'}],
    },
  ],
  preview: {
    select: {
      title: 'label',
      language: 'language',
      order: 'order',
    },
    prepare({title, language, order}) {
      return {
        title: title || 'Untitled',
        subtitle: `${order ? `#${order} · ` : ''}${language?.toUpperCase()}`,
      }
    },
  },
})

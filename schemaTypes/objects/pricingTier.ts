import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'pricingTier',
  title: 'Pricing Tier',
  type: 'object',
  fields: [
    defineField({
      name: 'name',
      title: 'Tier Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'string',
    }),
    defineField({
      name: 'priceMonthly',
      title: 'Monthly Price',
      type: 'number',
    }),
    defineField({
      name: 'priceAnnual',
      title: 'Annual Price',
      type: 'number',
    }),
    defineField({
      name: 'currency',
      title: 'Currency',
      type: 'string',
      options: {
        list: [
          {title: 'EUR (€)', value: 'EUR'},
          {title: 'USD ($)', value: 'USD'},
          {title: 'GBP (£)', value: 'GBP'},
        ],
      },
      initialValue: 'EUR',
    }),
    defineField({
      name: 'features',
      title: 'Features',
      type: 'array',
      of: [{type: 'pricingFeature'}],
    }),
    defineField({
      name: 'ctaText',
      title: 'CTA Text',
      type: 'string',
    }),
    defineField({
      name: 'ctaLink',
      title: 'CTA Link',
      type: 'string',
    }),
    defineField({
      name: 'highlight',
      title: 'Highlight (Recommended)',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'badge',
      title: 'Badge Text',
      type: 'string',
      description: 'e.g., "Most Popular", "Best Value"',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      priceMonthly: 'priceMonthly',
      currency: 'currency',
    },
    prepare({title, priceMonthly, currency}) {
      const symbol = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$'
      return {
        title: title || 'Tier',
        subtitle: priceMonthly ? `${symbol}${priceMonthly}/mo` : 'Free',
      }
    },
  },
})

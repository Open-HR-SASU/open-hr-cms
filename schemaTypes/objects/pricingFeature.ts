import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'pricingFeature',
  title: 'Pricing Feature',
  type: 'object',
  fields: [
    defineField({
      name: 'text',
      title: 'Feature Text',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'included',
      title: 'Included',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'tooltip',
      title: 'Tooltip',
      type: 'string',
    }),
  ],
  preview: {
    select: {
      title: 'text',
      included: 'included',
    },
    prepare({title, included}) {
      return {
        title: title,
        subtitle: included ? '✓ Included' : '✗ Not included',
      }
    },
  },
})

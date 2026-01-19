import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'localeConfig',
  title: 'Locale Configuration',
  type: 'object',
  fields: [
    defineField({
      name: 'code',
      title: 'Locale Code',
      type: 'string',
      options: {
        list: [
          {title: 'Français (fr)', value: 'fr'},
          {title: 'English UK (en-GB)', value: 'en-GB'},
          {title: 'English US (en-US)', value: 'en-US'},
          {title: 'Deutsch (de)', value: 'de'},
          {title: 'Italiano (it)', value: 'it'},
          {title: 'Español (es)', value: 'es'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'label',
      title: 'Display Label',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'isDefault',
      title: 'Default Locale',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'enabled',
      title: 'Enabled',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      code: 'code',
      label: 'label',
      isDefault: 'isDefault',
    },
    prepare({code, label, isDefault}) {
      return {
        title: label || code,
        subtitle: isDefault ? 'Default' : code,
      }
    },
  },
})

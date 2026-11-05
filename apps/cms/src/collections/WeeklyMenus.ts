import type { CollectionConfig } from 'payload'
import { hasRole, isGateway, isStaff } from '../access/roles'

// The canteen menu, one document per school week (Monday to Friday). Staff add it every week;
// the Home page shows today's lunch and the rest of the week through maarif-api.
// Dish names are localized; the API falls back to French when a language is not filled in,
// because a menu in another language is more useful to a parent than no menu.

const days = [
  { label: 'Monday', value: 'monday' },
  { label: 'Tuesday', value: 'tuesday' },
  { label: 'Wednesday', value: 'wednesday' },
  { label: 'Thursday', value: 'thursday' },
  { label: 'Friday', value: 'friday' },
]

const courses = [
  { label: 'Starter', value: 'starter' },
  { label: 'Main course', value: 'main' },
  { label: 'Side', value: 'side' },
  { label: 'Dessert', value: 'dessert' },
  { label: 'Snack', value: 'snack' },
]

export const WeeklyMenus: CollectionConfig = {
  slug: 'weekly-menus',
  labels: { singular: 'Weekly menu', plural: 'Weekly menus' },
  admin: {
    useAsTitle: 'weekOf',
    defaultColumns: ['weekOf', 'updatedAt'],
    group: 'School life',
    description: 'Add next week’s menu before Monday. One entry per week; days without lunch can be left out.',
  },
  defaultSort: '-weekOf',
  access: {
    read: ({ req }) => isStaff(req) || isGateway(req),
    create: ({ req }) => hasRole(req, 'editor', 'reviewer'),
    update: ({ req }) => hasRole(req, 'editor', 'reviewer'),
    delete: ({ req }) => hasRole(req, 'reviewer'),
  },
  fields: [
    {
      name: 'weekOf',
      label: 'Week of (Monday)',
      type: 'date',
      required: true,
      unique: true,
      index: true,
      admin: { date: { pickerAppearance: 'dayOnly', displayFormat: 'EEEE d MMMM yyyy' } },
      // The admin's date picker stores local midnight; read the weekday in Tunis time.
      validate: (value: unknown) => {
        if (!value) return 'Choose the Monday of the week.'
        const weekday = new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Tunis', weekday: 'long' }).format(
          new Date(value as string),
        )
        return weekday === 'Monday' ? true : 'The week starts on a Monday: choose a Monday.'
      },
    },
    {
      name: 'days',
      type: 'array',
      maxRows: 5,
      labels: { singular: 'Day', plural: 'Days' },
      fields: [
        { name: 'day', type: 'select', required: true, options: days },
        {
          name: 'dishes',
          type: 'array',
          minRows: 1,
          maxRows: 8,
          labels: { singular: 'Dish', plural: 'Dishes' },
          fields: [
            { name: 'course', type: 'select', required: true, defaultValue: 'main', options: courses },
            { name: 'dish', type: 'text', required: true, localized: true, maxLength: 80 },
          ],
        },
      ],
    },
  ],
}

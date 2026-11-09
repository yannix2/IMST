import type { Field, TextField } from 'payload'
import { campusKeys, stages } from '@maarif/contracts'

// Field building blocks shared by the wave-3 collections.

// "View on site" in the admin (wave 3): the published page in the editor's current language.
// SITE_URL is the public site's address (wrangler var); drafts are not shown on the site.
export const viewOnSite =
  (section: string) =>
  (doc: Record<string, unknown>, { locale }: { locale?: string }) => {
    const slug = typeof doc.slug === 'string' ? doc.slug : ''
    if (!slug) return null
    const site = process.env.SITE_URL ?? 'https://yassinekhiari.download'
    return `${site}/${locale ?? 'en'}${section ? `/${section}` : ''}/${slug}`
  }

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

// Latin lowercase words joined by hyphens: one address for all four languages
// (/en/campus-life/news/back-to-school-2025, /ar/campus-life/news/back-to-school-2025).
// Filled from the English title when left empty.
export const slugField = (from = 'title'): TextField => ({
  name: 'slug',
  type: 'text',
  required: true,
  unique: true,
  index: true,
  admin: { position: 'sidebar', description: 'Web address. Latin letters, digits and hyphens; filled from the English title if empty.' },
  hooks: {
    beforeValidate: [
      ({ value, data, req }) => {
        if (typeof value === 'string' && value) return value
        const source = (data?.[from] as unknown) ?? ''
        const text = typeof source === 'string' ? source : ((source as Record<string, string>)?.[req.locale ?? 'en'] ?? '')
        return text
          .normalize('NFD')
          .replace(/\p{M}/gu, '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .slice(0, 80)
      },
    ],
  },
  validate: (value: unknown) => (typeof value === 'string' && SLUG.test(value) ? true : 'Use Latin lowercase words joined by hyphens.'),
})

const stageLabels: Record<(typeof stages)[number], string> = {
  kindergarten: 'Kindergarten',
  primary: 'Primary (Years 1-6)',
  'lower-secondary': 'Lower secondary (Years 7-9)',
  'upper-secondary': 'Upper secondary (Years 10-13)',
}

export const stagesField: Field = {
  name: 'stages',
  label: 'Levels',
  type: 'select',
  hasMany: true,
  options: stages.map((value) => ({ label: stageLabels[value], value })),
  admin: { position: 'sidebar' },
}

export const campusField: Field = {
  name: 'campus',
  type: 'select',
  options: [
    { label: 'Le Kram (Kindergarten to Year 9)', value: campusKeys[0] },
    { label: 'Charguia 2 (Years 10 to 13)', value: campusKeys[1] },
  ],
  admin: { position: 'sidebar' },
}

export const consentReminder = 'Children only in shots where nobody can recognise them, unless written parental authorization is on file (the photo’s consent status says which).'

export const photosField = (name = 'photos', maxRows = 40): Field => ({
  name,
  type: 'array',
  maxRows,
  admin: { description: consentReminder },
  fields: [
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
    { name: 'caption', type: 'text', localized: true, maxLength: 160 },
  ],
})

export const seoField: Field = {
  name: 'seo',
  label: 'Search engines',
  type: 'group',
  fields: [
    { name: 'title', type: 'text', localized: true, maxLength: 60 },
    { name: 'description', type: 'textarea', localized: true, maxLength: 155 },
  ],
}

// Launch rule: a language version is shown publicly once it is at least "ready".
export const translationStatusField: Field = {
  name: 'translationStatus',
  label: 'Translation status',
  type: 'select',
  localized: true,
  required: true,
  defaultValue: 'draft',
  options: [
    { label: 'Draft', value: 'draft' },
    { label: 'Ready', value: 'ready' },
    { label: 'Proofread', value: 'proofread' },
  ],
  admin: { position: 'sidebar', description: 'A language is shown on the site only when Ready or Proofread.' },
}

import type { GlobalConfig } from 'payload'
import { hasRole, isGateway, isStaff } from '../access/roles'
import { refreshGlobal } from '../hooks/revalidate'

// The Home page's first screen. Wave 2 hero film, moved into maarifcms in wave 3; wave 5 (owner
// 2026-11-10): the silent loop is the trailer cut from the school's admissions film
// (tools/media/admissions-film.mjs), and "Watch the film" opens the full film with sound. Until a
// reviewer publishes this, the site keeps the photo loop built into the code and shows no film
// button. Each part works on its own: the loop needs its four files, the film button its two films.
const video = { mimeType: { contains: 'video' } }
const image = { mimeType: { contains: 'image' } }

export const HomeHero: GlobalConfig = {
  slug: 'home-hero',
  label: 'Home film',
  admin: { group: 'Content' },
  access: {
    read: ({ req }) => isStaff(req) || isGateway(req),
    update: ({ req }) => hasRole(req, 'editor', 'reviewer'),
  },
  hooks: { afterChange: [refreshGlobal('home-hero')] },
  fields: [
    {
      name: 'published',
      label: 'Show on the website',
      type: 'checkbox',
      defaultValue: false,
      access: { update: ({ req }) => hasRole(req, 'reviewer') },
      admin: { position: 'sidebar' },
    },
    {
      type: 'collapsible',
      label: 'Silent loop behind the headline',
      fields: [
        { name: 'filmLandscape', label: 'Loop, wide (computers), MP4 at most 4 MB', type: 'upload', relationTo: 'media', filterOptions: video },
        { name: 'filmPortrait', label: 'Loop, tall (phones), MP4 at most 2.5 MB', type: 'upload', relationTo: 'media', filterOptions: video },
        { name: 'posterLandscape', label: 'Still image, wide', type: 'upload', relationTo: 'media', filterOptions: image },
        { name: 'posterPortrait', label: 'Still image, tall', type: 'upload', relationTo: 'media', filterOptions: image },
      ],
    },
    {
      type: 'collapsible',
      label: '"Watch the film": the full film with sound',
      fields: [
        { name: 'fullFilm', label: 'Full film, 720p MP4 (at most 30 MB)', type: 'upload', relationTo: 'media', filterOptions: video },
        { name: 'fullFilmSmall', label: 'Full film for phones, 480p MP4 (at most 15 MB)', type: 'upload', relationTo: 'media', filterOptions: video },
        { name: 'fullFilmPoster', label: 'Still image shown before it plays', type: 'upload', relationTo: 'media', filterOptions: image },
        {
          name: 'transcript',
          label: 'What is said in the film, in this language',
          type: 'textarea',
          localized: true,
          maxLength: 6000,
          admin: {
            rows: 12,
            description: 'Shown under the film ("Read what is said"). The film itself has English subtitles; write the words in each language. One paragraph per line break.',
          },
        },
      ],
    },
  ],
}

import type { GlobalConfig } from 'payload'
import { hasRole, isGateway, isStaff } from '../access/roles'
import { refreshGlobal } from '../hooks/revalidate'

// The Home page's first screen (wave 2 hero film, moved into maarifcms in wave 3): the looping
// photo motion film in two shapes and its poster images. Until a reviewer publishes it, the site
// keeps the film built into the code.
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
    { name: 'filmLandscape', label: 'Film, wide (computers), MP4 at most 4 MB', type: 'upload', relationTo: 'media', filterOptions: video },
    { name: 'filmPortrait', label: 'Film, tall (phones), MP4 at most 2.5 MB', type: 'upload', relationTo: 'media', filterOptions: video },
    { name: 'posterLandscape', label: 'Still image, wide', type: 'upload', relationTo: 'media', filterOptions: image },
    { name: 'posterPortrait', label: 'Still image, tall', type: 'upload', relationTo: 'media', filterOptions: image },
  ],
}

import fs from 'fs'
import path from 'path'
import { sqliteD1Adapter } from '@payloadcms/db-d1-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { CloudflareContext, getCloudflareContext } from '@opennextjs/cloudflare'
import { GetPlatformProxyOptions } from 'wrangler'
import { r2Storage } from '@payloadcms/storage-r2'
import { ar } from '@payloadcms/translations/languages/ar'
import { en } from '@payloadcms/translations/languages/en'
import { fr } from '@payloadcms/translations/languages/fr'
import { tr } from '@payloadcms/translations/languages/tr'
import { AuditLog, auditLogPlugin } from './collections/AuditLog'
import { maintenance } from './endpoints/maintenance'
import type { MailBinding } from '@maarif/mail'
import { cloudflareEmailAdapter } from './email/adapter'

import { ApiClients } from './collections/ApiClients'
import { Inquiries } from './collections/Inquiries'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Users } from './collections/Users'
import { WeeklyMenus } from './collections/WeeklyMenus'
import { News } from './collections/News'
import { Faqs } from './collections/Faqs'
import { People } from './collections/People'
import { Testimonials } from './collections/Testimonials'
import { Albums } from './collections/Albums'
import { Applications } from './collections/Applications'
import { Clubs } from './collections/Clubs'
import { Documents } from './collections/Documents'
import { Jobs } from './collections/Jobs'
import { PageVisuals } from './collections/PageVisuals'
import { PrivateFiles } from './collections/PrivateFiles'
import { Redirects } from './collections/Redirects'
import { Trips } from './collections/Trips'
import { Newsletters } from './collections/Newsletters'
import { Subscribers } from './collections/Subscribers'
import { Gallery } from './globals/Gallery'
import { HeadMessage } from './globals/HeadMessage'
import { HomeHero } from './globals/HomeHero'
import { SchoolFacts } from './globals/SchoolFacts'
import { SiteSettings } from './globals/SiteSettings'
import { Timetables } from './globals/Timetables'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const realpath = (value: string) => {
  try {
    return fs.existsSync(value) ? fs.realpathSync(value) : undefined
  } catch {
    return undefined
  }
}

const isCLI = process.argv.some((value) => {
  const resolved = realpath(value)
  if (!resolved) return false
  return (
    resolved.endsWith(path.join('payload', 'bin.js')) ||
    resolved.endsWith(path.join('next', 'dist', 'bin', 'next'))
  )
})
const isProduction = process.env.NODE_ENV === 'production'

const createLog =
  (level: string, fn: typeof console.log) => (objOrMsg: object | string, msg?: string) => {
    if (typeof objOrMsg === 'string') {
      fn(JSON.stringify({ level, msg: objOrMsg }))
    } else {
      fn(JSON.stringify({ level, ...objOrMsg, msg: msg ?? (objOrMsg as { msg?: string }).msg }))
    }
  }

const cloudflareLogger = {
  level: process.env.PAYLOAD_LOG_LEVEL || 'info',
  trace: createLog('trace', console.debug),
  debug: createLog('debug', console.debug),
  info: createLog('info', console.log),
  warn: createLog('warn', console.warn),
  error: createLog('error', console.error),
  fatal: createLog('fatal', console.error),
  silent: () => {},
} as any // Use PayloadLogger type when it's exported

const cloudflare =
  isCLI || !isProduction
    ? await getCloudflareContextFromWrangler()
    : await getCloudflareContext({ async: true })

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || '',
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    // Wave 3: the school's branding and a home screen of what needs attention.
    meta: {
      titleSuffix: ' · maarifcms',
      description: 'maarifcms, the website administration of International Maarif Schools of Tunisia',
      icons: [{ rel: 'icon', type: 'image/svg+xml', url: '/brand/maarif-symbol.svg' }],
    },
    components: {
      graphics: { Logo: '/components/admin/Graphics#Logo', Icon: '/components/admin/Graphics#Icon' },
      beforeDashboard: ['/components/admin/Dashboard#Dashboard'],
    },
  },
  // The admin itself in the staff's languages (owner decision 2026-11-09); each person picks one
  // in their account settings. Content languages are separate (localization below).
  i18n: {
    supportedLanguages: { en, fr, ar, tr },
    fallbackLanguage: 'en',
  },
  // REST lives under /cms-api so the public /api/* path belongs to maarif-api (ARCHITECTURE.md section 2).
  routes: { api: '/cms-api', admin: '/admin' },
  graphQL: { disable: true },
  collections: [
    Users,
    ApiClients,
    Pages,
    PageVisuals,
    Media,
    Inquiries,
    WeeklyMenus,
    News,
    Albums,
    Clubs,
    Trips,
    Faqs,
    Testimonials,
    People,
    Documents,
    Jobs,
    Applications,
    PrivateFiles,
    Redirects,
    Subscribers,
    Newsletters,
    AuditLog,
  ],
  globals: [HeadMessage, HomeHero, Gallery, SchoolFacts, Timetables, SiteSettings],
  // Nightly retention and backup, called by maarif-api's cron (endpoints/maintenance.ts).
  endpoints: [maintenance],
  localization: {
    locales: [
      { code: 'en', label: 'English' },
      { code: 'fr', label: 'Français' },
      { code: 'ar', label: 'العربية', rtl: true },
      { code: 'tr', label: 'Türkçe' },
    ],
    defaultLocale: 'en',
    // No silent fallback: a missing translation must stay missing (launch rule).
    fallback: false,
  },
  upload: { limits: { fileSize: 10 * 1024 * 1024 } },
  // Wave 4 (ADR 011): emails through this Worker's Cloudflare Email Service binding (email/adapter.ts).
  email: cloudflareEmailAdapter(() => (cloudflare.env as { EMAIL?: MailBinding }).EMAIL),
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteD1Adapter({
    binding: cloudflare.env.D1,
  }),
  logger: isProduction ? cloudflareLogger : undefined,
  plugins: [
    // Who changed what, and when (collections/AuditLog.ts).
    auditLogPlugin,
    r2Storage({
      bucket: cloudflare.env.R2,
      // CVs sit under their own prefix; only administrators can read them (collections/PrivateFiles.ts).
      collections: { media: true, 'private-files': { prefix: 'private' } },
    }),
  ],
})

// Adapted from https://github.com/opennextjs/opennextjs-cloudflare/blob/d00b3a13e42e65aad76fba41774815726422cc39/packages/cloudflare/src/api/cloudflare-context.ts#L328C36-L328C46
function getCloudflareContextFromWrangler(): Promise<CloudflareContext> {
  return import(/* webpackIgnore: true */ `${'__wrangler'.replaceAll('_', '')}`).then(
    ({ getPlatformProxy }) =>
      getPlatformProxy({
        environment: process.env.CLOUDFLARE_ENV,
        remoteBindings: isProduction,
      } satisfies GetPlatformProxyOptions),
  )
}

// Local development setup (wave 3): a local administrator, the maarif-api gateway key, and the
// API's .dev.vars so the three apps talk to each other on this machine. Never for production:
// refuses to run when NODE_ENV is production. Re-running keeps existing accounts and keys.
//
//   pnpm --filter @maarif/cms seed:dev
//
// Writes the generated administrator password to apps/cms/.dev-admin.txt (git-ignored) and never
// prints it.
import { randomBytes } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload } from 'payload'
import config from '../payload.config'

if (process.env.NODE_ENV === 'production') throw new Error('dev-setup is for local development only.')

const here = path.dirname(fileURLToPath(import.meta.url))
const cmsDir = path.resolve(here, '..', '..')
const apiVars = path.resolve(cmsDir, '..', 'api', '.dev.vars')
const adminFile = path.join(cmsDir, '.dev-admin.txt')
const email = 'local-admin@maarif.test'

const payload = await getPayload({ config })

// 1. Local administrator.
const users = await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1 })
if (!users.docs.length) {
  const password = `${randomBytes(12).toString('base64url')}-Aa1`
  await payload.create({ collection: 'users', data: { email, password, name: 'Local admin', roles: ['admin'] } as never })
  writeFileSync(adminFile, `maarifcms local administrator (development only)\nemail: ${email}\npassword: ${password}\n`, { mode: 0o600 })
  console.log(`Created ${email}; password saved in ${adminFile}`)
} else {
  console.log(`${email} exists${existsSync(adminFile) ? `; password in ${adminFile}` : ''}`)
}

// 2. maarif-api gateway key.
const vars = existsSync(apiVars) ? readFileSync(apiVars, 'utf8') : ''
let key = /^CMS_API_KEY=(.+)$/m.exec(vars)?.[1]
const clients = await payload.find({ collection: 'api-clients', limit: 1, overrideAccess: true })
if (!key || !clients.docs.length) {
  key = randomBytes(24).toString('hex')
  if (clients.docs.length) {
    await payload.update({ collection: 'api-clients', id: clients.docs[0]!.id, data: { enableAPIKey: true, apiKey: key } as never, overrideAccess: true })
  } else {
    await payload.create({ collection: 'api-clients', data: { name: 'maarif-api (local)', enableAPIKey: true, apiKey: key } as never, overrideAccess: true })
  }
  console.log('Gateway key set for maarif-api.')
}

// 3. The API's local variables. Turnstile's official test secret always passes.
const revalidate = /^REVALIDATE_SECRET=(.+)$/m.exec(vars)?.[1] ?? randomBytes(16).toString('hex')
const maintenanceSecret = /^MAINTENANCE_SECRET=(.+)$/m.exec(vars)?.[1] ?? randomBytes(16).toString('hex')
writeFileSync(
  apiVars,
  [
    '# Local development only (written by apps/cms/src/seed/dev-setup.ts). Never commit.',
    `CMS_URL=${process.env.CMS_URL ?? 'http://localhost:3000'}`,
    `CMS_API_KEY=${key}`,
    'TURNSTILE_SECRET=1x0000000000000000000000000000000AA',
    `WEB_URL=${process.env.WEB_URL ?? 'http://localhost:3300'}`,
    `REVALIDATE_SECRET=${revalidate}`,
    `MAINTENANCE_SECRET=${maintenanceSecret}`,
    '',
  ].join('\n'),
)
console.log(`Wrote ${apiVars}`)

// 4. The CMS's own local variables for refresh on publish (hooks/revalidate.ts).
const cmsEnv = path.join(cmsDir, '.env')
let env = existsSync(cmsEnv) ? readFileSync(cmsEnv, 'utf8') : ''
const setVar = (name: string, value: string) => {
  env = new RegExp(`^${name}=`, 'm').test(env) ? env.replace(new RegExp(`^${name}=.*$`, 'm'), `${name}=${value}`) : `${env.trimEnd()}\n${name}=${value}\n`
}
setVar('API_URL', process.env.API_URL ?? 'http://127.0.0.1:8787')
setVar('REVALIDATE_SECRET', revalidate)
setVar('MAINTENANCE_SECRET', maintenanceSecret)
writeFileSync(cmsEnv, env)
console.log(`Updated ${cmsEnv} (API_URL, REVALIDATE_SECRET, MAINTENANCE_SECRET)`)
process.exit(0)

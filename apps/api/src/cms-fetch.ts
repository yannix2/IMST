import type { Env } from "./env";

// How maarif-api reaches maarifcms. In Cloudflare: the private CMS service binding only (the host
// is ignored; only the path reaches maarif-cms). In local development the CMS runs as `next dev`,
// not as a Worker, so `CMS_URL` (in .dev.vars, never in production) points at it over HTTP.
const CMS_ORIGIN = "https://maarif-cms.internal";

export function cmsFetch(env: Env, path: string, init?: RequestInit): Promise<Response> {
  if (env.CMS_URL) return fetch(new URL(path, env.CMS_URL), init);
  return env.CMS.fetch(`${CMS_ORIGIN}${path}`, init);
}

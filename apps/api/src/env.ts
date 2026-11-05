// Bindings and secrets of the maarif-api Worker (see wrangler.jsonc).
// This Worker never holds a database binding: content and form entries go through maarif-cms.
export interface Env {
  // Service binding to the maarifcms Worker (private, never over the internet).
  CMS: Fetcher;
  // Workers Rate Limiting binding for public form submissions.
  FORM_LIMITER: RateLimit;
  // Secrets (wrangler secret put ...; .dev.vars locally).
  TURNSTILE_SECRET: string;
  CMS_API_KEY: string;
}

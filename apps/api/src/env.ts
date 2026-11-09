// Bindings and secrets of the maarif-api Worker (see wrangler.jsonc).
// This Worker never holds a database binding: content and form entries go through maarif-cms.
export interface Env {
  // Service binding to the maarifcms Worker (private, never over the internet).
  CMS: Fetcher;
  // Workers Rate Limiting binding for public form submissions.
  FORM_LIMITER: RateLimit;
  // Cloudflare Images (wave 3, ADR 008): resizes CMS photos for the site. Optional locally.
  IMAGES?: ImagesBinding;
  // Cloudflare Email (wave 3, ADR 009): staff notifications to verified addresses. Optional
  // locally and until Email Routing is set up on the school domain.
  MAILER?: SendEmail;
  // Service binding to maarif-web, to refresh pages when staff publish (wave 3, ADR 007).
  WEB?: Fetcher;
  // Secrets (wrangler secret put ...; .dev.vars locally).
  TURNSTILE_SECRET: string;
  CMS_API_KEY: string;
  // Shared with maarifcms (its hooks call /internal/revalidate) and maarif-web (its revalidate route).
  REVALIDATE_SECRET?: string;
  // Shared with maarifcms: authorises the nightly retention and backup call (scheduled.ts).
  MAINTENANCE_SECRET?: string;
  // Sender address for notifications, on a domain with Cloudflare Email Routing.
  MAIL_FROM?: string;
  // maarifcms public address, for the "open it in maarifcms" link in notifications (wrangler var).
  ADMIN_URL?: string;
  // Local development only (.dev.vars): the CMS dev server's address, used instead of the binding.
  CMS_URL?: string;
  // Local development only (.dev.vars): the site's address for /revalidate, instead of the binding.
  WEB_URL?: string;
}

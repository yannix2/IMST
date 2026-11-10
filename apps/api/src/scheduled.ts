import type { Env } from "./env";
import { cmsFetch } from "./cms-fetch";

// Nightly maintenance trigger (wave 3, B7; wrangler.jsonc "triggers.crons"): asks maarifcms to
// apply the retention periods and write the daily backup (apps/cms/src/endpoints/maintenance.ts).
// maarif-api holds no database binding, so the work itself happens inside maarifcms.
// Newsletter sender (wave 4, B4; cron "*/5 * * * *"): asks maarifcms to email the next batch of
// a newsletter being sent (apps/cms/src/newsletter/run.ts). Nothing to do = a quick no-op.
export async function newsletterBatch(env: Env): Promise<boolean> {
  if (!env.MAINTENANCE_SECRET) return false;
  try {
    const response = await cmsFetch(env, "/cms-api/newsletters/run", { method: "POST", headers: { "x-maintenance-secret": env.MAINTENANCE_SECRET } });
    return response.ok;
  } catch {
    return false;
  }
}

export const NEWSLETTER_CRON = "*/5 * * * *";

export async function nightly(env: Env): Promise<boolean> {
  if (!env.MAINTENANCE_SECRET) return false;
  try {
    const response = await cmsFetch(env, "/cms-api/maintenance/nightly", { method: "POST", headers: { "x-maintenance-secret": env.MAINTENANCE_SECRET } });
    return response.ok;
  } catch {
    return false;
  }
}

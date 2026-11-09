import type { Env } from "./env";
import { cmsFetch } from "./cms-fetch";

// Nightly maintenance trigger (wave 3, B7; wrangler.jsonc "triggers.crons"): asks maarifcms to
// apply the retention periods and write the daily backup (apps/cms/src/endpoints/maintenance.ts).
// maarif-api holds no database binding, so the work itself happens inside maarifcms.
export async function nightly(env: Env): Promise<boolean> {
  if (!env.MAINTENANCE_SECRET) return false;
  try {
    const response = await cmsFetch(env, "/cms-api/maintenance/nightly", { method: "POST", headers: { "x-maintenance-secret": env.MAINTENANCE_SECRET } });
    return response.ok;
  } catch {
    return false;
  }
}

import type { Env } from "./env";

// Refresh on publish (wave 3, ADR 007). maarifcms calls /internal/revalidate with cache tags
// (for example "news", "news:back-to-school-2025", "visuals"); this forwards them to maarif-web's
// revalidate route over the WEB service binding, with the shared secret. Pages also refresh by
// themselves after a few minutes, so a missed call only delays a change.
const WEB_ORIGIN = "https://maarif-web.internal";

export async function revalidate(env: Env, tags: string[]): Promise<boolean> {
  if ((!env.WEB && !env.WEB_URL) || !env.REVALIDATE_SECRET) return false;
  const init = {
    method: "POST",
    headers: { "content-type": "application/json", "x-revalidate-secret": env.REVALIDATE_SECRET },
    body: JSON.stringify({ tags }),
  };
  try {
    // Local development: WEB_URL (.dev.vars) reaches the site over HTTP; Cloudflare: the binding.
    const response = env.WEB_URL ? await fetch(new URL("/revalidate", env.WEB_URL), init) : await env.WEB!.fetch(`${WEB_ORIGIN}/revalidate`, init);
    return response.ok;
  } catch {
    return false;
  }
}

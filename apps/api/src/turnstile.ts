const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

// Cloudflare's test secrets (always pass / always fail / token spent) answer with a dummy
// hostname, so the hostname check is skipped for them (local development, demo before launch).
const TEST_SECRET = /^[123]x0{20,}/;

// The hostnames a token may come from: the site's own host and its www. twin.
export function allowedHostnames(siteUrl: string | undefined): string[] {
  if (!siteUrl) return [];
  try {
    const host = new URL(siteUrl).hostname.replace(/^www\./, "");
    return [host, `www.${host}`];
  } catch {
    return [];
  }
}

// Server-side Turnstile check. Fails closed: any network or parsing problem counts as "not
// verified". With `siteUrl`, the token must also have been solved on that site (wave 4, C3):
// a token taken from another site using the same widget is refused.
export async function verifyTurnstile(token: string, secret: string, remoteIp?: string, siteUrl?: string): Promise<boolean> {
  const body = new FormData();
  body.append("secret", secret);
  body.append("response", token);
  if (remoteIp && remoteIp !== "unknown") body.append("remoteip", remoteIp);

  try {
    const response = await fetch(SITEVERIFY_URL, { method: "POST", body });
    if (!response.ok) return false;
    const outcome = (await response.json()) as { success?: boolean; hostname?: string };
    if (outcome.success !== true) return false;
    const hosts = allowedHostnames(siteUrl);
    if (!hosts.length || TEST_SECRET.test(secret)) return true;
    return typeof outcome.hostname === "string" && hosts.includes(outcome.hostname.toLowerCase());
  } catch {
    return false;
  }
}

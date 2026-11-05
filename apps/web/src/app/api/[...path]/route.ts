import { getCloudflareContext } from "@opennextjs/cloudflare";

// The browser calls /api/* on the site's own address (forms, CMS content, media). On a
// workers.dev address there are no zone routes, so this Worker hands each request to
// maarif-api over the private service binding (ARCHITECTURE.md section 2): maarif-api keeps no
// public URL, and maarif-web still holds no data binding. Method, headers (including the
// visitor's cf-connecting-ip, used for rate limiting) and body pass through unchanged.
// Once the school hostname exists, a zone route /api/* can send traffic to maarif-api directly.

export const dynamic = "force-dynamic";

async function forward(request: Request): Promise<Response> {
  const { env } = await getCloudflareContext({ async: true });
  const api = (env as { API?: Fetcher }).API;
  if (!api) return Response.json({ ok: false, error: "unavailable" }, { status: 503 });
  const url = new URL(request.url);
  return api.fetch(new Request(`https://maarif-api.internal${url.pathname}${url.search}`, request));
}

export { forward as GET, forward as HEAD, forward as POST };

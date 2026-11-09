import { getCloudflareContext } from "@opennextjs/cloudflare";

// The browser calls /api/* on the site's own address (forms, CMS content, media). On a
// workers.dev address there are no zone routes, so this Worker hands each request to
// maarif-api over the private service binding (ARCHITECTURE.md section 2): maarif-api keeps no
// public URL, and maarif-web still holds no data binding. Method, headers (including the
// visitor's cf-connecting-ip, used for rate limiting) and body pass through unchanged.
// Once the school hostname exists, a zone route /api/* can send traffic to maarif-api directly.

export const dynamic = "force-dynamic";

async function forward(request: Request): Promise<Response> {
  // Local development (wave 3): maarif-api runs in `wrangler dev`, reached over HTTP.
  const origin = process.env.API_ORIGIN;
  if (origin) {
    const url = new URL(request.url);
    // Node's fetch refuses hop-by-hop headers; GET and HEAD carry no body.
    const headers = new Headers(request.headers);
    for (const name of ["host", "connection", "keep-alive", "transfer-encoding", "upgrade", "content-length"]) headers.delete(name);
    const hasBody = request.method !== "GET" && request.method !== "HEAD";
    const init: RequestInit & { duplex?: string } = { method: request.method, headers, body: hasBody ? request.body : undefined, ...(hasBody ? { duplex: "half" } : {}) };
    const upstream = await fetch(new URL(`${url.pathname}${url.search}`, origin), init);
    // Node decompresses the body; drop the encoding headers so the browser reads it as is.
    const out = new Headers(upstream.headers);
    out.delete("content-encoding");
    out.delete("content-length");
    return new Response(upstream.body, { status: upstream.status, headers: out });
  }
  const { env } = await getCloudflareContext({ async: true });
  const api = (env as { API?: Fetcher }).API;
  if (!api) return Response.json({ ok: false, error: "unavailable" }, { status: 503 });
  const url = new URL(request.url);
  return api.fetch(new Request(`https://maarif-api.internal${url.pathname}${url.search}`, request));
}

export { forward as GET, forward as HEAD, forward as POST };

import { revalidateTag } from "next/cache";

// Refresh on publish (wave 3, ADR 007). Only maarif-api calls this, over its WEB service binding,
// with the shared secret: maarifcms hook → maarif-api /internal/revalidate → here. Each tag
// marks the pages that used that content as stale; the next visit regenerates them.
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || request.headers.get("x-revalidate-secret") !== secret) return Response.json({ ok: false }, { status: 403 });
  let tags: unknown;
  try {
    ({ tags } = (await request.json()) as { tags?: unknown });
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
  const valid = Array.isArray(tags) ? tags.filter((t): t is string => typeof t === "string" && /^[a-z0-9:/_-]{1,80}$/.test(t)).slice(0, 50) : [];
  if (!valid.length) return Response.json({ ok: false }, { status: 400 });
  for (const tag of valid) revalidateTag(tag, "max");
  return Response.json({ ok: true, tags: valid });
}

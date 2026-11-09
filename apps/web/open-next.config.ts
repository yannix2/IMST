import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import doQueue from "@opennextjs/cloudflare/overrides/queue/do-queue";
import d1NextTagCache from "@opennextjs/cloudflare/overrides/tag-cache/d1-next-tag-cache";

// Refresh on publish (wave 3, ADR 007). Pages are pre-rendered with maarifcms content and kept in
// an R2 page cache; when staff publish, maarifcms → maarif-api → this Worker's /revalidate marks
// the affected cache tags stale (tag cache in a small D1 database, never the school's), and the
// next visit regenerates the page in the background (Durable Object queue). These bindings are
// cache only: maarif-web still reads school content exclusively through maarif-api.
export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
  tagCache: d1NextTagCache,
  queue: doQueue,
  enableCacheInterception: true,
});

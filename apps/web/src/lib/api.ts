import "server-only";
import { cache } from "react";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// The only way this Worker gets data: the private service binding to maarif-api
// (declared in wrangler.jsonc once maarif-api is deployed).
// The host is ignored by service bindings; only the path matters.
const API_ORIGIN = "https://maarif-api.internal";

// Deduplicated per request (React.cache), so several components can ask for the same data.
export const apiGet = cache(async <T>(path: string): Promise<T> => {
  const { env } = await getCloudflareContext({ async: true });
  const api = (env as { API?: Fetcher }).API;
  if (!api) throw new Error("maarif-api service binding is not configured");
  const response = await api.fetch(`${API_ORIGIN}${path}`, { headers: { accept: "application/json" } });
  if (!response.ok) throw new Error(`maarif-api ${path} answered ${response.status}`);
  return (await response.json()) as T;
});

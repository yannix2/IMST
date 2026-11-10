import { afterEach, describe, expect, it, vi } from "vitest";
import { allowedHostnames, verifyTurnstile } from "./turnstile";

function answer(outcome: Record<string, unknown>, status = 200) {
  vi.stubGlobal("fetch", vi.fn(async () => Response.json(outcome, { status })));
}

afterEach(() => vi.unstubAllGlobals());

describe("verifyTurnstile (wave 4: hostname check)", () => {
  const site = "https://yassinekhiari.download";

  it("accepts a token solved on the site or its www twin", async () => {
    answer({ success: true, hostname: "yassinekhiari.download" });
    expect(await verifyTurnstile("t", "0x4AAAAreal", "203.0.113.7", site)).toBe(true);
    answer({ success: true, hostname: "www.yassinekhiari.download" });
    expect(await verifyTurnstile("t", "0x4AAAAreal", "203.0.113.7", site)).toBe(true);
  });

  it("refuses a token solved on another host", async () => {
    answer({ success: true, hostname: "evil.example" });
    expect(await verifyTurnstile("t", "0x4AAAAreal", undefined, site)).toBe(false);
    answer({ success: true });
    expect(await verifyTurnstile("t", "0x4AAAAreal", undefined, site)).toBe(false);
  });

  it("skips the hostname for Cloudflare's test secret and when no site is set", async () => {
    answer({ success: true, hostname: "example.com" });
    expect(await verifyTurnstile("t", "1x0000000000000000000000000000000AA", undefined, site)).toBe(true);
    expect(await verifyTurnstile("t", "0x4AAAAreal", undefined, undefined)).toBe(true);
  });

  it("fails closed on a failed check or a network error", async () => {
    answer({ success: false, hostname: "yassinekhiari.download" });
    expect(await verifyTurnstile("t", "0x4AAAAreal", undefined, site)).toBe(false);
    answer({}, 500);
    expect(await verifyTurnstile("t", "0x4AAAAreal", undefined, site)).toBe(false);
    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new Error("down"))));
    expect(await verifyTurnstile("t", "0x4AAAAreal", undefined, site)).toBe(false);
  });

  it("never sends an unknown IP to Cloudflare", async () => {
    const fetch = vi.fn(async (_url: string, _init: RequestInit) => Response.json({ success: true }));
    vi.stubGlobal("fetch", fetch);
    await verifyTurnstile("t", "s", "unknown");
    const body = fetch.mock.calls[0]![1].body as FormData;
    expect(body.has("remoteip")).toBe(false);
  });

  it("derives the hosts from the site URL", () => {
    expect(allowedHostnames("https://www.school.tn/")).toEqual(["school.tn", "www.school.tn"]);
    expect(allowedHostnames("not a url")).toEqual([]);
    expect(allowedHostnames(undefined)).toEqual([]);
  });
});

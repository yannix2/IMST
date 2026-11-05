import { NextResponse, type NextRequest } from "next/server";
import { localeCookie, negotiateLocale } from "@maarif/contracts/locales";

// "/" sends each visitor to their language: remembered choice, then the browser's languages,
// then /en. Edge middleware on purpose: OpenNext on Cloudflare does not run Node.js middleware
// (so this is not Next 16's proxy.ts). It matches "/" only, so every /{locale} page stays a
// static file served without this code.
export function middleware(request: NextRequest) {
  const locale = negotiateLocale(request.headers.get("accept-language"), request.cookies.get(localeCookie)?.value);
  const response = NextResponse.redirect(new URL(`/${locale}`, request.url), 307);
  // The answer depends on the visitor, so no shared cache may store it.
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Vary", "Accept-Language, Cookie");
  return response;
}

export const config = { matcher: "/" };

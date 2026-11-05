import type { Metadata } from "next";
import { fontVariables } from "@/lib/fonts";
import { languageAlternates, siteUrl } from "@/lib/site";
import "../globals.css";

// "/" is the x-default address. src/middleware.ts redirects it to the visitor's language
// (fallback /en); this page only renders if the middleware is bypassed, and then still
// links every language.
export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: "International Maarif Schools of Tunisia",
  alternates: { canonical: "/", languages: languageAlternates() },
};

export default function EntryLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={`${fontVariables} font-root`}>
      <body>{children}</body>
    </html>
  );
}

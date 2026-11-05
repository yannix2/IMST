import Link from "next/link";
import { localeDirection, localeNativeName, locales } from "@maarif/contracts/locales";

// Fallback for "/" when the language redirect (src/middleware.ts) does not run.
export default function EntryPage() {
  return (
    <main>
      <h1>International Maarif Schools of Tunisia</h1>
      <ul>
        {locales.map((locale) => (
          <li key={locale} lang={locale} dir={localeDirection[locale]}>
            <Link href={`/${locale}`} hrefLang={locale}>
              {localeNativeName[locale]}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

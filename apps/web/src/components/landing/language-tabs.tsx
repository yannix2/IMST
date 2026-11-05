import Link from "next/link";
import { localeDirection, localeNativeName, locales, type Locale } from "@maarif/contracts/locales";
import { cn } from "@/lib/utils";

// Four script tabs, each a real link (crawlable, matches the hreflang alternates).
// tone: "plate" on navy (footer, phone menu); "ground" on the page ground (header).
// path: the same page in every language ("" for Home, "/about" ...), so a switch keeps the page.
export function LanguageTabs({
  locale,
  label,
  className,
  tone = "plate",
  path = "",
}: {
  locale: Locale;
  label: string;
  className?: string;
  tone?: "plate" | "ground";
  path?: string;
}) {
  return (
    <nav aria-label={label} className={className}>
      {/* A segmented pill: the track is recessed, the current language is the raised thumb. */}
      <ul className={cn("inline-flex flex-wrap gap-0.5 rounded-full p-1 ring-1", tone === "plate" ? "bg-white/[0.07] ring-white/10" : "bg-mist ring-rule/70")}>
        {locales.map((code) => {
          const current = code === locale;
          return (
            <li key={code}>
              <Link
                href={`/${code}${path}`}
                hrefLang={code}
                lang={code}
                dir={localeDirection[code]}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 items-center rounded-full px-3.5 font-medium whitespace-nowrap no-underline transition-[background-color,color,box-shadow] duration-200",
                  tone === "plate"
                    ? current
                      ? "bg-white text-navy shadow-[0_6px_14px_-8px_rgb(6_26_48/0.7)]"
                      : "text-white hover:bg-white/10"
                    : current
                      ? "bg-surface text-heading shadow-rest"
                      : "text-slate hover:text-heading",
                )}
              >
                {localeNativeName[code]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

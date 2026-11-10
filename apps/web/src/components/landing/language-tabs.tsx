import Link from "next/link";
import { localeNativeName, locales, type Locale } from "@maarif/contracts/locales";
import { cn } from "@/lib/utils";

// The language switcher as four round flags (owner, 2026-11-09: flags only; English = United
// Kingdom, Arabic = Saudi Arabia). Each flag is a real link (crawlable, matches the hreflang
// alternates); the language's own name stays in the link for screen readers and as the hover
// title. Flags are static SVGs in public/flags (flag-icons, MIT) and never mirror in Arabic.
export const flagOf: Record<Locale, string> = { en: "gb", fr: "fr", ar: "sa", tr: "tr" };

export function LocaleFlag({ locale, size = 28, className }: { locale: Locale; size?: number; className?: string }) {
  return (
    <img
      src={`/flags/${flagOf[locale]}.svg`}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      draggable={false}
      className={cn("shrink-0 rounded-full ring-1 ring-black/10", className)}
      style={{ width: size, height: size }}
    />
  );
}

// tone: "plate" on navy (footer, phone menu); "ground" on the page ground (header).
// path: the same page in every language ("" for Home, "/about" ...), so a switch keeps the page.
export function LanguageTabs({
  locale,
  label,
  className,
  tone = "plate",
  path = "",
  framed = true,
}: {
  locale: Locale;
  label: string;
  className?: string;
  tone?: "plate" | "ground";
  path?: string;
  // false inside a panel that is already the frame (the header's xl language panel).
  framed?: boolean;
}) {
  return (
    <nav aria-label={label} className={className}>
      {/* A segmented pill: the track is recessed, the current language is the raised, ringed thumb. */}
      <ul
        className={cn(
          "inline-flex gap-0.5 rounded-full",
          framed && "p-1 ring-1",
          framed && (tone === "plate" ? "bg-white/[0.07] ring-white/10" : "bg-mist ring-rule/70"),
        )}
      >
        {locales.map((code) => {
          const current = code === locale;
          return (
            <li key={code}>
              <Link
                href={`/${code}${path}`}
                hrefLang={code}
                lang={code}
                title={localeNativeName[code]}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "group inline-flex size-11 items-center justify-center rounded-full no-underline transition-[background-color,box-shadow] duration-200",
                  tone === "plate"
                    ? current
                      ? "bg-white/15 shadow-[0_6px_14px_-8px_rgb(6_26_48/0.7)]"
                      : "hover:bg-white/10"
                    : current
                      ? "bg-surface shadow-rest"
                      : "hover:bg-surface/70",
                )}
              >
                <LocaleFlag
                  locale={code}
                  className={cn(
                    "transition-[opacity,box-shadow] duration-200",
                    current
                      ? tone === "plate"
                        ? "ring-2 ring-white"
                        : "ring-2 ring-turquoise"
                      : "opacity-75 group-hover:opacity-100",
                  )}
                />
                <span className="sr-only">{localeNativeName[code]}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

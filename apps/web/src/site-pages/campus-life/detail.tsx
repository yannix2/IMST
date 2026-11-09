import { ArrowLeftIcon, CalendarDaysIcon, MapPinIcon, TicketIcon } from "lucide-react";
import type { Album, NewsArticle } from "@maarif/contracts/content";
import type { Locale } from "@maarif/contracts/locales";
import { PageShell } from "@/components/site/page-shell";
import { PageSection } from "@/components/site/blocks";
import { Photo } from "@/components/site/photo";
import { RichText } from "@/components/site/rich-text";
import { formatDate, StageTags } from "@/components/site/cms-bits";
import { campusCopy, campusFigure } from "./copy";

// A news article or event, and a photo album (wave 3, D2). Both come from maarifcms; the page
// header shows the item's own title and cover photo.

function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} className="inline-flex items-center gap-2 font-bold text-turquoise-ink">
      <ArrowLeftIcon aria-hidden="true" className="size-4 rtl:-scale-x-100" />
      {label}
    </a>
  );
}

function PhotoGrid({ locale, photos }: { locale: Locale; photos: { photo: Album["photos"][number]["photo"]; caption: string }[] }) {
  if (photos.length === 0) return null;
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {photos.map(({ photo, caption }) => (
        <li key={photo.src}>
          <figure className="flex flex-col gap-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-plate)] shadow-rest ring-1 ring-rule/70">
              <Photo photo={photo} locale={locale} sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw" />
            </div>
            {caption ? <figcaption className="text-sm text-slate">{caption}</figcaption> : null}
          </figure>
        </li>
      ))}
    </ul>
  );
}

export function NewsArticlePage({ locale, item }: { locale: Locale; item: NewsArticle }) {
  const c = campusCopy[locale];
  const isEvent = item.kind === "event" && item.event;
  return (
    <PageShell
      locale={locale}
      page={item.kind === "event" ? "campus-life/events" : "campus-life/news"}
      title={item.title}
      lede={item.summary || undefined}
      photo={item.image}
      figure={campusFigure(locale)}
      band={false}
      body={
        <PageSection id="article">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="flex flex-col gap-6 lg:col-span-8">
              <p className="text-sm font-medium text-turquoise-ink">
                <time dateTime={item.date}>{formatDate(locale, item.date)}</time>
              </p>
              <StageTags locale={locale} list={item.stages} />
              <RichText blocks={item.body} />
            </div>
            {isEvent ? (
              <aside className="lg:col-span-4">
                <dl className="flex flex-col gap-4 rounded-[var(--radius-plate)] bg-turquoise-wash p-6">
                  {item.event!.startsAt ? (
                    <div className="flex gap-3">
                      <CalendarDaysIcon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-heading" />
                      <div>
                        <dt className="text-sm font-bold text-heading">{c.when}</dt>
                        <dd className="text-ink">
                          {formatDate(locale, item.event!.startsAt, true)}
                          {item.event!.endsAt ? ` – ${formatDate(locale, item.event!.endsAt, true)}` : ""}
                        </dd>
                      </div>
                    </div>
                  ) : null}
                  {item.event!.place ? (
                    <div className="flex gap-3">
                      <MapPinIcon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-heading" />
                      <div>
                        <dt className="text-sm font-bold text-heading">{c.where}</dt>
                        <dd className="text-ink">{item.event!.place}</dd>
                      </div>
                    </div>
                  ) : null}
                  {item.event!.registration ? (
                    <div className="flex gap-3">
                      <TicketIcon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-heading" />
                      <div>
                        <dt className="text-sm font-bold text-heading">{c.register}</dt>
                        <dd className="text-ink">{item.event!.registration}</dd>
                      </div>
                    </div>
                  ) : null}
                </dl>
              </aside>
            ) : null}
          </div>
          {item.photos.length ? (
            <div className="mt-12">
              <PhotoGrid locale={locale} photos={item.photos} />
            </div>
          ) : null}
          <div className="mt-12">
            <BackLink href={`/${locale}/campus-life/${item.kind === "event" ? "events" : "news"}`} label={c.backToNews} />
          </div>
        </PageSection>
      }
    />
  );
}

export function AlbumPage({ locale, item }: { locale: Locale; item: Album }) {
  const c = campusCopy[locale];
  return (
    <PageShell
      locale={locale}
      page="campus-life/gallery"
      title={item.title}
      lede={item.summary || `${formatDate(locale, item.date)} · ${c.photos(item.count)}`}
      photo={item.cover}
      figure={campusFigure(locale)}
      band={false}
      body={
        <PageSection id="album">
          {item.video ? (
            <video controls preload="none" poster={`${item.cover.src}?w=1600&f=webp`} className="mb-10 aspect-video w-full rounded-[var(--radius-plate)] bg-night shadow-rest">
              <source src={item.video.src} type={item.video.type} />
            </video>
          ) : null}
          <PhotoGrid locale={locale} photos={item.photos} />
          <div className="mt-12">
            <BackLink href={`/${locale}/campus-life/gallery`} label={c.backToGallery} />
          </div>
        </PageSection>
      }
    />
  );
}

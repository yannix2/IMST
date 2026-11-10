import { localeDirection, type Locale } from "@maarif/contracts/locales";
import type { RichBlock, RichInline } from "@maarif/contracts/rich-text";
import { mainPhone, schoolName } from "./school";

// One branded layout for every email, as HTML and plain text (both always sent).
// Email clients ignore stylesheets and web fonts unevenly, so: tables, inline styles, system
// fonts after the brand fonts, a PNG badge (Gmail drops SVG), colours from DESIGN.md (text on
// turquoise is night navy, never white). Arabic gets dir="rtl" and right alignment.
// Every value is escaped: names and subjects typed by people never become markup.

export type MailContent = {
  locale: Locale;
  subject: string;
  // The grey line inboxes show after the subject.
  preheader?: string;
  heading: string;
  greeting?: string;
  paragraphs: string[];
  details?: { label: string; value: string }[];
  button?: { label: string; url: string };
  after?: string[];
  // Newsletter body (rich text from maarifcms, already reduced to safe blocks).
  blocks?: RichBlock[];
  // Why this person receives the email.
  footerNote?: string;
  unsubscribeUrl?: string;
};

export type Brand = { siteUrl: string };
export type RenderedMail = { subject: string; html: string; text: string };

const color = { navy: "#103b65", night: "#0b2a47", turquoise: "#00adbb", turquoiseInk: "#00737c", ink: "#14212b", slate: "#4a5a66", mist: "#f4f7f7", rule: "#d3dce1", wash: "#e6f7f8" };

const words: Record<Locale, { copyLink: string; unsubscribe: string; website: string }> = {
  en: { copyLink: "If the button does not work, copy this link into your browser:", unsubscribe: "Unsubscribe", website: "Website" },
  fr: { copyLink: "Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :", unsubscribe: "Se désinscrire", website: "Site web" },
  ar: { copyLink: "إذا لم يعمل الزر، انسخوا هذا الرابط في المتصفح:", unsubscribe: "إلغاء الاشتراك", website: "الموقع" },
  tr: { copyLink: "Düğme çalışmazsa bu bağlantıyı tarayıcınıza kopyalayın:", unsubscribe: "Abonelikten çık", website: "Web sitesi" },
};

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

// Links in emails must be absolute; only web and mail links are kept.
export function absoluteUrl(href: string | undefined, siteUrl: string): string | undefined {
  if (!href) return undefined;
  if (/^(https?:\/\/|mailto:|tel:)/i.test(href)) return href;
  if (href.startsWith("/") && !href.startsWith("//")) return siteUrl.replace(/\/$/, "") + href;
  return undefined;
}

// A phone number or an address inside a sentence keeps its own left-to-right order (Arabic) and
// never breaks across lines.
export const isolate = (value: string) => `⁦${value.replace(/ /g, " ")}⁩`;

function fontOf(locale: Locale) {
  return locale === "ar" ? "'Readex Pro', Tahoma, Arial, sans-serif" : "Figtree, 'Helvetica Neue', Helvetica, Arial, sans-serif";
}

function inlineHtml(pieces: RichInline[], siteUrl: string): string {
  return pieces
    .map((p) => {
      let html = escapeHtml(p.text).replace(/\n/g, "<br>");
      if (p.b) html = `<strong>${html}</strong>`;
      if (p.i) html = `<em>${html}</em>`;
      if (p.u) html = `<u>${html}</u>`;
      const href = absoluteUrl(p.href, siteUrl);
      if (href) html = `<a href="${escapeHtml(href)}" style="color:${color.turquoiseInk};text-decoration:underline;">${html}</a>`;
      return html;
    })
    .join("");
}

function inlineText(pieces: RichInline[], siteUrl: string): string {
  return pieces
    .map((p) => {
      const href = absoluteUrl(p.href, siteUrl);
      return href && href !== p.text ? `${p.text} (${href})` : p.text;
    })
    .join("");
}

const P = `margin:0 0 16px;font-size:16px;line-height:1.6;color:${color.ink};`;

function blocksHtml(blocks: RichBlock[], siteUrl: string): string {
  return blocks
    .map((b) => {
      switch (b.t) {
        case "h2":
          return `<h2 style="margin:24px 0 12px;font-size:20px;line-height:1.3;color:${color.navy};">${inlineHtml(b.c, siteUrl)}</h2>`;
        case "h3":
          return `<h3 style="margin:20px 0 8px;font-size:17px;line-height:1.35;color:${color.navy};">${inlineHtml(b.c, siteUrl)}</h3>`;
        case "quote":
          return `<blockquote style="margin:0 0 16px;padding:12px 16px;border-inline-start:4px solid ${color.turquoise};background:${color.wash};${P}">${inlineHtml(b.c, siteUrl)}</blockquote>`;
        case "ul":
        case "ol":
          return `<${b.t} style="margin:0 0 16px;padding-inline-start:24px;">${b.items.map((item) => `<li style="margin:0 0 6px;font-size:16px;line-height:1.6;color:${color.ink};">${inlineHtml(item, siteUrl)}</li>`).join("")}</${b.t}>`;
        default:
          return `<p style="${P}">${inlineHtml(b.c, siteUrl)}</p>`;
      }
    })
    .join("");
}

function blocksText(blocks: RichBlock[], siteUrl: string): string {
  return blocks
    .map((b) => {
      if ("items" in b) {
        const ordered = b.t === "ol";
        return b.items.map((item, i) => `${ordered ? `${i + 1}.` : "-"} ${inlineText(item, siteUrl)}`).join("\n");
      }
      const text = inlineText(b.c, siteUrl);
      return b.t === "h2" || b.t === "h3" ? text.toUpperCase() : b.t === "quote" ? `> ${text}` : text;
    })
    .join("\n\n");
}

export function renderMail(content: MailContent, brand: Brand): RenderedMail {
  const { locale } = content;
  const w = words[locale];
  const dir = localeDirection[locale];
  const align = dir === "rtl" ? "right" : "left";
  const site = brand.siteUrl.replace(/\/$/, "");
  const host = site.replace(/^https?:\/\//, "");
  const font = fontOf(locale);
  const e = escapeHtml;

  const html = [
    `<!doctype html><html lang="${locale}" dir="${dir}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light"><title>${e(content.subject)}</title></head>`,
    `<body style="margin:0;padding:0;background:${color.mist};">`,
    content.preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${e(content.preheader)}</div>` : "",
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${color.mist};"><tr><td align="center" style="padding:24px 12px;">`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" dir="${dir}" style="max-width:560px;background:#ffffff;border:1px solid ${color.rule};border-radius:16px;font-family:${font};text-align:${align};">`,
    `<tr><td style="height:6px;line-height:6px;font-size:0;background:${color.turquoise};border-radius:16px 16px 0 0;">&nbsp;</td></tr>`,
    `<tr><td style="padding:24px 28px 0;" align="${align}"><a href="${e(site)}" style="text-decoration:none;"><img src="${e(site)}/brand/maarif-badge-email.png" width="56" height="56" alt="${e(schoolName[locale])}" style="display:block;border:0;width:56px;height:56px;"></a></td></tr>`,
    `<tr><td style="padding:20px 28px 8px;">`,
    `<h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;color:${color.navy};">${e(content.heading)}</h1>`,
    content.greeting ? `<p style="${P}">${e(content.greeting)}</p>` : "",
    ...content.paragraphs.map((p) => `<p style="${P}">${e(p)}</p>`),
    content.blocks?.length ? blocksHtml(content.blocks, site) : "",
    content.details?.length
      ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 20px;background:${color.wash};border-radius:12px;">${content.details
          .map(
            (d) =>
              `<tr><td style="padding:10px 16px;font-size:14px;color:${color.slate};width:40%;vertical-align:top;">${e(d.label)}</td><td style="padding:10px 16px;font-size:15px;font-weight:700;color:${color.ink};vertical-align:top;">${e(d.value)}</td></tr>`,
          )
          .join("")}</table>`
      : "",
    content.button
      ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 16px;"><tr><td style="border-radius:999px;background:${color.turquoise};"><a href="${e(content.button.url)}" style="display:inline-block;padding:14px 28px;font-family:${font};font-size:16px;font-weight:700;color:${color.night};text-decoration:none;border-radius:999px;">${e(content.button.label)}</a></td></tr></table>` +
        `<p style="margin:0 0 20px;font-size:13px;line-height:1.5;color:${color.slate};">${e(w.copyLink)}<br><a href="${e(content.button.url)}" style="color:${color.turquoiseInk};word-break:break-all;">${e(content.button.url)}</a></p>`
      : "",
    ...(content.after ?? []).map((p) => `<p style="${P}">${e(p)}</p>`),
    `</td></tr>`,
    `<tr><td style="padding:20px 28px 24px;border-top:1px solid ${color.rule};font-size:13px;line-height:1.6;color:${color.slate};">`,
    `<strong style="color:${color.navy};">${e(schoolName[locale])}</strong><br>`,
    `<a href="${e(site)}" style="color:${color.turquoiseInk};">${e(host)}</a> · <span dir="ltr" style="white-space:nowrap;">${e(mainPhone)}</span>`,
    content.footerNote ? `<br><br>${e(content.footerNote)}` : "",
    content.unsubscribeUrl ? `<br><a href="${e(content.unsubscribeUrl)}" style="color:${color.slate};text-decoration:underline;">${e(w.unsubscribe)}</a>` : "",
    `</td></tr></table></td></tr></table></body></html>`,
  ].join("");

  const text = [
    content.heading,
    "",
    ...(content.greeting ? [content.greeting, ""] : []),
    ...content.paragraphs.flatMap((p) => [p, ""]),
    ...(content.blocks?.length ? [blocksText(content.blocks, site), ""] : []),
    ...(content.details?.length ? [...content.details.map((d) => `${d.label}: ${d.value}`), ""] : []),
    ...(content.button ? [`${content.button.label}: ${content.button.url}`, ""] : []),
    ...(content.after ?? []).flatMap((p) => [p, ""]),
    "--",
    schoolName[locale],
    `${site} · ${mainPhone}`,
    ...(content.footerNote ? ["", content.footerNote] : []),
    ...(content.unsubscribeUrl ? [`${w.unsubscribe}: ${content.unsubscribeUrl}`] : []),
  ].join("\n");

  return { subject: content.subject, html, text };
}

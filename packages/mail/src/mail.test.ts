import { describe, expect, it, vi } from "vitest";
import { locales } from "@maarif/contracts/locales";
import {
  accountInvite,
  escapeHtml,
  formReceived,
  formatDate,
  formatTime,
  gradeName,
  mailErrorCode,
  newsletterConfirm,
  newsletterIssue,
  passwordReset,
  renderMail,
  sendMail,
  senderFor,
  staffNotification,
  visitConfirmed,
  type FormKind,
  type MailBinding,
} from "./index";

const brand = { siteUrl: "https://yassinekhiari.download" };

describe("senders", () => {
  it("picks the address and reply-to per case on the configured domain", () => {
    expect(senderFor("confirmation", "yassinekhiari.download", "fr")).toEqual({
      from: { email: "noreply@yassinekhiari.download", name: "Écoles Internationales Maarif de Tunisie" },
      replyTo: "contact@yassinekhiari.download",
    });
    expect(senderFor("account", "school.tn")).toMatchObject({ from: { email: "noreply@school.tn", name: "maarifcms" }, replyTo: "support@school.tn" });
    expect(senderFor("newsletter", "school.tn")).toMatchObject({ from: { email: "info@school.tn" }, replyTo: "info@school.tn" });
    expect(senderFor("staff", "school.tn")?.replyTo).toBe("contact@school.tn");
  });

  it("refuses a missing or malformed domain", () => {
    expect(senderFor("confirmation", undefined)).toBeNull();
    expect(senderFor("confirmation", "not a domain")).toBeNull();
    expect(senderFor("confirmation", "evil.com>\r\nBcc: x@y.z")).toBeNull();
  });
});

describe("sendMail", () => {
  const message = { from: { email: "noreply@school.tn", name: "School" }, to: "parent@example.com", replyTo: "contact@school.tn", subject: "Hi", html: "<p>Hi</p>", text: "Hi" };

  it("sends through the binding and returns the message id", async () => {
    const send = vi.fn(async () => ({ messageId: "m1" }));
    expect(await sendMail({ send } as MailBinding, message)).toEqual({ ok: true, id: "m1" });
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ from: { email: "noreply@school.tn", name: "School" }, to: "parent@example.com", replyTo: "contact@school.tn" }));
  });

  it("keeps header values on one line", async () => {
    const send = vi.fn(async () => ({ messageId: "m1" }));
    await sendMail({ send } as MailBinding, { ...message, subject: "Hi\r\nBcc: x@y.z", headers: { "List-Unsubscribe": "<https://a>\nX: y" } });
    const sent = (send.mock.calls[0] as unknown as [{ subject: string; headers: Record<string, string> }])[0];
    expect(sent.subject).toBe("Hi Bcc: x@y.z");
    expect(sent.headers["List-Unsubscribe"]).toBe("<https://a> X: y");
  });

  it("returns codes instead of throwing", async () => {
    expect(await sendMail(undefined, message)).toEqual({ ok: false, error: "no_binding" });
    expect(await sendMail({ send: vi.fn() } as unknown as MailBinding, { ...message, to: "not-an-email" })).toEqual({ ok: false, error: "invalid" });
    const failing = (error: unknown) => ({ send: vi.fn(async () => Promise.reject(error)) }) as unknown as MailBinding;
    expect(await sendMail(failing({ code: "E_RATE_LIMIT_EXCEEDED" }), message)).toEqual({ ok: false, error: "rate_limit" });
    expect(await sendMail(failing(new Error("send failed: E_RECIPIENT_SUPPRESSED")), message)).toEqual({ ok: false, error: "suppressed" });
    expect(await sendMail(failing(new Error("boom")), message)).toEqual({ ok: false, error: "failed" });
  });

  it("maps every documented error code", () => {
    expect(mailErrorCode({ code: "E_SENDER_DOMAIN_NOT_AVAILABLE" })).toBe("sender_domain");
    expect(mailErrorCode({ message: "E_DAILY_LIMIT_EXCEEDED" })).toBe("daily_limit");
    expect(mailErrorCode(null)).toBe("failed");
  });
});

describe("layout", () => {
  it("escapes everything people type", () => {
    const m = renderMail(formReceived("contact", "en", { reference: "7", name: '<img src=x onerror="alert(1)">' }), brand);
    expect(m.html).not.toContain("<img src=x");
    expect(m.html).toContain("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
    expect(escapeHtml(`a&b<'"`)).toBe("a&amp;b&lt;&#39;&quot;");
  });

  it("writes Arabic right to left, with the badge and a text twin", () => {
    const m = renderMail(formReceived("pre-registration", "ar", { reference: "12", grade: "year-11" }), brand);
    expect(m.html).toContain('<html lang="ar" dir="rtl">');
    expect(m.html).toContain("text-align:right");
    expect(m.html).toContain("https://yassinekhiari.download/brand/maarif-badge-email.png");
    expect(m.text).toContain("سنة 11");
    expect(m.text).toContain("الشرقية 2");
    expect(m.text).not.toContain("<");
  });

  it("renders the turquoise button with night navy text and a copyable link", () => {
    const m = renderMail(passwordReset("en", { url: "https://cms.example/admin/reset/abc", hours: 1 }), brand);
    expect(m.html).toContain("background:#00adbb");
    expect(m.html).toContain("color:#0b2a47");
    expect(m.html).toContain("The link works for 1 hour.");
    expect(m.text).toContain("Choose a new password: https://cms.example/admin/reset/abc");
  });

  it("renders newsletter rich text safely, with absolute links and an unsubscribe link", () => {
    const m = renderMail(
      newsletterIssue("fr", {
        subject: "Lettre de novembre",
        blocks: [
          { t: "h2", c: [{ text: "Sortie" }] },
          { t: "p", c: [{ text: "Voir " }, { text: "le programme", href: "/fr/campus-life/trips" }, { text: " <b>" }] },
          { t: "ul", items: [[{ text: "Un" }], [{ text: "Deux", b: true }]] },
        ],
        unsubscribeUrl: "https://yassinekhiari.download/fr/newsletter/unsubscribe?t=abc",
      }),
      brand,
    );
    expect(m.html).toContain('href="https://yassinekhiari.download/fr/campus-life/trips"');
    expect(m.html).toContain(" &lt;b&gt;");
    expect(m.html).toContain("<strong>Deux</strong>");
    expect(m.html).toContain("Se désinscrire");
    expect(m.text).toContain("- Deux");
    expect(m.text).toContain("le programme (https://yassinekhiari.download/fr/campus-life/trips)");
  });
});

describe("templates", () => {
  const kinds: FormKind[] = ["visit-booking", "pre-registration", "contact", "feedback", "application"];

  it("has every confirmation in every language, with the reference", () => {
    for (const locale of locales) {
      for (const kind of kinds) {
        const c = formReceived(kind, locale, { reference: "R42" });
        expect(c.subject).toContain("R42");
        expect(c.heading.length).toBeGreaterThan(5);
        expect(c.details?.[0]?.value).toBe("R42");
      }
      for (const k of ["suggestion", "complaint", "thanks"] as const) {
        expect(formReceived("feedback", locale, { reference: "1", feedbackKind: k }).heading).toBeTruthy();
      }
      expect(accountInvite(locale, { email: "a@b.tn", url: "https://x/y", hours: 72 }).paragraphs.join(" ")).toContain("72");
      expect(newsletterConfirm(locale, { url: "https://x/confirm" }).button?.url).toBe("https://x/confirm");
    }
  });

  it("adds the grade, campus, date and slot of a visit request", () => {
    const c = formReceived("visit-booking", "fr", { reference: "9", grade: "kg", preferredDate: "2026-12-03", preferredSlot: "morning" });
    expect(c.details).toEqual(
      expect.arrayContaining([
        { label: "Classe", value: "Maternelle" },
        { label: "Campus", value: "Le Kram" },
        { label: "Moment de la journée", value: "Matin" },
      ]),
    );
    expect(c.details?.find((d) => d.label === "Date souhaitée")?.value).toMatch(/3 décembre 2026/);
  });

  it("confirms a visit in Tunis time with Western digits in Arabic", () => {
    const c = visitConfirmed("ar", { reference: "5", when: "2026-12-03T08:30:00Z", campus: "highSchool" });
    const time = c.details?.find((d) => d.label === "الساعة")?.value;
    expect(time).toBe("09:30");
    expect(c.details?.find((d) => d.label === "العنوان")?.value).toContain("Charguia 2");
    expect(formatDate("2026-12-03", "ar")).toMatch(/3/);
    expect(formatDate("2026-12-03", "ar")).not.toMatch(/[٠-٩]/);
    expect(formatTime("bad", "en")).toBe("");
  });

  it("names grades per language", () => {
    expect(gradeName("year-13", "en")).toBe("Year 13");
    expect(gradeName("year-13", "fr")).toBe("Année 13");
    expect(gradeName("year-13", "ar")).toBe("سنة 13");
    expect(gradeName("year-13", "tr")).toBe("Yıl 13");
  });

  it("keeps personal details out of staff notifications", () => {
    const c = staffNotification("pre-registration", { reference: "77", url: "https://cms.example/admin/collections/inquiries/77" });
    const m = renderMail(c, brand);
    expect(m.subject).toBe("New pre-registration (#77)");
    expect(m.text).toContain("This email holds no personal details");
    expect(m.text).toContain("https://cms.example/admin/collections/inquiries/77");
  });
});

// @maarif/mail: everything the website emails (wave 4, ADR 011).
//   const s = senderFor("confirmation", env.MAIL_DOMAIN, locale);
//   const m = renderMail(formReceived("visit-booking", locale, data), { siteUrl });
//   await sendMail(env.EMAIL, { from: s.from, replyTo: s.replyTo, to, ...m });
export * from "./send";
export * from "./senders";
export * from "./layout";
export * from "./templates";
export { campuses, formatDate, formatTime, gradeName, mainPhone, schoolName } from "./school";

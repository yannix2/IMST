import { whatsappNumber } from "./school";

// The school's social accounts (maarif_site_data.json, social_links: the old site published
// each address twice inside itself, so every link was broken; these are the intended
// addresses). Owner decision 2026-11-05: the X account is left out (it is Maarif Cameroon's).
// [PROPOSAL] Check each account still exists and belongs to the school before launch.

export const socialAccounts = [
  { key: "facebook", name: "Facebook", href: "https://www.facebook.com/maariftn/", handle: "maariftn" },
  { key: "instagram", name: "Instagram", href: "https://www.instagram.com/maariftn/", handle: "@maariftn" },
  {
    key: "linkedin",
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/international-maarif-schools-of-tunisia",
    handle: "International Maarif Schools of Tunisia",
  },
  { key: "whatsapp", name: "WhatsApp", href: `https://wa.me/${whatsappNumber.replace("+", "")}`, handle: whatsappNumber },
  { key: "youtube", name: "YouTube", href: "https://www.youtube.com/@maariftn", handle: "@maariftn" },
] as const;

export type SocialKey = (typeof socialAccounts)[number]["key"];

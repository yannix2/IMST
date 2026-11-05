// Confirmed contact facts (maarif_site_data.json, contact page; WhatsApp number confirmed
// by the owner on 2026-11-04). Phone numbers are written for humans and dialled as E.164.

export const whatsappNumber = "+21629905209";

export const campuses = {
  highSchool: {
    address: "22 Rue de l’Usine, Charguia 2, Ariana 2035",
    phones: ["+216 70 74 70 46", "+216 29 96 34 80"],
  },
  schools: {
    address: "4 Rue Socrate, ZI Kheireddine, Le Kram 2089",
    phones: ["+216 29 90 52 09"],
  },
} as const;

export const schoolEmail = "info@tn.maarifschools.org";

export const telHref = (phone: string) => `tel:${phone.replace(/\s/g, "")}`;

export function whatsappHref(text: string): string {
  return `https://wa.me/${whatsappNumber.replace("+", "")}?text=${encodeURIComponent(text)}`;
}

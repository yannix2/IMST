import type { ContactMessage, FormKind, PreRegistration, VisitBooking } from "@maarif/contracts";
import type { Env } from "./env";

type FormData = {
  "pre-registration": PreRegistration;
  "visit-booking": VisitBooking;
  contact: ContactMessage;
};

// The host is ignored by service bindings; only the path reaches maarif-cms.
const CMS_ORIGIN = "https://maarif-cms.internal";

// Shape of an `inquiries` document in maarifcms. Only what staff need to call the family back;
// the Turnstile token, honeypot and raw consent flag are never stored.
export function toInquiry<K extends FormKind>(kind: K, data: FormData[K], receivedAt: Date) {
  const common = {
    kind,
    locale: data.locale,
    status: "new" as const,
    phone: data.phone,
    email: data.email,
    message: data.message,
    privacyNoticeAcceptedAt: receivedAt.toISOString(),
  };

  switch (kind) {
    case "pre-registration": {
      const d = data as PreRegistration;
      return {
        ...common,
        contactName: d.guardianName ?? d.studentName,
        grade: d.grade,
        details: { studentName: d.studentName, guardianName: d.guardianName, cityArea: d.cityArea },
      };
    }
    case "visit-booking": {
      const d = data as VisitBooking;
      return {
        ...common,
        contactName: d.parentName,
        grade: d.grade,
        details: { preferredDate: d.preferredDate, preferredSlot: d.preferredSlot },
      };
    }
    default: {
      const d = data as ContactMessage;
      return { ...common, contactName: d.name, details: { topic: d.topic } };
    }
  }
}

// Creates the entry through Payload's REST API with the gateway's API key (create-only rights).
// Returns the new document id, or null when maarifcms is unavailable.
export async function createInquiry<K extends FormKind>(env: Env, kind: K, data: FormData[K]): Promise<string | null> {
  try {
    const response = await env.CMS.fetch(`${CMS_ORIGIN}/cms-api/inquiries`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `api-clients API-Key ${env.CMS_API_KEY}`,
      },
      body: JSON.stringify(toInquiry(kind, data, new Date())),
    });
    if (!response.ok) return null;
    const created = (await response.json()) as { doc?: { id?: string | number } };
    return created.doc?.id != null ? String(created.doc.id) : null;
  } catch {
    return null;
  }
}

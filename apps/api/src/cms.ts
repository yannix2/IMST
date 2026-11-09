import type { Application, ContactMessage, Feedback, FormKind, PreRegistration, VisitBooking } from "@maarif/contracts";
import type { Env } from "./env";
import { cmsFetch } from "./cms-fetch";

type FormData = {
  "pre-registration": PreRegistration;
  "visit-booking": VisitBooking;
  contact: ContactMessage;
  feedback: Feedback;
};


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
    case "feedback": {
      const d = data as Feedback;
      return { ...common, contactName: d.name, grade: d.grade, details: { feedbackKind: d.feedbackKind } };
    }
    default: {
      const d = data as ContactMessage;
      return { ...common, contactName: d.name, details: { topic: d.topic } };
    }
  }
}

// Job applications (wave 3): the CV goes first into the private store (administrators only),
// then the application that points to it. Returns the application id, or null on failure; a CV
// stored without its application is removed by the retention job.
export async function createApplication(env: Env, data: Application, jobId: string | null, cv: File, receivedAt = new Date()): Promise<string | null> {
  const auth = { authorization: `api-clients API-Key ${env.CMS_API_KEY}` };
  try {
    const form = new FormData();
    form.append("file", cv, `cv-${crypto.randomUUID()}.pdf`);
    form.append("_payload", JSON.stringify({ label: `CV: ${data.name}`.slice(0, 160) }));
    const stored = await cmsFetch(env, "/cms-api/private-files", { method: "POST", headers: auth, body: form });
    if (!stored.ok) return null;
    const file = (await stored.json()) as { doc?: { id?: string | number } };
    if (file.doc?.id == null) return null;

    const response = await cmsFetch(env, "/cms-api/applications", {
      method: "POST",
      headers: { ...auth, "content-type": "application/json" },
      body: JSON.stringify({
        job: jobId ? Number.isNaN(Number(jobId)) ? jobId : Number(jobId) : undefined,
        position: data.position,
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
        cv: file.doc.id,
        locale: data.locale,
        status: "new",
        privacyNoticeAcceptedAt: receivedAt.toISOString(),
      }),
    });
    if (!response.ok) return null;
    const created = (await response.json()) as { doc?: { id?: string | number } };
    return created.doc?.id != null ? String(created.doc.id) : null;
  } catch {
    return null;
  }
}

// Creates the entry through Payload's REST API with the gateway's API key (create-only rights).
// Returns the new document id, or null when maarifcms is unavailable.
export async function createInquiry<K extends FormKind>(env: Env, kind: K, data: FormData[K]): Promise<string | null> {
  try {
    const response = await cmsFetch(env, "/cms-api/inquiries", {
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

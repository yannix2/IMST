"use client";

// The unsubscribe page's button (wave 4): posts the link's token (checked for its form by the
// page, on the server) to maarif-api, then shows the result.
import { useState } from "react";
import type { Locale } from "@maarif/contracts/locales";
import { newsletterCopy } from "@/content/newsletter";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type State = "ready" | "sending" | "done" | "invalid" | "error";

export function UnsubscribeButton({ locale, email, token }: { locale: Locale; email: string; token: string | null }) {
  const c = newsletterCopy[locale].unsubscribe;
  const [state, setState] = useState<State>(token ? "ready" : "invalid");

  async function unsubscribe() {
    setState("sending");
    try {
      const response = await fetch("/api/newsletter/unsubscribe", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ t: token }) });
      setState(response.ok ? "done" : response.status >= 500 ? "error" : "invalid");
    } catch {
      setState("error");
    }
  }

  if (state === "done" || state === "invalid") {
    const [title, text] = state === "done" ? c.done : c.invalid;
    return (
      <div role="status" className="mt-4">
        <p className="text-lg font-bold text-heading">{title}</p>
        <p className="mt-2 text-lg text-ink">
          {text}
          {state === "invalid" ? (
            <>
              {" "}
              <a href={`mailto:${email}`} className="break-all text-turquoise-ink">
                {email}
              </a>
            </>
          ) : null}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <p className="text-lg text-ink">{c.text}</p>
      <Button className="mt-6" size="lg" onClick={unsubscribe} disabled={state === "sending"}>
        {state === "sending" ? <Spinner data-icon="inline-start" /> : null}
        {c.button}
      </Button>
      {state === "error" ? (
        <p role="alert" className="mt-4 text-ink">
          {c.error}
        </p>
      ) : null}
    </div>
  );
}

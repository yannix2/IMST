"use client";

import dynamic from "next/dynamic";
import { useId, useRef, useState } from "react";
import { MenuIcon } from "lucide-react";
import type { Locale } from "@maarif/contracts/locales";
import { Button } from "@/components/ui/button";
import { messages } from "@/i18n/messages";

// The sheet (a Radix Dialog) is its own chunk: it loads on the first press of "Menu", and
// starts loading as soon as a finger or pointer lands on the button.
const loadSheet = () => import("./mobile-sheet");
const MobileSheet = dynamic(loadSheet, { ssr: false });

export function MobileNav({ locale, path = "" }: { locale: Locale; path?: string }) {
  const t = messages[locale];
  const id = useId();
  const [open, setOpen] = useState(false);
  const [used, setUsed] = useState(false);
  const warmed = useRef(false);

  const warm = () => {
    if (warmed.current) return;
    warmed.current = true;
    void loadSheet();
  };

  return (
    <>
      <Button
        id={`${id}-trigger`}
        variant="outline"
        className="xl:hidden"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={used ? id : undefined}
        onPointerDown={warm}
        onPointerEnter={warm}
        onFocus={warm}
        onClick={() => {
          setUsed(true);
          setOpen(true);
        }}
      >
        <MenuIcon data-icon="inline-start" />
        {t.nav.menu}
      </Button>
      {used ? <MobileSheet locale={locale} path={path} id={id} triggerId={`${id}-trigger`} open={open} onOpenChange={setOpen} /> : null}
    </>
  );
}

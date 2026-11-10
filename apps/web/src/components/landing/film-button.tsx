"use client";

import { PlayIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import type { FilmDialogProps } from "./film-dialog";

// "Watch the film · 3 min" under the Home buttons (wave 5). The player itself (film-dialog.tsx)
// is fetched on the first tap only, so Home's first load does not grow. The button is in the
// server HTML, so nothing moves when the page hydrates.
const FilmDialog = dynamic(() => import("./film-dialog").then((m) => m.FilmDialog), { ssr: false });

export function FilmButton(props: Omit<FilmDialogProps, "onClose">) {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button
        ref={button}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        data-film-button=""
        className="group mt-5 inline-flex min-h-11 cursor-pointer items-center gap-3 rounded-full pe-4 text-start font-bold text-white focus-visible:ring-3 focus-visible:ring-turquoise focus-visible:outline-none"
      >
        <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/50 backdrop-blur-sm transition-colors group-hover:bg-turquoise group-hover:text-on-turquoise">
          <PlayIcon aria-hidden="true" className="size-5 translate-x-px fill-current" />
        </span>
        <span>
          {props.copy.watch}{" "}
          <span className="ms-1 font-normal text-white/80">· {props.copy.length}</span>
        </span>
      </button>
      {open ? (
        <FilmDialog
          {...props}
          onClose={() => {
            setOpen(false);
            button.current?.focus();
          }}
        />
      ) : null}
    </>
  );
}

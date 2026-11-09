"use client";

import dynamic from "next/dynamic";
import type { GalleryItem } from "@/components/twentyfirst/circular-gallery";
import { useNear } from "./lazy-sections";

// Loads the circular gallery (and ogl, WebGL) when the Cambridge section comes near. Its box is
// fixed by the parent, so nothing moves when it starts.
const Gallery = dynamic(() => import("@/components/twentyfirst/circular-gallery").then((m) => m.CircularGallery), { ssr: false });

type Props = { items: GalleryItem[]; label: string; previousLabel: string; nextLabel: string };

export function CambridgeGallery(props: Props) {
  const [ref, near] = useNear<HTMLDivElement>("700px 0px");
  return (
    <div ref={ref} className="h-[22rem] sm:h-[26rem] lg:h-[30rem]">
      {near ? <Gallery {...props} className="size-full" /> : null}
    </div>
  );
}

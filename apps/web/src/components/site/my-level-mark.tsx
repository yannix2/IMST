"use client";

// "Your child's level" on the Parents hub (wave 6). A family that chose a level elsewhere on the
// site (level finder, child's path, pre-registration: lib/route-store.ts keeps it in this browser
// only) sees that level's row of school hours marked. The rows are server HTML; this adds a tint
// and a small tag placed over the row's top edge, so nothing changes size or moves. It reads the
// stored value itself, without the store's code, to keep the page light.
import { useEffect, useRef } from "react";

function storedStage(): string | null {
  try {
    const grade = (JSON.parse(window.localStorage.getItem("maarif:route:v1") ?? "{}") as { grade?: unknown }).grade;
    if (grade === "kg") return "kindergarten";
    const year = typeof grade === "string" && /^year-\d{1,2}$/.test(grade) ? Number(grade.slice(5)) : 0;
    return year >= 10 && year <= 13 ? "upper-secondary" : year >= 7 ? "lower-secondary" : year >= 1 ? "primary" : null;
  } catch {
    return null; // storage blocked or unreadable: no mark
  }
}

export function MyLevelMark() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const stage = storedStage();
    const list = ref.current?.parentElement;
    if (!stage || !list) return;
    for (const row of list.querySelectorAll<HTMLElement>("[data-stage]")) {
      if (row.dataset.stage === stage) row.dataset.mine = "";
    }
  }, []);
  return <span ref={ref} hidden />;
}

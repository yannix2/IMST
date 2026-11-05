"use client";

import { useSyncExternalStore } from "react";
import { grades, type Grade } from "@maarif/contracts/school";

// "You are here": the family's chosen grade and how far along the admissions route they
// are, kept in this browser only. Versioned, minimal, and safe when storage is blocked.

export type RouteState = { grade: Grade | null; station: 1 | 2 };

const KEY = "maarif:route:v1";
const EVENT = "maarif:route";
const EMPTY: RouteState = { grade: null, station: 1 };

let cachedRaw: string | null | undefined;
let cachedState: RouteState = EMPTY;

function read(): RouteState {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return EMPTY;
  }
  if (raw === cachedRaw) return cachedState;
  cachedRaw = raw;
  try {
    const parsed = raw ? (JSON.parse(raw) as Partial<RouteState>) : {};
    cachedState = {
      grade: grades.includes(parsed.grade as Grade) ? (parsed.grade as Grade) : null,
      station: parsed.station === 2 ? 2 : 1,
    };
  } catch {
    cachedState = EMPTY;
  }
  return cachedState;
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function updateRoute(patch: Partial<RouteState>) {
  const next = { ...read(), ...patch };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage blocked: the page still works, it just will not remember.
  }
  window.dispatchEvent(new Event(EVENT));
}

export function useRoute(): RouteState {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

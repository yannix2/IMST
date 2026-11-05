"use client";

import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { themeKey, type Theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

// One switch: pressed means dark. The new theme opens as a circle from the switch itself.
export function ThemeToggle({ label, className }: { label: string; className?: string }) {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    const read = () => setTheme(root.dataset.theme === "dark" ? "dark" : "light");
    read();
    // The head script follows the device setting until the visitor chooses; mirror it here.
    const watch = new MutationObserver(read);
    watch.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => watch.disconnect();
  }, []);

  function toggle(event: React.MouseEvent<HTMLButtonElement>) {
    const next: Theme = theme === "dark" ? "light" : "dark";
    const root = document.documentElement;
    const apply = () => {
      root.dataset.theme = next;
      try {
        localStorage.setItem(themeKey, next);
      } catch {
        // Private mode: the choice lasts for this page only.
      }
    };
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still || !document.startViewTransition) {
      apply();
      return;
    }
    const box = event.currentTarget.getBoundingClientRect();
    const x = box.left + box.width / 2, y = box.top + box.height / 2;
    root.style.setProperty("--reveal-x", `${x}px`);
    root.style.setProperty("--reveal-y", `${y}px`);
    root.style.setProperty("--reveal-r", `${Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))}px`);
    root.classList.add("theme-switching");
    const transition = document.startViewTransition(apply);
    void transition.finished.finally(() => root.classList.remove("theme-switching"));
  }

  return (
    <Button
      type="button"
      size="icon"
      variant="outline"
      aria-pressed={theme === "dark"}
      aria-label={label}
      title={label}
      onClick={toggle}
      className={cn("size-11", className)}
    >
      {/* Before hydration the icon is the sun; the label and state are right from the start. */}
      {theme === "dark" ? <MoonIcon className="size-5" /> : <SunIcon className="size-5" />}
    </Button>
  );
}

import { cn } from "@/lib/utils";
import { hairlineIcons, type HairlineIconName } from "./icons-data";

// A Hairline figure as a static icon (wave 2): the figure's still frame (icons-data.ts, made by
// hairline/icons.mjs), drawn in the current text colour with the turquoise highlight, on the
// surface colour. Server component, no engine, no JavaScript. Decorative: the heading next to it
// carries the meaning.
export function HairlineIcon({ name, className }: { name: HairlineIconName; className?: string }) {
  const icon = hairlineIcons[name];
  return (
    <svg
      viewBox={icon.viewBox}
      aria-hidden="true"
      focusable="false"
      className={cn("hl-icon", className)}
      // Our own generated markup (paths and circles only), never user content.
      dangerouslySetInnerHTML={{ __html: icon.body }}
    />
  );
}

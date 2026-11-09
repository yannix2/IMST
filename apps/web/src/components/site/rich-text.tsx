import type { RichBlock, RichInline } from "@maarif/contracts/rich-text";
import { cn } from "@/lib/utils";

// maarifcms rich text (already reduced to safe blocks by maarif-api, contracts/rich-text.ts) as
// React elements. No HTML from the CMS ever reaches the page. Server component.

function Inline({ parts }: { parts: RichInline[] }) {
  return (
    <>
      {parts.map((part, i) => {
        let node: React.ReactNode = part.text === "\n" ? <br /> : part.text;
        if (part.b) node = <strong>{node}</strong>;
        if (part.i) node = <em>{node}</em>;
        if (part.u) node = <u>{node}</u>;
        if (part.href) {
          const external = /^https?:\/\//i.test(part.href);
          node = (
            <a href={part.href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
              {node}
            </a>
          );
        }
        return <span key={i}>{node}</span>;
      })}
    </>
  );
}

export function RichText({ blocks, className }: { blocks: RichBlock[]; className?: string }) {
  if (blocks.length === 0) return null;
  return (
    <div className={cn("flex max-w-[68ch] flex-col gap-4 text-lg text-ink [&_a]:text-turquoise-ink [&_a]:underline [&_a]:underline-offset-2", className)}>
      {blocks.map((block, i) => {
        switch (block.t) {
          case "h2":
            return (
              <h2 key={i} className="mt-4 text-[length:var(--text-title,1.75rem)] leading-tight font-bold text-heading">
                <Inline parts={block.c} />
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} className="mt-2 font-heading text-xl font-bold text-heading">
                <Inline parts={block.c} />
              </h3>
            );
          case "quote":
            return (
              <blockquote key={i} className="border-s-4 border-turquoise ps-5 text-slate italic">
                <Inline parts={block.c} />
              </blockquote>
            );
          case "ul":
          case "ol": {
            const List = block.t;
            return (
              <List key={i} className={cn("flex flex-col gap-2 ps-6", block.t === "ul" ? "list-disc" : "list-decimal")}>
                {block.items.map((item, j) => (
                  <li key={j}>
                    <Inline parts={item} />
                  </li>
                ))}
              </List>
            );
          }
          default:
            return (
              <p key={i}>
                <Inline parts={block.c} />
              </p>
            );
        }
      })}
    </div>
  );
}

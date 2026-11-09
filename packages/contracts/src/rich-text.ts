// Rich text from maarifcms (Lexical JSON) reduced to a small, safe structure the site renders as
// React elements (wave 3). No HTML travels from the CMS to the page, so nothing can be injected:
// only paragraphs, two heading levels, lists, quotes and inline bold / italic / underline / links.

export type RichInline = { text: string; b?: true; i?: true; u?: true; href?: string };
export type RichBlock =
  | { t: "p" | "h2" | "h3" | "quote"; c: RichInline[] }
  | { t: "ul" | "ol"; items: RichInline[][] };

type LexicalNode = {
  type?: string;
  tag?: string;
  listType?: string;
  text?: string;
  format?: number | string;
  url?: string;
  fields?: { url?: string; linkType?: string; doc?: unknown };
  children?: LexicalNode[];
};

// Only web and mail links; anything else (javascript:, data:) is dropped.
const safeHref = (url: unknown) => (typeof url === "string" && /^(https?:\/\/|mailto:|tel:|\/)/i.test(url.trim()) ? url.trim() : undefined);

function inline(nodes: LexicalNode[] | undefined, href?: string): RichInline[] {
  const out: RichInline[] = [];
  for (const node of nodes ?? []) {
    if (node.type === "text" && typeof node.text === "string" && node.text) {
      const f = typeof node.format === "number" ? node.format : 0;
      const piece: RichInline = { text: node.text };
      if (f & 1) piece.b = true;
      if (f & 2) piece.i = true;
      if (f & 8) piece.u = true;
      if (href) piece.href = href;
      out.push(piece);
    } else if (node.type === "linebreak") {
      out.push({ text: "\n" });
    } else if (node.type === "link" || node.type === "autolink") {
      out.push(...inline(node.children, safeHref(node.fields?.url ?? node.url)));
    } else if (node.children) {
      out.push(...inline(node.children, href));
    }
  }
  return out;
}

const hasText = (c: RichInline[]) => c.some((piece) => piece.text.trim());

/** Lexical editor state (or null) → blocks. Unknown node types keep their text as paragraphs. */
export function toRichBlocks(state: unknown): RichBlock[] {
  const root = (state as { root?: LexicalNode } | null)?.root;
  const blocks: RichBlock[] = [];
  for (const node of root?.children ?? []) {
    if (node.type === "heading") {
      const c = inline(node.children);
      if (hasText(c)) blocks.push({ t: node.tag === "h2" || node.tag === "h1" ? "h2" : "h3", c });
    } else if (node.type === "list") {
      const items = (node.children ?? []).map((item) => inline(item.children)).filter(hasText);
      if (items.length) blocks.push({ t: node.listType === "number" ? "ol" : "ul", items });
    } else if (node.type === "quote") {
      const c = inline(node.children);
      if (hasText(c)) blocks.push({ t: "quote", c });
    } else {
      const c = inline(node.children);
      if (hasText(c)) blocks.push({ t: "p", c });
    }
  }
  return blocks;
}

/** Plain text of the blocks, for descriptions and search. */
export const richPlainText = (blocks: RichBlock[]) =>
  blocks
    .map((b) => ("c" in b ? b.c : b.items.flat()).map((x) => x.text).join(""))
    .join("\n")
    .trim();

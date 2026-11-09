import { describe, expect, it } from "vitest";
import { richPlainText, toRichBlocks } from "./rich-text";

const state = (children: unknown[]) => ({ root: { children } });
const t = (text: string, format = 0) => ({ type: "text", text, format });

describe("toRichBlocks", () => {
  it("keeps paragraphs, headings, lists and quotes with inline styles", () => {
    const blocks = toRichBlocks(
      state([
        { type: "heading", tag: "h1", children: [t("Title")] },
        { type: "heading", tag: "h4", children: [t("Small")] },
        { type: "paragraph", children: [t("Bold", 1), t(" and "), t("italic", 2), t(" under", 8)] },
        { type: "list", listType: "number", children: [{ type: "listitem", children: [t("One")] }, { type: "listitem", children: [t(" ")] }] },
        { type: "quote", children: [t("Said")] },
      ]),
    );
    expect(blocks).toEqual([
      { t: "h2", c: [{ text: "Title" }] },
      { t: "h3", c: [{ text: "Small" }] },
      { t: "p", c: [{ text: "Bold", b: true }, { text: " and " }, { text: "italic", i: true }, { text: " under", u: true }] },
      { t: "ol", items: [[{ text: "One" }]] },
      { t: "quote", c: [{ text: "Said" }] },
    ]);
  });

  it("keeps safe links and drops dangerous ones", () => {
    const blocks = toRichBlocks(
      state([
        { type: "paragraph", children: [{ type: "link", fields: { url: "https://cambridgeinternational.org" }, children: [t("Cambridge")] }] },
        { type: "paragraph", children: [{ type: "link", fields: { url: "javascript:alert(1)" }, children: [t("bad")] }] },
        { type: "paragraph", children: [{ type: "link", fields: { url: "data:text/html,x" }, children: [t("worse")] }] },
      ]),
    );
    expect(blocks).toEqual([
      { t: "p", c: [{ text: "Cambridge", href: "https://cambridgeinternational.org" }] },
      { t: "p", c: [{ text: "bad" }] },
      { t: "p", c: [{ text: "worse" }] },
    ]);
  });

  it("returns nothing for empty or invalid states", () => {
    expect(toRichBlocks(null)).toEqual([]);
    expect(toRichBlocks({})).toEqual([]);
    expect(toRichBlocks(state([{ type: "paragraph", children: [] }]))).toEqual([]);
    expect(richPlainText(toRichBlocks(state([{ type: "paragraph", children: [t("a")] }, { type: "list", children: [{ children: [t("b")] }] }])))).toBe("a\nb");
  });
});

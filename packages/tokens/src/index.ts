// Token values for TypeScript consumers (Open Graph images, emails, tests).
// tokens.css is the source for the browser; keep both in step with DESIGN.md.

export const colors = {
  navy: "#134577",
  night: "#0B2A47",
  turquoise: "#00ADBB",
  turquoiseInk: "#00737C",
  levelKindergarten: "#F2B705",
  levelPrimary: "#5BAA3C",
  levelSecondary: "#E8684A",
  notice: "#A3262A",
  white: "#FFFFFF",
  mist: "#F4F7F7",
  ink: "#14212B",
  slate: "#4A5A66",
  rule: "#D3DCE1",
  onPlateMuted: "#B9CBDC",
} as const;

export const fontFamily = "Readex Pro";

export type ColorName = keyof typeof colors;

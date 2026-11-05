// Types for the generated Hairline modules (hairline/sync.mjs writes the .js files).

export type HairlineHandle = { set(value: number): void; destroy(): void };

export type HairlineFigure = {
  name: string;
  means: string;
  rules: number[];
  range: [number, number, number];
  tour: ([number, number] | null)[] | null;
  mount(
    host: { stage: HTMLElement; svg: SVGSVGElement; read: { textContent: string | null } },
    value: number,
  ): HairlineHandle;
};

export type HairlineKernel = {
  inject(root: Document | ShadowRoot): void;
  mk(tag: string, attrs: Record<string, string>, parent: Element): SVGSVGElement;
};

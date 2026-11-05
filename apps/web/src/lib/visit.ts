// Every "Book a visit" link on the page points at the station (#visit). The station opens
// its form for any of them, so a CTA far down the page lands on a ready form, not a closed card.
export const visitHash = "#visit";

export function isVisitLink(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest(`a[href="${visitHash}"]`));
}

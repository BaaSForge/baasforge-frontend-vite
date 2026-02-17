export enum ScrollBehavior {
  Smooth = "smooth",
  Instant = "instant",
}

function scroll(
  containerId: string | undefined,
  getTop: (el: Element | null) => number,
  behavior: ScrollBehavior = ScrollBehavior.Instant,
) {
  const el = containerId ? document.getElementById(containerId) : null;
  const top = getTop(el);
  if (el) el.scrollTo({ top, behavior });
  else window.scrollTo({ top, behavior });
}

export function scrollToTop(
  containerId?: string,
  behavior?: ScrollBehavior,
) {
  scroll(containerId, () => 0, behavior);
}

export function scrollToBottom(
  containerId?: string,
  behavior?: ScrollBehavior,
) {
  scroll(
    containerId,
    (el) => (el?.scrollHeight ?? 0) || document.documentElement.scrollHeight,
    behavior,
  );
}
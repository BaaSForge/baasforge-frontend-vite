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
    (el) => {
      const target = el ?? document.documentElement;
      return target.scrollHeight - target.clientHeight;
    },
    behavior,
  );
}
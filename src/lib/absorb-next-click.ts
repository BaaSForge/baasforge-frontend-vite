/**
 * Registers a one-shot native `click` capture listener on `document` that
 * swallows the very next click event. Used by Dialog/Drawer to prevent the
 * "stray click" that lands on elements underneath after the overlay is
 * dismissed on `pointerdown` (the overlay unmounts before `click` fires).
 *
 * Safe-guarded with a 400 ms timeout so a stuck listener cannot permanently
 * block clicks.
 */
export function absorbNextClick() {
    const ac = new AbortController();

    const remove = () => ac.abort();

    document.addEventListener(
        "click",
        (e) => {
            e.stopPropagation();
            e.preventDefault();
            remove();
        },
        { capture: true, once: true, signal: ac.signal },
    );

    window.setTimeout(remove, 400);
}

import { autoUpdate } from "@floating-ui/react-dom";

const LAYOUT_POLL_INTERVAL_MS = 500;

export function scheduleLayoutUpdates(
    reference: Element,
    floating: Element | Window | VisualViewport,
    update: () => void,
): () => void {
    const cleanupAutoUpdate = autoUpdate(reference, floating, update);
    const intervalId = window.setInterval(update, LAYOUT_POLL_INTERVAL_MS);
    return () => {
        cleanupAutoUpdate();
        window.clearInterval(intervalId);
    };
}

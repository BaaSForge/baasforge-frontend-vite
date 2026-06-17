import { createDismissFlagStorage, type DismissFlagStorage } from "./dismiss-flag-storage";

export type OverlayHintController = {
    requestShow: () => void;
    dismiss: () => void;
    releaseShowRequest: () => void;
    isDismissed: () => boolean;
    subscribe: (handler: () => void) => () => void;
};

export function createOverlayHintController(options: { dismissedStorageKey: string }): OverlayHintController {
    const dismissStorage: DismissFlagStorage = createDismissFlagStorage(options.dismissedStorageKey);
    const handlers = new Set<() => void>();
    let showRequested = false;

    function requestShow(): void {
        if (dismissStorage.isDismissed() || showRequested) return;
        showRequested = true;
        for (const handler of handlers) {
            handler();
        }
    }

    function dismiss(): void {
        dismissStorage.markDismissed();
        showRequested = false;
    }

    function releaseShowRequest(): void {
        showRequested = false;
    }

    function subscribe(handler: () => void): () => void {
        handlers.add(handler);
        return () => handlers.delete(handler);
    }

    return {
        requestShow,
        dismiss,
        releaseShowRequest,
        isDismissed: dismissStorage.isDismissed,
        subscribe,
    };
}

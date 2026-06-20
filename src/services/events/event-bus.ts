import type { AppEventName } from "./events";

type AppEventListener = (event: Event) => void;

export function listenAppEvent(eventName: AppEventName, listener: AppEventListener): () => void {
    window.addEventListener(eventName, listener);
    return () => {
        window.removeEventListener(eventName, listener);
    };
}

export function triggerAppEvent(eventName: AppEventName, detail?: unknown): void {
    window.dispatchEvent(new CustomEvent(eventName, { detail }));
}

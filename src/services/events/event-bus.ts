import type { AppEventName, AppEventPayloadMap } from "./events";

type AppEventListener<T = unknown> = (event: CustomEvent<T>) => void;

export function listenAppEvent<TEventName extends AppEventName>(
    eventName: TEventName,
    listener: AppEventListener<AppEventPayloadMap[TEventName]>
): () => void {
    const typedListener = listener as EventListener;
    window.addEventListener(eventName, typedListener);
    return () => {
        window.removeEventListener(eventName, typedListener);
    };
}

export function triggerAppEvent<TEventName extends AppEventName>(
    eventName: TEventName,
    detail?: AppEventPayloadMap[TEventName]
): void {
    window.dispatchEvent(new CustomEvent(eventName, { detail }));
}

const appChromeDismissHandlers = new Set<() => void>();

export function registerAppChromeDismissHandler(handler: () => void): () => void {
    appChromeDismissHandlers.add(handler);
    return () => {
        appChromeDismissHandlers.delete(handler);
    };
}

export function dismissAppChrome(): void {
    for (const dismiss of appChromeDismissHandlers) {
        dismiss();
    }
}

type SpotlightContentHostsListener = () => void;

const listeners = new Set<SpotlightContentHostsListener>();

export function onSpotlightContentHostsMounted(listener: SpotlightContentHostsListener): () => void {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

export function notifySpotlightContentHostsMounted(): void {
    for (const listener of listeners) {
        listener();
    }
}

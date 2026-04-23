import { useCallback, useSyncExternalStore } from "react";

function subscribeToStorageKey(storageKey: string, changedEventName: string, onStoreChange: () => void) {
    if (typeof window === "undefined") {
        return () => {};
    }
    const onStorage = (e: StorageEvent) => {
        if (e.key === storageKey || e.key === null) onStoreChange();
    };
    const onLocal = () => onStoreChange();
    window.addEventListener("storage", onStorage);
    window.addEventListener(changedEventName, onLocal);
    return () => {
        window.removeEventListener("storage", onStorage);
        window.removeEventListener(changedEventName, onLocal);
    };
}

function safeGetItem(key: string): string | null {
    if (typeof window === "undefined") return null;
    try {
        return window.localStorage.getItem(key);
    } catch {
        return null;
    }
}

function safeSetItem(key: string, value: string) {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(key, value);
    } catch {
        /* ignore */
    }
}

function dispatchChanged(eventName: string) {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new Event(eventName));
}

export type SyncedStringLocalStorageStore<T extends string> = {
    subscribe: (onStoreChange: () => void) => () => void;
    getSnapshot: () => T;
    getServerSnapshot: () => T;
    persist: (value: T) => void;
};

export function createSyncedStringLocalStorageStore<T extends string>(config: {
    storageKey: string;
    changedEventName: string;
    parse: (raw: string | null) => T | null;
    fallback: T;
    serverSnapshot: T;
}): SyncedStringLocalStorageStore<T> {
    function read(): T {
        return config.parse(safeGetItem(config.storageKey)) ?? config.fallback;
    }

    return {
        subscribe: (onStoreChange) => subscribeToStorageKey(config.storageKey, config.changedEventName, onStoreChange),
        getSnapshot: read,
        getServerSnapshot: () => config.serverSnapshot,
        persist(value: T) {
            safeSetItem(config.storageKey, value);
            dispatchChanged(config.changedEventName);
        },
    };
}

export type SyncedJsonLocalStorageStore<T> = {
    subscribe: (onStoreChange: () => void) => () => void;
    getSnapshot: () => T;
    getServerSnapshot: () => T;
    persist: (next: T | ((previous: T) => T)) => void;
};

export function createSyncedJsonLocalStorageStore<T>(config: {
    storageKey: string;
    changedEventName: string;
    getServerSnapshot: () => T;
    read: () => T;
    equal: (a: T, b: T) => boolean;
}): SyncedJsonLocalStorageStore<T> {
    let cachedSnapshot: T = config.getServerSnapshot();

    function getSnapshot(): T {
        const next = config.read();
        if (config.equal(next, cachedSnapshot)) {
            return cachedSnapshot;
        }
        cachedSnapshot = next;
        return cachedSnapshot;
    }

    return {
        subscribe: (onStoreChange) => subscribeToStorageKey(config.storageKey, config.changedEventName, onStoreChange),
        getSnapshot,
        getServerSnapshot: config.getServerSnapshot,
        persist(next: T | ((previous: T) => T)) {
            const previous = config.read();
            const value = typeof next === "function" ? (next as (p: T) => T)(previous) : next;
            safeSetItem(config.storageKey, JSON.stringify(value));
            dispatchChanged(config.changedEventName);
        },
    };
}

export function useSyncedStringLocalStorageStore<T extends string>(
    store: SyncedStringLocalStorageStore<T>,
): [T, (value: T) => void] {
    const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
    const persist = useCallback(
        (value: T) => {
            store.persist(value);
        },
        [store],
    );
    return [snapshot, persist];
}

export function useSyncedJsonLocalStorageStore<T>(store: SyncedJsonLocalStorageStore<T>): [T, SyncedJsonLocalStorageStore<T>["persist"]] {
    const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
    const persist = useCallback(
        (next: T | ((previous: T) => T)) => {
            store.persist(next);
        },
        [store],
    );
    return [snapshot, persist];
}

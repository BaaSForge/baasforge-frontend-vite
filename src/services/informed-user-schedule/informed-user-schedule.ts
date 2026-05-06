export type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export type InformSchedulePersistedV1 = {
    v: 1;
    dismissCount: number;
    nextEligibleAt: number;
};

export type GetPostponeMsAfterDismiss = (dismissCountAfterThisDismiss: number) => number;

export type CreateInformScheduleOptions = {
    storageKey: string;
    storage?: StorageLike | null;
    getPostponeMsAfterDismiss?: GetPostponeMsAfterDismiss;
    initialPostponeMs?: number;
    postponeMultiplier?: number;
    maxPostponeMs?: number;
};

export type InformSchedule = {
    shouldShow: (now?: number) => boolean;
    recordDismiss: (now?: number) => void;
    clearPostpone: (now?: number) => void;
    resetAll: () => void;
    readPersisted: () => InformSchedulePersistedV1 | null;
};

function createMemoryStorage(): StorageLike {
    const map = new Map<string, string>();
    return {
        getItem: (key) => map.get(key) ?? null,
        setItem: (key, value) => {
            map.set(key, value);
        },
        removeItem: (key) => {
            map.delete(key);
        },
    };
}

function resolveStorage(explicit: StorageLike | null | undefined): StorageLike {
    if (explicit != null) return explicit;
    if (typeof globalThis !== "undefined" && "localStorage" in globalThis && globalThis.localStorage != null) {
        return globalThis.localStorage;
    }
    return createMemoryStorage();
}

export function createDefaultExponentialPostponeMs(options: {
    initialMs: number;
    multiplier: number;
    maxMs: number;
}): GetPostponeMsAfterDismiss {
    return (dismissCountAfterThisDismiss) =>
        Math.min(
            options.maxMs,
            options.initialMs * Math.pow(options.multiplier, Math.max(0, dismissCountAfterThisDismiss - 1)),
        );
}

function parsePersisted(raw: string | null): InformSchedulePersistedV1 | null {
    if (raw == null) return null;
    try {
        const parsed = JSON.parse(raw) as unknown;
        if (
            parsed != null &&
            typeof parsed === "object" &&
            (parsed as InformSchedulePersistedV1).v === 1 &&
            typeof (parsed as InformSchedulePersistedV1).dismissCount === "number" &&
            typeof (parsed as InformSchedulePersistedV1).nextEligibleAt === "number"
        ) {
            return parsed as InformSchedulePersistedV1;
        }
    } catch {
        /* ignore */
    }
    return null;
}

export function createInformSchedule(options: CreateInformScheduleOptions): InformSchedule {
    const storage = resolveStorage(options.storage);
    const getPostponeMs: GetPostponeMsAfterDismiss =
        options.getPostponeMsAfterDismiss ??
        createDefaultExponentialPostponeMs({
            initialMs: options.initialPostponeMs ?? 3 * 86_400_000,
            multiplier: options.postponeMultiplier ?? 3,
            maxMs: options.maxPostponeMs ?? 27 * 86_400_000,
        });

    const readPersisted = (): InformSchedulePersistedV1 | null =>
        parsePersisted(storage.getItem(options.storageKey));

    const writePersisted = (data: InformSchedulePersistedV1): void => {
        try {
            storage.setItem(options.storageKey, JSON.stringify(data));
        } catch {
            /* ignore */
        }
    };

    return {
        readPersisted,

        shouldShow(now = Date.now()) {
            const s = readPersisted();
            if (s == null) return true;
            return now >= s.nextEligibleAt;
        },

        recordDismiss(now = Date.now()) {
            const s = readPersisted();
            const nextDismissCount = (s?.dismissCount ?? 0) + 1;
            writePersisted({
                v: 1,
                dismissCount: nextDismissCount,
                nextEligibleAt: now + getPostponeMs(nextDismissCount),
            });
        },

        clearPostpone(now = Date.now()) {
            const s = readPersisted();
            if (s == null) return;
            writePersisted({ ...s, nextEligibleAt: now });
        },

        resetAll() {
            try {
                storage.removeItem(options.storageKey);
            } catch {
                /* ignore */
            }
        },
    };
}

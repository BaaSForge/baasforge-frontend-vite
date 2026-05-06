import { createStore, useStore } from "zustand";

export type AppNotificationOpenContext = {
    group: string;
    id: string;
    title: string;
    subtitle?: string;
    read: boolean;
    pushedAt: number;
};

export type OnShowAppNotification = (ctx: AppNotificationOpenContext) => void;

export type PushAppNotificationInput = {
    group: string;
    id: string;
    title: string;
    subtitle?: string;
    read: boolean;
    onShowNotification: OnShowAppNotification;
};

type InternalNotification = PushAppNotificationInput & {
    pushedAt: number;
};

export const APP_NOTIFICATION_GROUP_FILTER_STORAGE_KEY = "app-notifications:group-filter:v1";

type AppNotificationsState = {
    notifications: InternalNotification[];
    push: (input: PushAppNotificationInput) => void;
    open: (group: string, id: string) => void;
};

const appNotificationsStore = createStore<AppNotificationsState>((set, get) => ({
    notifications: [],
    push(input) {
        const pushedAt = Date.now();
        const next: InternalNotification = { ...input, pushedAt };
        set((state) => {
            const idx = state.notifications.findIndex((n) => n.group === input.group && n.id === input.id);
            if (idx === -1) {
                return { notifications: [next, ...state.notifications] };
            }
            const copy = [...state.notifications];
            copy.splice(idx, 1);
            return { notifications: [next, ...copy] };
        });
    },
    open(group, id) {
        const prev = get().notifications.find((n) => n.group === group && n.id === id);
        if (prev == null) return;
        const onShow = prev.onShowNotification;
        const ctx: AppNotificationOpenContext = {
            group: prev.group,
            id: prev.id,
            title: prev.title,
            subtitle: prev.subtitle,
            read: true,
            pushedAt: prev.pushedAt,
        };
        onShow(ctx);
        set((state) => ({
            notifications: state.notifications.map((n) =>
                n.group === group && n.id === id ? { ...n, read: true } : n,
            ),
        }));
    },
}));

export { appNotificationsStore };

export function pushAppNotification(input: PushAppNotificationInput): void {
    appNotificationsStore.getState().push(input);
}

export function openAppNotification(group: string, id: string): void {
    appNotificationsStore.getState().open(group, id);
}

export function useAppNotifications(): InternalNotification[] {
    return useStore(appNotificationsStore, (s) => s.notifications);
}

export function useAppNotificationOpen(): (group: string, id: string) => void {
    return useStore(appNotificationsStore, (s) => s.open);
}

export function useAppNotificationBadgeLabel(): string | null {
    return useStore(appNotificationsStore, (s) => {
        const { notifications } = s;
        if (notifications.length === 0) return null;
        const unread = notifications.filter((n) => !n.read).length;
        const n = unread > 0 ? unread : notifications.length;
        return n > 50 ? "50+" : String(n);
    });
}

export function readStoredNotificationGroupFilter(): string[] {
    if (typeof globalThis === "undefined" || !("localStorage" in globalThis) || globalThis.localStorage == null) {
        return [];
    }
    try {
        const raw = globalThis.localStorage.getItem(APP_NOTIFICATION_GROUP_FILTER_STORAGE_KEY);
        if (raw == null) return [];
        const parsed = JSON.parse(raw) as unknown;
        if (!Array.isArray(parsed)) return [];
        return parsed.filter((x): x is string => typeof x === "string");
    } catch {
        return [];
    }
}

export function writeStoredNotificationGroupFilter(groups: string[]): void {
    if (typeof globalThis === "undefined" || !("localStorage" in globalThis) || globalThis.localStorage == null) {
        return;
    }
    try {
        globalThis.localStorage.setItem(APP_NOTIFICATION_GROUP_FILTER_STORAGE_KEY, JSON.stringify(groups));
    } catch {
        /* ignore */
    }
}

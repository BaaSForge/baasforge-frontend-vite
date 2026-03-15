export const UNIFIED_KEYBOARD_SCOPES = {
    MAIN_SIDEBAR: "main-sidebar",
    SECONDARY_SIDEBAR: "secondary-sidebar",
    FOCUS_CHAT: "focus-chat",
    NEW_CONVERSATION: "new-conversation",
    OPEN_PREVIOUS_CONVERSATIONS: "open-previous-conversations",
    FALLBACK_KEY: "fallback-key",
    STOP_GENERATION: "stop-generation",
    OPEN_SHORTCUTS_MODAL: "open-shortcuts-modal",
} as const;

export type UnifiedKeyboardScope = (typeof UNIFIED_KEYBOARD_SCOPES)[keyof typeof UNIFIED_KEYBOARD_SCOPES];

type Handler = () => void;
type FallbackHandler = (key: string) => void;

type Handlers = Partial<{
    [K in UnifiedKeyboardScope]: K extends typeof UNIFIED_KEYBOARD_SCOPES.FALLBACK_KEY ? FallbackHandler : Handler;
}>;

const mod = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? "⌘" : "Ctrl";

export const SHORTCUT_LABELS = {
    MAIN_SIDEBAR: `${mod}+\\`,
    SECONDARY_SIDEBAR: `${mod}+Shift+\\`,
    FOCUS_CHAT: "/",
    NEW_CONVERSATION: `${mod}+K`,
    OPEN_PREVIOUS_CONVERSATIONS: `${mod}+Shift+O`,
    STOP_GENERATION: "Esc",
    OPEN_SHORTCUTS_MODAL: "?",
} as const;

export const SHORTCUTS_FOR_MODAL: { label: string; keys: string }[] = [
    { label: "Open shortkeys", keys: SHORTCUT_LABELS.OPEN_SHORTCUTS_MODAL },
    { label: "Toggle main sidebar", keys: SHORTCUT_LABELS.MAIN_SIDEBAR },
    { label: "Toggle secondary sidebar", keys: SHORTCUT_LABELS.SECONDARY_SIDEBAR },
    { label: "Focus chat input", keys: SHORTCUT_LABELS.FOCUS_CHAT },
    { label: "New conversation", keys: SHORTCUT_LABELS.NEW_CONVERSATION },
    { label: "Previous conversations", keys: SHORTCUT_LABELS.OPEN_PREVIOUS_CONVERSATIONS },
    { label: "Stop message generation", keys: SHORTCUT_LABELS.STOP_GENERATION },
];

const handlers: Handlers = {};
let attached = false;

function isInputLike(target: EventTarget | null): boolean {
    if (!target || !(target instanceof HTMLElement)) return false;
    const tag = target.tagName.toLowerCase();
    const role = target.getAttribute?.("role");
    const editable = target.isContentEditable;
    return tag === "input" || tag === "textarea" || tag === "select" || role === "textbox" || role === "searchbox" || editable === true;
}

function isInsideModal(target: EventTarget | null): boolean {
    if (!target || !(target instanceof Node)) return false;
    const el = target instanceof Element ? target : ((target as Node).parentElement ?? null);
    return el?.closest?.("[role='dialog'], [role='alertdialog']") != null;
}

type ShortcutRule = {
    scope: UnifiedKeyboardScope;
    match: (e: KeyboardEvent) => boolean;
    allowInInput: boolean;
    allowInModal: boolean;
};

const SHORTCUT_RULES: ShortcutRule[] = [
    {
        scope: UNIFIED_KEYBOARD_SCOPES.OPEN_SHORTCUTS_MODAL,
        match: (e) => e.key === "?" && !e.metaKey && !e.ctrlKey && !e.altKey,
        allowInInput: false,
        allowInModal: true,
    },
    {
        scope: UNIFIED_KEYBOARD_SCOPES.STOP_GENERATION,
        match: (e) => e.key === "Escape",
        allowInInput: false,
        allowInModal: false,
    },
    {
        scope: UNIFIED_KEYBOARD_SCOPES.MAIN_SIDEBAR,
        match: (e) => (e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === "\\",
        allowInInput: false,
        allowInModal: true,
    },
    {
        scope: UNIFIED_KEYBOARD_SCOPES.SECONDARY_SIDEBAR,
        match: (e) => (e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "\\",
        allowInInput: false,
        allowInModal: true,
    },
    {
        scope: UNIFIED_KEYBOARD_SCOPES.FOCUS_CHAT,
        match: (e) => e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey,
        allowInInput: false,
        allowInModal: true,
    },
    {
        scope: UNIFIED_KEYBOARD_SCOPES.NEW_CONVERSATION,
        match: (e) => (e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === "k",
        allowInInput: false,
        allowInModal: true,
    },
    {
        scope: UNIFIED_KEYBOARD_SCOPES.OPEN_PREVIOUS_CONVERSATIONS,
        match: (e) => (e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "o",
        allowInInput: false,
        allowInModal: false,
    },
];

function handleKeyDown(e: KeyboardEvent): void {
    // Only act when no other listener has handled the event (e.g. native form/input behavior).
    if (e.defaultPrevented) return;

    const inInput = isInputLike(e.target as EventTarget | null);
    const inModal = isInsideModal(e.target as EventTarget | null);

    for (const { scope, match, allowInInput, allowInModal } of SHORTCUT_RULES) {
        const handler = handlers[scope];
        if (!handler || !match(e)) continue;
        if (inInput && !allowInInput) continue;
        if (inModal && !allowInModal) continue;
        e.preventDefault();
        (handler as Handler)();
        return;
    }

    // Fallback: single printable key → focus chat and type it (never for "?" or "/").
    if (!inInput && handlers[UNIFIED_KEYBOARD_SCOPES.FALLBACK_KEY] && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const key = e.key;
        if (key.length === 1 && key !== "?" && key !== "/") {
            e.preventDefault();
            (handlers[UNIFIED_KEYBOARD_SCOPES.FALLBACK_KEY] as FallbackHandler)(key);
        }
    }
}

function attach(): void {
    if (attached) return;
    attached = true;
    window.addEventListener("keydown", handleKeyDown, false);
}

function detach(): void {
    if (!attached) return;
    attached = false;
    window.removeEventListener("keydown", handleKeyDown, false);
}

export function register(scope: UnifiedKeyboardScope, handler: Handler | FallbackHandler): void {
    (handlers as Record<string, Handler | FallbackHandler>)[scope] = handler;
    attach();
}

export function unregister(scope: UnifiedKeyboardScope): void {
    delete (handlers as Record<string, unknown>)[scope];
    const hasAny = Object.values(handlers).some((h) => h != null);
    if (!hasAny) detach();
}

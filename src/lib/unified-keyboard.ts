export const UNIFIED_KEYBOARD_SCOPES = {
    MAIN_SIDEBAR: "main-sidebar",
    SECONDARY_SIDEBAR: "secondary-sidebar",
    FOCUS_CHAT: "focus-chat",
    OPEN_PREVIOUS_CONVERSATIONS: "open-previous-conversations",
    OPEN_SHORTCUTS_MODAL: "open-shortcuts-modal",
} as const;

export type UnifiedKeyboardScope = (typeof UNIFIED_KEYBOARD_SCOPES)[keyof typeof UNIFIED_KEYBOARD_SCOPES];

type Handler = () => void;

type Handlers = Partial<Record<UnifiedKeyboardScope, Handler>>;

const mod = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? "⌘" : "Ctrl";

export const SHORTCUT_LABELS = {
    MAIN_SIDEBAR: `${mod}+\\`,
    SECONDARY_SIDEBAR: `${mod}+Shift+\\`,
    FOCUS_CHAT: "/",
    OPEN_PREVIOUS_CONVERSATIONS: `${mod}+Shift+O`,
    OPEN_SHORTCUTS_MODAL: "?",
} as const;

export const SHORTCUTS_FOR_MODAL: { label: string; keys: string }[] = [
    { label: "Open shortkeys", keys: SHORTCUT_LABELS.OPEN_SHORTCUTS_MODAL },
    { label: "Toggle main sidebar", keys: SHORTCUT_LABELS.MAIN_SIDEBAR },
    { label: "Toggle secondary sidebar", keys: SHORTCUT_LABELS.SECONDARY_SIDEBAR },
    { label: "Focus chat input", keys: SHORTCUT_LABELS.FOCUS_CHAT },
    { label: "Previous conversations", keys: SHORTCUT_LABELS.OPEN_PREVIOUS_CONVERSATIONS },
];

const handlers: Handlers = {};
let attached = false;
let suspendDepth = 0;

export function suspendUnifiedKeyboard(): () => void {
    suspendDepth += 1;
    return () => {
        suspendDepth = Math.max(0, suspendDepth - 1);
    };
}

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
    return (
        el?.closest?.("[role='dialog'], [role='alertdialog'], [data-slot='tutorial-overlay']") != null
    );
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
        scope: UNIFIED_KEYBOARD_SCOPES.MAIN_SIDEBAR,
        match: (e) => (e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === "\\",
        allowInInput: true,
        allowInModal: true,
    },
    {
        scope: UNIFIED_KEYBOARD_SCOPES.SECONDARY_SIDEBAR,
        match: (e) => (e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "\\",
        allowInInput: true,
        allowInModal: true,
    },
    {
        scope: UNIFIED_KEYBOARD_SCOPES.FOCUS_CHAT,
        match: (e) => e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey,
        allowInInput: false,
        allowInModal: true,
    },
    {
        scope: UNIFIED_KEYBOARD_SCOPES.OPEN_PREVIOUS_CONVERSATIONS,
        match: (e) => (e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "o",
        allowInInput: true,
        allowInModal: false,
    },
];

function handleKeyDown(e: KeyboardEvent): void {
    if (suspendDepth > 0) return;

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

export function register(scope: UnifiedKeyboardScope, handler: Handler): void {
    handlers[scope] = handler;
    attach();
}

export function unregister(scope: UnifiedKeyboardScope): void {
    delete (handlers as Record<string, unknown>)[scope];
    const hasAny = Object.values(handlers).some((h) => h != null);
    if (!hasAny) detach();
}

export function findInScopeShortcutLabel(): string {
    if (typeof navigator === "undefined") return "Ctrl+F";
    return /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? "⌘F" : "Ctrl+F";
}

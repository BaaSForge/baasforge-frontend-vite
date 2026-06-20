import {
    TARGET_SPOTLIGHT_OVERLAY_ACTIONS_ID,
    TARGET_SPOTLIGHT_OVERLAY_CONTENT_ID,
} from "@/components/target-spotlight-overlay/constants";
import { type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";

export type SpotlightRoots = {
    content: Root | null;
    actions: Root | null;
};

type PendingSpotlightContent = {
    content: ReactNode;
    actions?: ReactNode;
};

let roots: SpotlightRoots = { content: null, actions: null };
let pending: PendingSpotlightContent | null = null;
let waitForHostsCleanup: (() => void) | null = null;

function getHostElement(id: string): HTMLElement | null {
    return document.getElementById(id);
}

function renderIntoHost(root: Root | null, host: HTMLElement | null, node: ReactNode): Root | null {
    if (host == null) {
        root?.unmount();
        return null;
    }

    const nextRoot = root ?? createRoot(host);
    nextRoot.render(node);
    return nextRoot;
}

function hostsReady(actions?: ReactNode): boolean {
    if (getHostElement(TARGET_SPOTLIGHT_OVERLAY_CONTENT_ID) == null) return false;
    if (actions != null && getHostElement(TARGET_SPOTLIGHT_OVERLAY_ACTIONS_ID) == null) return false;
    return true;
}

function renderPending(): boolean {
    if (pending == null) return false;
    if (!hostsReady(pending.actions)) return false;

    const contentHost = getHostElement(TARGET_SPOTLIGHT_OVERLAY_CONTENT_ID);
    const actionsHost = getHostElement(TARGET_SPOTLIGHT_OVERLAY_ACTIONS_ID);

    roots.content = renderIntoHost(
        roots.content,
        contentHost,
        <div className="px-4 py-3 pr-3 text-sm">{pending.content}</div>,
    );

    if (pending.actions == null) {
        roots.actions?.unmount();
        roots.actions = null;
    } else {
        roots.actions = renderIntoHost(
            roots.actions,
            actionsHost,
            <div className="flex items-center gap-1.5 border-t border-primary/10 px-3 pl-2 py-2">{pending.actions}</div>,
        );
    }

    return true;
}

function stopWaitingForHosts(): void {
    waitForHostsCleanup?.();
    waitForHostsCleanup = null;
}

function waitForHosts(): void {
    if (pending == null || renderPending()) {
        stopWaitingForHosts();
        return;
    }

    stopWaitingForHosts();

    const attempt = (): void => {
        if (pending == null || renderPending()) {
            stopWaitingForHosts();
        }
    };

    const observer = new MutationObserver(attempt);
    observer.observe(document.body, { childList: true, subtree: true });

    const frameId = window.requestAnimationFrame(attempt);
    const timeoutId = window.setTimeout(attempt, 0);

    waitForHostsCleanup = () => {
        observer.disconnect();
        window.cancelAnimationFrame(frameId);
        window.clearTimeout(timeoutId);
    };
}

export function setSpotlightContentToRender(content: ReactNode, actions?: ReactNode): void {
    pending = { content, actions };
    waitForHosts();
}

export function flushSpotlightContent(): void {
    if (pending == null) return;
    waitForHosts();
}

export function clearSpotlightContent(): void {
    pending = null;
    stopWaitingForHosts();
    roots.content?.unmount();
    roots.actions?.unmount();
    roots = { content: null, actions: null };
}

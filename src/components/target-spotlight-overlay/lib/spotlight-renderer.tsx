import {
    TARGET_SPOTLIGHT_OVERLAY_ACTIONS_ID,
    TARGET_SPOTLIGHT_OVERLAY_CONTENT_ID,
} from "@/components/target-spotlight-overlay/constants";
import { SpotlightPrevButton, SpotlightStopButton } from "@/components/target-spotlight-overlay/components/spotlight-actions";
import { onSpotlightContentHostsMounted } from "@/components/target-spotlight-overlay/lib/spotlight-content-hosts";
import { type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";

export type SpotlightRenderOptions = {
    showStopButton?: boolean;
    canGoToPreviousStep?: boolean;
};

export type SpotlightRoots = {
    content: Root | null;
    actions: Root | null;
};

type PendingSpotlightContent = {
    content: ReactNode;
    actions?: ReactNode;
    showStopButton?: boolean;
    canGoToPreviousStep?: boolean;
};

let roots: SpotlightRoots = { content: null, actions: null };
let boundHosts: { content: HTMLElement | null; actions: HTMLElement | null } = { content: null, actions: null };
let pending: PendingSpotlightContent | null = null;
let waitForHostsCleanup: (() => void) | null = null;

function getHostElement(id: string): HTMLElement | null {
    return document.getElementById(id);
}

function isConnectedHost(host: HTMLElement | null): host is HTMLElement {
    return host != null && host.isConnected;
}

function renderIntoHost(
    root: Root | null,
    host: HTMLElement | null,
    boundHost: HTMLElement | null,
    node: ReactNode,
): { root: Root | null; boundHost: HTMLElement | null } {
    if (!isConnectedHost(host)) {
        root?.unmount();
        return { root: null, boundHost: null };
    }

    if (root != null && boundHost !== host) {
        root.unmount();
        root = null;
    }

    const nextRoot = root ?? createRoot(host);
    nextRoot.render(node);
    return { root: nextRoot, boundHost: host };
}

function hostsReady(pendingContent: PendingSpotlightContent): boolean {
    if (!isConnectedHost(getHostElement(TARGET_SPOTLIGHT_OVERLAY_CONTENT_ID))) return false;
    if (pendingContent.showStopButton || pendingContent.actions != null) {
        if (!isConnectedHost(getHostElement(TARGET_SPOTLIGHT_OVERLAY_ACTIONS_ID))) return false;
    }
    return true;
}

function renderPending(): boolean {
    if (pending == null) return false;
    if (!hostsReady(pending)) return false;

    const contentHost = getHostElement(TARGET_SPOTLIGHT_OVERLAY_CONTENT_ID);
    const actionsHost = getHostElement(TARGET_SPOTLIGHT_OVERLAY_ACTIONS_ID);

    const contentResult = renderIntoHost(
        roots.content,
        contentHost,
        boundHosts.content,
        <div className="px-4 py-3 pr-3 text-sm">{pending.content}</div>,
    );
    roots.content = contentResult.root;
    boundHosts.content = contentResult.boundHost;

    if (pending.showStopButton || pending.actions != null) {
        const actionsResult = renderIntoHost(
            roots.actions,
            actionsHost,
            boundHosts.actions,
            <div className="flex items-center gap-1.5 border-t border-primary/10 px-3 pl-2 py-2">
                {pending.showStopButton ? (
                    <>
                        <SpotlightPrevButton disabled={!pending.canGoToPreviousStep} />
                        <SpotlightStopButton />
                    </>
                ) : null}
                {pending.actions != null ? <div className="ml-auto flex items-center gap-1.5">{pending.actions}</div> : null}
            </div>,
        );
        roots.actions = actionsResult.root;
        boundHosts.actions = actionsResult.boundHost;
    } else {
        roots.actions?.unmount();
        roots.actions = null;
        boundHosts.actions = null;
    }

    return true;
}

function stopWaitingForHosts(): void {
    waitForHostsCleanup?.();
    waitForHostsCleanup = null;
}

function waitForHosts(): void {
    if (pending == null) {
        stopWaitingForHosts();
        return;
    }

    if (renderPending()) {
        stopWaitingForHosts();
        return;
    }

    stopWaitingForHosts();

    const attempt = (): void => {
        if (pending == null) {
            stopWaitingForHosts();
            return;
        }
        if (renderPending()) {
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

export function setSpotlightContentToRender(
    content: ReactNode,
    actions?: ReactNode,
    options?: SpotlightRenderOptions,
): void {
    pending = {
        content,
        actions,
        showStopButton: options?.showStopButton ?? false,
        canGoToPreviousStep: options?.canGoToPreviousStep ?? false,
    };
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
    boundHosts = { content: null, actions: null };
}

onSpotlightContentHostsMounted(() => {
    if (pending != null) {
        waitForHosts();
    }
});

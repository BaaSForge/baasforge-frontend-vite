"use client";

import { appStateStore } from "@/modules/app-state/store";
import { useEffect, type RefObject } from "react";
import { SCALAR_TEST_REQUEST_BUTTON_SELECTOR } from "./use-tutorial-scalar-test-request-target";

const SCALAR_OVERLAY_SELECTOR = "body .scalar.scalar-app.z-overlay";
const SCALAR_OPEN_CLIENT_SELECTOR = `${SCALAR_OVERLAY_SELECTOR} .scalar-container.scalar-client--open`;

function isScalarOverlayVisible(): boolean {
    return document.querySelector(SCALAR_OPEN_CLIENT_SELECTOR) != null;
}

export function useScalarClientModalAppStateSync(
    rootRef: RefObject<HTMLElement | null>,
    unitId: string | undefined,
): void {
    useEffect(() => {
        if (unitId == null) return;

        const root = rootRef.current;
        if (root == null) return;

        let cleanupTestRequestClick: (() => void) | undefined;
        let buttonObserver: MutationObserver | undefined;

        const syncClosed = () => {
            const store = appStateStore.getState();
            if (store.scalarClientModalOpenUnitId !== unitId) return;
            store.setScalarClientModalOpenUnitId(null);
        };

        const syncOpened = () => {
            appStateStore.getState().setScalarClientModalOpenUnitId(unitId);
        };

        const syncVisibility = () => {
            if (isScalarOverlayVisible()) return;
            syncClosed();
        };

        const attachTestRequestListener = (): boolean => {
            const button = root.querySelector(SCALAR_TEST_REQUEST_BUTTON_SELECTOR);
            if (!(button instanceof HTMLButtonElement)) return false;
            const onClick = () => syncOpened();
            button.addEventListener("click", onClick);
            cleanupTestRequestClick = () => button.removeEventListener("click", onClick);
            return true;
        };

        if (!attachTestRequestListener()) {
            buttonObserver = new MutationObserver(() => {
                if (attachTestRequestListener()) buttonObserver?.disconnect();
            });
            buttonObserver.observe(root, { childList: true, subtree: true });
        }

        const overlayObserver = new MutationObserver(syncVisibility);
        overlayObserver.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["class"],
        });

        const onDismissClick = (event: MouseEvent) => {
            const target = event.target;
            if (!(target instanceof Element)) return;
            if (appStateStore.getState().scalarClientModalOpenUnitId !== unitId) return;

            if (target.closest("button.app-exit-button") || target.classList.contains("scalar-app-exit")) {
                queueMicrotask(syncVisibility);
            }
        };
        document.addEventListener("click", onDismissClick, true);

        return () => {
            buttonObserver?.disconnect();
            overlayObserver.disconnect();
            cleanupTestRequestClick?.();
            document.removeEventListener("click", onDismissClick, true);
            syncClosed();
        };
    }, [rootRef, unitId]);
}

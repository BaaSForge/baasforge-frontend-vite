"use client";

import { emitScalarTestRequestClicked } from "@/services/events";
import { useEffect, type RefObject } from "react";

export const SCALAR_TEST_REQUEST_BUTTON_SELECTOR = "button.show-api-client-button";

export function useTutorialScalarTestRequestTarget(
    rootRef: RefObject<HTMLElement | null>,
    tutorialScalarTestRequestTargetId?: string,
): void {
    useEffect(() => {
        if (tutorialScalarTestRequestTargetId == null) return;

        const root = rootRef.current;
        if (root == null) return;

        let cleanupClick: (() => void) | undefined;

        const attach = (): boolean => {
            const button = root.querySelector(SCALAR_TEST_REQUEST_BUTTON_SELECTOR);
            if (!(button instanceof HTMLButtonElement)) return false;
            if (button.id !== tutorialScalarTestRequestTargetId) {
                button.id = tutorialScalarTestRequestTargetId;
            }
            const onClick = () => emitScalarTestRequestClicked();
            button.addEventListener("click", onClick);
            cleanupClick = () => button.removeEventListener("click", onClick);
            return true;
        };

        if (attach()) {
            return () => cleanupClick?.();
        }

        const observer = new MutationObserver(() => {
            if (attach()) observer.disconnect();
        });
        observer.observe(root, { childList: true, subtree: true });

        return () => {
            observer.disconnect();
            cleanupClick?.();
        };
    }, [rootRef, tutorialScalarTestRequestTargetId]);
}

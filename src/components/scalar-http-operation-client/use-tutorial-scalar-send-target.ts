"use client";

import { emitScalarSendClicked } from "@/services/events";
import { useEffect } from "react";

export const SCALAR_SEND_BUTTON_SELECTOR = ".scalar.scalar-app.z-overlay button[data-addressbar-action='send']";

export function useTutorialScalarSendTarget(tutorialScalarSendTargetId?: string): void {
    useEffect(() => {
        if (tutorialScalarSendTargetId == null) return;

        let cleanupClick: (() => void) | undefined;

        const attach = (): boolean => {
            const button = document.querySelector(SCALAR_SEND_BUTTON_SELECTOR);
            if (!(button instanceof HTMLButtonElement)) return false;
            if (button.id !== tutorialScalarSendTargetId) {
                button.id = tutorialScalarSendTargetId;
            }
            const onClick = () => emitScalarSendClicked();
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
        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            observer.disconnect();
            cleanupClick?.();
        };
    }, [tutorialScalarSendTargetId]);
}

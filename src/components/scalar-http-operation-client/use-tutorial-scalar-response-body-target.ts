"use client";

import { useEffect } from "react";

export const SCALAR_RESPONSE_BODY_SECTION_SELECTOR =
    ".scalar.scalar-app.z-overlay .response-section-content-body";

function findScalarResponseBodySection(): HTMLElement | null {
    const section = document.querySelector(SCALAR_RESPONSE_BODY_SECTION_SELECTOR);
    return section instanceof HTMLElement ? section : null;
}

export function useTutorialScalarResponseBodyTarget(tutorialScalarResponseBodyTargetId?: string): void {
    useEffect(() => {
        if (tutorialScalarResponseBodyTargetId == null) return;

        const attach = (): boolean => {
            const section = findScalarResponseBodySection();
            if (section == null) return false;
            if (section.id !== tutorialScalarResponseBodyTargetId) {
                section.id = tutorialScalarResponseBodyTargetId;
            }
            return true;
        };

        if (attach()) return;

        const observer = new MutationObserver(() => {
            if (attach()) observer.disconnect();
        });
        observer.observe(document.body, { childList: true, subtree: true });

        return () => observer.disconnect();
    }, [tutorialScalarResponseBodyTargetId]);
}

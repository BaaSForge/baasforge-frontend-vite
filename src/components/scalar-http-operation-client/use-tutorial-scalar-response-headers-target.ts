"use client";

import { useEffect } from "react";

export const SCALAR_RESPONSE_HEADERS_SECTION_SELECTOR =
    ".scalar.scalar-app.z-overlay .response-section-content-headers";

function findScalarResponseHeadersSection(): HTMLElement | null {
    const sections = document.querySelectorAll(SCALAR_RESPONSE_HEADERS_SECTION_SELECTOR);
    for (const section of sections) {
        if (!(section instanceof HTMLElement)) continue;
        const button = section.querySelector("button[type='button']");
        if (button?.textContent?.includes("Response Headers")) return section;
    }
    return null;
}

export function useTutorialScalarResponseHeadersTarget(tutorialScalarResponseHeadersTargetId?: string): void {
    useEffect(() => {
        if (tutorialScalarResponseHeadersTargetId == null) return;

        const attach = (): boolean => {
            const section = findScalarResponseHeadersSection();
            if (section == null) return false;
            if (section.id !== tutorialScalarResponseHeadersTargetId) {
                section.id = tutorialScalarResponseHeadersTargetId;
            }
            return true;
        };

        if (attach()) return;

        const observer = new MutationObserver(() => {
            if (attach()) observer.disconnect();
        });
        observer.observe(document.body, { childList: true, subtree: true });

        return () => observer.disconnect();
    }, [tutorialScalarResponseHeadersTargetId]);
}

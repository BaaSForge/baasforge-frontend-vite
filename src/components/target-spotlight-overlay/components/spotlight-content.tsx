"use client";

import { type ReactNode } from "react";
import { createPortal } from "react-dom";
import { TARGET_SPOTLIGHT_OVERLAY_CONTENT_ID } from "../constants";
import { useElementById } from "../hooks/use-element-by-id";

type SpotlightContentProps = {
    children: ReactNode;
};

export function SpotlightContent({ children }: SpotlightContentProps) {
    const host = useElementById(TARGET_SPOTLIGHT_OVERLAY_CONTENT_ID, true);
    if (host == null) return null;

    const content = (
        <div className="px-4 py-3 pr-3 text-sm">
            {children}
        </div>
    );

    return createPortal(content, host);
}

"use client";

import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { events, triggerAppEvent } from "@/services/events";
import { type ReactNode } from "react";
import { createPortal } from "react-dom";
import { TARGET_SPOTLIGHT_OVERLAY_ACTIONS_ID } from "../constants";
import { useElementById } from "../hooks/use-element-by-id";

type SpotlightActionsProps = {
    children: ReactNode;
};

export function SpotlightActions({ children }: SpotlightActionsProps) {
    const host = useElementById(TARGET_SPOTLIGHT_OVERLAY_ACTIONS_ID, true);
    if (host == null) return null;
    return createPortal(
        <div className="flex items-center gap-1.5 border-t border-primary/10 px-3 pl-2 py-2">{children}</div>,
        host,
    );
}

export function SpotlightPrimaryActionButton({ className, onClick, type = "button", ...props }: ButtonProps) {
    return (
        <Button
            type={type}
            variant="default"
            size="xs"
            className={cn("ml-auto", className)}
            onClick={(event) => {
                triggerAppEvent(events.TUTORIAL_PRIMARY_ACTION_BUTTON_CLICKED);
                onClick?.(event);
            }}
            {...props}
        />
    );
}

export function SpotlightSecondaryActionButton({ className, ...props }: ButtonProps) {
    return (
        <Button
            variant="ghost"
            size="xs"
            className={className}
            {...props}
        />
    );
}

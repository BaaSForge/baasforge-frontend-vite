"use client";

import { Button, type ButtonProps } from "@/components/ui/button";
import { ConfirmableButton, type ConfirmableButtonProps } from "@/components/ui/confirmable-button";
import { cn } from "@/lib/utils";
import { events, triggerAppEvent } from "@/services/events";
import { Ban } from "lucide-react";
import { type ReactNode, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { TARGET_SPOTLIGHT_OVERLAY_ACTIONS_ID } from "../constants";
import { useElementById } from "../hooks/use-element-by-id";

const STOP_TUTORIAL_LABEL = (
    <>
        <Ban aria-hidden />
        Stop tutorial
    </>
);

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

export function SpotlightFillChatPromptButton({
    text,
    className,
    children = "Fill the prompt",
    ...props
}: ButtonProps & { text: string }) {
    return (
        <Button
            type="button"
            variant="default"
            size="xs"
            className={cn("ml-auto", className)}
            onClick={() => {
                triggerAppEvent(events.CHAT_COMPOSER_FILL_PROMPT_EVENT, { text });
            }}
            {...props}
        >
            {children}
        </Button>
    );
}

export function SpotlightStopButton({
    className,
    onClick,
    confirmationTooltip = "Re-click to stop the tutorial",
    confirmChildren = STOP_TUTORIAL_LABEL,
    children = STOP_TUTORIAL_LABEL,
    ...props
}: Omit<ConfirmableButtonProps, "onClick"> & {
    onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
    return (
        <ConfirmableButton
            type="button"
            variant="ghost"
            size="xs"
            className={cn("text-muted-foreground hover:text-foreground", className)}
            confirmationTooltip={confirmationTooltip}
            confirmationTooltipPlacement="bottom-start"
            confirmChildren={confirmChildren}
            onClick={(event) => {
                triggerAppEvent(events.TUTORIAL_STOP_BUTTON_CLICKED);
                onClick?.(event);
            }}
            {...props}
        >
            {children}
        </ConfirmableButton>
    );
}

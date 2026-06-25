"use client";

import { StatusPulseRingLayer } from "@/components/status-pulse-ring";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import * as React from "react";

const DEFAULT_CONFIRM_MS = 10_000;

function mergeRefs<T>(...refs: (React.Ref<T> | undefined)[]): React.RefCallback<T> {
    return (value) => {
        for (const r of refs) {
            if (r == null) continue;
            if (typeof r === "function") r(value);
            else (r as React.MutableRefObject<T | null>).current = value;
        }
    };
}

export type ConfirmableButtonProps = Omit<ButtonProps, "onClick"> & {
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
    confirmWithinMs?: number;
    confirmationTooltip?: React.ReactNode;
    confirmChildren?: React.ReactNode;
    confirmationTooltipPlacement?: "top" | "top-start" | "bottom" | "bottom-start";
};

function getConfirmationTooltipPlacement(placement: NonNullable<ConfirmableButtonProps["confirmationTooltipPlacement"]>): {
    side: "top" | "bottom";
    align: "center" | "start";
} {
    switch (placement) {
        case "top-start":
            return { side: "top", align: "start" };
        case "bottom":
            return { side: "bottom", align: "center" };
        case "bottom-start":
            return { side: "bottom", align: "start" };
        default:
            return { side: "top", align: "center" };
    }
}

export const ConfirmableButton = React.forwardRef<HTMLButtonElement, ConfirmableButtonProps>(function ConfirmableButton(
    {
        onClick,
        confirmWithinMs = DEFAULT_CONFIRM_MS,
        confirmationTooltip,
        confirmChildren,
        confirmationTooltipPlacement = "top",
        children,
        className,
        ...buttonProps
    },
    ref,
) {
    const [armed, setArmed] = React.useState(false);
    const timerRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const [pulseShape, setPulseShape] = React.useState<React.CSSProperties>({});

    React.useEffect(() => {
        return () => {
            if (timerRef.current != null) clearTimeout(timerRef.current);
        };
    }, []);

    React.useLayoutEffect(() => {
        if (!armed) {
            setPulseShape({});
            return;
        }
        const el = buttonRef.current;
        if (el == null) return;
        const sync = () => {
            const br = getComputedStyle(el).borderRadius;
            setPulseShape({ borderRadius: br || undefined });
        };
        sync();
        const ro = new ResizeObserver(sync);
        ro.observe(el);
        return () => ro.disconnect();
    }, [armed, className, buttonProps.size, buttonProps.variant, confirmChildren, children]);

    const disarmTimer = () => {
        if (timerRef.current != null) {
            clearTimeout(timerRef.current);
            timerRef.current = undefined;
        }
    };

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (!armed) {
            setArmed(true);
            disarmTimer();
            timerRef.current = setTimeout(() => {
                setArmed(false);
                timerRef.current = undefined;
            }, confirmWithinMs);
            return;
        }
        disarmTimer();
        setArmed(false);
        onClick(event);
    };

    const hasTooltip =
        confirmationTooltip != null &&
        confirmationTooltip !== false &&
        (typeof confirmationTooltip !== "string" || confirmationTooltip.length > 0);

    const showTip = armed && hasTooltip;
    const tooltipPlacement = getConfirmationTooltipPlacement(confirmationTooltipPlacement);

    const mergedRef = mergeRefs(ref, buttonRef);

    const pulseHost = (
        <div className="relative inline-flex shrink-0 overflow-visible">
            {armed ? <StatusPulseRingLayer className="z-0" style={pulseShape} /> : null}
            <Button ref={mergedRef} type="button" className={cn("relative z-[1]", className)} {...buttonProps} onClick={handleClick}>
                {armed ? (confirmChildren ?? children) : children}
            </Button>
        </div>
    );

    if (!hasTooltip) return pulseHost;

    return (
        <TooltipProvider delayDuration={0}>
            <Tooltip open={showTip} onOpenChange={() => undefined}>
                <TooltipTrigger asChild>{pulseHost}</TooltipTrigger>
                <TooltipContent side={tooltipPlacement.side} align={tooltipPlacement.align} sideOffset={6}>
                    {confirmationTooltip}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
});

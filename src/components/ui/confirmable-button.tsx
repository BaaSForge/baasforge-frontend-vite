"use client";

import { StatusPulseRingLayer } from "@/components/status-pulse-ring";
import { Button, type ButtonProps } from "@/components/ui/button";
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
};

export const ConfirmableButton = React.forwardRef<HTMLButtonElement, ConfirmableButtonProps>(function ConfirmableButton(
    { onClick, confirmWithinMs = DEFAULT_CONFIRM_MS, confirmationTooltip, confirmChildren, children, className, ...buttonProps },
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

    const mergedRef = mergeRefs(ref, buttonRef);

    const button = (
        <Button ref={mergedRef} type="button" className={cn("relative z-[1]", className)} {...buttonProps} onClick={handleClick}>
            {armed ? (confirmChildren ?? children) : children}
        </Button>
    );

    const pulseHost = (
        <div className="relative inline-flex shrink-0 overflow-visible">
            {armed ? <StatusPulseRingLayer className="z-0" style={pulseShape} /> : null}
            {button}
        </div>
    );

    if (!hasTooltip) return pulseHost;

    return (
        <div className="relative inline-flex shrink-0 flex-col items-center">
            {pulseHost}
            {showTip ? (
                <span
                    role="status"
                    aria-live="polite"
                    className={cn(
                        "pointer-events-none absolute bottom-full left-1/2 z-50 mb-1.5 w-max max-w-[14rem] -translate-x-1/2",
                        "border-border bg-background text-foreground rounded-md border px-3 py-1.5 text-center text-xs shadow-md",
                    )}
                >
                    {confirmationTooltip}
                </span>
            ) : null}
        </div>
    );
});

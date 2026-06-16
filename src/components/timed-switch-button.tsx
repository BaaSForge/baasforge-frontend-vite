"use client";

import { Button, type ButtonProps } from "@/components/ui/button";
import { useTimedSwitch } from "@/hooks/use-timed-switch";
import { cn } from "@/lib/utils";
import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

const DEFAULT_DURATION_SECONDS = 10;

export type TimedSwitchTurnOffReason = "click" | "timeout";

export type TimedSwitchButtonProps = Omit<ButtonProps, "onClick" | "children"> & {
    inactiveIcon?: ReactNode;
    activeIcon?: ReactNode;
    inactiveLabel?: ReactNode;
    activeLabel?: ReactNode;
    durationSeconds?: number;
    active?: boolean;
    defaultActive?: boolean;
    onActiveChange?: (active: boolean) => void;
    onTurnOn?: () => void;
    onTurnOff?: (reason: TimedSwitchTurnOffReason) => void;
    pending?: boolean;
};

function CircularCountdownRing({ durationSeconds, animationKey }: { durationSeconds: number; animationKey: number }) {
    const size = 24;
    const strokeWidth = 1;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    return (
        <svg
            aria-hidden
            className="pointer-events-none absolute inset-0 size-full -rotate-90 text-muted-foreground/40"
            viewBox={`0 0 ${size} ${size}`}
        >
            <circle
                key={animationKey}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={0}
                style={
                    {
                        "--timed-switch-ring-circumference": circumference,
                        animation: `timed-switch-ring ${durationSeconds}s linear forwards`,
                    } as CSSProperties
                }
            />
        </svg>
    );
}

export function TimedSwitchButton({
    inactiveIcon,
    activeIcon,
    inactiveLabel,
    activeLabel,
    durationSeconds = DEFAULT_DURATION_SECONDS,
    active,
    defaultActive,
    onActiveChange,
    onTurnOn,
    onTurnOff,
    className,
    disabled,
    pending = false,
    ...buttonProps
}: TimedSwitchButtonProps) {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const shouldRetainFocusRef = useRef(false);
    const [ringAnimationKey, setRingAnimationKey] = useState(0);
    const [prevValue, setPrevValue] = useState<boolean | undefined>(active ?? defaultActive);

    const { value, toggle } = useTimedSwitch({
        durationSeconds,
        initialValue: defaultActive,
        value: active,
        onValueChange: (next, context) => {
            onActiveChange?.(next);
            if (!next) {
                const reason = context?.reason === "timeout" ? "timeout" : "click";
                onTurnOff?.(reason);
            }
        },
    });

    if (value !== prevValue) {
        setPrevValue(value);
        if (value) {
            setRingAnimationKey((current) => current + 1);
        }
    }

    const isIconMode = inactiveIcon != null;
    const content = value
        ? (isIconMode ? (activeIcon ?? inactiveIcon) : (activeLabel ?? inactiveLabel))
        : (isIconMode ? inactiveIcon : inactiveLabel);

    const showRing = value;

    const isControlled = active !== undefined;
    const isInteractionBlocked = disabled || pending;

    const retainFocus = () => {
        shouldRetainFocusRef.current = true;
    };

    useLayoutEffect(() => {
        if (!shouldRetainFocusRef.current) return;
        buttonRef.current?.focus({ preventScroll: true });
        shouldRetainFocusRef.current = false;
    }, [value, active, inactiveIcon, activeIcon, inactiveLabel, activeLabel, pending]);

    const handleClick = () => {
        if (isInteractionBlocked) return;

        retainFocus();

        if (value) {
            toggle();
            return;
        }

        if (isControlled) {
            onTurnOn?.();
            return;
        }

        toggle();
        onTurnOn?.();
    };

    return (
        <div className="relative inline-flex shrink-0">
            {showRing ? <CircularCountdownRing durationSeconds={durationSeconds} animationKey={ringAnimationKey} /> : null}
            <Button
                ref={buttonRef}
                type="button"
                variant="ghost"
                size={isIconMode ? "icon-xs" : "xs"}
                className={cn("relative z-[1] rounded-full", pending && "pointer-events-none", className)}
                disabled={disabled}
                aria-busy={pending || undefined}
                onClick={handleClick}
                {...buttonProps}
            >
                {content}
            </Button>
        </div>
    );
}

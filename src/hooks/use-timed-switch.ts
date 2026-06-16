"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type TimedSwitchTurnOffReason = "manual" | "timeout";

type UseTimedSwitchOptions = {
    durationSeconds: number;
    initialValue?: boolean;
    value?: boolean;
    onValueChange?: (value: boolean, context?: { reason?: TimedSwitchTurnOffReason }) => void;
};

export function useTimedSwitch({
    durationSeconds,
    initialValue = false,
    value: controlledValue,
    onValueChange,
}: UseTimedSwitchOptions) {
    const [uncontrolledValue, setUncontrolledValue] = useState(initialValue);
    const [secondsLeft, setSecondsLeft] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : uncontrolledValue;

    const clearCountdown = useCallback(() => {
        if (intervalRef.current != null) {
            clearInterval(intervalRef.current);
            intervalRef.current = undefined;
        }
        if (timeoutRef.current != null) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = undefined;
        }
    }, []);

    const setValue = useCallback(
        (next: boolean, context?: { reason?: TimedSwitchTurnOffReason }) => {
            if (!isControlled) {
                setUncontrolledValue(next);
            }
            onValueChange?.(next, context);
        },
        [isControlled, onValueChange],
    );

    const deactivate = useCallback(
        (reason: TimedSwitchTurnOffReason = "manual") => {
            clearCountdown();
            setSecondsLeft(0);
            setValue(false, { reason });
        },
        [clearCountdown, setValue],
    );

    const activate = useCallback(() => {
        clearCountdown();
        setValue(true);
        setSecondsLeft(durationSeconds);
    }, [clearCountdown, durationSeconds, setValue]);

    const toggle = useCallback(() => {
        if (value) {
            deactivate();
            return;
        }
        activate();
    }, [activate, deactivate, value]);

    useEffect(() => {
        return () => clearCountdown();
    }, [clearCountdown]);

    useEffect(() => {
        if (!value) {
            clearCountdown();
            setSecondsLeft(0);
            return;
        }

        setSecondsLeft(durationSeconds);

        const startedAt = Date.now();

        timeoutRef.current = setTimeout(() => {
            timeoutRef.current = undefined;
            setSecondsLeft(0);
            setValue(false, { reason: "timeout" });
        }, durationSeconds * 1000);

        intervalRef.current = setInterval(() => {
            const elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
            const remaining = Math.max(0, durationSeconds - elapsedSeconds);
            setSecondsLeft(remaining);
        }, 250);

        return () => clearCountdown();
    }, [value, durationSeconds, clearCountdown, setValue]);

    return { value, secondsLeft, toggle, activate, deactivate };
}

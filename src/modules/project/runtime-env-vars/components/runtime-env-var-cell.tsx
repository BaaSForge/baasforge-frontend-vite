"use client";

import { CopyableEntityIdBadge } from "@/components/copyable-entity-id-badge";
import { TimedSwitchButton } from "@/components/timed-switch-button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { getApiErrorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { useCallback, useState } from "react";
import { revealRuntimeEnvVar } from "../api";

const REVEAL_DURATION_SECONDS = 10;

type RevealedState = { kind: "hidden" } | { kind: "revealed"; value: string | null } | { kind: "error"; message: string };

export type RuntimeEnvVarCellProps = {
    projectId: string;
    envKey: string;
    runtimeId: string;
    listValue: string | null;
    isEncrypted: boolean;
};

function CopyableEnvValue({ value, className }: { value: string; className?: string }) {
    return (
        <CopyableEntityIdBadge
            id={value}
            title="Click to copy value"
            className={cn("max-w-full sm:max-w-[14rem]", className)}
        />
    );
}

export function RuntimeEnvVarCell({ projectId, envKey, runtimeId, listValue, isEncrypted }: RuntimeEnvVarCellProps) {
    const [revealState, setRevealState] = useState<RevealedState>({ kind: "hidden" });
    const [isRevealing, setIsRevealing] = useState(false);

    const hide = useCallback(() => {
        setRevealState({ kind: "hidden" });
    }, []);

    const reveal = useCallback(async () => {
        setIsRevealing(true);
        try {
            const res = await revealRuntimeEnvVar(projectId, envKey, runtimeId);
            setRevealState({ kind: "revealed", value: res.value });
        } catch (error) {
            setRevealState({ kind: "error", message: getApiErrorMessage(error) });
        } finally {
            setIsRevealing(false);
        }
    }, [projectId, envKey, runtimeId]);

    const isRevealed = revealState.kind === "revealed";

    if (listValue === null) {
        return <span className="text-muted-foreground text-sm">Not set</span>;
    }

    if (listValue === "") {
        return (
            <Badge variant="outline" className="font-normal text-muted-foreground">
                Empty
            </Badge>
        );
    }

    if (!isEncrypted) {
        return <CopyableEnvValue value={listValue} />;
    }

    return (
        <div className="flex min-w-0 items-center gap-1.5">
            {isRevealed ? (
                revealState.value === null ? (
                    <span className="text-muted-foreground text-sm">Not set</span>
                ) : (
                    <CopyableEnvValue value={revealState.value} />
                )
            ) : (
                <span className="font-mono text-xs tracking-widest text-muted-foreground" aria-hidden>
                    ••••••
                </span>
            )}
            <TimedSwitchButton
                active={isRevealed}
                durationSeconds={REVEAL_DURATION_SECONDS}
                inactiveIcon={isRevealing ? <Spinner className="size-3.5" /> : <Eye className="size-3.5" />}
                activeIcon={<EyeOff className="size-3.5" />}
                onTurnOn={() => void reveal()}
                onTurnOff={() => hide()}
                pending={isRevealing}
                aria-label={isRevealed ? "Hide value" : "Reveal value"}
            />
            {revealState.kind === "error" ? (
                <span className="text-destructive text-xs" role="alert">
                    {revealState.message}
                </span>
            ) : null}
        </div>
    );
}

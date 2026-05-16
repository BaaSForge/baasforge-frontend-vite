"use client";

import { CopyableEntityIdBadge } from "@/components/copyable-entity-id-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { getApiErrorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { revealRuntimeEnvVar } from "../api";

const AUTO_HIDE_MS = 10_000;

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

function RevealedAutoHide({ children, onHide }: { children: ReactNode; onHide: () => void }) {
    const [isHovered, setIsHovered] = useState(false);
    const onHideRef = useRef(onHide);
    onHideRef.current = onHide;

    useEffect(() => {
        if (isHovered) return;
        const id = window.setTimeout(() => onHideRef.current(), AUTO_HIDE_MS);
        return () => window.clearTimeout(id);
    }, [isHovered]);

    return (
        <div
            className="flex min-w-0 items-center gap-1.5"
            onPointerEnter={() => setIsHovered(true)}
            onPointerLeave={() => setIsHovered(false)}
        >
            {children}
        </div>
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
        setRevealState({ kind: "hidden" });
        try {
            const res = await revealRuntimeEnvVar(projectId, envKey, runtimeId);
            setRevealState({ kind: "revealed", value: res.value });
        } catch (error) {
            setRevealState({ kind: "error", message: getApiErrorMessage(error) });
        } finally {
            setIsRevealing(false);
        }
    }, [projectId, envKey, runtimeId]);

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

    if (revealState.kind === "revealed") {
        if (revealState.value === null) {
            return (
                <RevealedAutoHide onHide={hide}>
                    <span className="text-muted-foreground text-sm">Not set</span>
                    <Button type="button" variant="ghost" size="icon-xs" onClick={hide} aria-label="Hide value">
                        <EyeOff className="size-3.5" />
                    </Button>
                </RevealedAutoHide>
            );
        }

        return (
            <RevealedAutoHide onHide={hide}>
                <CopyableEnvValue value={revealState.value} />
                <Button type="button" variant="ghost" size="icon-xs" onClick={hide} aria-label="Hide value">
                    <EyeOff className="size-3.5" />
                </Button>
            </RevealedAutoHide>
        );
    }

    return (
        <div className="flex min-w-0 items-center gap-1.5">
            <span className="font-mono text-xs tracking-widest text-muted-foreground" aria-hidden>
                ••••••
            </span>
            <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => void reveal()}
                disabled={isRevealing}
                aria-label="Reveal value"
            >
                {isRevealing ? <Spinner className="size-3.5" /> : <Eye className="size-3.5" />}
            </Button>
            {revealState.kind === "error" ? (
                <span className="text-destructive text-xs" role="alert">
                    {revealState.message}
                </span>
            ) : null}
        </div>
    );
}

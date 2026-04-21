"use client";

import type { ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";
import { useParams } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { FadedScrollArea } from "@/components/faded-scroll-area";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { QueryKeys } from "@/constants/query-keys";
import { cn } from "@/lib/utils";
import { UnitCardChip } from "@/modules/project";
import type { ProjectUnitResponse } from "@/modules/project/types";
import { postRejectControllerBoxReject } from "@/modules/project/api";
import type { RejectControllerBoxPayload } from "@/modules/project-chat/payloads";
import { ChatSessionRoleType, type ChatMessageWithDeliveryStatus } from "@/modules/project-chat/types";
import { useConversationSessionMessages } from "../conversation-session-messages-context";
import { useIsMessageScrollHighlighted } from "../sticky-messages";
import { ScrollHighlightOverlay } from "./scroll-highlight-overlay";

function getRejectControllerBoxPayload(message: ChatMessageWithDeliveryStatus): RejectControllerBoxPayload {
    const p = message.payload as RejectControllerBoxPayload | undefined | null;
    if (p == null || typeof p !== "object") return {};
    return p;
}

function readUnitChanges(payload: RejectControllerBoxPayload): ProjectUnitResponse[] {
    const raw = payload.unit_changes;
    if (!Array.isArray(raw)) return [];
    const out: ProjectUnitResponse[] = [];
    for (const item of raw) {
        if (item == null || typeof item !== "object" || Array.isArray(item)) continue;
        const id = (item as { id?: unknown }).id;
        if (typeof id !== "string" || id === "") continue;
        out.push(item as ProjectUnitResponse);
    }
    return out;
}

const ruleLineClass = "h-px min-w-6 flex-1 bg-border/50 dark:bg-border/40";

function RuleCenteredMessage({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <div className="flex w-full min-w-0 items-center gap-3 py-1">
            <div className={ruleLineClass} aria-hidden />
            <div className={cn("min-w-0 shrink px-2 text-center text-sm", className)}>{children}</div>
            <div className={ruleLineClass} aria-hidden />
        </div>
    );
}

export function RejectControllerBoxMessage({
    message,
    nestedMessages,
}: {
    message: ChatMessageWithDeliveryStatus;
    nestedMessages?: ReactNode;
}) {
    const { projectId, conversationId } = useParams<{ projectId: string; conversationId?: string }>();
    const chatSessionId = conversationId ?? undefined;
    const sessionMessages = useConversationSessionMessages();
    const hasUserMessageAfter = useMemo(() => {
        const i = sessionMessages.findIndex((m) => m.id === message.id);
        if (i < 0) return false;
        return sessionMessages.slice(i + 1).some((m) => m.role === ChatSessionRoleType.User);
    }, [sessionMessages, message.id]);
    const payload = useMemo(() => getRejectControllerBoxPayload(message), [message]);
    const isRejected = payload.is_rejected === true;
    const disabledDueToProductionRelease = payload.is_disabled_due_to_production_release === true;
    const unitChanges = useMemo(() => readUnitChanges(payload), [payload]);

    const [confirmOpen, setConfirmOpen] = useState(false);

    const queryClient = useQueryClient();
    const isScrollHighlight = useIsMessageScrollHighlighted(message.id);

    const rejectMutation = useMutation({
        mutationFn: () => {
            if (projectId == null || chatSessionId == null) throw new Error("Missing context");
            return postRejectControllerBoxReject(projectId, chatSessionId, message.id);
        },
        onSuccess: async () => {
            setConfirmOpen(false);
            // TODO: invalidate the stage releases
            toast.success("Changes for this step were rejected.", { position: "top-center" });
        },
    });

    const onConfirmReject = useCallback(() => {
        rejectMutation.mutate();
    }, [rejectMutation]);

    const canAttemptReject =
        !hasUserMessageAfter && !isRejected && !disabledDueToProductionRelease;

    const unitChangesRow =
        unitChanges.length > 0 ? (
            <FadedScrollArea
                orientation="horizontal"
                horizontalIntrinsicHeight
                hideScrollbar
                className="min-h-0 min-w-0 w-full max-w-full"
                faderFromClassName="from-background"
            >
                <div className="flex w-max min-w-0 flex-nowrap items-stretch gap-2 py-0.5 pr-1">
                    {unitChanges.map((unit) => (
                        <UnitCardChip
                            key={`${unit.id}-${unit.revision}`}
                            unit={unit}
                            projectId={projectId}
                            chatSessionId={chatSessionId}
                            className="w-[11rem] shrink-0"
                        />
                    ))}
                </div>
            </FadedScrollArea>
        ) : null;

    const mainBlock =
        isRejected ? (
            <RuleCenteredMessage className="font-medium text-destructive">
                You have rejected these changes for this step.
            </RuleCenteredMessage>
        ) : hasUserMessageAfter ? null : disabledDueToProductionRelease ? (
            <RuleCenteredMessage className="text-muted-foreground">
                You cannot reject these changes because a production release already exists for this scope.
            </RuleCenteredMessage>
        ) : (
            <div className="relative w-full min-w-0 overflow-hidden py-2">
                <ScrollHighlightOverlay
                    show={isScrollHighlight}
                    className="rounded-lg bg-rose-400/12 dark:bg-rose-400/10"
                />
                <div className="relative z-[1] flex w-full min-w-0 flex-nowrap items-center gap-3">
                    <p className="min-w-0 max-w-[min(100%,70%)] shrink text-right text-sm text-muted-foreground">
                        <span className="sm:hidden">Reject changes?</span>
                        <span className="hidden sm:inline">You can reject changes for this step.</span>
                    </p>
                    <div className="h-px min-w-8 flex-1 self-center bg-border" aria-hidden />
                    <Button
                        type="button"
                        variant="destructive"
                        size="xs"
                        className="shrink-0"
                        disabled={!canAttemptReject || rejectMutation.isPending}
                        onClick={() => setConfirmOpen(true)}
                    >
                        Reject changes
                    </Button>
                </div>
            </div>
        );

    return (
        <>
            <div className="mb-4 w-full min-w-0 max-w-full">
                {mainBlock}
                {unitChangesRow != null ? (
                    <div className={cn("min-w-0", mainBlock != null && "mt-2")}>{unitChangesRow}</div>
                ) : null}
            </div>

            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reject changes from this step?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Rejecting will permanently discard the changes introduced by this step. This action cannot be undone.
                            Any stage releases tied to this step will be removed, and the runtime will be disconnected.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={rejectMutation.isPending}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className={buttonVariants({ variant: "destructive" })}
                            onClick={(e) => {
                                e.preventDefault();
                                onConfirmReject();
                            }}
                            disabled={rejectMutation.isPending}
                        >
                            {rejectMutation.isPending ? (
                                <>
                                    <Spinner className="size-3" aria-hidden />
                                    Rejecting…
                                </>
                            ) : (
                                "Reject"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {nestedMessages}
        </>
    );
}

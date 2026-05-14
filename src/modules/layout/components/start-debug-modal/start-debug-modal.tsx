"use client";

import * as React from "react";
import { CheckCircle2, FlaskConical, Loader2, Play, Rocket } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { useDebounce } from "use-debounce";

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
import {
    CentricModal,
    CentricModalContent,
    CentricModalFooter,
    CentricModalHeader,
    CentricModalTitle,
} from "@/components/ui/centric-modal";
import { Button } from "@/components/ui/button";
import { FreeformMultiCombobox } from "@/components/ui/freeform-multi-combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { getApiErrorMessage } from "@/lib/errors";
import { useProjectLiveReleaseByRevisionQuery, useProjectTracesByIdsQuery } from "@/modules/project/queries";
import type { ReleaseResponse } from "@/modules/project/types";
import { PlatformEnvironmentType } from "@/modules/project/types";

import { StartDebugModalBgIllustration } from "./start-debug-modal-bg";

type StartDebugModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

const SAMPLE_RELEASE_ERROR = "";
const RELEASE_LOOKUP_DEBOUNCE_MS = 1000;
const TRACE_LOOKUP_DEBOUNCE_MS = 1000;
const PADDINGS = "md:pb-4 md:pt-6";

function parseRevisionForLookup(trimmed: string): number | undefined {
    if (!trimmed) return undefined;
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : undefined;
}

/** True when the user is already in a specific chat and navigation would move them away from it. */
function shouldConfirmLeavingCurrentChat(params: {
    currentConversationId: string | undefined;
    releaseEnv: "production" | "stage";
    targetStageSessionId: string | undefined;
}): boolean {
    const current = params.currentConversationId?.trim();
    if (!current) return false;
    if (params.releaseEnv === "production") {
        return true;
    }
    const target = params.targetStageSessionId?.trim() ?? "";
    if (!target) return false;
    return current !== target;
}

type TraceConsensus =
    | { ok: true; release: ReleaseResponse; traceIdsForPayload: string[] }
    | { ok: false; message: string };

function computeTraceConsensus(entries: { traceId: string; release?: ReleaseResponse | null }[] | undefined): TraceConsensus | null {
    if (!entries || entries.length === 0) return null;
    const releaseIds = entries.map((e) => e.release?.id ?? null);
    if (releaseIds.some((id) => id == null)) {
        return { ok: false, message: "Each trace must be linked to a release." };
    }
    const first = releaseIds[0]!;
    if (releaseIds.some((id) => id !== first)) {
        return { ok: false, message: "you can only add the traces from the same release (stage or production)" };
    }
    const release = entries[0]!.release!;
    if (release.is_stage) {
        const sid = release.chat_session_id?.trim() ?? "";
        if (!sid) {
            return { ok: false, message: "This stage release has no linked conversation." };
        }
    }
    return { ok: true, release, traceIdsForPayload: entries.map((e) => e.traceId) };
}

export function StartDebugModal({ open, onOpenChange }: StartDebugModalProps) {
    const { projectId, conversationId: currentConversationId } = useParams<{
        projectId?: string;
        conversationId?: string;
    }>();
    const navigate = useNavigate();

    const [leaveChatConfirm, setLeaveChatConfirm] = React.useState<{
        path: string;
        releaseEnv: "production" | "stage";
    } | null>(null);

    const [traceIds, setTraceIds] = React.useState<string[]>([]);
    const [releaseEnv, setReleaseEnv] = React.useState<"production" | "stage">("stage");
    const [releaseRevision, setReleaseRevision] = React.useState("");
    const releaseRevisionInputRef = React.useRef<HTMLInputElement>(null);

    const focusReleaseRevisionInput = React.useCallback(() => {
        window.setTimeout(() => releaseRevisionInputRef.current?.focus(), 0);
    }, []);

    React.useEffect(() => {
        if (!open) return;
        setTraceIds([]);
        setReleaseEnv("stage");
        setReleaseRevision("");
        setLeaveChatConfirm(null);
    }, [open]);

    const traceIdsNormalized = React.useMemo(
        () => traceIds.map((t) => t.trim()).filter((t) => t !== ""),
        [traceIds],
    );
    const [debouncedTraceIds] = useDebounce(traceIdsNormalized, TRACE_LOOKUP_DEBOUNCE_MS);
    const traceParsingIdle = traceIdsNormalized.join("\u0000") === debouncedTraceIds.join("\u0000");

    const tracesQuery = useProjectTracesByIdsQuery(projectId, debouncedTraceIds);

    const platformEnvironment =
        releaseEnv === "production" ? PlatformEnvironmentType.prod : PlatformEnvironmentType.stage;

    const revisionTrimmed = releaseRevision.trim();
    const [debouncedRevision] = useDebounce(revisionTrimmed, RELEASE_LOOKUP_DEBOUNCE_MS);
    const revisionForQuery = React.useMemo(() => {
        if (!revisionTrimmed) return undefined;
        // Do not query while the current input is invalid — debounced value may still be a stale valid number.
        if (parseRevisionForLookup(revisionTrimmed) === undefined) return undefined;
        return parseRevisionForLookup(debouncedRevision);
    }, [revisionTrimmed, debouncedRevision]);

    const releaseQuery = useProjectLiveReleaseByRevisionQuery(projectId, platformEnvironment, revisionForQuery);

    const revisionParsingIdle = revisionTrimmed === "" || revisionTrimmed === debouncedRevision;
    const releaseInputLoading = releaseQuery.isFetching || !revisionParsingIdle;

    type ReleaseFeedback =
        | null
        | { kind: "text"; tone: "destructive"; message: string }
        | { kind: "release-available" };

    const releaseFeedback = React.useMemo((): ReleaseFeedback => {
        if (!revisionTrimmed) {
            return { kind: "text", tone: "destructive", message: SAMPLE_RELEASE_ERROR };
        }
        const parsedNow = parseRevisionForLookup(revisionTrimmed);
        if (parsedNow === undefined) {
            return { kind: "text", tone: "destructive", message: "Enter a valid release revision." };
        }
        if (!projectId) {
            return { kind: "text", tone: "destructive", message: "Open this modal from a project to look up a release." };
        }
        if (releaseQuery.isError) {
            return { kind: "text", tone: "destructive", message: getApiErrorMessage(releaseQuery.error) };
        }
        if (!revisionParsingIdle || releaseQuery.isFetching) {
            return null;
        }
        if (releaseQuery.data) {
            return { kind: "release-available" };
        }
        return null;
    }, [
        revisionTrimmed,
        projectId,
        releaseQuery.isError,
        releaseQuery.error,
        releaseQuery.isFetching,
        releaseQuery.data,
        revisionParsingIdle,
    ]);

    const traceConsensus = React.useMemo(
        () => (tracesQuery.isSuccess ? computeTraceConsensus(tracesQuery.data) : null),
        [tracesQuery.isSuccess, tracesQuery.data],
    );

    const traceInputLoading = debouncedTraceIds.length > 0 && (!traceParsingIdle || tracesQuery.isFetching);

    const traceServerError =
        debouncedTraceIds.length > 0 && traceParsingIdle && !tracesQuery.isFetching && tracesQuery.isError
            ? getApiErrorMessage(tracesQuery.error)
            : null;

    const traceClientError =
        debouncedTraceIds.length > 0 && traceParsingIdle && !tracesQuery.isFetching && tracesQuery.isSuccess && traceConsensus && !traceConsensus.ok
            ? traceConsensus.message
            : null;

    type TraceFeedback =
        | null
        | { kind: "text"; tone: "destructive"; message: string }
        | { kind: "traces-available" };

    const traceFeedback = React.useMemo((): TraceFeedback => {
        if (debouncedTraceIds.length === 0) return null;
        if (traceInputLoading) return null;
        if (traceServerError) return { kind: "text", tone: "destructive", message: traceServerError };
        if (traceClientError) return { kind: "text", tone: "destructive", message: traceClientError };
        if (traceConsensus?.ok) return { kind: "traces-available" };
        return null;
    }, [debouncedTraceIds.length, traceInputLoading, traceServerError, traceClientError, traceConsensus]);

    const resolvedRelease = releaseQuery.data ?? null;
    const stageChatSessionId = resolvedRelease?.chat_session_id?.trim() ?? "";
    const canStartWithRelease =
        resolvedRelease !== null && (releaseEnv === "production" || stageChatSessionId.length > 0);

    const canStartWithTraces =
        debouncedTraceIds.length > 0 &&
        traceParsingIdle &&
        !tracesQuery.isFetching &&
        tracesQuery.isSuccess &&
        traceConsensus?.ok === true;

    const tracesAttempted = debouncedTraceIds.length > 0;
    const canNavigate = tracesAttempted ? canStartWithTraces : canStartWithRelease;

    const performNavigateToDebug = React.useCallback(
        (path: string) => {
            navigate(path);
            onOpenChange(false);
            setLeaveChatConfirm(null);
        },
        [navigate, onOpenChange],
    );

    const handleStartWithRelease = () => {
        if (!projectId || !resolvedRelease) return;
        if (releaseEnv === "production") {
            const payload = {
                environment: PlatformEnvironmentType.prod,
                release_id: resolvedRelease.id,
                release_revision: String(resolvedRelease.revision),
            };
            const path = `/dashboard/projects/${projectId}/conversations?debug=${encodeURIComponent(JSON.stringify(payload))}`;
            if (
                shouldConfirmLeavingCurrentChat({
                    currentConversationId,
                    releaseEnv: "production",
                    targetStageSessionId: undefined,
                })
            ) {
                setLeaveChatConfirm({ path, releaseEnv: "production" });
                return;
            }
            performNavigateToDebug(path);
        } else {
            const sessionId = resolvedRelease.chat_session_id?.trim();
            if (!sessionId) return;
            const payload = {
                environment: PlatformEnvironmentType.stage,
                release_id: resolvedRelease.id,
                release_revision: String(resolvedRelease.revision),
            };
            const path = `/dashboard/projects/${projectId}/conversations/${sessionId}?debug=${encodeURIComponent(JSON.stringify(payload))}`;
            if (
                shouldConfirmLeavingCurrentChat({
                    currentConversationId,
                    releaseEnv: "stage",
                    targetStageSessionId: sessionId,
                })
            ) {
                setLeaveChatConfirm({ path, releaseEnv: "stage" });
                return;
            }
            performNavigateToDebug(path);
        }
    };

    const handleStartWithTraces = () => {
        if (!projectId || traceConsensus?.ok !== true) return;
        const { release, traceIdsForPayload } = traceConsensus;
        const environment = release.is_stage ? PlatformEnvironmentType.stage : PlatformEnvironmentType.prod;
        const payload = {
            environment,
            release_id: release.id,
            release_revision: String(release.revision),
            traceIDs: traceIdsForPayload.join(","),
        };
        if (!release.is_stage) {
            const path = `/dashboard/projects/${projectId}/conversations?debug=${encodeURIComponent(JSON.stringify(payload))}`;
            if (
                shouldConfirmLeavingCurrentChat({
                    currentConversationId,
                    releaseEnv: "production",
                    targetStageSessionId: undefined,
                })
            ) {
                setLeaveChatConfirm({ path, releaseEnv: "production" });
                return;
            }
            performNavigateToDebug(path);
        } else {
            const sessionId = release.chat_session_id?.trim();
            if (!sessionId) return;
            const path = `/dashboard/projects/${projectId}/conversations/${sessionId}?debug=${encodeURIComponent(JSON.stringify(payload))}`;
            if (
                shouldConfirmLeavingCurrentChat({
                    currentConversationId,
                    releaseEnv: "stage",
                    targetStageSessionId: sessionId,
                })
            ) {
                setLeaveChatConfirm({ path, releaseEnv: "stage" });
                return;
            }
            performNavigateToDebug(path);
        }
    };

    const handleLetsStart = () => {
        if (tracesAttempted) {
            handleStartWithTraces();
        } else {
            handleStartWithRelease();
        }
    };

    return (
        <>
            <AlertDialog
                open={leaveChatConfirm != null}
                onOpenChange={(next) => {
                    if (!next) setLeaveChatConfirm(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {leaveChatConfirm?.releaseEnv === "production"
                                ? "Leave this conversation?"
                                : "Switch to the linked chat?"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {leaveChatConfirm?.releaseEnv === "production" ? (
                                <>
                                    Production debug opens a new chat with this release / traces attached. You will leave
                                    the chat you are viewing now.
                                </>
                            ) : (
                                <>
                                    This stage release is wired to a different conversation than the one you have open. We will take
                                    you there so traces and release context match what you are debugging.
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            type="button"
                            onClick={() => {
                                if (leaveChatConfirm) performNavigateToDebug(leaveChatConfirm.path);
                            }}
                        >
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <CentricModal open={open} onOpenChange={onOpenChange}>
                <CentricModalContent
                    className="w-full max-w-[calc(100%-2rem)] gap-0 overflow-hidden p-0 sm:max-w-5xl"
                    bodyScroll={false}
                    showCloseButton
                    decorator={<StartDebugModalBgIllustration />}
                >
                    <CentricModalHeader className="bg-transparent">
                        <CentricModalTitle>Start Debug</CentricModalTitle>
                    </CentricModalHeader>
                    <div className="flex w-full min-h-0 flex-1 flex-col justify-start sm:justify-center md:py-10">
                        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-stretch sm:gap-x-6 sm:gap-y-0">
                            <div className={`flex min-w-0 flex-col gap-3 ${PADDINGS}`}>
                                <div className="flex h-7 min-h-7 shrink-0 items-center justify-between gap-2">
                                    <Label className="text-muted-foreground shrink-0 text-xs font-medium">by release</Label>
                                    <ToggleGroup
                                        type="single"
                                        value={releaseEnv}
                                        onValueChange={(v) => {
                                            if (v === "production" || v === "stage") {
                                                setReleaseEnv(v);
                                                focusReleaseRevisionInput();
                                            }
                                        }}
                                        variant="outline"
                                        size="sm"
                                        className="shrink-0"
                                    >
                                        <ToggleGroupItem
                                            value="stage"
                                            className="h-7 min-h-7 gap-1 px-2 text-xs"
                                            onClick={focusReleaseRevisionInput}
                                        >
                                            <FlaskConical className="size-3 shrink-0" aria-hidden />
                                            stage
                                        </ToggleGroupItem>
                                        <ToggleGroupItem
                                            value="production"
                                            className="h-7 min-h-7 gap-1 px-2 text-xs"
                                            onClick={focusReleaseRevisionInput}
                                        >
                                            <Rocket className="size-3 shrink-0" aria-hidden />
                                            production
                                        </ToggleGroupItem>
                                    </ToggleGroup>
                                </div>
                                <div className="relative w-full">
                                    <Input
                                        ref={releaseRevisionInputRef}
                                        value={releaseRevision}
                                        onChange={(e) => setReleaseRevision(e.target.value)}
                                        placeholder="release revision e.g. 1.0"
                                        className="w-full pr-9"
                                        autoComplete="off"
                                        aria-busy={releaseInputLoading}
                                    />
                                    {releaseInputLoading ? (
                                        <Loader2
                                            className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin"
                                            aria-hidden
                                        />
                                    ) : null}
                                </div>
                                <div className="min-h-[2.75rem] shrink-0">
                                    {releaseFeedback?.kind === "text" ? (
                                        <p className="text-destructive text-sm leading-snug" role="alert">
                                            {releaseFeedback.message}
                                        </p>
                                    ) : null}
                                    {releaseFeedback?.kind === "release-available" ? (
                                        <div className="text-green-600 dark:text-green-500 flex items-start gap-2 text-sm leading-snug">
                                            <CheckCircle2 className="size-4 shrink-0 translate-y-px" aria-hidden />
                                            <span>The release is available.</span>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                            <div
                                role="separator"
                                aria-hidden
                                className="border-border h-0 w-full shrink-0 border-t border-dashed sm:hidden"
                            />
                            <div
                                role="separator"
                                aria-hidden
                                className="border-border hidden w-0 shrink-0 self-stretch border-l border-dashed sm:block"
                            />
                            <div className={`flex flex-col gap-3 ${PADDINGS}`}>
                                <FreeformMultiCombobox
                                    id="start-debug-trace-ids"
                                    label="by trace id"
                                    placeholder="Trace id, press Enter to add multiple"
                                    value={traceIds}
                                    onValueChange={setTraceIds}
                                    className="gap-3"
                                    chipsClassName="min-h-9 items-center"
                                    labelRowClassName="flex h-7 shrink-0 items-center"
                                    chipsEnd={
                                        traceInputLoading ? (
                                            <Loader2
                                                className="text-muted-foreground size-4 shrink-0 animate-spin"
                                                aria-hidden
                                            />
                                        ) : null
                                    }
                                />
                                <div className="min-h-[2.75rem] shrink-0">
                                    {traceFeedback?.kind === "text" ? (
                                        <p className="text-destructive text-sm leading-snug" role="alert">
                                            {traceFeedback.message}
                                        </p>
                                    ) : null}
                                    {traceFeedback?.kind === "traces-available" ? (
                                        <div className="text-green-600 dark:text-green-500 flex items-start gap-2 text-sm leading-snug">
                                            <CheckCircle2 className="size-4 shrink-0 translate-y-px" aria-hidden />
                                            <span>Traces loaded.</span>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </div>
                    <CentricModalFooter className="flex flex-col items-stretch gap-2">
                        <Button
                            type="button"
                            size="default"
                            disabled={!canNavigate}
                            className="h-11 w-full gap-2.5 text-base"
                            onClick={handleLetsStart}
                        >
                            <Play className="size-4 shrink-0" aria-hidden />
                            let&apos;s start
                        </Button>
                    </CentricModalFooter>
                </CentricModalContent>
            </CentricModal>
        </>
    );
}

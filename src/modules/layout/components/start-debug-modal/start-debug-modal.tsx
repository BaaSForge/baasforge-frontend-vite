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
import { useProjectLiveReleaseByRevisionQuery } from "@/modules/project/queries";
import { PlatformEnvironmentType } from "@/modules/project/types";

import { StartDebugModalBgIllustration } from "./start-debug-modal-bg";

type StartDebugModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

const SAMPLE_TRACE_ERROR = "";
const SAMPLE_RELEASE_ERROR = "";
const RELEASE_LOOKUP_DEBOUNCE_MS = 1000;
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
    const [traceError, setTraceError] = React.useState<string | null>(SAMPLE_TRACE_ERROR);

    React.useEffect(() => {
        if (!open) return;
        setTraceIds([]);
        setReleaseEnv("stage");
        setReleaseRevision("");
        setTraceError(SAMPLE_TRACE_ERROR);
        setLeaveChatConfirm(null);
    }, [open]);

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

    const revisionParsingIdle =
        revisionTrimmed === "" || revisionTrimmed === debouncedRevision;
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

    const resolvedRelease = releaseQuery.data ?? null;
    const stageChatSessionId = resolvedRelease?.chat_session_id?.trim() ?? "";
    const canStartWithRelease =
        resolvedRelease !== null &&
        (releaseEnv === "production" || stageChatSessionId.length > 0);

    const performNavigateToDebug = React.useCallback(
        (path: string) => {
            navigate(path);
            onOpenChange(false);
            setLeaveChatConfirm(null);
        },
        [navigate, onOpenChange],
    );

    const handleStart = () => {
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
                                    Production debug opens from the conversations list with this release attached. You will leave
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
                            />
                            <div className="min-h-[2.75rem] shrink-0">
                                {traceError ? (
                                    <p className="text-destructive text-sm leading-snug" role="alert">
                                        {traceError}
                                    </p>
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
                        <div className={`flex min-w-0 flex-col gap-3 ${PADDINGS}`}>
                            <div className="flex h-7 min-h-7 shrink-0 items-center justify-between gap-2">
                                <Label className="text-muted-foreground shrink-0 text-xs font-medium">by release</Label>
                                <ToggleGroup
                                    type="single"
                                    value={releaseEnv}
                                    onValueChange={(v) => {
                                        if (v === "production" || v === "stage") setReleaseEnv(v);
                                    }}
                                    variant="outline"
                                    size="sm"
                                    className="shrink-0"
                                >
                                    <ToggleGroupItem value="stage" className="h-7 min-h-7 gap-1 px-2 text-xs">
                                        <FlaskConical className="size-3 shrink-0" aria-hidden />
                                        stage
                                    </ToggleGroupItem>
                                    <ToggleGroupItem value="production" className="h-7 min-h-7 gap-1 px-2 text-xs">
                                        <Rocket className="size-3 shrink-0" aria-hidden />
                                        production
                                    </ToggleGroupItem>
                                </ToggleGroup>
                            </div>
                            <div className="relative w-full">
                                <Input
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
                    </div>
                </div>
                <CentricModalFooter className="flex flex-col items-stretch gap-2">
                    <Button
                        type="button"
                        size="default"
                        disabled={!canStartWithRelease}
                        className="h-11 w-full gap-2.5 text-base"
                        onClick={handleStart}
                    >
                        <Play className="size-4 shrink-0" aria-hidden />
                        let's start
                    </Button>
                </CentricModalFooter>
            </CentricModalContent>
        </CentricModal>
        </>
    );
}

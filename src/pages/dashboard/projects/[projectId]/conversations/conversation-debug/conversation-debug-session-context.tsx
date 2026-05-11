import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { PlatformEnvironmentType } from "@/modules/project/types";
import type { CreateProjectChatSessionMessageDebugContext } from "@/modules/project-chat/types";
import { BugPlay, Check } from "lucide-react";
import * as React from "react";
import { startTransition, useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useParams, useSearchParams } from "react-router";

import { debugToolbarActiveToneClassName } from "./debug-toolbar-button-classes";
import {
    type ConversationDebugFromUrl,
    isConversationDebugDisabledInSearch,
    parseConversationDebugFromSearch,
} from "./parse-conversation-debug-search";

type ConversationDebugSessionContextValue = {
    /** Parsed `debug` query when present and valid. */
    parsedFromUrl: ConversationDebugFromUrl | null;
    /** `debug_disabled=1` in the URL. */
    isUrlMarkedDisabled: boolean;
    /** Include release in API calls for new user messages. */
    isDebugSendActive: boolean;
    /** Shown on the composer debug control (e.g. `debug: release 1.1 stage`). */
    composerDebugLabel: string | null;
    /** Classes for the active (orange) composer control — same tone as sidebar Debug. */
    debugActiveButtonClassName: string;
    /** Turn attaching this release to outgoing messages on or off (updates `debug_disabled` in the URL). */
    setDebugSendActive: (active: boolean) => void;
};

const ConversationDebugSessionContext = React.createContext<ConversationDebugSessionContextValue | null>(null);

function environmentDisplayName(environment: PlatformEnvironmentType): string {
    return environment === PlatformEnvironmentType.prod ? "production" : "stage";
}

function buildComposerDebugLabel(parsed: ConversationDebugFromUrl): string {
    const env = environmentDisplayName(parsed.environment);
    const revPart =
        parsed.release_revision != null && parsed.release_revision !== ""
            ? parsed.release_revision
            : `#${parsed.release_id.slice(0, 8)}`;
    return `debug: release ${revPart} ${env}`;
}

function disclaimerStorageKey(projectId: string, conversationId: string | undefined, releaseId: string): string {
    return `baal:conversation-debug-disclaimer:${projectId}:${conversationId ?? "new"}:${releaseId}`;
}

export function ConversationDebugSessionProvider({ children }: { children: React.ReactNode }) {
    const { search } = useLocation();
    const [, setSearchParams] = useSearchParams();
    const { conversationId, projectId } = useParams<{ conversationId?: string; projectId: string }>();

    const [disclaimerOpen, setDisclaimerOpen] = useState(false);

    const parsedFromUrl = useMemo(() => parseConversationDebugFromSearch(search), [search]);
    const isUrlMarkedDisabled = useMemo(() => isConversationDebugDisabledInSearch(search), [search]);

    const isDebugSendActive = parsedFromUrl != null && !isUrlMarkedDisabled;

    const composerDebugLabel = parsedFromUrl != null ? buildComposerDebugLabel(parsedFromUrl) : null;

    const setDebugSendActive = useCallback(
        (active: boolean) => {
            setSearchParams(
                (prev) => {
                    const next = new URLSearchParams(prev);
                    if (active) {
                        next.delete("debug_disabled");
                    } else {
                        next.set("debug_disabled", "1");
                    }
                    return next;
                },
                { replace: true },
            );
        },
        [setSearchParams],
    );

    useEffect(() => {
        startTransition(() => {
            if (!parsedFromUrl || isUrlMarkedDisabled) {
                setDisclaimerOpen(false);
                return;
            }
            const key = disclaimerStorageKey(projectId ?? "", conversationId, parsedFromUrl.release_id);
            if (sessionStorage.getItem(key)) return;
            setDisclaimerOpen(true);
        });
    }, [parsedFromUrl, isUrlMarkedDisabled, conversationId, projectId]);

    const persistDisclaimerSeen = useCallback(() => {
        if (!parsedFromUrl) return;
        sessionStorage.setItem(
            disclaimerStorageKey(projectId ?? "", conversationId, parsedFromUrl.release_id),
            "1",
        );
    }, [parsedFromUrl, conversationId, projectId]);

    const value = useMemo(
        (): ConversationDebugSessionContextValue => ({
            parsedFromUrl,
            isUrlMarkedDisabled,
            isDebugSendActive,
            composerDebugLabel,
            debugActiveButtonClassName: debugToolbarActiveToneClassName,
            setDebugSendActive,
        }),
        [parsedFromUrl, isUrlMarkedDisabled, isDebugSendActive, composerDebugLabel, setDebugSendActive],
    );

    return (
        <>
            <AlertDialog open={disclaimerOpen} onOpenChange={setDisclaimerOpen}>
                <AlertDialogContent className="sm:max-w-xl" onClick={(e) => e.stopPropagation()}>
                    <AlertDialogHeader className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:gap-8 sm:text-left">
                        <div
                            className={cn(
                                "flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md",
                                "from-orange-500 to-orange-700 ring-1 ring-orange-500/25",
                                "[.dark-default_&]:from-orange-700 [.dark-default_&]:to-orange-950",
                                "[.dark-midnight_&]:from-orange-600 [.dark-midnight_&]:to-orange-900",
                            )}
                            aria-hidden
                        >
                            <BugPlay className="size-7" strokeWidth={1.75} />
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                            <AlertDialogTitle className="text-center sm:text-left">Debug session started</AlertDialogTitle>
                            <AlertDialogDescription asChild>
                                <div className="text-muted-foreground flex flex-col gap-3 text-center text-sm leading-snug sm:text-left">
                                    <p>
                                        Outgoing messages in this chat can include the release or trace ids from your link.
                                    </p>
                                    <p>
                                        Use the `+` button at the top-left of the message input to edit the release or trace ids.
                                    </p>
                                </div>
                            </AlertDialogDescription>
                        </div>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-8 w-full flex-col gap-3 sm:flex-col sm:justify-start">
                        <AlertDialogAction type="button" className="w-full gap-2" onClick={persistDisclaimerSeen}>
                            <Check className="size-4 shrink-0" aria-hidden />
                            Got it
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <ConversationDebugSessionContext.Provider value={value}>{children}</ConversationDebugSessionContext.Provider>
        </>
    );
}

export function useConversationDebugSession(): ConversationDebugSessionContextValue {
    const ctx = React.useContext(ConversationDebugSessionContext);
    if (!ctx) {
        throw new Error("useConversationDebugSession must be used within ConversationDebugSessionProvider");
    }
    return ctx;
}

/** For components that may render outside the provider (should not happen on conversation routes). */
export function getConversationDebugSendContext(
    ctx: ConversationDebugSessionContextValue,
): CreateProjectChatSessionMessageDebugContext | undefined {
    if (!ctx.isDebugSendActive || !ctx.parsedFromUrl) return undefined;
    return {
        release_id: ctx.parsedFromUrl.release_id,
        environment: ctx.parsedFromUrl.environment,
    };
}

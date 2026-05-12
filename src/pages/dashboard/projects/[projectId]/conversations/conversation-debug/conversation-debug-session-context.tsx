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
import type { CreateProjectChatSessionMessageDebugContext } from "@/modules/project-chat/types";
import { BugPlay, Check } from "lucide-react";
import * as React from "react";
import { startTransition, useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";

import {
    type ConversationDebugFromUrl,
    parseConversationDebugFromSearch,
} from "./parse-conversation-debug-search";

type ConversationDebugSessionContextValue = {
    /** Parsed `debug` query when present and valid. */
    parsedFromUrl: ConversationDebugFromUrl | null;
    /** Include release in API calls for new user messages when `debug` is present. */
    isDebugSendActive: boolean;
};

const ConversationDebugSessionContext = React.createContext<ConversationDebugSessionContextValue | null>(null);

/** Rolling window: at most one acknowledgment reminder per 7 days, not scoped to chat or release. */
const DEBUG_STARTED_MODAL_DISMISS_MS = 7 * 24 * 60 * 60 * 1000;
const DEBUG_STARTED_MODAL_STORAGE_KEY = "baal:conversation-debug-started-disclaimer:last-dismissed-ms";

function readLastDebugStartedDisclaimerDismissMs(): number | null {
    try {
        const raw = localStorage.getItem(DEBUG_STARTED_MODAL_STORAGE_KEY);
        if (raw == null || raw === "") return null;
        const n = Number(raw);
        return Number.isFinite(n) ? n : null;
    } catch {
        return null;
    }
}

function shouldShowDebugStartedDisclaimer(): boolean {
    const last = readLastDebugStartedDisclaimerDismissMs();
    if (last == null) return true;
    return Date.now() - last >= DEBUG_STARTED_MODAL_DISMISS_MS;
}

export function ConversationDebugSessionProvider({ children }: { children: React.ReactNode }) {
    const { search } = useLocation();

    const [disclaimerOpen, setDisclaimerOpen] = useState(false);

    const parsedFromUrl = useMemo(() => parseConversationDebugFromSearch(search), [search]);

    const isDebugSendActive = parsedFromUrl != null;

    useEffect(() => {
        startTransition(() => {
            if (!parsedFromUrl) {
                setDisclaimerOpen(false);
                return;
            }
            if (!shouldShowDebugStartedDisclaimer()) return;
            setDisclaimerOpen(true);
        });
    }, [parsedFromUrl]);

    const persistDisclaimerSeen = useCallback(() => {
        try {
            localStorage.setItem(DEBUG_STARTED_MODAL_STORAGE_KEY, String(Date.now()));
        } catch {
            /* ignore quota / private mode */
        }
    }, []);

    const value = useMemo(
        (): ConversationDebugSessionContextValue => ({
            parsedFromUrl,
            isDebugSendActive,
        }),
        [parsedFromUrl, isDebugSendActive],
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
                                        Use the `+` button at the bottom-right of the message input to edit the release or trace ids.
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

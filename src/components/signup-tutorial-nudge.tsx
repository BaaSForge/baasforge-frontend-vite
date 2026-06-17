"use client";

import { Button } from "@/components/ui/button";
import {
    CentricModal,
    CentricModalContent,
    CentricModalDescription,
    CentricModalFooter,
    CentricModalHeader,
    CentricModalTitle,
} from "@/components/ui/centric-modal";
import { isSignupToken } from "@/modules/auth/lib/decode-access-token";
import { useCurrentUserQuery } from "@/modules/auth/queries";
import { createInformSchedule } from "@/services/informed-user-schedule";
import { pushAppNotification } from "@/stores/app-notifications";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

const SIGNUP_TUTORIAL_DELAY_MS = 10_000;

export const SIGNUP_TUTORIAL_STORAGE_KEY = "signup-tutorial:v1";

const SIGNUP_TUTORIAL_ALERT_STORAGE_KEY = "signup-tutorial:alert-shown:v1";

export const SIGNUP_TUTORIAL_NOTIFICATION_GROUP = "tutorials";

export const SIGNUP_TUTORIAL_NOTIFICATION_ID = "welcome-tutorial";

const TUTORIAL_TITLE = "Welcome to BaaS Forge";

const signupTutorialOpenHandlers = new Set<() => void>();

const signupTutorialDialogOpenRef = { current: false };

type SignupTutorialOpenOptions = {
    force?: boolean;
};

export function emitSignupTutorialOpen(options: SignupTutorialOpenOptions = {}): void {
    if (!options.force && !signupTutorialInformSchedule.shouldShow()) return;
    for (const openNow of signupTutorialOpenHandlers) {
        openNow();
    }
}

export const signupTutorialInformSchedule = createInformSchedule({
    storageKey: SIGNUP_TUTORIAL_STORAGE_KEY,
    getPostponeMsAfterDismiss: () => Number.MAX_SAFE_INTEGER,
});

function pushSignupTutorialInboxNotification(): void {
    pushAppNotification({
        group: SIGNUP_TUTORIAL_NOTIFICATION_GROUP,
        id: SIGNUP_TUTORIAL_NOTIFICATION_ID,
        title: TUTORIAL_TITLE,
        read: true,
        onShowNotification: () => emitSignupTutorialOpen({ force: true }),
    });
    maybeShowSignupTutorialAlert();
}

function readSignupTutorialAlertShown(): boolean {
    if (typeof globalThis === "undefined" || !("localStorage" in globalThis) || globalThis.localStorage == null) {
        return false;
    }
    return globalThis.localStorage.getItem(SIGNUP_TUTORIAL_ALERT_STORAGE_KEY) === "1";
}

function markSignupTutorialAlertShown(): void {
    if (typeof globalThis === "undefined" || !("localStorage" in globalThis) || globalThis.localStorage == null) {
        return;
    }
    try {
        globalThis.localStorage.setItem(SIGNUP_TUTORIAL_ALERT_STORAGE_KEY, "1");
    } catch {
        /* ignore */
    }
}

function maybeShowSignupTutorialAlert(): void {
    if (readSignupTutorialAlertShown()) return;
    markSignupTutorialAlertShown();
    globalThis.alert("You have a new tutorial in your notifications inbox.");
}

function SignupTutorialDialogShell({
    open,
    onOpenChange,
}: {
    open: boolean;
    onOpenChange: (next: boolean) => void;
}) {
    return (
        <CentricModal open={open} onOpenChange={onOpenChange}>
            <CentricModalContent className="sm:max-w-xl select-text pointer-events-auto" fillViewportOnMobile showCloseButton>
                <CentricModalHeader className="gap-5 sm:gap-6">
                    <CentricModalTitle>{TUTORIAL_TITLE}</CentricModalTitle>
                    <CentricModalDescription className="sr-only">
                        A short guide to projects, conversations, and the assistant.
                    </CentricModalDescription>
                </CentricModalHeader>
                <div className="text-muted-foreground space-y-2.5 text-sm select-text">
                    <p>
                        BAAL helps you build and ship backend units with an AI assistant that understands your project,
                        releases, and live runtime context.
                    </p>
                    <p>
                        Start from the dashboard: create or open a project, open a conversation, and describe what you want
                        in plain language—the assistant plans, implements, and can deploy when you are ready.
                    </p>
                    <p>
                        Use the notification inbox anytime to reopen tips like this one. You can also explore units, run HTTP
                        tests, and trace production behavior without leaving the app.
                    </p>
                </div>
                <CentricModalFooter>
                    <Button type="button" onClick={() => onOpenChange(false)}>
                        Got it
                    </Button>
                </CentricModalFooter>
            </CentricModalContent>
        </CentricModal>
    );
}

export function SignupTutorialGlobalHost() {
    const { data: me } = useCurrentUserQuery();
    const [open, setOpen] = useState(false);
    const delayTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const handleOpenChange = useCallback((next: boolean) => {
        setOpen(next);
        signupTutorialDialogOpenRef.current = next;
        if (!next) {
            signupTutorialInformSchedule.recordDismiss();
            if (delayTimerRef.current != null) {
                globalThis.clearTimeout(delayTimerRef.current);
                delayTimerRef.current = undefined;
            }
            pushSignupTutorialInboxNotification();
        }
    }, []);

    useLayoutEffect(() => {
        let alive = true;
        const openFromSignal = () => {
            globalThis.setTimeout(() => {
                if (!alive) return;
                setOpen(true);
                signupTutorialDialogOpenRef.current = true;
            }, 0);
        };
        signupTutorialOpenHandlers.add(openFromSignal);
        return () => {
            alive = false;
            signupTutorialOpenHandlers.delete(openFromSignal);
        };
    }, []);

    useEffect(() => {
        if (me == null) return;

        if (!isSignupToken(me.token)) {
            pushSignupTutorialInboxNotification();
            return;
        }

        if (!signupTutorialInformSchedule.shouldShow()) {
            pushSignupTutorialInboxNotification();
            return;
        }

        delayTimerRef.current = globalThis.setTimeout(() => {
            if (signupTutorialDialogOpenRef.current) return;
            if (!signupTutorialInformSchedule.shouldShow()) return;
            emitSignupTutorialOpen();
        }, SIGNUP_TUTORIAL_DELAY_MS);

        return () => {
            if (delayTimerRef.current != null) {
                globalThis.clearTimeout(delayTimerRef.current);
                delayTimerRef.current = undefined;
            }
        };
    }, [me]);

    return <SignupTutorialDialogShell open={open} onOpenChange={handleOpenChange} />;
}

"use client";

import { APP_NOTIFICATION_INBOX_BUTTON_ID, requestOpenAppNotificationInbox } from "@/components/app-notification-inbox-button";
import {
    TutorialOverlay,
    createOverlayHintController,
    dismissOverlayBeforeTargetActivate,
    useOverlayHintHost,
} from "@/components/tutorial-overlay";
import { SignupTutorialPlaceholderBoxStrip } from "@/components/signup-tutorial-placeholder-box-strip";
import { Button } from "@/components/ui/button";
import {
    CentricModal,
    CentricModalContent,
    CentricModalDescription,
    CentricModalFooter,
    CentricModalHeader,
    CentricModalTitle,
} from "@/components/ui/centric-modal";
import { cn } from "@/lib/utils";
import { isSignupToken } from "@/modules/auth/lib/decode-access-token";
import { useCurrentUserQuery } from "@/modules/auth/queries";
import { createInformSchedule } from "@/services/informed-user-schedule";
import { pushAppNotification } from "@/stores/app-notifications";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

const SIGNUP_TUTORIAL_DELAY_MS = 10_000;

const SIGNUP_TUTORIAL_INBOX_HINT_DELAY_MS = 5_000;

export const SIGNUP_TUTORIAL_STORAGE_KEY = "signup-tutorial:v1";

const SIGNUP_TUTORIAL_INBOX_HINT_DISMISSED_STORAGE_KEY = "signup-tutorial:alert-shown:v1";

export const SIGNUP_TUTORIAL_NOTIFICATION_GROUP = "tutorials";

export const SIGNUP_TUTORIAL_NOTIFICATION_ID = "welcome-tutorial";

const TUTORIAL_TITLE = "Welcome to BaaS Forge";

const SIGNUP_TUTORIAL_WORKFLOW_STEPS: ReadonlyArray<{
    title: string;
    description: string;
}> = [
    {
        title: "Develop",
        description:
            "Tell the AI what you need and it builds units for you—self-contained files of code that power your API.",
    },
    {
        title: "Test on runtimes",
        description:
            "Deploy units to stage (a test runtime) and call them with the built-in HTTP client—without leaving BaaS Forge. Runtimes are the live environments where your code runs.",
    },
    {
        title: "Debug",
        description:
            "Found an issue? Reference that deploy in chat. The AI reads live runtime data, pinpoints what went wrong, and fixes it.",
    },
    {
        title: "Deploy to production",
        description:
            "Once tests look good, push to production in seconds. Your backend API runs on production servers—all from the same platform.",
    },
];

function SignupTutorialWorkflowSteps() {
    const lastIndex = SIGNUP_TUTORIAL_WORKFLOW_STEPS.length - 1;

    return (
        <ol className="space-y-0">
            {SIGNUP_TUTORIAL_WORKFLOW_STEPS.map((step, index) => {
                const isLast = index === lastIndex;

                return (
                    <li key={step.title} className="relative flex gap-3.5">
                        <div className="flex w-8 shrink-0 flex-col items-center">
                            <span className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold tabular-nums">
                                {index + 1}
                            </span>
                            {!isLast ? <span className="bg-border my-1.5 w-px flex-1 min-h-4" aria-hidden /> : null}
                        </div>
                        <div className={cn("min-w-0 flex-1", !isLast && "pb-5")}>
                            <p className="font-medium leading-snug">{step.title}</p>
                            <p className="text-muted-foreground mt-1 text-sm text-pretty leading-relaxed">{step.description}</p>
                        </div>
                    </li>
                );
            })}
        </ol>
    );
}

const signupTutorialOpenHandlers = new Set<() => void>();

const signupTutorialDialogOpenRef = { current: false };

const signupTutorialInboxHint = createOverlayHintController({
    dismissedStorageKey: SIGNUP_TUTORIAL_INBOX_HINT_DISMISSED_STORAGE_KEY,
});

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
    signupTutorialInboxHint.requestShow();
}

function SignupTutorialDialogShell({
    open,
    onOpenChange,
}: {
    open: boolean;
    onOpenChange: (next: boolean) => void;
}) {
    return (
        <CentricModal open={open} onOpenChange={onOpenChange} dismissOnOverlayClick={false}>
            <CentricModalContent className="sm:max-w-xl select-text pointer-events-auto" fillViewportOnMobile showCloseButton>
                <CentricModalHeader className="gap-5 sm:gap-6">
                    <CentricModalTitle>{TUTORIAL_TITLE}</CentricModalTitle>
                    <CentricModalDescription className="sr-only">
                        An overview of BaaS Forge and the develop, test, debug, and deploy workflow.
                    </CentricModalDescription>
                </CentricModalHeader>
                <div className="space-y-5 select-text">
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        BaaS Forge lets you build backend APIs on one platform—no switching tools. Describe the behavior you
                        want and AI writes the code. It handles complex, production-ready scenarios—not just CRUD—and deploys
                        in seconds.
                    </p>

                    <div className="space-y-3">
                        <p className="text-sm font-medium">How it works</p>
                        <SignupTutorialWorkflowSteps />
                    </div>

                    <SignupTutorialPlaceholderBoxStrip />
                </div>
                <CentricModalFooter>
                    <Button type="button">
                        Let&apos;s start live tutorials
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
    const inboxHint = useOverlayHintHost(signupTutorialInboxHint, { delayMs: SIGNUP_TUTORIAL_INBOX_HINT_DELAY_MS });

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

    return (
        <>
            <SignupTutorialDialogShell open={open} onOpenChange={handleOpenChange} />
            <TutorialOverlay
                targetId={APP_NOTIFICATION_INBOX_BUTTON_ID}
                placement="bottom"
                open={inboxHint.open}
                onOpenChange={inboxHint.onOpenChange}
                title="Tutorials are in your inbox"
                description="You can see the tutorials here anytime from the notifications button."
                dismissLabel="Got it"
                onTargetPointerDown={dismissOverlayBeforeTargetActivate(
                    inboxHint.onOpenChange,
                    requestOpenAppNotificationInbox,
                )}
            />
        </>
    );
}

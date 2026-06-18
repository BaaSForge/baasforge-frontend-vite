"use client";

import { APP_NOTIFICATION_INBOX_BUTTON_ID, requestOpenAppNotificationInbox } from "@/components/app-notification-inbox-button";
import {
    TutorialOverlay,
    createOverlayHintController,
    dismissOverlayBeforeTargetActivate,
    useOverlayHintHost,
} from "@/components/tutorial-overlay";
import { TutorialCardStrip } from "@/components/tutorial-card-strip";
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
import {
    getTutorialActionTitleFromDisplayStatus,
    getTutorialGroup,
    getTutorialsByGroupId,
    runTutorialAction,
    runTutorialGroupAction,
    useTutorialGroupDisplayState,
    WELCOME_TUTORIALS_GROUP_ID,
    type TutorialId,
} from "@/services/tutorials";
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
    mobileLine: string;
}> = [
    {
        title: "Develop",
        description: "Describe what you need—the AI builds units that power your API.",
        mobileLine: "Describe it—AI builds your units.",
    },
    {
        title: "Test on runtimes",
        description: "Deploy to stage and call your API with the built-in HTTP client.",
        mobileLine: "Deploy to stage and test with HTTP client.",
    },
    {
        title: "Debug",
        description: "Reference the deploy in chat—the AI reads runtime data and fixes it.",
        mobileLine: "Share the deploy in chat to debug.",
    },
    {
        title: "Deploy to production",
        description: "When tests pass, push to production in seconds.",
        mobileLine: "Ship to production when tests pass.",
    },
];

const welcomeTutorialGroup = getTutorialGroup(WELCOME_TUTORIALS_GROUP_ID)!;

const welcomeTutorials = getTutorialsByGroupId(WELCOME_TUTORIALS_GROUP_ID);

function SignupTutorialWorkflowSteps() {
    const lastIndex = SIGNUP_TUTORIAL_WORKFLOW_STEPS.length - 1;

    return (
        <ol className="space-y-0">
            {SIGNUP_TUTORIAL_WORKFLOW_STEPS.map((step, index) => {
                const isLast = index === lastIndex;

                return (
                    <li key={step.title} className="relative flex gap-2 md:gap-3.5">
                        <div className="flex w-6 shrink-0 flex-col items-center md:w-8">
                            <span className="bg-primary/10 text-primary flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums md:size-8 md:text-sm">
                                {index + 1}
                            </span>
                            {!isLast ? (
                                <span className="bg-border my-1 w-px flex-1 min-h-2 md:my-1.5 md:min-h-4" aria-hidden />
                            ) : null}
                        </div>
                        <div className={cn("min-w-0 flex-1", !isLast && "pb-2 md:pb-5")}>
                            <div className="flex h-6 items-center md:h-auto md:block">
                                <p className="text-muted-foreground truncate text-xs leading-snug md:hidden">{step.mobileLine}</p>
                            </div>
                            <div className="hidden md:block">
                                <p className="font-medium leading-snug">{step.title}</p>
                                <p className="text-muted-foreground mt-1 text-sm text-pretty leading-relaxed">{step.description}</p>
                            </div>
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
    const { displayStatuses, lastNonIdleTutorialId, groupActionTitle, groupActionKind, isGroupActionDisabled } =
        useTutorialGroupDisplayState(WELCOME_TUTORIALS_GROUP_ID, open);
    const [isRunningAction, setIsRunningAction] = useState(false);
    const showSkipButton = groupActionKind !== "continue" && groupActionKind !== "all-completed";

    const runActionAndClose = useCallback(
        async (action: () => Promise<boolean>) => {
            setIsRunningAction(true);
            try {
                const succeeded = await action();
                if (succeeded) onOpenChange(false);
            } finally {
                setIsRunningAction(false);
            }
        },
        [onOpenChange],
    );

    const handleGroupAction = useCallback(() => {
        void runActionAndClose(() => runTutorialGroupAction(WELCOME_TUTORIALS_GROUP_ID));
    }, [runActionAndClose]);

    const handleTutorialAction = useCallback(
        (tutorialId: TutorialId) => {
            void runActionAndClose(() => runTutorialAction(WELCOME_TUTORIALS_GROUP_ID, tutorialId));
        },
        [runActionAndClose],
    );

    return (
        <CentricModal open={open} onOpenChange={onOpenChange} dismissOnOverlayClick={false}>
            <CentricModalContent
                className="sm:max-w-xl select-text pointer-events-auto"
                fillViewportOnMobile
                showCloseButton
                onEscapeKeyDown={(event) => event.preventDefault()}
            >
                <CentricModalHeader className="gap-3 sm:gap-5 md:gap-6">
                    <CentricModalTitle>{TUTORIAL_TITLE}</CentricModalTitle>
                    <CentricModalDescription className="sr-only">
                        An overview of BaaS Forge and the develop, test, debug, and deploy workflow.
                    </CentricModalDescription>
                </CentricModalHeader>
                <div className="space-y-3 select-text md:space-y-5">
                    <p className="text-muted-foreground text-xs leading-relaxed md:text-sm">
                        BaaS Forge lets you build backend APIs on one platform—no switching tools. Describe the behavior you
                        want and AI writes the code. It handles complex, production-ready scenarios—not just CRUD—and deploys
                        in seconds.
                    </p>

                    <div className="space-y-1.5 md:space-y-3">
                        <p className="text-xs font-medium md:text-sm">How it works</p>
                        <SignupTutorialWorkflowSteps />
                    </div>

                    <TutorialCardStrip
                        heading={welcomeTutorialGroup.title}
                        scrollToItemId={open && displayStatuses != null ? lastNonIdleTutorialId : null}
                        items={welcomeTutorials.map((tutorial) => {
                            const status = displayStatuses?.[tutorial.id] ?? "idle";

                            return {
                                id: tutorial.id,
                                title: tutorial.title,
                                description: tutorial.description,
                                icon: tutorial.icon,
                                status,
                                actionLabel: getTutorialActionTitleFromDisplayStatus(status),
                                onAction: isRunningAction ? undefined : () => handleTutorialAction(tutorial.id),
                            };
                        })}
                    />
                </div>
                <CentricModalFooter>
                    <div className="flex w-full flex-row items-center justify-end gap-2">
                        {showSkipButton ? (
                            <Button
                                type="button"
                                variant="ghost"
                                className="text-muted-foreground hover:text-foreground"
                                onClick={() => onOpenChange(false)}
                            >
                                Skip
                            </Button>
                        ) : null}
                        <Button
                            type="button"
                            disabled={isRunningAction || isGroupActionDisabled || groupActionTitle == null}
                            onClick={handleGroupAction}
                        >
                            {groupActionTitle ?? "Let's start live tutorials"}
                        </Button>
                    </div>
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

"use client";

import { AppLogoSquare } from "@/components/logo/app-logo-square";
import { Button } from "@/components/ui/button";
import {
    CentricModal,
    CentricModalContent,
    CentricModalDescription,
    CentricModalFooter,
    CentricModalHeader,
    CentricModalTitle,
} from "@/components/ui/centric-modal";
import { AppSyntaxHighlighter } from "@/components/syntax-highlight/app-syntax-highlighter";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";
import { createDefaultExponentialPostponeMs, createInformSchedule } from "@/services/informed-user-schedule";
import { pushAppNotification } from "@/stores/app-notifications";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";

const MS_PER_DAY = 86_400_000;

export const SCALAR_HTTP_TEST_AI_NUDGE_STORAGE_KEY = "http-test-ai-nudge:v1";

export const SCALAR_HTTP_TEST_AI_NUDGE_NOTIFICATION_GROUP = "tutorials";

export const SCALAR_HTTP_TEST_AI_NUDGE_NOTIFICATION_ID = "http-test-ai-nudge";

const scalarHttpTestAiNudgeOpenHandlers = new Set<() => void>();

const scalarHttpTestAiNudgeDialogOpenRef = { current: false };

export function emitScalarHttpTestAiNudgeOpen(): void {
    for (const openNow of scalarHttpTestAiNudgeOpenHandlers) {
        openNow();
    }
}

export const scalarHttpTestAiInformSchedule = createInformSchedule({
    storageKey: SCALAR_HTTP_TEST_AI_NUDGE_STORAGE_KEY,
    getPostponeMsAfterDismiss: createDefaultExponentialPostponeMs({
        initialMs: 3 * MS_PER_DAY,
        multiplier: 3,
        maxMs: 27 * MS_PER_DAY,
    }),
});

let inboxSyncMicrotaskQueued = false;

export function scheduleScalarHttpTestAiNudgeInboxSync(): void {
    if (typeof globalThis.window === "undefined") return;
    if (inboxSyncMicrotaskQueued) return;
    inboxSyncMicrotaskQueued = true;
    queueMicrotask(() => {
        inboxSyncMicrotaskQueued = false;
        pushScalarHttpTestAiNudgeInboxNotification();
    });
}

function pushScalarHttpTestAiNudgeInboxNotification(): void {
    if (scalarHttpTestAiInformSchedule.readPersisted() == null) return;
    pushAppNotification({
        group: SCALAR_HTTP_TEST_AI_NUDGE_NOTIFICATION_GROUP,
        id: SCALAR_HTTP_TEST_AI_NUDGE_NOTIFICATION_ID,
        title: "Your test run is already in the assistant's view",
        read: true,
        onShowNotification: emitScalarHttpTestAiNudgeOpen,
    });
}

const SNIPPET_RESPONSE = `{
  "status": 422,
  "url": "https://api.example/v1/units/live-test",
  "headers": {
    "x-request-id": "req_8k2m9p",
    "content-type": "application/json",
    "x-trace-sampled": "1"
  },
  "body": {
    "error": "unit_schema_invalid",
    "details": ["field: payload.size", "expected: <= 65536"]
  },
  "timingsMs": { "dns": 2, "tcp": 8, "tls": 14, "ttfb": 41 }
}`;

const SNIPPET_SPAN = `{
  "name": "POST /v1/units",
  "traceId": "4bf92f3577b34da6a3ce929d0e0e4736",
  "spanId": "00f067aa0ba902b7",
  "parentSpanId": "e8e9b7f3c2a14000",
  "durationMs": 38.4,
  "attributes": {
    "http.route": "/v1/units",
    "http.status_code": 201,
    "db.system": "postgresql"
  },
  "events": [{ "name": "serialize", "ts": 1746534123012 }]
}`;

const SNIPPET_LOG = `{
  "timeUnixNano": "1746534123000000000",
  "severityText": "INFO",
  "traceId": "4bf92f3577b34da6a3ce929d0e0e4736",
  "spanId": "00f067aa0ba902b7",
  "body": {
    "stringValue": "request completed",
    "attrs": { "bytesOut": 2048, "cached": false }
  },
  "resource": { "service.name": "unit-live-test" }
}`;

const NUDGE_CONNECTOR_VIEW_W = 400;
const NUDGE_CONNECTOR_VIEW_H = 164;
const NUDGE_CONNECTOR_JUNCTION_Y = 82;

const NUDGE_CARD_STACK = {
    span: {
        className: "absolute z-[40]",
        style: { top: 5, left: "13%", width: "86%", transform: "translateX(-5px)" } as const,
    },
    response: {
        className: "absolute z-[40]",
        style: { top: "41%", left: "-2%", width: "91%", transform: "translateY(3px)" } as const,
    },
    log: {
        className: "absolute z-[40] translate-x-[7px] translate-y-6",
        style: { bottom: 2, right: "4%", width: "83%" } as const,
    },
} as const;

function ScalarHttpTestAiNudgeConnector({ junctionX }: { junctionX: number }) {
    const dash = "5 5";
    const rx = 292;
    const jy = NUDGE_CONNECTOR_JUNCTION_Y;
    const trunkEnd = 58;
    const filletR = Math.min(10, Math.max(5, (rx - junctionX) * 0.08));
    const topY = 38;
    const botY = 126;
    const topPath = `M ${rx} ${topY} H ${junctionX + filletR} Q ${junctionX} ${topY} ${junctionX} ${topY + filletR} V ${jy}`;
    const botPath = `M ${rx} ${botY} H ${junctionX + filletR} Q ${junctionX} ${botY} ${junctionX} ${botY - filletR} V ${jy}`;
    const march = () => (
        <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1.25s" repeatCount="indefinite" />
    );
    return (
        <svg
            className="text-primary pointer-events-none absolute inset-0 z-[10] h-full w-full overflow-visible"
            viewBox={`0 0 ${NUDGE_CONNECTOR_VIEW_W} ${NUDGE_CONNECTOR_VIEW_H}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            aria-hidden
        >
            <g
                stroke="currentColor"
                strokeOpacity={0.45}
                strokeWidth={1.35}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            >
                <path strokeDasharray={dash} d={topPath}>
                    {march()}
                </path>
                <path strokeDasharray={dash} d={`M ${rx} ${jy} H ${junctionX}`}>
                    {march()}
                </path>
                <path strokeDasharray={dash} d={botPath}>
                    {march()}
                </path>
                <path strokeDasharray={dash} d={`M ${junctionX} ${jy} H ${trunkEnd}`}>
                    {march()}
                </path>
            </g>
        </svg>
    );
}

function ScalarHttpTestAiNudgeMergeNode({ junctionX }: { junctionX: number }) {
    const leftPct = (junctionX / NUDGE_CONNECTOR_VIEW_W) * 100;
    const topPct = (NUDGE_CONNECTOR_JUNCTION_Y / NUDGE_CONNECTOR_VIEW_H) * 100;
    return (
        <div
            className="pointer-events-none absolute z-[15] flex size-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-muted outline-none"
            style={{ left: `${leftPct}%`, top: `${topPct}%` }}
            aria-hidden
        >
            <RefreshCw
                className="text-muted-foreground size-[11px] shrink-0 animate-spin [animation-direction:reverse] outline-none"
                strokeWidth={2.25}
            />
        </div>
    );
}

function NudgeCodeBlock({ code, className, style }: { code: string; className?: string; style?: CSSProperties }) {
    return (
        <div className={cn("min-w-0 max-w-full", className)} style={style}>
            <div className="border-border bg-muted relative w-full overflow-hidden rounded-sm border px-1.5 py-1 shadow-2xl shadow-black/15 select-none dark:shadow-black/40">
                <div className="max-h-[4.125rem] overflow-hidden [&_code]:break-all [&_code]:whitespace-pre-wrap">
                    <AppSyntaxHighlighter variant="markdownBlock" code={code} language="json" compact />
                </div>
            </div>
        </div>
    );
}

function ScalarHttpTestAiNudgeIllustration({ className }: { className?: string }) {
    const [junctionX, setJunctionX] = useState(172);
    useEffect(() => {
        const xsMq = window.matchMedia("(width < 26.25rem)");
        const smMq = window.matchMedia("(max-width: 639px)");
        const sync = () => {
            if (xsMq.matches) setJunctionX(145);
            else if (smMq.matches) setJunctionX(118);
            else setJunctionX(172);
        };
        sync();
        xsMq.addEventListener("change", sync);
        smMq.addEventListener("change", sync);
        return () => {
            xsMq.removeEventListener("change", sync);
            smMq.removeEventListener("change", sync);
        };
    }, []);
    return (
        <div className={cn("relative mb-8 min-h-[calc(12.25rem+theme(spacing.6))] w-full", className)}>
            <ScalarHttpTestAiNudgeConnector junctionX={junctionX} />
            <ScalarHttpTestAiNudgeMergeNode junctionX={junctionX} />
            <div className="relative isolate z-20 flex w-full min-w-0 items-center gap-2">
                <div className="relative z-[30] mt-8 shrink-0 bg-background">
                    <AppLogoSquare width={76} height={76} className="h-[4.5rem] w-[4.5rem]" />
                </div>
                <div
                    className="min-h-[calc(10.25rem+theme(spacing.6))] min-w-0 flex-1 max-xs:min-w-10"
                    aria-hidden
                />
                <div className="relative z-[40] h-[calc(10.25rem+theme(spacing.6))] w-[min(100%,13.25rem)] shrink-0 max-xs:translate-x-5">
                    <NudgeCodeBlock code={SNIPPET_SPAN} className={cn(NUDGE_CARD_STACK.span.className)} style={NUDGE_CARD_STACK.span.style} />
                    <NudgeCodeBlock
                        code={SNIPPET_RESPONSE}
                        className={cn(NUDGE_CARD_STACK.response.className)}
                        style={NUDGE_CARD_STACK.response.style}
                    />
                    <NudgeCodeBlock code={SNIPPET_LOG} className={cn(NUDGE_CARD_STACK.log.className)} style={NUDGE_CARD_STACK.log.style} />
                </div>
            </div>
        </div>
    );
}

function ScalarHttpTestAiNudgeDialogShell({
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
                    <CentricModalTitle>Your test run is already in the assistant&apos;s view</CentricModalTitle>
                    <CentricModalDescription className="sr-only">
                        Live HTTP test responses, traces, and logs are streamed into the assistant context so you can debug
                        without copying errors into chat.
                    </CentricModalDescription>
                </CentricModalHeader>
                <div className="text-muted-foreground space-y-2.5 text-sm select-text">
                    <ScalarHttpTestAiNudgeIllustration />
                    <p>
                        Every send from here is captured live—status, body, URL, traces, and logs stream straight into context.
                        When something breaks, you do not need to copy responses or stack traces into the model; it can already read
                        what just happened.
                    </p>
                    <p>
                        Open a fresh chat conversation or keep going in the latest one and describe the issue in your own words—the
                        assistant is standing on the same evidence you are.
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

export function ScalarHttpTestAiNudgeGlobalHost() {
    const [open, setOpen] = useState(false);

    const handleOpenChange = useCallback((next: boolean) => {
        setOpen(next);
        scalarHttpTestAiNudgeDialogOpenRef.current = next;
        if (!next) {
            scalarHttpTestAiInformSchedule.recordDismiss();
            pushScalarHttpTestAiNudgeInboxNotification();
        }
    }, []);

    useLayoutEffect(() => {
        let alive = true;
        const openFromSignal = () => {
            globalThis.setTimeout(() => {
                if (!alive) return;
                setOpen(true);
                scalarHttpTestAiNudgeDialogOpenRef.current = true;
            }, 0);
        };
        scalarHttpTestAiNudgeOpenHandlers.add(openFromSignal);
        return () => {
            alive = false;
            scalarHttpTestAiNudgeOpenHandlers.delete(openFromSignal);
        };
    }, []);

    useEffect(() => {
        if (scalarHttpTestAiInformSchedule.readPersisted() == null) return;
        pushScalarHttpTestAiNudgeInboxNotification();
    }, []);

    return <ScalarHttpTestAiNudgeDialogShell open={open} onOpenChange={handleOpenChange} />;
}

export function useScalarHttpTestAiNudge() {
    const onRequestSent = useCallback(() => {
        if (!scalarHttpTestAiInformSchedule.shouldShow()) return;
        if (scalarHttpTestAiNudgeDialogOpenRef.current) return;
        emitScalarHttpTestAiNudgeOpen();
    }, []);

    return { onRequestSent };
}

"use client";

import { useAreBothSidebarsOpen } from "@/components/secondary-sidebar";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { CompactReleaseBadge } from "@/modules/project";
import { ChatMessageType, type ChatMessageWithDeliveryStatus } from "@/modules/project-chat/types";
import { cn } from "@/lib/utils";
import { AlignJustify, FlaskConical, Rocket } from "lucide-react";
import { useParams } from "react-router";

import {
    getReleaseControllerPayload,
    useReleaseControllerRuntimeLiveFlags,
} from "../message/release-controller-box-shared";

function getPayloadForSticky(message: ChatMessageWithDeliveryStatus) {
    if (message.type !== ChatMessageType.ReleaseControllerBox) return {};
    return getReleaseControllerPayload(message);
}

/** One-line summary for non-UI contexts (e.g. tests, logging). */
export function getReleaseControllerStickyLineText(message: ChatMessageWithDeliveryStatus): string {
    const { stage_release: stage, prod_release: prod } = getPayloadForSticky(message);
    const parts: string[] = ["Release scope"];
    if (stage?.revision != null) parts.push(`Stage ${stage.revision}`);
    if (prod?.revision != null) parts.push(`Prod ${prod.revision}`);
    return parts.join(" · ");
}

const STICKY_RELEASE_TITLE = "Release scope up to here";

const stickyOutlineBtn =
    "border-inverse-foreground/25 bg-transparent text-inverse-foreground/90 shadow-none hover:bg-transparent";

function StickyReleaseControllerDesktop({ message }: { message: ChatMessageWithDeliveryStatus }) {
    const { projectId } = useParams<{ projectId: string; conversationId?: string }>();
    const bothSidebarsOpen = useAreBothSidebarsOpen();
    const { stage_release: stageRelease, prod_release: prodRelease } = getReleaseControllerPayload(message);
    const { isStageReleaseLiveOnRuntime, isProdReleaseLiveOnRuntime } = useReleaseControllerRuntimeLiveFlags(
        projectId,
        stageRelease,
        prodRelease,
    );

    if (bothSidebarsOpen) {
        return (
            <p
                className="min-w-0 flex-1 truncate text-center text-sm font-medium text-inverse-foreground/95 md:text-left"
                title={STICKY_RELEASE_TITLE}
            >
                {STICKY_RELEASE_TITLE}
            </p>
        );
    }

    return (
        <div
            className="flex min-w-0 flex-1 flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-3"
            aria-hidden
        >
            <p
                className={cn(
                    "relative z-[1] w-full min-w-0 text-center text-sm font-medium text-inverse-foreground/95",
                    "md:flex-1 md:text-left",
                )}
            >
                {STICKY_RELEASE_TITLE}
            </p>
            <div
                className={cn(
                    "relative z-[1] flex w-full min-w-0 flex-wrap items-center justify-center gap-2",
                    "pointer-events-none md:w-auto md:justify-end",
                )}
            >
                <Button type="button" variant="outline" size="xs" disabled className={stickyOutlineBtn} tabIndex={-1}>
                    <AlignJustify className="size-3" aria-hidden />
                    View changes
                </Button>

                {stageRelease != null ? (
                    isStageReleaseLiveOnRuntime ? (
                        <CompactReleaseBadge release={stageRelease} projectId={projectId} />
                    ) : (
                        <Button type="button" variant="outline" size="xs" disabled className={stickyOutlineBtn} tabIndex={-1}>
                            <FlaskConical className="size-3 shrink-0" aria-hidden />
                            Deploy revision {stageRelease.revision} to stage
                        </Button>
                    )
                ) : (
                    <Button type="button" variant="outline" size="xs" disabled className={stickyOutlineBtn} tabIndex={-1}>
                        Release Stage
                    </Button>
                )}

                {prodRelease != null ? (
                    isProdReleaseLiveOnRuntime ? (
                        <CompactReleaseBadge release={prodRelease} projectId={projectId} />
                    ) : (
                        <Button type="button" variant="outline" size="xs" disabled className={stickyOutlineBtn} tabIndex={-1}>
                            <Rocket className="size-3 shrink-0" aria-hidden />
                            Deploy revision {prodRelease.revision} to production
                        </Button>
                    )
                ) : (
                    <Button type="button" variant="outline" size="xs" disabled className={stickyOutlineBtn} tabIndex={-1}>
                        Release production
                    </Button>
                )}
            </div>
        </div>
    );
}

/** Sticky bar: scroll-only; desktop mirrors the in-thread release controller (non-interactive). */
export function StickyMessageLineReleaseController({
    message,
    className,
}: {
    message: ChatMessageWithDeliveryStatus;
    className?: string;
}) {
    const isMobile = useIsMobile();

    if (isMobile) {
        return (
            <span
                data-message-id={message.id}
                className={cn("min-w-0 flex-1 truncate text-sm text-inverse-foreground", className)}
                title={STICKY_RELEASE_TITLE}
            >
                {STICKY_RELEASE_TITLE}
            </span>
        );
    }

    return <StickyReleaseControllerDesktop message={message} />;
}

import { cn } from "@/lib/utils";
import type { ReleaseControllerBoxPayload } from "@/modules/project-chat/payloads";
import { ChatMessageType, type ChatMessageWithDeliveryStatus } from "@/modules/project-chat/types";

function getPayload(message: ChatMessageWithDeliveryStatus): ReleaseControllerBoxPayload {
    if (message.type !== ChatMessageType.ReleaseControllerBox) return {};
    const p = message.payload as ReleaseControllerBoxPayload | undefined | null;
    if (p == null || typeof p !== "object") return {};
    return p;
}

/** One-line summary for non-UI contexts (e.g. tests, logging). */
export function getReleaseControllerStickyLineText(message: ChatMessageWithDeliveryStatus): string {
    const { stage_release: stage, prod_release: prod } = getPayload(message);
    const parts: string[] = ["Release scope"];
    if (stage?.revision != null) parts.push(`Stage ${stage.revision}`);
    if (prod?.revision != null) parts.push(`Prod ${prod.revision}`);
    return parts.join(" · ");
}

const STICKY_RELEASE_TITLE = "Release scope up to here";

/** Sticky bar copy only — matches the in-thread release controller title. */
export function StickyMessageLineReleaseController({
    message,
    className,
}: {
    message: ChatMessageWithDeliveryStatus;
    className?: string;
}) {
    return (
        <span
            data-message-id={message.id}
            className={cn("min-w-0 flex-1 truncate text-sm text-foreground", className)}
            title={STICKY_RELEASE_TITLE}
        >
            {STICKY_RELEASE_TITLE}
        </span>
    );
}

import type { PointerEvent } from "react";
import { TARGET_SPOTLIGHT_OVERLAY_BACKDROP_POINTER_EVENTS } from "../constants";
import { TARGET_SPOTLIGHT_OVERLAY_ATTRIBUTE } from "../lib/outside-event";

const BACKDROP_PANEL_CLASS = "pointer-events-auto fixed bg-black/55 animate-in fade-in-0 duration-300";

type FullScreenBackdropProps = {
    className?: string;
};

function blockPointerEvent(event: PointerEvent<HTMLDivElement>): void {
    event.preventDefault();
    event.stopPropagation();
}

export function FullScreenBackdrop({ className }: FullScreenBackdropProps) {
    return (
        <div
            aria-hidden
            {...{ [TARGET_SPOTLIGHT_OVERLAY_ATTRIBUTE]: "" }}
            className={className ?? BACKDROP_PANEL_CLASS}
            style={{ inset: 0, pointerEvents: TARGET_SPOTLIGHT_OVERLAY_BACKDROP_POINTER_EVENTS }}
            onPointerDown={blockPointerEvent}
        />
    );
}

export { BACKDROP_PANEL_CLASS };

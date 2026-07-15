import type { PointerEvent } from "react";
import type { BackdropPanel } from "../types";
import { TARGET_SPOTLIGHT_OVERLAY_BACKDROP_CLASS, TARGET_SPOTLIGHT_OVERLAY_BACKDROP_POINTER_EVENTS } from "../constants";
import { TARGET_SPOTLIGHT_OVERLAY_ATTRIBUTE } from "../lib/outside-event";

const BACKDROP_PANEL_CLASS = `pointer-events-auto fixed ${TARGET_SPOTLIGHT_OVERLAY_BACKDROP_CLASS} animate-in fade-in-0 duration-300`;

type CutoutBackdropProps = {
    panels: BackdropPanel[];
};

function blockPointerEvent(event: PointerEvent<HTMLDivElement>): void {
    event.preventDefault();
    event.stopPropagation();
}

export function CutoutBackdrop({ panels }: CutoutBackdropProps) {
    return (
        <>
            {panels.map((panel) => (
                <div
                    key={panel.key}
                    aria-hidden
                    {...{ [TARGET_SPOTLIGHT_OVERLAY_ATTRIBUTE]: "" }}
                    className={BACKDROP_PANEL_CLASS}
                    style={{ ...panel.style, pointerEvents: TARGET_SPOTLIGHT_OVERLAY_BACKDROP_POINTER_EVENTS }}
                    onPointerDown={blockPointerEvent}
                />
            ))}
        </>
    );
}

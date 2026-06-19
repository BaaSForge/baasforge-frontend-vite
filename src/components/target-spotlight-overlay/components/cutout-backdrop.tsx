import type { BackdropPanel } from "../types";
import { TARGET_SPOTLIGHT_OVERLAY_BACKDROP_POINTER_EVENTS } from "../constants";

const BACKDROP_PANEL_CLASS = "pointer-events-auto fixed bg-black/55 animate-in fade-in-0 duration-300";

type CutoutBackdropProps = {
    panels: BackdropPanel[];
};

export function CutoutBackdrop({ panels }: CutoutBackdropProps) {
    return (
        <>
            {panels.map((panel) => (
                <div
                    key={panel.key}
                    aria-hidden
                    className={BACKDROP_PANEL_CLASS}
                    style={{ ...panel.style, pointerEvents: TARGET_SPOTLIGHT_OVERLAY_BACKDROP_POINTER_EVENTS }}
                />
            ))}
        </>
    );
}

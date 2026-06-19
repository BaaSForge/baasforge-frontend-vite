import { TARGET_SPOTLIGHT_OVERLAY_BACKDROP_POINTER_EVENTS } from "../constants";

const BACKDROP_PANEL_CLASS = "fixed bg-black/55 animate-in fade-in-0 duration-300";

type FullScreenBackdropProps = {
    className?: string;
};

export function FullScreenBackdrop({ className }: FullScreenBackdropProps) {
    return (
        <div
            aria-hidden
            className={className ?? BACKDROP_PANEL_CLASS}
            style={{ inset: 0, pointerEvents: TARGET_SPOTLIGHT_OVERLAY_BACKDROP_POINTER_EVENTS }}
        />
    );
}

export { BACKDROP_PANEL_CLASS };

import type { CSSProperties, RefObject } from "react";
import { TARGET_SPOTLIGHT_OVERLAY_ATTRIBUTE } from "../lib/outside-event";
import { SpotlightContentBox } from "./spotlight-content-box";
import type { TargetSpotlightOverlayPlacement } from "../types";

type AnchoredContentBoxProps = {
    setFloatingRef: (node: HTMLElement | null) => void;
    floatingStyles: CSSProperties;
    resolvedPlacement: TargetSpotlightOverlayPlacement;
    arrowRef: RefObject<HTMLDivElement | null>;
    arrowStyle: CSSProperties;
    className?: string;
    hideArrow?: boolean;
};

export function AnchoredContentBox({
    setFloatingRef,
    floatingStyles,
    resolvedPlacement,
    arrowRef,
    arrowStyle,
    className,
    hideArrow = false,
}: AnchoredContentBoxProps) {
    return (
        <div
            ref={setFloatingRef}
            {...{ [TARGET_SPOTLIGHT_OVERLAY_ATTRIBUTE]: "" }}
            style={floatingStyles}
            className="pointer-events-auto transition-transform duration-300 ease-out"
        >
            <div
                className="relative w-[min(100vw-32px,30rem)] animate-in fade-in-0 zoom-in-95 duration-300 data-[side=bottom]:slide-in-from-top-2"
                data-side={resolvedPlacement}
            >
                {hideArrow ? null : (
                    <div
                        ref={arrowRef}
                        aria-hidden
                        className="absolute z-0 size-3 rotate-45 rounded-[2px] border border-primary/20 bg-popover shadow-sm"
                        style={arrowStyle}
                    />
                )}
                <SpotlightContentBox className={className} />
            </div>
        </div>
    );
}

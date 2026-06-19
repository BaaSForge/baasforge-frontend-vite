import type { CSSProperties, RefObject } from "react";
import { SpotlightContentBox } from "./spotlight-content-box";
import type { TargetSpotlightOverlayPlacement } from "../types";

type AnchoredContentBoxProps = {
    setFloatingRef: (node: HTMLElement | null) => void;
    floatingStyles: CSSProperties;
    resolvedPlacement: TargetSpotlightOverlayPlacement;
    arrowRef: RefObject<HTMLDivElement | null>;
    arrowStyle: CSSProperties;
    className?: string;
};

export function AnchoredContentBox({
    setFloatingRef,
    floatingStyles,
    resolvedPlacement,
    arrowRef,
    arrowStyle,
    className,
}: AnchoredContentBoxProps) {
    return (
        <div
            ref={setFloatingRef}
            style={floatingStyles}
            className="pointer-events-auto relative w-[min(100vw-2rem,20rem)] animate-in fade-in-0 zoom-in-95 duration-300 data-[side=bottom]:slide-in-from-top-2"
            data-side={resolvedPlacement}
        >
            <div
                ref={arrowRef}
                aria-hidden
                className="absolute z-0 size-3 rotate-45 rounded-[2px] border border-primary/20 bg-popover shadow-sm"
                style={arrowStyle}
            />
            <SpotlightContentBox className={className} />
        </div>
    );
}

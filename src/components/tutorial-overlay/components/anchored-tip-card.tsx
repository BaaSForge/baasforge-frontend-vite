import type { CSSProperties, RefObject } from "react";
import { TutorialTipContent } from "./tutorial-tip-content";
import type { TutorialOverlayPlacement } from "../types";

type AnchoredTipCardProps = {
    setFloatingRef: (node: HTMLElement | null) => void;
    floatingStyles: CSSProperties;
    resolvedPlacement: TutorialOverlayPlacement;
    arrowRef: RefObject<HTMLDivElement | null>;
    arrowStyle: CSSProperties;
    title?: string;
    description?: React.ReactNode;
    dismissLabel?: string;
    onDismiss: () => void;
    children?: React.ReactNode;
    className?: string;
};

export function AnchoredTipCard({
    setFloatingRef,
    floatingStyles,
    resolvedPlacement,
    arrowRef,
    arrowStyle,
    title,
    description,
    dismissLabel,
    onDismiss,
    children,
    className,
}: AnchoredTipCardProps) {
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
            <TutorialTipContent
                title={title}
                description={description}
                dismissLabel={dismissLabel}
                onDismiss={onDismiss}
                className={className}
            >
                {children}
            </TutorialTipContent>
        </div>
    );
}

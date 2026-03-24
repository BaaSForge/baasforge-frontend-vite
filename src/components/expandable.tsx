"use client";

import { SCROLL_EDGE_FADER_DEFAULT_FROM, ScrollEdgeFader } from "@/components/scroll-edge-fader";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLayoutEffect, useRef, useState } from "react";

export interface ExpandableProps {
    children: React.ReactNode;
    trigger?: (isOpen: boolean, setOpen: (open: boolean) => void, isOverflowing: boolean) => React.ReactNode;
    maxLines: number;
    className?: string;
    bottomEdgeFade?: boolean;
    bottomEdgeFadeFromClassName?: string;
}

// Full class names so Tailwind JIT includes them (dynamic `line-clamp-${n}` is purged)
const LINE_CLAMP_CLASSES: Record<number, string> = {
    1: "line-clamp-1",
    2: "line-clamp-2",
    3: "line-clamp-3",
    4: "line-clamp-4",
    5: "line-clamp-5",
    6: "line-clamp-6",
    7: "line-clamp-7",
    8: "line-clamp-8",
    9: "line-clamp-9",
    10: "line-clamp-10",
    11: "line-clamp-11",
    12: "line-clamp-12",
};

export function Expandable({
    children,
    trigger,
    maxLines,
    className,
    bottomEdgeFade = false,
    bottomEdgeFadeFromClassName = SCROLL_EDGE_FADER_DEFAULT_FROM,
}: ExpandableProps) {
    const [open, setOpen] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const clampClass = LINE_CLAMP_CLASSES[maxLines] ?? LINE_CLAMP_CLASSES[5];

    // line-clamp makes scrollHeight === clientHeight in common engines, so overflow
    // must be detected by comparing natural height (no clamp) to clamped client height.
    useLayoutEffect(() => {
        if (open) return;
        const el = contentRef.current;
        if (!el) return;

        const checkOverflow = () => {
            el.classList.remove(clampClass);
            void el.offsetHeight;
            const fullHeight = el.scrollHeight;
            el.classList.add(clampClass);
            void el.offsetHeight;
            const clampedHeight = el.clientHeight;
            setIsOverflowing(fullHeight > clampedHeight + 1);
        };

        checkOverflow();

        const observer = new ResizeObserver(checkOverflow);
        observer.observe(el);
        return () => observer.disconnect();
    }, [children, open, maxLines, clampClass]);

    return (
        <div ref={contentRef} className={cn(!open && clampClass, className)}>
            {children}
            {bottomEdgeFade && !open && isOverflowing && (
                <ScrollEdgeFader edge="bottom" fromClassName={bottomEdgeFadeFromClassName} className="z-[1]" />
            )}
            {trigger?.(open, setOpen, isOverflowing)}
        </div>
    );
}

type Props = {
    isOpen: boolean;
    setOpen: (open: boolean) => void;
} & Omit<ButtonProps, "onClick">;

export function ToggleButton({ isOpen, setOpen, className, ...props }: Props) {
    return (
        <Button
            size="xs"
            variant="ghost"
            className={cn("bg-gradient-to-b from-transparent to-background hover:bg-none", className)}
            onClick={() => setOpen(!isOpen)}
            {...props}
        />
    );
}

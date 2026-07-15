import { cn } from "@/lib/utils";
import {
    ArrowDown,
    ArrowDownLeft,
    ArrowDownRight,
    ArrowLeft,
    ArrowRight,
    ArrowUp,
    ArrowUpLeft,
    ArrowUpRight,
    type LucideIcon,
} from "lucide-react";
import { TARGET_SPOTLIGHT_OVERLAY_ATTRIBUTE } from "../lib/outside-event";
import type { ScrollHint as ScrollHintData, ScrollHintIcon } from "../lib/scroll-hint";
import "./scroll-hint.css";

const SCROLL_HINT_ICONS: Record<ScrollHintIcon, LucideIcon> = {
    up: ArrowUp,
    down: ArrowDown,
    left: ArrowLeft,
    right: ArrowRight,
    leftTop: ArrowUpLeft,
    rightTop: ArrowUpRight,
    leftDown: ArrowDownLeft,
    rightDown: ArrowDownRight,
};

const SCROLL_HINT_ICON_ANIMATIONS: Record<ScrollHintIcon, string> = {
    up: "animate__fadeInUp",
    down: "animate__fadeInDown",
    left: "animate__fadeInRight",
    right: "animate__fadeInLeft",
    leftTop: "animate__fadeInBottomRight",
    rightTop: "animate__fadeInBottomLeft",
    leftDown: "animate__fadeInTopRight",
    rightDown: "animate__fadeInTopLeft",
};

type ScrollHintProps = {
    hint: ScrollHintData;
    onScrollToTarget: () => void;
};

export function ScrollHint({ hint, onScrollToTarget }: ScrollHintProps) {
    const Icon = SCROLL_HINT_ICONS[hint.icon];

    return (
        <button
            type="button"
            onClick={onScrollToTarget}
            aria-label={hint.label}
            {...{ [TARGET_SPOTLIGHT_OVERLAY_ATTRIBUTE]: "" }}
            className="group absolute inset-0 z-20 flex cursor-pointer items-center justify-center gap-1.5 text-inverse-foreground"
        >
            <div
                aria-hidden
                className="absolute inset-0 bg-inverse/80 backdrop-blur-[2px] transition-colors group-hover:bg-inverse/90"
            />
            <Icon
                className={cn(
                    "relative z-10 size-4 shrink-0 animate__animated animate__infinite animate__slow",
                    SCROLL_HINT_ICON_ANIMATIONS[hint.icon],
                )}
                aria-hidden
            />
            <span className="relative z-10 text-sm font-medium">{hint.label}</span>
        </button>
    );
}

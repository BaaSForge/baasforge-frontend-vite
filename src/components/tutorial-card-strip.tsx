"use client";

import { FadedScrollArea } from "@/components/faded-scroll-area";
import { TutorialCard } from "@/components/tutorial-card";
import { cn } from "@/lib/utils";
import type { TutorialDisplayStatus } from "@/services/tutorials";
import type { LucideIcon } from "lucide-react";
import { useLayoutEffect, useRef } from "react";

export type TutorialCardItem = {
    id?: string;
    title: string;
    description: string;
    icon: LucideIcon;
    status?: TutorialDisplayStatus;
};

/** One full card plus a peek of the next: 1.2 on mobile, 1.5 from md up. */
const TUTORIAL_CARD_GAP_REM = 0.75;

const TUTORIAL_CARD_WIDTH = `calc((100cqw - ${TUTORIAL_CARD_GAP_REM}rem) / var(--tutorial-visible-cards))`;

export interface TutorialCardStripProps {
    items: ReadonlyArray<TutorialCardItem>;
    heading?: string;
    className?: string;
    scrollToItemId?: string | null;
}

export function TutorialCardStrip({ items, heading = "Live tutorials", className, scrollToItemId }: TutorialCardStripProps) {
    const cardRefs = useRef(new Map<string, HTMLDivElement>());
    const lastScrolledIdRef = useRef<string | null>(null);

    useLayoutEffect(() => {
        if (scrollToItemId == null) {
            lastScrolledIdRef.current = null;
            return;
        }
        if (lastScrolledIdRef.current === scrollToItemId) return;

        const element = cardRefs.current.get(scrollToItemId);
        if (element == null) return;

        lastScrolledIdRef.current = scrollToItemId;
        element.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }, [scrollToItemId, items]);

    return (
        <div className={cn("space-y-3", className)}>
            <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm font-medium">{heading}</p>
                <p className="text-muted-foreground text-xs tabular-nums">{items.length} steps</p>
            </div>
            <div className="@container w-full min-w-0 [--tutorial-visible-cards:1.2] md:[--tutorial-visible-cards:1.5]">
                <FadedScrollArea orientation="horizontal" horizontalIntrinsicHeight className="w-full min-w-0">
                    <div className="flex w-max items-stretch gap-3">
                        {items.map((tutorial, index) => (
                            <div
                                key={tutorial.id ?? tutorial.title}
                                ref={(node) => {
                                    if (tutorial.id == null || node == null) {
                                        if (tutorial.id != null) cardRefs.current.delete(tutorial.id);
                                        return;
                                    }
                                    cardRefs.current.set(tutorial.id, node);
                                }}
                                className="flex shrink-0 self-stretch"
                                style={{ width: TUTORIAL_CARD_WIDTH }}
                            >
                                <TutorialCard
                                    number={index + 1}
                                    title={tutorial.title}
                                    description={tutorial.description}
                                    icon={tutorial.icon}
                                    status={tutorial.status}
                                    className="h-full w-full"
                                />
                            </div>
                        ))}
                    </div>
                </FadedScrollArea>
            </div>
        </div>
    );
}

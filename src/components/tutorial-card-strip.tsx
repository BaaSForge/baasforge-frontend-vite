"use client";

import { FadedScrollArea } from "@/components/faded-scroll-area";
import { TutorialCard } from "@/components/tutorial-card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export type TutorialCardItem = {
    title: string;
    description: string;
    icon: LucideIcon;
};

/** One full card plus a peek of the next: 1.2 on mobile, 1.5 from md up. */
const TUTORIAL_CARD_GAP_REM = 0.75;

const TUTORIAL_CARD_WIDTH = `calc((100cqw - ${TUTORIAL_CARD_GAP_REM}rem) / var(--tutorial-visible-cards))`;

export interface TutorialCardStripProps {
    items: ReadonlyArray<TutorialCardItem>;
    heading?: string;
    className?: string;
}

export function TutorialCardStrip({ items, heading = "Live tutorials", className }: TutorialCardStripProps) {
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
                                key={tutorial.title}
                                className="flex shrink-0 self-stretch"
                                style={{ width: TUTORIAL_CARD_WIDTH }}
                            >
                                <TutorialCard
                                    number={index + 1}
                                    title={tutorial.title}
                                    description={tutorial.description}
                                    icon={tutorial.icon}
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

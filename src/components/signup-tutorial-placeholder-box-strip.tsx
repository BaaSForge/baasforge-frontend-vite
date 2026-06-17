"use client";

import { FadedScrollArea } from "@/components/faded-scroll-area";

const PLACEHOLDER_BOX_COUNT = 6;

/** One full box plus half of the next is visible in the strip viewport. */
const VISIBLE_PLACEHOLDER_BOXES = 1.5;

const PLACEHOLDER_BOX_GAP_REM = 0.75;

const PLACEHOLDER_BOX_WIDTH = `calc((100cqw - ${PLACEHOLDER_BOX_GAP_REM}rem) / ${VISIBLE_PLACEHOLDER_BOXES})`;

export function SignupTutorialPlaceholderBoxStrip() {
    return (
        <div className="space-y-3">
            <p className="text-sm font-medium">Live tutorials</p>
            <div className="@container w-full min-w-0">
                <FadedScrollArea orientation="horizontal" horizontalIntrinsicHeight className="w-full min-w-0">
                    <div className="flex w-max gap-3">
                        {Array.from({ length: PLACEHOLDER_BOX_COUNT }, (_, index) => (
                            <div
                                key={index}
                                className="bg-muted/45 h-28 shrink-0 rounded-xl"
                                style={{ width: PLACEHOLDER_BOX_WIDTH }}
                                aria-hidden
                            />
                        ))}
                    </div>
                </FadedScrollArea>
            </div>
        </div>
    );
}

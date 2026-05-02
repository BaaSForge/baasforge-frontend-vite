"use client";

import { FadedScrollArea } from "@/components/faded-scroll-area";
import { TabsList } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

export function useScalarLiveInteractionTabsLayout() {
    const isMobile = useIsMobile();
    return {
        isMobile,
        tabsOrientation: isMobile ? ("horizontal" as const) : ("vertical" as const),
        tabsClassName: cn(
            "flex gap-2 rounded-lg border bg-background p-2",
            isMobile ? "min-h-0 flex-col !flex-col" : "min-h-[18rem] flex-row !flex-row",
        ),
        tabsListClassName: cn(
            "text-muted-foreground inline-flex h-auto shrink-0 flex-nowrap gap-1.5 p-[3px]",
            isMobile
                ? "min-h-9 w-max max-w-none items-center justify-start"
                : "max-w-[12.5rem] w-full flex-col items-stretch justify-start",
        ),
        tabsTriggerClassName: cn(
            "!h-auto min-h-0 shrink-0 px-2.5 py-1.5 text-xs font-medium leading-snug text-muted-foreground",
            "data-[state=active]:border-border data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md",
            "dark:data-[state=active]:bg-background dark:data-[state=active]:text-foreground",
            isMobile ? "flex-none justify-center text-center whitespace-nowrap" : "w-full flex-none justify-start text-left whitespace-normal break-words",
        ),
    };
}

export function ScalarLiveInteractionTabsList({
    isMobile,
    className,
    ...props
}: ComponentProps<typeof TabsList> & { isMobile: boolean }) {
    const list = <TabsList className={className} {...props} />;
    if (!isMobile) return list;
    return (
        <FadedScrollArea
            orientation="horizontal"
            horizontalIntrinsicHeight
            hideScrollbar
            className="min-w-0 w-full max-w-full"
        >
            {list}
        </FadedScrollArea>
    );
}

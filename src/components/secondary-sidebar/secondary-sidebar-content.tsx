import { FadedScrollArea } from "@/components/faded-scroll-area";
import { cn } from "@/lib/utils";
import * as React from "react";
import { SidebarContent } from "../ui/sidebar";

/** Fixed strip at the top of the secondary sidebar (outside the scroll viewport). */
export function SecondarySidebarStickyHeader({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            className={cn("shrink-0 border-b border-sidebar-border bg-sidebar px-2 pb-2 pt-2", className)}
            {...props}
        />
    );
}

/** Fixed strip at the bottom of the secondary sidebar (outside the scroll viewport). */
export function SecondarySidebarStickyFooter({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            className={cn("shrink-0 border-t border-sidebar-border bg-sidebar px-2 pb-2 pt-2", className)}
            {...props}
        />
    );
}

export type SecondarySidebarContentProps = Omit<React.ComponentProps<typeof SidebarContent>, "children"> & {
    faderFromClassName?: string;
    /** Renders above the scroll area; does not scroll with body content. */
    header?: React.ReactNode;
    /** Renders below the scroll area; does not scroll with body content. */
    footer?: React.ReactNode;
    children: React.ReactNode;
};

/**
 * Secondary sidebar shell: optional fixed header and footer with a single scrollable region between them.
 * Keeps edge fades on {@link FadedScrollArea} aligned with the scroll viewport (unlike CSS `sticky` inside the same scroll container).
 */
export function SecondarySidebarContent({
    className,
    header,
    footer,
    children,
    faderFromClassName = "from-sidebar",
    ...props
}: SecondarySidebarContentProps) {
    return (
        <SidebarContent
            className={cn("mt-1.5 flex h-full min-h-0 flex-1 flex-col gap-0 overflow-hidden p-0", className)}
            {...props}
        >
            {header}
            {/* Flex item must shrink so Radix viewport gets a max height and can scroll */}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <FadedScrollArea
                    className="h-full min-h-0 flex-1 max-h-none"
                    faderFromClassName={faderFromClassName}
                >
                    <div className="flex flex-col gap-2 p-2">{children}</div>
                </FadedScrollArea>
            </div>
            {footer}
        </SidebarContent>
    );
}

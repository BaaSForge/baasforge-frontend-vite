import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";

import { cn } from "@/lib/utils";
import { absorbNextClick } from "@/lib/absorb-next-click";

function Drawer({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Root>) {
    return <DrawerPrimitive.Root data-slot="drawer" {...props} />;
}

function DrawerTrigger({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
    return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

function DrawerPortal({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
    return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />;
}

function DrawerClose({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Close>) {
    return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

function DrawerOverlay({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
    return (
        <DrawerPrimitive.Overlay
            data-slot="drawer-overlay"
            className={cn(
                "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-modal bg-black/50",
                className,
            )}
            {...props}
        />
    );
}

function DrawerContent({
    className,
    children,
    dismissOnOverlayClick = true,
    onPointerDownOutside: onPointerDownOutsideProp,
    onCloseAutoFocus: onCloseAutoFocusProp,
    ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content> & {
    dismissOnOverlayClick?: boolean;
}) {
    const handlePointerDownOutside: React.ComponentProps<typeof DrawerPrimitive.Content>["onPointerDownOutside"] = (e) => {
        if (dismissOnOverlayClick) absorbNextClick();
        onPointerDownOutsideProp?.(e);
    };

    const handleCloseAutoFocus: React.ComponentProps<typeof DrawerPrimitive.Content>["onCloseAutoFocus"] = (e) => {
        e.preventDefault();
        onCloseAutoFocusProp?.(e);
    };

    return (
        <DrawerPortal data-slot="drawer-portal">
            <DrawerOverlay className={dismissOnOverlayClick ? undefined : "pointer-events-none"} />
            <DrawerPrimitive.Content
                data-slot="drawer-content"
                onPointerDownOutside={handlePointerDownOutside}
                onCloseAutoFocus={handleCloseAutoFocus}
                onClick={(e) => e.stopPropagation()}
                className={cn(
                    "group/drawer-content bg-background fixed z-modal flex h-auto max-h-[80dvh] flex-col overflow-hidden",
                    "data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:right-auto data-[vaul-drawer-direction=top]:bottom-auto data-[vaul-drawer-direction=top]:left-1/2 data-[vaul-drawer-direction=top]:w-full data-[vaul-drawer-direction=top]:-translate-x-1/2 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:rounded-b-lg data-[vaul-drawer-direction=top]:border-b",
                    "data-[vaul-drawer-direction=bottom]:right-auto data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:left-1/2 data-[vaul-drawer-direction=bottom]:w-full data-[vaul-drawer-direction=bottom]:-translate-x-1/2 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:rounded-t-lg data-[vaul-drawer-direction=bottom]:border-t",
                    "data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=right]:sm:max-w-sm",
                    "data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=left]:sm:max-w-sm",
                    className,
                )}
                {...props}
            >
                <div className="bg-muted mx-auto mt-4 hidden h-2 w-[100px] shrink-0 rounded-full group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />
                {children}
            </DrawerPrimitive.Content>
        </DrawerPortal>
    );
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="drawer-header"
            className={cn(
                "sticky top-0 z-10 shrink-0 border-b border-border bg-background flex flex-col gap-0.5 py-4 px-0 group-data-[vaul-drawer-direction=bottom]/drawer-content:text-center group-data-[vaul-drawer-direction=top]/drawer-content:text-center md:gap-1.5 md:px-4 md:text-left mb-4",
                className,
            )}
            {...props}
        />
    );
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
    return <div data-slot="drawer-footer" className={cn("mt-auto flex flex-col gap-2 py-4 px-0 md:px-4", className)} {...props} />;
}

function DrawerTitle({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Title>) {
    return <DrawerPrimitive.Title data-slot="drawer-title" className={cn("text-foreground font-semibold", className)} {...props} />;
}

function DrawerDescription({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Description>) {
    return <DrawerPrimitive.Description data-slot="drawer-description" className={cn("text-muted-foreground text-sm", className)} {...props} />;
}

export { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerPortal, DrawerTitle, DrawerTrigger };

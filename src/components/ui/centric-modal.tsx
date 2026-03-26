"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { XIcon } from "lucide-react";
import * as React from "react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "./drawer";

function CentricModal(props: React.ComponentProps<typeof Dialog>) {
    const isMobile = useIsMobile();
    const Component = isMobile ? Drawer : Dialog;
    return <Component {...props} />;
}

function CentricModalTrigger(props: React.ComponentProps<typeof DialogTrigger>) {
    const isMobile = useIsMobile();
    const Component = isMobile ? DrawerTrigger : DialogTrigger;
    return <Component {...props} />;
}

function CentricModalClose(props: React.ComponentProps<typeof DialogClose>) {
    const isMobile = useIsMobile();
    const Component = isMobile ? DrawerClose : DialogClose;
    return <Component {...props} />;
}

function CentricModalContent({
    className,
    children,
    showCloseButton = true,
    ...props
}: React.ComponentProps<typeof DialogContent> & {
    showCloseButton?: boolean;
}) {
    const isMobile = useIsMobile();

    if (isMobile) {
        const mobileChildren = React.Children.toArray(children);
        const headerIndex = mobileChildren.findIndex((child) => React.isValidElement(child) && child.type === CentricModalHeader);
        const footerIndex = mobileChildren.findIndex((child) => React.isValidElement(child) && child.type === CentricModalFooter);
        const header = headerIndex >= 0 ? mobileChildren[headerIndex] : null;
        const footer = footerIndex >= 0 ? mobileChildren[footerIndex] : null;
        const body = mobileChildren.filter((_, index) => index !== headerIndex && index !== footerIndex);

        return (
            <DrawerContent className={cn("h-auto max-h-[80dvh] overflow-hidden", className)} {...props}>
                <div className="flex min-h-0 flex-1 flex-col">
                    {header}
                    <div className="min-h-0 overflow-y-auto">{body}</div>
                    {footer}
                </div>
                {showCloseButton && (
                    <DrawerClose className="ring-offset-background focus:ring-ring absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
                        <XIcon />
                        <span className="sr-only">Close</span>
                    </DrawerClose>
                )}
            </DrawerContent>
        );
    }

    return (
        <DialogContent className={className} showCloseButton={showCloseButton} {...props}>
            {children}
        </DialogContent>
    );
}

function CentricModalHeader(props: React.ComponentProps<typeof DialogHeader>) {
    const isMobile = useIsMobile();
    const Component = isMobile ? DrawerHeader : DialogHeader;
    return <Component {...props} />;
}

function CentricModalFooter(props: React.ComponentProps<typeof DialogFooter>) {
    const isMobile = useIsMobile();
    const Component = isMobile ? DrawerFooter : DialogFooter;
    return <Component {...props} />;
}

function CentricModalTitle(props: React.ComponentProps<typeof DialogTitle>) {
    const isMobile = useIsMobile();
    const Component = isMobile ? DrawerTitle : DialogTitle;
    return <Component {...props} />;
}

function CentricModalDescription(props: React.ComponentProps<typeof DialogDescription>) {
    const isMobile = useIsMobile();
    const Component = isMobile ? DrawerDescription : DialogDescription;
    return <Component {...props} />;
}

export {
    CentricModal,
    CentricModalClose,
    CentricModalContent,
    CentricModalDescription,
    CentricModalFooter,
    CentricModalHeader,
    CentricModalTitle,
    CentricModalTrigger,
};

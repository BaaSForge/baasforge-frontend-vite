import { Maximize2 } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
    CentricModal,
    CentricModalContent,
    CentricModalHeader,
    CentricModalTitle,
} from "@/components/ui/centric-modal";

export function ToolDetailModalExpandButton({ onClick, ariaLabel }: { onClick: () => void; ariaLabel: string }) {
    return (
        <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="shrink-0 text-muted-foreground hover:text-foreground"
            aria-label={ariaLabel}
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
        >
            <Maximize2 className="size-3.5" aria-hidden />
        </Button>
    );
}

export function ToolDetailModalLayout({
    open,
    onOpenChange,
    title,
    children,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    children: ReactNode;
}) {
    return (
        <CentricModal open={open} onOpenChange={onOpenChange}>
            <CentricModalContent className="sm:max-w-[48rem]" showCloseButton>
                <CentricModalHeader>
                    <CentricModalTitle>{title}</CentricModalTitle>
                </CentricModalHeader>
                <div className="space-y-4">{children}</div>
            </CentricModalContent>
        </CentricModal>
    );
}

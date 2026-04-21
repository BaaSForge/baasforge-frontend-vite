"use client";

import { Markdown } from "@/components/markdown";
import { CentricModal, CentricModalContent, CentricModalHeader, CentricModalTitle } from "@/components/ui/centric-modal";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export interface UnitFullExplanationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    explanation: string;
    isDeleted?: boolean;
    isRejected?: boolean;
    badges: ReactNode;
}

export function UnitFullExplanationModal({
    open,
    onOpenChange,
    explanation,
    isDeleted,
    isRejected,
    badges,
}: UnitFullExplanationModalProps) {
    return (
        <CentricModal open={open} onOpenChange={onOpenChange}>
            <CentricModalContent className="sm:max-w-[48rem]" showCloseButton>
                <CentricModalHeader>
                    <CentricModalTitle>Full explanation</CentricModalTitle>
                    <div className="flex flex-row flex-wrap items-center gap-1">{badges}</div>
                </CentricModalHeader>
                <div
                    className={cn(
                        "prose prose-sm dark:prose-invert max-w-none",
                        isDeleted && "line-through",
                        isRejected && "opacity-90",
                    )}
                >
                    <Markdown>{explanation}</Markdown>
                </div>
            </CentricModalContent>
        </CentricModal>
    );
}

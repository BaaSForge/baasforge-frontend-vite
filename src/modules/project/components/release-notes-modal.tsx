"use client";

import { Markdown } from "@/components/markdown";
import { CentricModal, CentricModalContent, CentricModalHeader, CentricModalTitle } from "@/components/ui/centric-modal";
import type { ReactNode } from "react";

export interface ReleaseNotesModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    notes: string;
    badges: ReactNode;
}

export function ReleaseNotesModal({ open, onOpenChange, notes, badges }: ReleaseNotesModalProps) {
    return (
        <CentricModal open={open} onOpenChange={onOpenChange}>
            <CentricModalContent className="sm:max-w-[48rem]" showCloseButton>
                <CentricModalHeader>
                    <CentricModalTitle>Release notes</CentricModalTitle>
                    <div className="flex flex-wrap items-center gap-1">{badges}</div>
                </CentricModalHeader>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                    <Markdown>{notes}</Markdown>
                </div>
            </CentricModalContent>
        </CentricModal>
    );
}

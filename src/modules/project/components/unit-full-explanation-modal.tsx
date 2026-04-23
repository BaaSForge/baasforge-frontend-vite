"use client";

import { Markdown } from "@/components/markdown";
import { CentricModal, CentricModalContent, CentricModalHeader, CentricModalTitle } from "@/components/ui/centric-modal";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { CollapsiblePanelTitle } from "@/components/ui/collapsible-panel-title";
import { cn } from "@/lib/utils";
import { UnitExplanationCurrentViewer } from "@/modules/project-chat/components/unit-explanation-current-viewer";
import { usePersistedUnitDetailPanels } from "@/modules/project-chat/hooks/use-persisted-unit-detail-panels";
import type { ReactNode } from "react";

export interface UnitFullExplanationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    explanation: string;
    code: string | null;
    isDeleted?: boolean;
    isRejected?: boolean;
    badges: ReactNode;
}

export function UnitFullExplanationModal({
    open,
    onOpenChange,
    explanation,
    code,
    isDeleted,
    isRejected,
    badges,
}: UnitFullExplanationModalProps) {
    const [panels, setPanelOpen] = usePersistedUnitDetailPanels();

    return (
        <CentricModal open={open} onOpenChange={onOpenChange}>
            <CentricModalContent className="sm:max-w-[48rem]" showCloseButton>
                <CentricModalHeader>
                    <CentricModalTitle>Full explanation</CentricModalTitle>
                    <div className="flex flex-row flex-wrap items-center gap-1">{badges}</div>
                </CentricModalHeader>
                <div className="space-y-4">
                    <Collapsible
                        open={panels.explanationNote}
                        onOpenChange={(next) => setPanelOpen("explanationNote", next)}
                    >
                        <CollapsiblePanelTitle>Explanation note</CollapsiblePanelTitle>
                        <CollapsibleContent className="min-h-0">
                            <div
                                className={cn(
                                    "prose prose-sm dark:prose-invert max-w-none pt-2",
                                    isDeleted && "line-through",
                                    isRejected && "opacity-90",
                                )}
                            >
                                <Markdown>{explanation}</Markdown>
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                    <Collapsible open={panels.code} onOpenChange={(next) => setPanelOpen("code", next)}>
                        <CollapsiblePanelTitle>Code</CollapsiblePanelTitle>
                        <CollapsibleContent className="min-h-0">
                            <div className={cn("pt-2", isDeleted && "line-through", isRejected && "opacity-90")}>
                                <UnitExplanationCurrentViewer code={code} language="typescript" plainText={false} />
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                </div>
            </CentricModalContent>
        </CentricModal>
    );
}

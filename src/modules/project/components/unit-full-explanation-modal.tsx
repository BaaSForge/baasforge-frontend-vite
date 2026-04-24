"use client";

import { Markdown } from "@/components/markdown";
import { SectionTitle } from "@/components/section-title";
import { CentricModal, CentricModalContent, CentricModalHeader, CentricModalTitle } from "@/components/ui/centric-modal";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { UnitExplanationCurrentViewer } from "@/modules/project-chat/components/unit-explanation-current-viewer";
import { usePersistedUnitDetailPanels } from "@/modules/project-chat/hooks/use-persisted-unit-detail-panels";
import { type ReactNode, useMemo } from "react";

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
    const toggleValue = useMemo(() => {
        const v: string[] = [];
        if (panels.explanationNote) v.push("explanationNote");
        if (panels.code) v.push("code");
        return v;
    }, [panels]);

    return (
        <CentricModal open={open} onOpenChange={onOpenChange}>
            <CentricModalContent className="sm:max-w-[48rem]" showCloseButton>
                <CentricModalHeader>
                    <CentricModalTitle>Full explanation</CentricModalTitle>
                    <div className="flex flex-row flex-wrap items-center gap-1">{badges}</div>
                </CentricModalHeader>
                <div className="space-y-4">
                    <div className="flex justify-start">
                        <ToggleGroup
                            type="multiple"
                            variant="outline"
                            size="sm"
                            spacing={0}
                            className="h-8 w-fit shrink-0"
                            value={toggleValue}
                            onValueChange={(next) => {
                                setPanelOpen("explanationNote", next.includes("explanationNote"));
                                setPanelOpen("code", next.includes("code"));
                            }}
                            aria-label="Explanation sections"
                        >
                            <ToggleGroupItem
                                value="explanationNote"
                                className="h-7 min-w-0 px-2.5 py-0 text-xs"
                            >
                                Explanation note
                            </ToggleGroupItem>
                            <ToggleGroupItem value="code" className="h-7 min-w-0 px-2.5 py-0 text-xs">
                                Code
                            </ToggleGroupItem>
                        </ToggleGroup>
                    </div>
                    <Collapsible open={panels.explanationNote}>
                        <CollapsibleContent className="min-h-0">
                            <SectionTitle className="mb-2">Explanation note</SectionTitle>
                            <div
                                className={cn(
                                    "prose prose-sm dark:prose-invert max-w-none",
                                    isDeleted && "line-through",
                                    isRejected && "opacity-90",
                                )}
                            >
                                <Markdown>{explanation}</Markdown>
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                    <Collapsible open={panels.code}>
                        <CollapsibleContent className="min-h-0">
                            <SectionTitle className="mb-2">Code</SectionTitle>
                            <div className={cn(isDeleted && "line-through", isRejected && "opacity-90")}>
                                <UnitExplanationCurrentViewer code={code} language="typescript" plainText={false} />
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                </div>
            </CentricModalContent>
        </CentricModal>
    );
}

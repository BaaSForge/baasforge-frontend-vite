"use client";

import { Expandable } from "@/components/expandable";
import { LiveBadge } from "@/components/live-badge";
import { Markdown } from "@/components/markdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { capitalizeFirstLetter, cn } from "@/lib/utils";
import { Maximize2 } from "lucide-react";
import { useState } from "react";
import type { ProjectUnitResponse } from "../types";
import { getProjectUnitTypeBadgeClass } from "../unit-type-badge-class";

export interface UnitCardCompactProps {
    unit: ProjectUnitResponse;
    className?: string;
}

export function UnitCardCompact({ unit, className }: UnitCardCompactProps) {
    const hasParent = unit.parent_unit_id != null;
    const isDeleted = unit.is_deleted === true;
    const explanation = unit.explanation?.trim() ?? "No description";
    const [modalOpen, setModalOpen] = useState(false);

    const badges = (
        <>
            {isDeleted && (
                <Badge variant="destructive" className="text-[0.625rem]" title="This unit has been removed">
                    Deleted
                </Badge>
            )}
            <Badge variant="secondary" className="bg-blue-500/15 text-blue-700 border-blue-500/30 text-[0.625rem]" title={`Version ${unit.version}`}>
                {unit.version}
            </Badge>
            <Badge variant="outline" className={cn("text-[0.625rem]", getProjectUnitTypeBadgeClass(unit.unit_type))}>
                {capitalizeFirstLetter(unit.unit_type)}
            </Badge>
            <LiveBadge isOn={!unit.is_draft} offLabel="Draft" offTitle="Draft, not ready" onLabel="Published" onTitle="Published, ready" />
        </>
    );

    return (
        <div className={cn("relative inline-block w-full min-w-0", className)}>
            {hasParent && (
                <Card
                    className="pointer-events-none absolute left-1.5 top-1.5 z-0 h-full w-full rounded-xl border bg-card p-0 shadow-none"
                    aria-hidden
                />
            )}
            <Card
                className={cn(
                    "relative z-[1] gap-0 overflow-hidden rounded-xl border p-0 shadow-none",
                    isDeleted && "border-destructive",
                )}
            >
                <Expandable
                    className="p-2 text-xs relative"
                    maxLines={7}
                    trigger={(_isOpen, _setOpen, isOverflowing) =>
                        isOverflowing && (
                            <Button
                                type="button"
                                size="xs"
                                variant="secondary"
                                className="rounded-none absolute left-0 right-0 bottom-0 z-[2] text-muted-foreground"
                                onClick={() => setModalOpen(true)}
                                aria-label="Show full description"
                            >
                                <Maximize2 />
                                Read full explanation
                            </Button>
                        )
                    }
                >
                    <div className={cn(isDeleted && "line-through")}>
                        <Markdown>{explanation}</Markdown>
                    </div>
                </Expandable>
                <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                    <DialogContent className="sm:max-w-[48rem] max-h-[85vh] flex flex-col" showCloseButton>
                        <DialogHeader className="flex flex-row">{badges}</DialogHeader>
                        <div
                            className={cn(
                                "prose prose-sm dark:prose-invert max-w-none overflow-y-auto max-h-[70vh] pr-2",
                                isDeleted && "line-through",
                            )}
                        >
                            <Markdown>{explanation}</Markdown>
                        </div>
                    </DialogContent>
                </Dialog>
                <CardAction className="bg-muted/30 w-full flex items-center justify-start p-2 gap-2 border-t">{badges}</CardAction>
            </Card>
        </div>
    );
}

"use client";

import { useState } from "react";
import { Card, CardAction } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import { Maximize2 } from "lucide-react";
import { capitalizeFirstLetter, cn } from "@/lib/utils";
import type { ProjectUnitResponse, ProjectUnitType } from "../types";
import ReactMarkdown from "react-markdown";
import { Expandable } from "@/components/expandable";

function UnitStatusChip({ isDraft }: { isDraft: boolean }) {
  const baseClass = "inline-flex items-center gap-1 text-[10px] text-muted-foreground/50";
  const circleClass = "size-1.5 shrink-0 rounded-full bg-muted-foreground/20";

  if (isDraft) {
    return (
      <span
        className={baseClass}
        title="Draft — not released yet"
        aria-label="Draft, not released"
      >
        <span
          className={circleClass}
          aria-hidden
        />
        <span>draft</span>
      </span>
    );
  }
  return (
    <span
      className={cn(baseClass, "text-foreground")}
      title="Published / live"
      aria-label="Live"
    >
      <span className="relative flex size-3 shrink-0 items-center justify-center bg-secondary border border-blue-500 rounded-full" aria-hidden>
        <span
          className="absolute inset-0 origin-center rounded-full bg-blue-500 animate-[status-pulse-ring_1.2s_ease-out_infinite]"
          aria-hidden
        />
        <span className={cn(circleClass, "bg-blue-500")} aria-hidden />
      </span>
      <span>Live</span>
    </span>
  );
}

export interface UnitCardCompactProps {
  unit: ProjectUnitResponse;
  className?: string;
}

function getTypeBadgeClass(type: ProjectUnitType): string {
  if (type === "controller") {
    return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30";
  }
  return "bg-muted text-muted-foreground border-border";
}

export function UnitCardCompact({ unit, className }: UnitCardCompactProps) {
  const hasParent = unit.parent_unit_id != null;
  const explanation = unit.explanation?.trim() ?? "No description";
  const [modalOpen, setModalOpen] = useState(false);

  const badges = (
    <>
      <Badge
        variant="secondary"
        className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30 text-[10px] font-semibold px-1.5 py-0 truncate max-w-full"
        title={`Version ${unit.version}`}
      >
        {unit.version}
      </Badge>
      <Badge
        variant="outline"
        className={cn(
          "text-[10px] font-medium px-1.5 py-0 border truncate max-w-full",
          getTypeBadgeClass(unit.unit_type)
        )}
      >
        {capitalizeFirstLetter(unit.unit_type)}
      </Badge>
      <UnitStatusChip isDraft={unit.is_draft} />
    </>
  );

  return (
    <div className={cn("relative inline-block w-full min-w-0", className)}>
      {hasParent && (
        <Card
          className="absolute left-1.5 w-full h-full top-1.5 z-0 rounded-xl border shadow-none"
          aria-hidden
        />
      )}
      <Card className="p-0 z-10 rounded-xl border shadow-none overflow-hidden gap-0">
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
          <ReactMarkdown>{explanation}</ReactMarkdown>
        </Expandable>
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent
            className="sm:max-w-[48rem] max-h-[85vh] flex flex-col"
            showCloseButton
          >
            <DialogHeader className="flex flex-row">
              {badges}
            </DialogHeader>
            <div className="prose prose-sm dark:prose-invert max-w-none overflow-y-auto max-h-[70vh] pr-2">
              <ReactMarkdown>{explanation}</ReactMarkdown>
            </div>
          </DialogContent>
        </Dialog>
        <CardAction className="bg-muted/30 w-full flex items-center justify-start p-2 gap-2 border-t">
          {badges}
        </CardAction>
      </Card>
    </div>
  );
}

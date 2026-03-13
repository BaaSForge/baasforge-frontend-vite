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
import { Markdown } from "@/components/markdown";
import { Expandable } from "@/components/expandable";
import { LiveBadge } from "@/components/live-badge";

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
        className="bg-blue-500/15 text-blue-700 border-blue-500/30 text-[0.625rem]"
        title={`Version ${unit.version}`}
      >
        {unit.version}
      </Badge>
      <Badge
        variant="outline"
        className={cn(
          "text-[0.625rem]",
          getTypeBadgeClass(unit.unit_type)
        )}
      >
        {capitalizeFirstLetter(unit.unit_type)}
      </Badge>
      <LiveBadge
        isOn={!unit.is_draft}
        offLabel="Draft"
        offTitle="Draft, not ready"
        onLabel="Published"
        onTitle="Published, ready"
      />
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
          <Markdown>{explanation}</Markdown>
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
              <Markdown>{explanation}</Markdown>
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

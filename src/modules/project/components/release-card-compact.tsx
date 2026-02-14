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
import { cn } from "@/lib/utils";
import type { ProjectRuntimeResponse, ReleaseResponse } from "../types";
import ReactMarkdown from "react-markdown";
import { Expandable } from "@/components/expandable";
import { formatDateTimeMedium } from "@/utils/time";
import { LiveBadge } from "@/components/live-badge";

export interface ReleaseCardCompactProps {
  release: ReleaseResponse;
  className?: string;
  selected?: boolean;
  runtime?: ProjectRuntimeResponse;
  onClick?: () => void;
}

export function ReleaseCardCompact({
  release,
  runtime,
  className,
  selected,
  onClick,
}: ReleaseCardCompactProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const isLive = !!runtime;

  const badges = (
    <>
      <Badge
        variant="secondary"
        className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30 text-[10px]"
        title={`Version ${release.version}`}
      >
        {release.version}
      </Badge>
      {isLive && (
        <Badge variant="outline" className="text-[10px]">
          deployed to {runtime.name}
        </Badge>
      )}
      {isLive && (
        <LiveBadge isOn onLabel="Live" />
      )}
      <Badge
        variant="outline"
        className="text-[10px]"
      >
        {formatDateTimeMedium(release.created_at)}
      </Badge>
    </>
  );

  return (
    <div
      className={cn(
        "relative inline-block w-full min-w-0",
        selected &&
          "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40",
        className
      )}
      aria-selected={selected}
      onClick={onClick}
    >
      <Card
        className={cn(
          "p-0 z-10 rounded-xl border shadow-none overflow-hidden gap-0 transition-shadow transition-colors",
          selected &&
            "border-emerald-500 shadow-lg"
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
                onClick={(e) => {
                  e.stopPropagation();
                  setModalOpen(true);
                }}
                aria-label="Show full release notes"
              >
                <Maximize2 />
                Read full release notes
              </Button>
            )
          }
        >
          <ReactMarkdown components={{ pre: () => null }}>
            {release.notes}
          </ReactMarkdown>
        </Expandable>
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent
            className="sm:max-w-[48rem] max-h-[85vh] flex flex-col"
            showCloseButton
          >
            <DialogHeader className="flex">
              {badges}
            </DialogHeader>
            <div className="prose prose-sm dark:prose-invert max-w-none overflow-y-auto max-h-[70vh] pr-2">
              <ReactMarkdown>{release.notes}</ReactMarkdown>
            </div>
          </DialogContent>
        </Dialog>
        <CardAction
          className={cn(
            "bg-muted/30 w-full flex flex-wrap items-center justify-start p-2 gap-2 border-t",
            selected && "bg-emerald-200/40 dark:bg-emerald-900/40 border-emerald-500"
          )}
        >
          {badges}
        </CardAction>
      </Card>
      {selected && (
        <span
          className="absolute top-1.5 right-1.5 rounded-full bg-emerald-500 text-xs text-white px-2 py-0.5 font-semibold pointer-events-none select-none shadow"
          aria-hidden="true"
        >
          Selected
        </span>
      )}
    </div>
  );
}

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
import type { ReleaseResponse } from "../types";
import ReactMarkdown from "react-markdown";
import { Expandable } from "@/components/expandable";
import { formatDateTimeMedium } from "@/utils/time";

export interface ReleaseCardCompactProps {
  release: ReleaseResponse;
  className?: string;
}

export function ReleaseCardCompact({ release, className }: ReleaseCardCompactProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const badges = (
    <>
      <Badge
        variant="secondary"
        className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30 text-[10px] font-semibold px-1.5 py-0 truncate max-w-full"
        title={`Version ${release.version}`}
      >
        {release.version}
      </Badge>
      <Badge
        variant="outline"
        className="text-[10px] font-medium px-1.5 py-0 border truncate max-w-full"
      >
        {formatDateTimeMedium(release.created_at)}
      </Badge>
    </>
  );

  return (
    <div className={cn("relative inline-block w-full min-w-0", className)}>
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
                aria-label="Show full release notes"
              >
                <Maximize2 />
                Read full release notes
              </Button>
            )
          }
        >
          <ReactMarkdown components={{ pre: () => null }}>{release.notes}</ReactMarkdown>
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
              <ReactMarkdown>{release.notes}</ReactMarkdown>
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

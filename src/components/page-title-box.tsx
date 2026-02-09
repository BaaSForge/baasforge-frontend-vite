import * as React from "react";
import { InfoIcon } from "lucide-react";
import {
  Card,
  CardAction,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface PageTitleBoxProps {
  title: string;
  tooltip?: React.ReactNode;
  className?: string;
}

export function PageTitleBox({ title, tooltip, className }: PageTitleBoxProps) {
  return (
    <Card className={cn("py-4", className)}>
      <CardHeader className="flex flex-row items-center gap-2 pb-0">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {tooltip != null && (
          <CardAction className="relative -top-0.5">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground rounded p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="More information"
                  >
                    <InfoIcon className="size-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  {tooltip}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardAction>
        )}
      </CardHeader>
    </Card>
  );
}

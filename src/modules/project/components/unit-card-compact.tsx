import { Card, CardAction, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { capitalizeFirstLetter, cn } from "@/lib/utils";
import type { ProjectUnitResponse, ProjectUnitType } from "../types";
import ReactMarkdown from "react-markdown";

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
}

function getTypeBadgeClass(type: ProjectUnitType): string {
  if (type === "controller") {
    return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30";
  }
  return "bg-muted text-muted-foreground border-border";
}

export function UnitCardCompact({ unit }: UnitCardCompactProps) {
  const hasParent = unit.parent_unit_id != null;
  const explanation = unit.explanation?.trim() ?? "No description";

  return (
    <div className="relative inline-block w-full min-w-0">
      {hasParent && (
        <Card
          className="absolute left-1.5 w-full h-full top-1.5 z-0 rounded-xl border shadow-none"
          aria-hidden
        />
      )}
      <Card className="p-0 relative z-10 rounded-xl border shadow-none overflow-hidden gap-0">
        <CardDescription className="p-2 text-xs">
          <ReactMarkdown>{explanation}</ReactMarkdown>
        </CardDescription>
        <CardAction className="bg-muted/30 w-full flex items-center justify-start p-2 gap-2 border-t">
          <Badge
            variant="secondary"
            className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30 text-[10px] font-semibold px-1.5 py-0 truncate max-w-full"
            title={`Version ${unit.version}`}
          >
            v{unit.version}
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
        </CardAction>
      </Card>
    </div>
  );
}

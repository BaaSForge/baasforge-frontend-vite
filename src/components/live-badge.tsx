import { cn } from "@/lib/utils";

export interface LiveBadgeProps {
  isOn: boolean;
  offLabel?: string;
  offTitle?: string;
  onLabel: string;
  onTitle?: string;
}

export function LiveBadge({
  isOn,
  offLabel,
  offTitle,
  onLabel,
  onTitle,
}: LiveBadgeProps) {
  const baseClass = "inline-flex items-center gap-1 text-[10px] text-muted-foreground/50";
  const circleClass = "size-1.5 shrink-0 rounded-full bg-muted-foreground/20";

  if (!isOn) {
    return (
      <span
        className={baseClass}
        title={offTitle}
        aria-label={offTitle}
      >
        <span
          className={circleClass}
          aria-hidden
        />
        <span>{offLabel}</span>
      </span>
    );
  }
  return (
    <span
      className={cn(baseClass, "text-foreground")}
      title={onTitle}
      aria-label={onTitle}
    >
      <span className="relative flex size-3 shrink-0 items-center justify-center bg-secondary border border-blue-500 rounded-full" aria-hidden>
        <span
          className="absolute inset-0 origin-center rounded-full bg-blue-500 animate-[status-pulse-ring_1.2s_ease-out_infinite]"
          aria-hidden
        />
        <span className={cn(circleClass, "bg-blue-500")} aria-hidden />
      </span>
      <span>{onLabel}</span>
    </span>
  );
}
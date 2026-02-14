import { cn } from "@/lib/utils";

export interface LiveBadgeProps {
  isOn: boolean;
  offLabel?: string;
  offTitle?: string;
  onLabel: string;
  onTitle?: string;
  className?: string;
  size?: number;
}

export function LiveBadge({
  isOn,
  offLabel,
  offTitle,
  onLabel,
  onTitle,
  className,
  size = 1.5,
}: LiveBadgeProps) {
  const baseClass = cn("inline-flex items-center gap-1 text-sm text-muted-foreground/50", className);
  const circleClass = `size-${size} shrink-0 rounded-full bg-muted-foreground/20`;

  const offCircle = (
    <span
      className={circleClass}
      aria-hidden
    />
  );

  if (!isOn) {
    return (
      <span
        className={baseClass}
        title={offTitle}
        aria-label={offTitle}
      >
        {offCircle}
        <span>{offLabel}</span>
      </span>
    );
  }

  const onCircle = (
    <span className={`relative flex size-${size * 2} shrink-0 items-center justify-center bg-secondary border border-blue-500 rounded-full`} aria-hidden>
      <span
        className="absolute inset-0 origin-center rounded-full bg-blue-500 animate-[status-pulse-ring_1.2s_ease-out_infinite]"
        aria-hidden
      />
      <span className={cn(circleClass, "bg-blue-500")} aria-hidden />
    </span>
  );

  return (
    <span
      className={cn(baseClass, "text-foreground")}
      title={onTitle}
      aria-label={onTitle}
    >
      {onCircle}
      <span>{onLabel}</span>
    </span>
  );
}
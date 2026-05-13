import { cn } from "@/lib/utils";
import { StatusPulseRingLayer } from "@/components/status-pulse-ring";

export interface LiveBadgeProps {
    isOn: boolean;
    offLabel?: string;
    offTitle?: string;
    onLabel: string;
    onTitle?: string;
    className?: string;
    size?: number;
}

export function LiveBadge({ isOn, offLabel, offTitle, onLabel, onTitle, className, size = 0.4 }: LiveBadgeProps) {
    const baseClass = cn("inline-flex items-center gap-1 text-[0.625rem] text-muted-foreground/50", className);

    const circleStyle = { width: `${size}rem`, height: `${size}rem` };
    const doubleCircleStyle = { width: `${size * 2}rem`, height: `${size * 2}rem` };

    const circleClass = cn("shrink-0 rounded-full bg-muted-foreground/20");

    const offCircle = <span className={circleClass} style={circleStyle} aria-hidden />;

    if (!isOn) {
        return (
            <span className={baseClass} title={offTitle} aria-label={offTitle}>
                {offCircle}
                <span>{offLabel}</span>
            </span>
        );
    }

    const onCircle = (
        <span
            className={cn("relative flex shrink-0 items-center justify-center bg-secondary border border-blue-500 rounded-full")}
            style={doubleCircleStyle}
            aria-hidden
        >
            <StatusPulseRingLayer className="rounded-full" />
            <span className={cn(circleClass, "bg-blue-500")} style={circleStyle} aria-hidden />
        </span>
    );

    return (
        <span className={cn(baseClass, "text-foreground")} title={onTitle} aria-label={onTitle}>
            {onCircle}
            <span>{onLabel}</span>
        </span>
    );
}

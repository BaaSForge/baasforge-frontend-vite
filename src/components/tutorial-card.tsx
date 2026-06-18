"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TutorialDisplayStatus } from "@/services/tutorials";
import { Check, ChevronRight, CircleDashed, CirclePause, Lock, type LucideIcon } from "lucide-react";

const ACCENT_STYLES = [
    {
        bar: "from-sky-500/70 via-sky-500 to-cyan-400/70",
        icon: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
        badge: "bg-sky-500/15 text-sky-700 dark:text-sky-300 ring-sky-500/20",
    },
    {
        bar: "from-violet-500/70 via-violet-500 to-purple-400/70",
        icon: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
        badge: "bg-violet-500/15 text-violet-700 dark:text-violet-300 ring-violet-500/20",
    },
    {
        bar: "from-amber-500/70 via-amber-500 to-orange-400/70",
        icon: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        badge: "bg-amber-500/15 text-amber-700 dark:text-amber-300 ring-amber-500/20",
    },
    {
        bar: "from-emerald-500/70 via-emerald-500 to-teal-400/70",
        icon: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        badge: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-emerald-500/20",
    },
    {
        bar: "from-rose-500/70 via-rose-500 to-pink-400/70",
        icon: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
        badge: "bg-rose-500/15 text-rose-700 dark:text-rose-300 ring-rose-500/20",
    },
    {
        bar: "from-cyan-500/70 via-cyan-500 to-blue-400/70",
        icon: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
        badge: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 ring-cyan-500/20",
    },
] as const;

const STATUS_RING_STYLES: Record<TutorialDisplayStatus, string> = {
    idle: "ring-muted-foreground/20 bg-muted/20",
    "pending-action": "ring-sky-500/45 bg-sky-500/10",
    interrupted: "ring-amber-500/45 bg-amber-500/10",
    completed: "ring-emerald-500/45 bg-emerald-500/10",
    disabled: "ring-muted-foreground/15 bg-muted/30",
};

const STATUS_INNER_STYLES: Record<TutorialDisplayStatus, string> = {
    idle: "",
    "pending-action": "bg-sky-500/15 text-sky-700 ring-sky-500/25 dark:text-sky-300",
    interrupted: "bg-amber-500/15 text-amber-700 ring-amber-500/25 dark:text-amber-300",
    completed: "bg-emerald-500/15 text-emerald-700 ring-emerald-500/25 dark:text-emerald-300",
    disabled: "bg-muted text-muted-foreground ring-muted-foreground/20",
};

const STATUS_ICONS: Record<Exclude<TutorialDisplayStatus, "idle" | "disabled">, LucideIcon> = {
    "pending-action": CircleDashed,
    interrupted: CirclePause,
    completed: Check,
};

function TutorialCardStatusBadge({
    number,
    status,
    accentBadge,
}: {
    number: number;
    status: TutorialDisplayStatus;
    accentBadge: string;
}) {
    const StatusIcon =
        status !== "idle" && status !== "disabled" ? STATUS_ICONS[status] : status === "disabled" ? Lock : null;

    return (
        <div className="relative flex size-8 shrink-0 items-center justify-center" aria-label={`Tutorial ${number}, ${status}`}>
            <span
                className={cn(
                    "absolute inset-0 rounded-full ring-2 ring-inset transition-colors",
                    STATUS_RING_STYLES[status],
                    status === "pending-action" && "animate-pulse",
                )}
                aria-hidden
            />
            <span
                className={cn(
                    "relative z-10 flex size-5 items-center justify-center rounded-full text-[10px] font-bold tabular-nums ring-1 ring-inset",
                    status === "idle" ? accentBadge : STATUS_INNER_STYLES[status],
                )}
            >
                {number}
            </span>
            {StatusIcon != null ? (
                <span
                    className={cn(
                        "absolute -right-0.5 -bottom-0.5 z-20 flex size-3.5 items-center justify-center rounded-full ring-1 ring-background",
                        status === "pending-action" && "bg-sky-500 text-white",
                        status === "interrupted" && "bg-amber-500 text-white",
                        status === "completed" && "bg-emerald-500 text-white",
                        status === "disabled" && "bg-muted-foreground/70 text-background",
                    )}
                    aria-hidden
                >
                    <StatusIcon className="size-2" />
                </span>
            ) : null}
        </div>
    );
}

export interface TutorialCardProps {
    number: number;
    title: string;
    description: string;
    icon: LucideIcon;
    status?: TutorialDisplayStatus;
    actionLabel: string;
    onAction?: () => void;
    className?: string;
    style?: React.CSSProperties;
}

export function TutorialCard({
    number,
    title,
    description,
    icon: Icon,
    status = "idle",
    actionLabel,
    onAction,
    className,
    style,
}: TutorialCardProps) {
    const accent = ACCENT_STYLES[(number - 1) % ACCENT_STYLES.length];
    const isDisabled = status === "disabled";
    const isActionDisabled = isDisabled || onAction == null;

    return (
        <article
            className={cn(
                "group relative flex min-h-0 flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm",
                "transition-all duration-200",
                isDisabled
                    ? "opacity-60"
                    : "hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md",
                className,
            )}
            style={style}
            aria-disabled={isDisabled || undefined}
        >
            <div className={cn("h-1 bg-gradient-to-r", accent.bar)} />
            <div className="flex flex-1 flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-2">
                    <TutorialCardStatusBadge number={number} status={status} accentBadge={accent.badge} />
                    <div className={cn("flex size-9 items-center justify-center rounded-lg", accent.icon)}>
                        <Icon className="size-4.5" aria-hidden />
                    </div>
                </div>
                <div className="min-w-0 flex-1 space-y-1.5">
                    <h3 className="text-sm font-semibold leading-snug text-pretty">{title}</h3>
                    <p className="text-muted-foreground line-clamp-3 text-xs leading-relaxed text-pretty">{description}</p>
                </div>
                <div className="flex items-center justify-end -my-1 -mr-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        disabled={isActionDisabled}
                        onClick={onAction}
                        className={cn(
                            "h-6 gap-0.5 px-2 text-xs font-medium",
                            isActionDisabled
                                ? "text-muted-foreground/60"
                                : "text-muted-foreground/70 hover:text-primary",
                        )}
                    >
                        {actionLabel}
                        {!isDisabled ? (
                            <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                        ) : (
                            <Lock className="size-3" aria-hidden />
                        )}
                    </Button>
                </div>
            </div>
        </article>
    );
}

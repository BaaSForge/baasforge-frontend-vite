"use client";

import { cn } from "@/lib/utils";
import { ChevronRight, type LucideIcon } from "lucide-react";

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

export interface TutorialCardProps {
    number: number;
    title: string;
    description: string;
    icon: LucideIcon;
    className?: string;
    style?: React.CSSProperties;
}

export function TutorialCard({ number, title, description, icon: Icon, className, style }: TutorialCardProps) {
    const accent = ACCENT_STYLES[(number - 1) % ACCENT_STYLES.length];

    return (
        <article
            className={cn(
                "group relative flex min-h-0 flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm",
                "transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md",
                className,
            )}
            style={style}
        >
            <div className={cn("h-1 bg-gradient-to-r", accent.bar)} />
            <div className="flex flex-1 flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-2">
                    <span
                        className={cn(
                            "inline-flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums ring-1 ring-inset",
                            accent.badge,
                        )}
                    >
                        {number}
                    </span>
                    <div className={cn("flex size-9 items-center justify-center rounded-lg", accent.icon)}>
                        <Icon className="size-4.5" aria-hidden />
                    </div>
                </div>
                <div className="min-w-0 flex-1 space-y-1.5">
                    <h3 className="text-sm font-semibold leading-snug text-pretty">{title}</h3>
                    <p className="text-muted-foreground line-clamp-3 text-xs leading-relaxed text-pretty">{description}</p>
                </div>
                <div className="flex items-center justify-end">
                    <span className="text-muted-foreground/70 group-hover:text-primary flex items-center gap-0.5 text-xs font-medium transition-colors">
                        Start
                        <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                    </span>
                </div>
            </div>
        </article>
    );
}

import { cn } from "@/lib/utils";
import { ChevronRightIcon, type LucideIcon } from "lucide-react";
import { Link } from "react-router";

export interface SectionLinkCardProps {
    to: string;
    title: string;
    description: string;
    icon: LucideIcon;
    className?: string;
}

export function SectionLinkCard({ to, title, description, icon: Icon, className }: SectionLinkCardProps) {
    return (
        <Link
            to={to}
            className={cn(
                "group block rounded-xl border bg-card text-card-foreground",
                "transition-colors hover:bg-muted/50 hover:border-muted-foreground/20",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                className,
            )}
        >
            <div className="flex flex-row items-start gap-4 p-5">
                <div
                    className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted/50", "group-hover:bg-muted transition-colors")}
                >
                    <Icon className="size-5 text-muted-foreground" aria-hidden />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold leading-none">{title}</span>
                        <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden />
                    </div>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>
            </div>
        </Link>
    );
}

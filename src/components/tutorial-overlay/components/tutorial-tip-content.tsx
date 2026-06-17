import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TutorialTipContentProps = {
    title?: string;
    description?: React.ReactNode;
    dismissLabel?: string;
    onDismiss: () => void;
    children?: React.ReactNode;
    className?: string;
};

export function TutorialTipContent({
    title,
    description,
    dismissLabel,
    onDismiss,
    children,
    className,
}: TutorialTipContentProps) {
    const body =
        children ??
        (description != null ? (
            <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
        ) : null);

    return (
        <div
            className={cn(
                "relative z-10 overflow-hidden rounded-xl border border-primary/15 bg-popover text-popover-foreground shadow-2xl shadow-black/20 dark:shadow-black/50",
                className,
            )}
        >
            <div className="h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
            <div className="space-y-3 p-4">
                {title != null ? (
                    <div className="space-y-1">
                        <Badge variant="secondary" className="h-5 px-1.5 text-[0.65rem] font-medium">
                            Tip
                        </Badge>
                        <h3 className="text-sm font-semibold leading-snug tracking-tight">{title}</h3>
                    </div>
                ) : null}
                {body != null ? <div>{body}</div> : null}
                {dismissLabel != null ? (
                    <Button type="button" size="sm" className="w-full" onClick={onDismiss}>
                        {dismissLabel}
                    </Button>
                ) : null}
            </div>
        </div>
    );
}

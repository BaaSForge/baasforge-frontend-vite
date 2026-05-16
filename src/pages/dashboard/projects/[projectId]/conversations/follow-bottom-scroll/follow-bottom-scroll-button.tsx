import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ChevronsDown, Lock } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const SCROLL_IDLE_HIDE_MS = 3000;

export type FollowBottomScrollControl = {
    pinnedToBottom: boolean;
    onJumpToLatest: () => void;
};

type FollowBottomScrollButtonProps = {
    control: FollowBottomScrollControl | undefined;
};

export function FollowBottomScrollButton({ control }: FollowBottomScrollButtonProps) {
    const [scrollIdleHidden, setScrollIdleHidden] = useState(false);
    const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const trackingEnabled = control != null;

    const clearIdleTimer = useCallback(() => {
        if (idleTimerRef.current != null) {
            clearTimeout(idleTimerRef.current);
            idleTimerRef.current = null;
        }
    }, []);

    const armIdleHide = useCallback(() => {
        clearIdleTimer();
        idleTimerRef.current = setTimeout(() => {
            setScrollIdleHidden(true);
            idleTimerRef.current = null;
        }, SCROLL_IDLE_HIDE_MS);
    }, [clearIdleTimer]);

    useEffect(() => {
        if (!trackingEnabled) {
            clearIdleTimer();
            return;
        }

        queueMicrotask(() => {
            setScrollIdleHidden(false);
        });

        const onScroll = () => {
            setScrollIdleHidden(false);
            armIdleHide();
        };

        armIdleHide();
        window.addEventListener("scroll", onScroll, { passive: true, capture: true });
        return () => {
            window.removeEventListener("scroll", onScroll, { capture: true });
            clearIdleTimer();
        };
    }, [trackingEnabled, armIdleHide, clearIdleTimer]);

    if (control == null) return null;

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    type="button"
                    variant="secondary"
                    size="icon-sm"
                    className={cn(
                        "absolute right-4 z-30 shrink-0 origin-center rounded-md bottom-full mb-2 border transition-[background-color,border-color,box-shadow,opacity,transform] duration-200 [&_svg]:size-4",
                        control.pinnedToBottom
                            ? "scale-[0.75] border-primary/35 bg-primary/8 shadow-sm dark:bg-primary/12"
                            : "scale-100 border-border/80 bg-secondary shadow-sm",
                        scrollIdleHidden && "pointer-events-none opacity-0",
                    )}
                    aria-label={control.pinnedToBottom ? "Following, scroll up to pause" : "Scroll to end"}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                        e.stopPropagation();
                        control.onJumpToLatest();
                    }}
                >
                    {control.pinnedToBottom ? (
                        <Lock className="stroke-[2] text-primary/75" aria-hidden />
                    ) : (
                        <ChevronsDown className="stroke-[2.25] text-muted-foreground" aria-hidden />
                    )}
                </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
                {control.pinnedToBottom ? "Following · scroll up to pause" : "Scroll to end"}
            </TooltipContent>
        </Tooltip>
    );
}

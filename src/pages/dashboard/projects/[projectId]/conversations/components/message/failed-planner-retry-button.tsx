import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { RefreshCw, TriangleAlert } from "lucide-react";

/** Destructive ghost styling for failed message Retry (user delivery + planner). */
export const destructiveRetryButtonClass =
    "shrink-0 font-medium text-destructive hover:bg-destructive/10 hover:text-destructive";

export type FailedPlannerRetryButtonProps = {
    onRetry: () => void;
    disabled: boolean;
    inFlight: boolean;
    blockedByGeneration: boolean;
};

/** Shared Retry UI for a failed main-thread planner text row (TextMessage + ExploringToolCallsMessage). */
export function FailedPlannerRetryButton({ onRetry, disabled, inFlight, blockedByGeneration }: FailedPlannerRetryButtonProps) {
    if (disabled) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    <span className="inline-flex">
                        <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            className={cn(destructiveRetryButtonClass, "gap-1")}
                            disabled
                        >
                            {inFlight ? (
                                <>
                                    <Spinner className="size-3 shrink-0" />
                                    Retry
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="size-3 shrink-0" />
                                    Retry
                                </>
                            )}
                        </Button>
                    </span>
                </TooltipTrigger>
                <TooltipContent side="top">
                    {blockedByGeneration
                        ? "You cannot retry while a response is generating."
                        : "Please wait."}
                </TooltipContent>
            </Tooltip>
        );
    }

    return (
        <Button type="button" variant="ghost" size="xs" className={destructiveRetryButtonClass} onClick={onRetry}>
            <RefreshCw className="size-3 shrink-0" />
            Retry
        </Button>
    );
}

const plannerFailedInlineAlertClass =
    "max-w-md py-2 pl-3 pr-2.5 text-xs shadow-none gap-x-2 border-destructive/40 [&>svg]:size-3.5 [&>svg]:translate-y-px";

/** Compact destructive alert plus Retry on the row below (replaces status icon + inline retry for failed planner rows). */
export function FailedPlannerRetryWithAlert(props: FailedPlannerRetryButtonProps) {
    return (
        <div className="flex w-full min-w-0 flex-col gap-1.5">
            <Alert variant="destructive" className={plannerFailedInlineAlertClass}>
                <TriangleAlert />
                <AlertDescription className="text-xs leading-snug text-destructive/95">
                    This response failed to generate. Retry to run the assistant again.
                </AlertDescription>
            </Alert>
            <div className="flex min-h-6 items-center">
                <FailedPlannerRetryButton {...props} />
            </div>
        </div>
    );
}

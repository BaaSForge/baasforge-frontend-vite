import { TriangleAlert } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export function ToolMessagePayloadError({ message }: { message: string }) {
    return (
        <Alert
            className={cn(
                "mb-2 flex min-w-0 flex-row items-center gap-1.5 rounded-md border-amber-500/40 bg-amber-50 px-2 py-1.5 text-xs text-amber-950",
                "[&>svg]:size-3.5 [&>svg]:shrink-0 [&>svg]:translate-y-0 [&>svg]:text-amber-600",
                "dark:border-amber-400/25 dark:bg-amber-950/35 dark:text-amber-50 dark:[&>svg]:text-amber-400",
            )}
        >
            <TriangleAlert aria-hidden />
            <AlertDescription className="block min-w-0 flex-1 text-inherit leading-snug whitespace-pre-wrap break-words">
                {message}
            </AlertDescription>
        </Alert>
    );
}

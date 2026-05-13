import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { TriangleAlert } from "lucide-react";

export function AiGenerationFailedStatusAlert({ className }: { className?: string }) {
    return (
        <Alert
            variant="destructive"
            className={cn(
                "w-full min-w-0 max-w-md py-2 pl-3 pr-2.5 text-xs shadow-none gap-x-2 border-destructive/40 [&>svg]:size-3.5 [&>svg]:translate-y-px",
                className,
            )}
        >
            <TriangleAlert />
            <AlertDescription className="text-xs leading-snug text-destructive/95">
                This response failed to generate.
            </AlertDescription>
        </Alert>
    );
}

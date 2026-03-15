import { Badge } from "@/components/ui/badge";
import { SparklesIcon } from "lucide-react";

export function TrialBadge() {
    return (
        <Badge variant="outline" className="shrink-0 border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400">
            <SparklesIcon className="mr-1 size-3.5" aria-hidden />
            Trial
        </Badge>
    );
}

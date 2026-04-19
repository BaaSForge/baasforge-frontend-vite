import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TriangleAlert } from "lucide-react";

import {
    STALE_BASE_RELEASE_CONVERSATION_MESSAGE,
    useConversationStaleBaseRelease,
} from "./conversation-stale-base-release-context";

export function ConversationStaleBaseReleaseTitleBadge() {
    const staleBaseRelease = useConversationStaleBaseRelease();
    if (!staleBaseRelease) return null;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-1.5 text-left text-amber-950 outline-none transition-colors hover:bg-amber-500/15 focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:border-amber-400/35 dark:bg-amber-500/12 dark:text-amber-50 dark:hover:bg-amber-500/18"
                    aria-label="Stale base release details"
                >
                    <TriangleAlert
                        className="size-3.5 shrink-0 text-amber-700 dark:text-amber-300"
                        aria-hidden
                    />
                    <span className="text-xs font-medium tracking-tight">Stale base</span>
                    <span className="text-xs text-amber-900/90 dark:text-amber-100/90">read more</span>
                </button>
            </PopoverTrigger>
            <PopoverContent align="end" side="bottom" className="text-sm leading-snug">
                {STALE_BASE_RELEASE_CONVERSATION_MESSAGE}
            </PopoverContent>
        </Popover>
    );
}

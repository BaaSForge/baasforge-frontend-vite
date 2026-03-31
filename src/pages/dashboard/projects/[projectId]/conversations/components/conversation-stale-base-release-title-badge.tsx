import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Info } from "lucide-react";

import {
    STALE_BASE_RELEASE_CONVERSATION_MESSAGE,
    useConversationStaleBaseRelease,
} from "./conversation-stale-base-release-context";

export function ConversationStaleBaseReleaseTitleBadge() {
    const staleBaseRelease = useConversationStaleBaseRelease();
    if (!staleBaseRelease) return null;

    return (
        <div
            className="flex shrink-0 items-center gap-0.5 rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-amber-950 dark:border-amber-400/35 dark:bg-amber-500/12 dark:text-amber-50"
            role="status"
        >
            <span className="text-xs font-medium tracking-tight">Stale base</span>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 shrink-0 text-amber-900 hover:bg-amber-500/20 dark:text-amber-100 dark:hover:bg-amber-500/15"
                        aria-label="Stale base release details"
                    >
                        <Info className="size-3.5" aria-hidden />
                    </Button>
                </PopoverTrigger>
                <PopoverContent align="end" side="bottom" className="text-sm leading-snug">
                    {STALE_BASE_RELEASE_CONVERSATION_MESSAGE}
                </PopoverContent>
            </Popover>
        </div>
    );
}

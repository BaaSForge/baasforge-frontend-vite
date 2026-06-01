import { Badge } from "@/components/ui/badge";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { InputGroupButton } from "@/components/ui/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";
import { useStartDebugModal } from "@/modules/layout/components/start-debug-modal";
import { cn } from "@/lib/utils";
import { Bug, FileText, Plus } from "lucide-react";
import { useState } from "react";

const PANEL_CLASS =
    "w-[min(100vw-2rem,28rem)] rounded-2xl border-border/70 bg-popover p-0 text-popover-foreground shadow-xl";

function AddMenuTiles({
    onPickDebugContext,
    onClose,
}: {
    onPickDebugContext: () => void;
    onClose: () => void;
}) {
    return (
        <div className="flex gap-3 overflow-x-auto p-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:p-5">
            <button
                type="button"
                className={cn(
                    "flex min-w-[7rem] max-w-[10rem] flex-col items-center gap-2 rounded-2xl border border-border/70 px-3 py-3 text-center transition-colors",
                    "bg-gradient-to-b from-muted/60 to-muted/25 hover:border-blue-500/35 hover:from-muted hover:to-muted/50",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                )}
                onClick={() => {
                    onPickDebugContext();
                    onClose();
                }}
            >
                <span
                    className={cn(
                        "flex size-11 items-center justify-center rounded-full",
                        "bg-orange-500/15 text-orange-700 dark:bg-orange-400/18 dark:text-orange-300",
                    )}
                >
                    <Bug className="size-5" aria-hidden />
                </span>
                <span className="text-[13px] font-medium leading-tight">Debug context</span>
                <span className="text-[11px] leading-snug text-muted-foreground">Release and trace IDs</span>
            </button>

            <button
                type="button"
                disabled
                aria-label="Add doc, coming soon"
                className={cn(
                    "flex min-w-[7rem] max-w-[10rem] flex-col items-center gap-2 rounded-2xl border border-dashed border-border/80 px-3 py-3 text-center",
                    "cursor-not-allowed bg-muted/30 opacity-70",
                )}
            >
                <span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <FileText className="size-5" aria-hidden />
                </span>
                <span className="text-[13px] font-medium leading-tight text-muted-foreground">Add doc</span>
                <Badge variant="secondary" className="mt-auto text-[10px] font-normal">
                    Coming soon
                </Badge>
            </button>
        </div>
    );
}

function AddMenuHeader() {
    return (
        <div className="border-b border-border/60 px-4 py-3 sm:px-5 sm:py-4">
            <p className="text-sm font-semibold tracking-tight">Add to message</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Attach files or link debug data for richer replies.</p>
        </div>
    );
}

export function ChatComposerAddMenu() {
    const isMobile = useIsMobile();
    const [open, setOpen] = useState(false);
    const { open: openStartDebugModal } = useStartDebugModal();

    const trigger = (
        <InputGroupButton
            size="icon-sm"
            variant="outline"
            className={cn(
                "rounded-lg border-border/80 bg-muted/50 shadow-none",
                "text-muted-foreground hover:bg-muted hover:text-foreground",
                open && "border-blue-500/40 text-foreground ring-2 ring-blue-500/25",
            )}
            aria-expanded={open}
            aria-label="Add to message"
            onClick={(e) => e.stopPropagation()}
        >
            <Plus className="size-[1.125rem]" strokeWidth={2.25} aria-hidden />
        </InputGroupButton>
    );

    if (isMobile) {
        return (
            <Drawer direction="bottom" open={open} onOpenChange={setOpen} shouldScaleBackground={false}>
                <DrawerTrigger asChild>{trigger}</DrawerTrigger>
                <DrawerContent
                    className={cn(
                        "max-h-[min(90dvh,560px)] gap-0 overflow-hidden rounded-t-2xl border-border/70 bg-popover p-0 text-popover-foreground shadow-xl",
                    )}
                >
                    <DrawerHeader className="mb-0 border-b border-border/60 px-4 py-3 text-left sm:px-5 sm:py-4">
                        <DrawerTitle className="text-sm font-semibold tracking-tight">Add to message</DrawerTitle>
                        <DrawerDescription className="text-xs text-muted-foreground">
                            Attach files or link debug data for richer replies.
                        </DrawerDescription>
                    </DrawerHeader>
                    <div className="overflow-y-auto pb-[max(1rem,env(safe-area-inset-bottom))]">
                        <AddMenuTiles onPickDebugContext={openStartDebugModal} onClose={() => setOpen(false)} />
                    </div>
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>{trigger}</PopoverTrigger>
            <PopoverContent
                align="end"
                side="top"
                sideOffset={10}
                className={cn(PANEL_CLASS)}
                // Clicking non-focusable areas inside (header/padding) used to move focus and fire
                // focus-outside dismiss; pointer-down outside still closes the popover (separate event).
                onFocusOutside={(e) => e.preventDefault()}
                onPointerDown={(e) => e.stopPropagation()}
            >
                <AddMenuHeader />
                <AddMenuTiles onPickDebugContext={openStartDebugModal} onClose={() => setOpen(false)} />
            </PopoverContent>
        </Popover>
    );
}

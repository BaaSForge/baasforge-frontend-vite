import { SHORTCUTS_FOR_MODAL } from "@/lib/unified-keyboard";
import { cn } from "@/lib/utils";

import { CentricModal, CentricModalContent, CentricModalHeader, CentricModalTitle } from "@/components/ui/centric-modal";

type ShortcutsModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function ShortcutsModal({ open, onOpenChange }: ShortcutsModalProps) {
    return (
        <CentricModal open={open} onOpenChange={onOpenChange}>
            <CentricModalContent className="max-w-md p-0 gap-0" showCloseButton>
                <CentricModalHeader>
                    <CentricModalTitle>Shortcuts</CentricModalTitle>
                </CentricModalHeader>
                <div className="rounded-md overflow-hidden">
                    {SHORTCUTS_FOR_MODAL.map(({ label, keys }, i) => (
                        <div
                            key={label}
                            className={cn(
                                "flex cursor-default items-center py-3 text-sm outline-hidden select-none",
                                "text-foreground [&_svg]:shrink-0 [&_svg]:size-4",
                                i < SHORTCUTS_FOR_MODAL.length - 1 && "",
                            )}
                        >
                            <span className="flex-1 truncate text-left">{label}</span>
                            <kbd className="text-muted-foreground ml-auto font-mono text-xs tracking-widest rounded border border-border bg-muted/50 px-1.5 py-0.5">
                                {keys}
                            </kbd>
                        </div>
                    ))}
                </div>
            </CentricModalContent>
        </CentricModal>
    );
}

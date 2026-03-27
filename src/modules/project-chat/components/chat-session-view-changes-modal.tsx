import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type ChatSessionViewChangesModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function ChatSessionViewChangesModal({ open, onOpenChange }: ChatSessionViewChangesModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>View changes</DialogTitle>
                    <DialogDescription>
                        Compare draft units in this conversation with their state before the chat. This dialog will show a diff or summary once wired to the
                        pre-chat base data.
                    </DialogDescription>
                </DialogHeader>
                <p className="text-muted-foreground text-sm">
                    Sample content: pre-chat base units are loaded when you open this panel. The comparison UI will appear here in a follow-up.
                </p>
            </DialogContent>
        </Dialog>
    );
}

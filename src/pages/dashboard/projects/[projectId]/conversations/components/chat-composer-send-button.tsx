import { InputGroupButton } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { ArrowUp, Square } from "lucide-react";

type ChatComposerSendButtonProps = {
    isGenerating?: boolean;
    canSend: boolean;
    onSend: () => void;
    onStop?: () => void;
    disabled?: boolean;
    isLoading?: boolean;
    className?: string;
};

export function ChatComposerSendButton({
    isGenerating = false,
    canSend,
    onSend,
    onStop,
    disabled = false,
    isLoading = false,
    className,
}: ChatComposerSendButtonProps) {
    const busy = disabled || isLoading || (!isGenerating && !canSend);
    return (
        <InputGroupButton
            size="sm"
            className={cn(
                "ml-auto",
                !isGenerating && canSend && !disabled && !isLoading && "!bg-blue-500 hover:!bg-blue-600 !text-white",
                className,
            )}
            variant={isGenerating ? "destructive" : canSend && !disabled && !isLoading ? "default" : "ghost"}
            disabled={busy}
            onClick={() =>
                isGenerating ? onStop?.() : canSend && !disabled && !isLoading ? onSend() : undefined
            }
            type="button"
        >
            {isLoading ? (
                <>
                    <Spinner className="size-3.5" aria-hidden />
                    Sending…
                </>
            ) : isGenerating ? (
                <>
                    Stop <Square className="size-3.5" />
                </>
            ) : (
                <>
                    Send <ArrowUp className="size-3.5" />
                </>
            )}
        </InputGroupButton>
    );
}

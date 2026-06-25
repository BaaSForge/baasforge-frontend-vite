import type { ChatRichTextEditorHandle } from "@/components/chat-rich-text-editor";
import { ChatRichTextEditor } from "@/components/chat-rich-text-editor";
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMainSidebar } from "@/stores/main-sidebar";
import { useSecondarySidebarVisibility } from "@/stores/secondary-sidebar";
import { SHORTCUT_LABELS } from "@/lib/unified-keyboard";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ChatComposerAddMenu } from "../chat-composer-add-menu";
import { MIDDLE_CONTENT_CLASSNAME } from "../../constants";
import { useConversationDebugSession } from "../../conversation-debug";
import { FollowBottomScrollButton, type FollowBottomScrollControl } from "../../follow-bottom-scroll";
import { ChatComposerSendButton } from "../chat-composer-send-button";

type Props = {
    /** Remount the composer when switching chat sessions (Lexical editor identity). */
    composerResetKey?: string;
    messageInputRef: React.RefObject<ChatRichTextEditorHandle | null>;
    messageInputValue: string;
    setMessageInputValue: (value: string) => void;
    handleSend: () => void;
    handleStop?: () => void;
    canSend: boolean;
    isGenerating?: boolean;
    isNewSession: boolean;
    followScroll?: FollowBottomScrollControl;
};

export default function Controls({
    composerResetKey,
    messageInputRef,
    messageInputValue,
    setMessageInputValue,
    handleSend,
    handleStop,
    canSend,
    isGenerating = false,
    isNewSession,
    followScroll,
}: Props) {
    const mainSidebar = useMainSidebar();
    const secondarySidebar = useSecondarySidebarVisibility();
    const isMobile = useIsMobile();
    const [isInputFocused, setIsInputFocused] = useState(false);
    const { isDebugSendActive } = useConversationDebugSession();

    const lineBreakHint = ", Shift+Enter for new line";
    const placeholder = isDebugSendActive
        ? isNewSession
            ? "Describe what went wrong or what you need so we can debug this release"
            : "Explain the issue"
        : isNewSession
          ? `Type a message to start a new conversation ${lineBreakHint}`
          : `Type a message ${lineBreakHint}`;

    const leftClassName =
        mainSidebar.open && !mainSidebar.isMobile ? "!left-[var(--sidebar-width)]" : mainSidebar.isMobile ? "left-0" : "!left-[var(--sidebar-width-icon)]";
    const rightClassName = secondarySidebar.isOpen && !secondarySidebar.isMobile ? "!right-[var(--sidebar-width)]" : "right-0";

    // Desktop new session: anchor by `top` so multi-line growth extends downward and does not
    // cover "What would you like to create?". Else keep bottom anchoring as usual.
    // Use only one vertical edge per state so the transition doesn't jump.
    const verticalPositionClassName =
        !isNewSession || isMobile ? "bottom-4" : "top-[calc(50%-3rem)]";

    const focusComposerFromChrome = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('[data-slot="input-group-control"]')) return;
        if (target.closest("button, a, [role='menu'], [role='menuitem']")) return;
        messageInputRef.current?.focus();
    };

    return (
        <>
            <div className="h-24 lg:h-20 flex-shrink-0" aria-hidden="true" />
            {isNewSession && (
                <div
                    className={cn(
                        "fixed left-0 right-0 flex items-center justify-center -mt-20 bottom-1/2 -translate-y-2/1 text-center",
                        leftClassName,
                        rightClassName,
                    )}
                    onClick={focusComposerFromChrome}
                >
                    <h1 className={cn("text-3xl font-bold text-foreground", MIDDLE_CONTENT_CLASSNAME)}>What would you like to create?</h1>
                </div>
            )}
            <div
                className={cn(
                    "fixed min-h-14 z-20 transition-[left,right,bottom,top] duration-200 ease-out",
                    leftClassName,
                    rightClassName,
                    verticalPositionClassName,
                )}
            >
                <div
                    className={cn("relative flex w-full items-stretch px-4", MIDDLE_CONTENT_CLASSNAME)}
                    onClick={focusComposerFromChrome}
                >
                    <FollowBottomScrollButton control={followScroll} />
                    <InputGroup
                        className={cn(
                            "w-full shadow-2xl flex flex-col !bg-background transition-shadow duration-300",
                            isGenerating && "controller-generating-glow",
                        )}
                    >
                        <ChatRichTextEditor
                            resetKey={composerResetKey}
                            ref={messageInputRef}
                            value={messageInputValue}
                            onChange={setMessageInputValue}
                            onFocus={() => setIsInputFocused(true)}
                            onBlur={() => setIsInputFocused(false)}
                            placeholder={placeholder}
                            className="min-h-10 max-h-40 px-0 py-0"
                            contentClassName="min-h-10 max-h-40 px-3 py-3"
                            onEscapeRequest={() => messageInputRef.current?.blur()}
                            onSubmitRequest={() => {
                                if (isGenerating || !canSend) return;
                                handleSend();
                            }}
                        />
                        <InputGroupAddon
                            align="block-end"
                            className="!flex !w-full !flex-row !items-center !gap-2 !p-3 !pt-0"
                        >
                            <span className="min-w-0 flex-1 text-xs text-muted-foreground opacity-50">
                                press {isInputFocused ? "Esc to release" : `${SHORTCUT_LABELS.FOCUS_CHAT} to focus`}
                            </span>
                            <div className="flex shrink-0 items-center gap-2">
                                <ChatComposerAddMenu />
                                <ChatComposerSendButton
                                    className="!ml-0"
                                    isGenerating={isGenerating}
                                    canSend={canSend}
                                    onSend={handleSend}
                                    onStop={handleStop}
                                />
                            </div>
                        </InputGroupAddon>
                    </InputGroup>
                </div>
            </div>
        </>
    );
}

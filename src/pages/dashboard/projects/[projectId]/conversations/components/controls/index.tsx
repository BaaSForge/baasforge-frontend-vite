import {
    InputGroup,
    InputGroupAddon,
    InputGroupTextarea,
} from "@/components/ui/input-group";
import { useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { SHORTCUT_LABELS } from "@/lib/unified-keyboard";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { MIDDLE_CONTENT_CLASSNAME } from "../../constants";
import { ChatComposerSendButton } from "../chat-composer-send-button";

type Sidebar = ReturnType<typeof useSidebar>;

type Props = {
    messageInputRef: React.RefObject<HTMLTextAreaElement | null>;
    messageInputValue: string;
    setMessageInputValue: (value: string) => void;
    handleSend: () => void;
    handleStop?: () => void;
    canSend: boolean;
    isGenerating?: boolean;
    isNewSession: boolean;
    mainSidebar?: Sidebar;
};

export default function Controls({
    messageInputRef,
    messageInputValue,
    setMessageInputValue,
    handleSend,
    handleStop,
    canSend,
    isGenerating = false,
    isNewSession,
    mainSidebar: passedMainSidebar,
}: Props) {
    const useSidebarRes = useSidebar();
    const mainSidebar = passedMainSidebar ?? useSidebarRes;
    const secondarySidebar = passedMainSidebar ? useSidebarRes : null;
    const isMobile = useIsMobile();
    const [isInputFocused, setIsInputFocused] = useState(false);

    const leftClassName =
        mainSidebar.open && !mainSidebar.isMobile ? "!left-[var(--sidebar-width)]" : mainSidebar.isMobile ? "left-0" : "!left-[var(--sidebar-width-icon)]";
    const rightClassName = secondarySidebar?.open && !secondarySidebar?.isMobile ? "!right-[var(--sidebar-width)]" : "right-0";

    // Use only `bottom` for vertical position so the transition doesn't jump (changing
    // both bottom and transform caused transform to snap to 0 first, then bottom to animate).
    const bottomClassName = !isNewSession || isMobile ? "bottom-4" : "bottom-[calc(50%-3rem)]";

    const handleFocus = () => {
        if (messageInputRef.current) {
            messageInputRef.current.focus();
        }
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
                    onClick={handleFocus}
                >
                    <h1 className={cn("text-3xl font-bold text-foreground", MIDDLE_CONTENT_CLASSNAME)}>What would you like to create?</h1>
                </div>
            )}
            <div className={cn("fixed min-h-14 z-20 transition-[left,right,bottom] duration-200 ease-out", leftClassName, rightClassName, bottomClassName)}>
                <div className={cn("flex items-stretch px-4", MIDDLE_CONTENT_CLASSNAME)} onClick={handleFocus}>
                    <InputGroup
                        className={cn(
                            "w-full shadow-2xl flex flex-col !bg-background transition-shadow duration-300",
                            isGenerating && "controller-generating-glow",
                        )}
                    >
                        <InputGroupTextarea
                            ref={messageInputRef}
                            value={messageInputValue}
                            onChange={(e) => setMessageInputValue(e.target.value)}
                            onFocus={() => setIsInputFocused(true)}
                            onBlur={() => setIsInputFocused(false)}
                            onKeyDown={(e) => {
                                if (e.key === "Escape") {
                                    e.currentTarget.blur();
                                    return;
                                }
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    if (isGenerating || !canSend) return;
                                    handleSend();
                                }
                            }}
                            placeholder={(isNewSession ? "Type a message to start a new conversation" : "Type a message") + `, Shift+Enter for new line`}
                            className="px-3 py-3 pb-0 min-h-10 max-h-40"
                            rows={1}
                        />
                        <InputGroupAddon align="block-end" className="!p-3 !pt-0">
                            {/* <InputGroupButton variant="ghost" size="icon-xs">
                <Copy />
              </InputGroupButton> */}
                            <span className="text-xs text-muted-foreground opacity-50">
                                press {isInputFocused ? "Esc to release" : `${SHORTCUT_LABELS.FOCUS_CHAT} to focus`}
                            </span>
                            <ChatComposerSendButton
                                isGenerating={isGenerating}
                                canSend={canSend}
                                onSend={handleSend}
                                onStop={handleStop}
                            />
                        </InputGroupAddon>
                    </InputGroup>
                </div>
            </div>
        </>
    );
}

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  // InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { ArrowUp } from "lucide-react";

type Sidebar = ReturnType<typeof useSidebar>;

type Props = {
  messageInputRef: React.RefObject<HTMLTextAreaElement | null>;
  messageInputValue: string;
  setMessageInputValue: (value: string) => void;
  handleSend: () => void;
  canSend: boolean;
  isNewSession: boolean;
  mainSidebar?: Sidebar;
};

const middleContentClassName = "max-w-screen-sm mx-auto";

export default function Controls({
  messageInputRef,
  messageInputValue,
  setMessageInputValue,
  handleSend,
  canSend,
  isNewSession,
  mainSidebar: passedMainSidebar,
}: Props) {
  const useSidebarRes = useSidebar();
  const mainSidebar = passedMainSidebar ?? useSidebarRes;
  const secondarySidebar = passedMainSidebar ? useSidebarRes : null;
  const isMobile = useIsMobile();

  const leftClassName =
    mainSidebar.open && !mainSidebar.isMobile
      ? "!left-[var(--sidebar-width)]"
      : mainSidebar.isMobile
        ? "left-0"
        : "!left-[var(--sidebar-width-icon)]";
  const rightClassName =
    secondarySidebar?.open && !secondarySidebar?.isMobile
      ? "!right-[var(--sidebar-width)]"
      : "right-0";

  // Use only `bottom` for vertical position so the transition doesn't jump (changing
  // both bottom and transform caused transform to snap to 0 first, then bottom to animate).
  const bottomClassName =
    !isNewSession || isMobile
      ? "bottom-4"
      : "bottom-[calc(50%-3rem)]";

  const handleFocus = () => {
    if (messageInputRef.current) {
      messageInputRef.current.focus();
    }
  };

  return (
    <>
      <div className="h-20 flex-shrink-0" aria-hidden="true" />
      {isNewSession && (
        <div
          className={cn(
            "fixed left-0 right-0 flex items-center justify-center -mt-20 bottom-1/2 -translate-y-2/1 text-center",
            leftClassName,
            rightClassName,
          )}
          onClick={handleFocus}
        >
          <h1 className={cn("text-3xl font-bold text-foreground", middleContentClassName)}>
            What would you like to create?
          </h1>
        </div>
      )}
      <div
        className={cn(
          "fixed min-h-14 z-20 transition-[left,right,bottom] duration-200 ease-out",
          leftClassName,
          rightClassName,
          bottomClassName,
        )}
      >
        <div className={cn("flex items-stretch px-4", middleContentClassName)} onClick={handleFocus}>
          <InputGroup className="w-full shadow-2xl flex flex-col bg-background">
            <InputGroupTextarea
              ref={messageInputRef}
              value={messageInputValue}
              onChange={(e) => setMessageInputValue(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())
              }
              placeholder={
                (isNewSession
                  ? "Type a message to start a new conversation"
                  : "Type a message") + ", press Shift+Enter for new line"
              }
              className="px-2 py-2 pb-0 min-h-8 max-h-40"
              rows={1}
            />
            <InputGroupAddon align="block-end" className="!p-2">
              {/* <InputGroupButton variant="ghost" size="icon-xs">
                <Copy />
              </InputGroupButton> */}
              <InputGroupButton
                size="sm"
                className="ml-auto"
                variant="default"
                onClick={handleSend}
                disabled={!canSend}
                type="button"
              >
                Send <ArrowUp className="size-3.5" />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </div>
      </div>
    </>
  );
}
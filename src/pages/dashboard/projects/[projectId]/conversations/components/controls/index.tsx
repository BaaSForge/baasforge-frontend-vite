import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  // InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { useSidebar } from "@/components/ui/sidebar";
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

  return (
    <>
      <div className="h-20 flex-shrink-0" aria-hidden="true" />
      <div
        className={cn(
          "fixed bottom-4 min-h-14 z-20 flex items-stretch px-4 transition-[left,right] duration-200 ease-out",
          leftClassName,
          rightClassName
        )}
      >
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
            className="px-2 py-2 pb-0 min-h-8"
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
    </>
  );
}
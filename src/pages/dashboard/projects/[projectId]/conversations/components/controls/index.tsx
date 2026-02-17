import { Input } from "@/components/ui/input";
import { InputGroupButton } from "@/components/ui/input-group";
import { InputGroup } from "@/components/ui/input-group";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { SendIcon } from "lucide-react";

type Sidebar = ReturnType<typeof useSidebar>;

type Props = {
  messageInputRef: React.RefObject<HTMLInputElement | null>;
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
      <div className="h-10 flex-shrink-0" aria-hidden="true" />
      <div
        className={cn(
          "fixed bottom-0 h-14 bg-background z-20 border-t flex items-center px-4 transition-[left,right] duration-200 ease-out",
          leftClassName,
          rightClassName
        )}
      >
        <InputGroup className="w-full shadow-none">
          <Input
            ref={messageInputRef}
            value={messageInputValue}
            onChange={(e) => setMessageInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
            className="shadow-none"
            placeholder={
              isNewSession
                ? "Type a message to start a new conversation"
                : "Type a message..."
            }
          />
          <InputGroupButton onClick={handleSend} disabled={!canSend} type="button">
            <SendIcon className="size-4" />
          </InputGroupButton>
        </InputGroup>
      </div>
    </>
  );
}
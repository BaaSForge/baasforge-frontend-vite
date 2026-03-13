import { useContext, useEffect } from "react";
import { useSidebar } from "../ui/sidebar";
import { InternalSecondarySidebarContext } from "./context";
import {
  register,
  unregister,
  UNIFIED_KEYBOARD_SCOPES,
} from "@/lib/unified-keyboard";

export function useSecondarySidebar() {
  const { toggleSidebar } = useSidebar();
  const ctx = useContext(InternalSecondarySidebarContext);

  return {
    toggleSidebar,
    setOpenSkipStorage: ctx?.handleOpenChangeSkipStorage,
    rereadSidebarOpen: ctx?.rereadSidebarOpen,
  };
}

export function useRegisterSecondarySidebarShortcut() {
  const { toggleSidebar } = useSecondarySidebar();
  useEffect(() => {
    register(UNIFIED_KEYBOARD_SCOPES.SECONDARY_SIDEBAR, toggleSidebar);
    return () => unregister(UNIFIED_KEYBOARD_SCOPES.SECONDARY_SIDEBAR);
  }, [toggleSidebar]);
}

export { SecondarySidebarProvider, SecondarySidebar } from "./secondary-sidebar";
export { SidebarContent, SidebarInset, useSidebar } from "../ui/sidebar";
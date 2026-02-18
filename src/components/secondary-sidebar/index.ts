import { useContext } from "react";
import { useSidebar } from "../ui/sidebar";
import { InternalSecondarySidebarContext } from "./context";

export function useSecondarySidebar() {
  const { toggleSidebar } = useSidebar();
  const ctx = useContext(InternalSecondarySidebarContext);

  return {
    toggleSidebar,
    setOpenSkipStorage: ctx?.handleOpenChangeSkipStorage,
    rereadSidebarOpen: ctx?.rereadSidebarOpen,
  };
}

export { SecondarySidebarProvider, SecondarySidebar } from "./secondary-sidebar";
export { SidebarContent, SidebarInset, useSidebar } from "../ui/sidebar";
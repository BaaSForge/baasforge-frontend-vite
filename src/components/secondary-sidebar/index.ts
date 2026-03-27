import { register, UNIFIED_KEYBOARD_SCOPES, unregister } from "@/lib/unified-keyboard";
import { useContext, useEffect } from "react";
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

export function useRegisterSecondarySidebarShortcut() {
    const { toggleSidebar } = useSecondarySidebar();
    useEffect(() => {
        register(UNIFIED_KEYBOARD_SCOPES.SECONDARY_SIDEBAR, toggleSidebar);
        return () => unregister(UNIFIED_KEYBOARD_SCOPES.SECONDARY_SIDEBAR);
    }, [toggleSidebar]);
}

export { NestedMainSidebarProvider, useNestedMainSidebar } from "./nested-main-sidebar-context";
export { useAreBothSidebarsOpen } from "./use-are-both-sidebars-open";
export { SidebarContent, SidebarInset, useSidebar } from "../ui/sidebar";
export {
    SecondarySidebarContent,
    SecondarySidebarStickyFooter,
    SecondarySidebarStickyHeader,
} from "./secondary-sidebar-content";
export type { SecondarySidebarContentProps } from "./secondary-sidebar-content";
export { SecondarySidebar, SecondarySidebarProvider } from "./secondary-sidebar";

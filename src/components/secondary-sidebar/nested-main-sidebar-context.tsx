import { useSidebar } from "@/components/ui/sidebar";
import { createContext, type ReactNode, useContext } from "react";

type MainSidebar = ReturnType<typeof useSidebar>;

const NestedMainSidebarContext = createContext<MainSidebar | null>(null);

export function useOptionalNestedMainSidebar(): MainSidebar | null {
    return useContext(NestedMainSidebarContext);
}

/**
 * Routes that wrap content in `SecondarySidebarProvider` add a nested `SidebarProvider`.
 * The inner `useSidebar()` only reflects the secondary (e.g. right) sidebar. Pass the
 * outer app sidebar from `useSidebar()` **before** that nested provider so descendants
 * can combine it with `useSidebar()` from `@/components/secondary-sidebar` (secondary).
 */
export function NestedMainSidebarProvider({ mainSidebar, children }: { mainSidebar: MainSidebar; children: ReactNode }) {
    return <NestedMainSidebarContext.Provider value={mainSidebar}>{children}</NestedMainSidebarContext.Provider>;
}

export function useNestedMainSidebar(): MainSidebar {
    const ctx = useContext(NestedMainSidebarContext);
    if (ctx == null) {
        throw new Error("useNestedMainSidebar must be used within NestedMainSidebarProvider");
    }
    return ctx;
}

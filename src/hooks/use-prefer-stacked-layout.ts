import { useOptionalNestedMainSidebar } from "@/components/secondary-sidebar/nested-main-sidebar-context";
import { useSidebar } from "@/components/ui/sidebar";
import { SECONDARY_SIDEBAR_SHEET_BREAKPOINT, useIsBelowBreakpoint } from "@/hooks/use-mobile";

/**
 * Prefer vertical/stacked layout when the content column is narrow: phone, tablet with an
 * expanded sidebar, or both main and secondary sidebars expanded.
 */
export function usePreferStackedLayout(): boolean {
    const nestedMain = useOptionalNestedMainSidebar();
    const sidebar = useSidebar();
    const main = nestedMain ?? sidebar;
    const secondary = nestedMain ? sidebar : null;

    const isMobile = main.isMobile;
    const isTablet = useIsBelowBreakpoint(SECONDARY_SIDEBAR_SHEET_BREAKPOINT) && !isMobile;

    if (isMobile) {
        return true;
    }

    const mainExpanded = main.open && !main.isMobile;
    const secondaryExpanded = Boolean(secondary?.open && !secondary.isMobile);

    if (mainExpanded && secondaryExpanded) {
        return true;
    }

    if (isTablet && (mainExpanded || secondaryExpanded)) {
        return true;
    }

    return false;
}

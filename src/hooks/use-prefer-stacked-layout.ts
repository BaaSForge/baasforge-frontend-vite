import { SECONDARY_SIDEBAR_SHEET_BREAKPOINT, useIsBelowBreakpoint } from "@/hooks/use-mobile";
import { useMainSidebar } from "@/stores/main-sidebar";
import { useSecondarySidebarVisibility } from "@/stores/secondary-sidebar";

/**
 * Prefer vertical/stacked layout when the content column is narrow: phone, tablet with an
 * expanded sidebar, or both main and secondary sidebars expanded.
 */
export function usePreferStackedLayout(): boolean {
    const main = useMainSidebar();
    const secondary = useSecondarySidebarVisibility();

    const isMobile = main.isMobile;
    const isTablet = useIsBelowBreakpoint(SECONDARY_SIDEBAR_SHEET_BREAKPOINT) && !isMobile;

    if (isMobile) {
        return true;
    }

    const mainExpanded = main.open && !main.isMobile;
    const secondaryExpanded = secondary.isOpen && !secondary.isMobile;

    if (mainExpanded && secondaryExpanded) {
        return true;
    }

    if (isTablet && (mainExpanded || secondaryExpanded)) {
        return true;
    }

    return false;
}

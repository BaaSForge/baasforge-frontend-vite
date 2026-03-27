import { useSidebar } from "@/components/ui/sidebar";
import { useNestedMainSidebar } from "./nested-main-sidebar-context";

/**
 * True when the main app sidebar and the nested secondary sidebar are both expanded
 * on desktop. The center column can be narrow even though the viewport is above the
 * mobile breakpoint.
 */
export function useAreBothSidebarsOpen(): boolean {
    const main = useNestedMainSidebar();
    const secondary = useSidebar();
    return main.open && !main.isMobile && secondary.open && !secondary.isMobile;
}

import { useSidebar } from "@/components/ui/sidebar";
import { useMainSidebar } from "@/stores/main-sidebar";

/**
 * True when the main app sidebar and the nested secondary sidebar are both expanded
 * on desktop. The center column can be narrow even though the viewport is above the
 * secondary sidebar sheet breakpoint (includes tablet).
 */
export function useAreBothSidebarsOpen(): boolean {
    const main = useMainSidebar();
    const secondary = useSidebar();
    return main.open && !main.isMobile && secondary.open && !secondary.isMobile;
}

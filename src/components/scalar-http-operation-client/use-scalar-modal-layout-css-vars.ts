import { useOptionalNestedMainSidebar } from "@/components/secondary-sidebar/nested-main-sidebar-context";
import { SIDEBAR_WIDTH, SIDEBAR_WIDTH_ICON, useSidebar } from "@/components/ui/sidebar";
import { usePageTitleBoxHeight, useStickyBreadcrumbBarHeight, useStickyBreadcrumbBarVisible } from "@/stores/breadcrumb";
import { useLayoutEffect } from "react";

let layoutVarConsumers = 0;

const VAR_TOP = "--baal-scalar-modal-inset-top";
const VAR_LEFT = "--baal-scalar-modal-inset-left";
const VAR_RIGHT = "--baal-scalar-modal-inset-right";

function clearLayoutVars(root: HTMLElement) {
    root.style.removeProperty(VAR_TOP);
    root.style.removeProperty(VAR_LEFT);
    root.style.removeProperty(VAR_RIGHT);
}

export function useScalarModalLayoutCssVars() {
    const innerSidebar = useSidebar();
    const nestedMain = useOptionalNestedMainSidebar();
    const mainSidebar = nestedMain ?? innerSidebar;
    const secondarySidebar = nestedMain != null ? innerSidebar : null;

    const secondaryOpen = secondarySidebar?.open === true && secondarySidebar.isMobile !== true;

    const stickyBarVisible = useStickyBreadcrumbBarVisible();
    const stickyBarHeight = useStickyBreadcrumbBarHeight();
    const pageTitleBoxHeight = usePageTitleBoxHeight();

    useLayoutEffect(() => {
        const root = document.documentElement;
        layoutVarConsumers++;

        const left =
            mainSidebar.isMobile || !mainSidebar.open ? (mainSidebar.isMobile ? "0px" : SIDEBAR_WIDTH_ICON) : SIDEBAR_WIDTH;
        const right = secondaryOpen ? SIDEBAR_WIDTH : "0px";
        const topPx = (stickyBarVisible ? stickyBarHeight : 0) + pageTitleBoxHeight;

        root.style.setProperty(VAR_LEFT, left);
        root.style.setProperty(VAR_RIGHT, right);
        root.style.setProperty(VAR_TOP, `${topPx}px`);

        return () => {
            layoutVarConsumers--;
            if (layoutVarConsumers <= 0) {
                layoutVarConsumers = 0;
                clearLayoutVars(root);
            }
        };
    }, [
        mainSidebar.isMobile,
        mainSidebar.open,
        secondaryOpen,
        stickyBarHeight,
        stickyBarVisible,
        pageTitleBoxHeight,
    ]);
}

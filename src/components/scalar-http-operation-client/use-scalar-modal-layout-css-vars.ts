import { useOptionalNestedMainSidebar } from "@/components/secondary-sidebar/nested-main-sidebar-context";
import { SIDEBAR_WIDTH, SIDEBAR_WIDTH_ICON, useSidebar } from "@/components/ui/sidebar";
import { useLayoutEffect } from "react";

let layoutVarConsumers = 0;

const VAR_LEFT = "--baal-scalar-modal-inset-left";
const VAR_RIGHT = "--baal-scalar-modal-inset-right";

function clearLayoutVars(root: HTMLElement) {
    root.style.removeProperty(VAR_LEFT);
    root.style.removeProperty(VAR_RIGHT);
}

export function useScalarModalLayoutCssVars() {
    const innerSidebar = useSidebar();
    const nestedMain = useOptionalNestedMainSidebar();
    const mainSidebar = nestedMain ?? innerSidebar;
    const secondarySidebar = nestedMain != null ? innerSidebar : null;

    const secondaryOpen = secondarySidebar?.open === true && secondarySidebar.isMobile !== true;

    useLayoutEffect(() => {
        const root = document.documentElement;
        layoutVarConsumers++;

        const left =
            mainSidebar.isMobile || !mainSidebar.open ? (mainSidebar.isMobile ? "0px" : SIDEBAR_WIDTH_ICON) : SIDEBAR_WIDTH;
        const right = secondaryOpen ? SIDEBAR_WIDTH : "0px";

        root.style.setProperty(VAR_LEFT, left);
        root.style.setProperty(VAR_RIGHT, right);

        return () => {
            layoutVarConsumers--;
            if (layoutVarConsumers <= 0) {
                layoutVarConsumers = 0;
                clearLayoutVars(root);
            }
        };
    }, [mainSidebar.isMobile, mainSidebar.open, secondaryOpen]);
}

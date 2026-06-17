"use client";

import { useSidebar } from "@/components/ui/sidebar";
import { useRegisterAppChromeDismiss } from "@/hooks/use-register-app-chrome-dismiss";
import { useCallback } from "react";

export function SidebarChromeDismiss() {
    const { setOpen, setOpenMobile } = useSidebar();
    const dismiss = useCallback(() => {
        setOpen(false);
        setOpenMobile(false);
    }, [setOpen, setOpenMobile]);
    useRegisterAppChromeDismiss(dismiss);
    return null;
}

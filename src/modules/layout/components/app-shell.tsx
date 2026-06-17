import { SidebarChromeDismiss } from "@/components/sidebar-chrome-dismiss";
import { SignupTutorialGlobalHost } from "@/components/signup-tutorial-nudge";
import { ScalarHttpTestAiNudgeGlobalHost } from "@/components/scalar-http-operation-client/scalar-http-test-ai-nudge";
import { SidebarInset, SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { useSubscribeUserNotifications } from "@/hooks/use-subscribe-user-notifications";
import { register, UNIFIED_KEYBOARD_SCOPES, unregister } from "@/lib/unified-keyboard";
import * as React from "react";
import { Outlet } from "react-router";
import { StartDebugModalProvider } from "./start-debug-modal";
import { AppSidebar } from "./app-sidebar";
import { ShortcutsModal } from "./shortcuts-modal";
import { StickyBreadcrumbBar, StickyBreadcrumbBarPlaceholder } from "./sticky-breadcrumb-bar";

const SIDEBAR_STORAGE_KEY = "sidebar_state";

function getStoredSidebarState(): boolean {
    if (typeof window === "undefined") return true;
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    return stored === null ? true : stored === "true";
}

function MainSidebarShortcutListener() {
    const { toggleSidebar } = useSidebar();
    React.useEffect(() => {
        register(UNIFIED_KEYBOARD_SCOPES.MAIN_SIDEBAR, toggleSidebar);
        return () => unregister(UNIFIED_KEYBOARD_SCOPES.MAIN_SIDEBAR);
    }, [toggleSidebar]);
    return null;
}

export function AppShell() {
    const [open, setOpen] = React.useState(getStoredSidebarState);
    const [shortcutsOpen, setShortcutsOpen] = React.useState(false);

    useSubscribeUserNotifications();

    const handleOpenChange = React.useCallback((value: boolean) => {
        setOpen(value);
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(value));
    }, []);

    const handleOpenShortcuts = React.useCallback(() => {
        setShortcutsOpen(true);
    }, []);

    React.useEffect(() => {
        register(UNIFIED_KEYBOARD_SCOPES.OPEN_SHORTCUTS_MODAL, handleOpenShortcuts);
        return () => unregister(UNIFIED_KEYBOARD_SCOPES.OPEN_SHORTCUTS_MODAL);
    }, [handleOpenShortcuts]);

    return (
        <StartDebugModalProvider>
            <SidebarProvider open={open} onOpenChange={handleOpenChange}>
                <SidebarChromeDismiss />
                <MainSidebarShortcutListener />
                <AppSidebar onOpenShortcuts={handleOpenShortcuts} />
                <SidebarInset>
                    <StickyBreadcrumbBarPlaceholder />
                    <StickyBreadcrumbBar />
                    <Outlet />
                </SidebarInset>
                <ShortcutsModal open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
                <ScalarHttpTestAiNudgeGlobalHost />
                <SignupTutorialGlobalHost />
            </SidebarProvider>
        </StartDebugModalProvider>
    );
}

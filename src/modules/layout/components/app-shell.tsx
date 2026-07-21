import { SidebarChromeDismiss } from "@/components/sidebar-chrome-dismiss";
import { TutorialGlobalHost } from "@/modules/tutorials";
import { SignupTutorialGlobalHost } from "@/components/signup-tutorial-nudge";
import { ScalarHttpTestAiNudgeGlobalHost } from "@/components/scalar-http-operation-client/scalar-http-test-ai-nudge";
import { TargetSpotlightOverlayGlobalHost } from "@/components/target-spotlight-overlay";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    CentricModal,
    CentricModalContent,
    CentricModalDescription,
    CentricModalHeader,
    CentricModalTitle,
} from "@/components/ui/centric-modal";
import { SidebarInset, SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { useSubscribeUserNotifications } from "@/hooks/use-subscribe-user-notifications";
import { toast } from "@/lib/toast";
import { register, UNIFIED_KEYBOARD_SCOPES, unregister } from "@/lib/unified-keyboard";
import { mainSidebarApi } from "@/stores/main-sidebar";
import * as React from "react";
import { Outlet } from "react-router";
import { StartDebugModalProvider } from "./start-debug-modal";
import { AppSidebar } from "./app-sidebar";
import { ShortcutsModal } from "./shortcuts-modal";
import { StickyBreadcrumbBar, StickyBreadcrumbBarPlaceholder } from "./sticky-breadcrumb-bar";

function MainSidebarShortcutListener() {
    const { toggleSidebar } = useSidebar();
    React.useEffect(() => {
        register(UNIFIED_KEYBOARD_SCOPES.MAIN_SIDEBAR, toggleSidebar);
        return () => unregister(UNIFIED_KEYBOARD_SCOPES.MAIN_SIDEBAR);
    }, [toggleSidebar]);
    return null;
}

function DialogsAutoOpenTest() {
    const { isMobile, setOpenMobile } = useSidebar();
    const [alertOpen, setAlertOpen] = React.useState(false);
    const [modalOpen, setModalOpen] = React.useState(false);

    const enabledOnes: ("mainSidebar" | "secondarySidebar" | "alert" | "modal" | "toast")[] = React.useMemo(() => {
        return [];
    }, []);

    React.useEffect(() => {
        const timer = window.setTimeout(() => {
            if (enabledOnes.includes("mainSidebar")) {
                setOpenMobile(true);
            }
            if (enabledOnes.includes("alert")) {
                setAlertOpen(true);
            }
            if (enabledOnes.includes("modal")) {
                setModalOpen(true);
            }
            if (enabledOnes.includes("toast")) {
                toast.info("Mobile sidebar auto-open test");
            }
        }, 1000);
        return () => window.clearTimeout(timer);
    }, [isMobile, setOpenMobile, enabledOnes]);

    return (
        <>
            <CentricModal open={modalOpen} onOpenChange={setModalOpen}>
                <CentricModalContent className="sm:max-w-xl" fillViewportOnMobile showCloseButton>
                    <CentricModalHeader>
                        <CentricModalTitle>Mobile sidebar auto-open test</CentricModalTitle>
                        <CentricModalDescription>Sidebar should be open behind this modal.</CentricModalDescription>
                    </CentricModalHeader>
                </CentricModalContent>
            </CentricModal>
            <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Mobile sidebar auto-open test</AlertDialogTitle>
                        <AlertDialogDescription>Sidebar should be open behind this alert.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction>OK</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

export function AppShell() {
    const [shortcutsOpen, setShortcutsOpen] = React.useState(false);

    useSubscribeUserNotifications();

    const handleOpenShortcuts = React.useCallback(() => {
        setShortcutsOpen(true);
    }, []);

    React.useEffect(() => {
        register(UNIFIED_KEYBOARD_SCOPES.OPEN_SHORTCUTS_MODAL, handleOpenShortcuts);
        return () => unregister(UNIFIED_KEYBOARD_SCOPES.OPEN_SHORTCUTS_MODAL);
    }, [handleOpenShortcuts]);

    return (
        <StartDebugModalProvider>
            <SidebarProvider sidebarStore={mainSidebarApi}>
                <SidebarChromeDismiss />
                <MainSidebarShortcutListener />
                <DialogsAutoOpenTest />
                <AppSidebar onOpenShortcuts={handleOpenShortcuts} />
                <SidebarInset>
                    <StickyBreadcrumbBarPlaceholder />
                    <StickyBreadcrumbBar />
                    <Outlet />
                </SidebarInset>
                <ShortcutsModal open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
                <ScalarHttpTestAiNudgeGlobalHost />
                <SignupTutorialGlobalHost />
                <TutorialGlobalHost />
                <TargetSpotlightOverlayGlobalHost />
            </SidebarProvider>
        </StartDebugModalProvider>
    );
}

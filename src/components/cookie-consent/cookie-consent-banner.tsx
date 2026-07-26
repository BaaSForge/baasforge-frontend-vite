import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import {
    useCookieConsentActions,
    useCookieConsentSettingsOpen,
    useHasCookieConsentResponded,
} from "@/services/cookie-consent";
import { Link } from "react-router";

export function CookieConsentBanner() {
    const hasResponded = useHasCookieConsentResponded();
    const settingsOpen = useCookieConsentSettingsOpen();
    const { acceptAll, rejectAll, openSettings } = useCookieConsentActions();
    const open = !hasResponded && !settingsOpen;

    return (
        <Drawer open={open} onOpenChange={() => {}} dismissible={false} modal={false}>
            <DrawerContent
                showOverlay={false}
                showDragHandle={false}
                dismissOnOverlayClick={false}
                className="max-h-[min(80dvh,28rem)] border shadow-lg data-[vaul-drawer-direction=bottom]:bottom-4 data-[vaul-drawer-direction=bottom]:mt-0 data-[vaul-drawer-direction=bottom]:w-[min(42rem,calc(100%-2rem))] data-[vaul-drawer-direction=bottom]:max-w-[42rem] data-[vaul-drawer-direction=bottom]:rounded-lg"
            >
                <div className="flex min-h-0 flex-col px-4">
                    <DrawerHeader className="mb-0 border-b-0 px-0 text-left group-data-[vaul-drawer-direction=bottom]/drawer-content:text-left md:px-0">
                        <DrawerTitle>We use cookies</DrawerTitle>
                        <DrawerDescription className="text-left">
                            We use strictly necessary cookies to run the site. With your permission, we may also use
                            analytics and marketing cookies. See our{" "}
                            <Link
                                className="text-foreground underline underline-offset-4 hover:text-foreground/80"
                                to="/privacy-policy"
                                reloadDocument
                            >
                                Privacy Policy
                            </Link>
                            .
                        </DrawerDescription>
                    </DrawerHeader>
                    <DrawerFooter className="flex-col gap-2 px-0 sm:flex-row sm:justify-end">
                        <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => rejectAll()}>
                            Reject non-essential
                        </Button>
                        <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={() => openSettings()}>
                            Cookie settings
                        </Button>
                        <Button type="button" className="w-full sm:w-auto" onClick={() => acceptAll()}>
                            Accept all
                        </Button>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}

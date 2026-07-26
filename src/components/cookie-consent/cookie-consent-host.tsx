import { openCookieSettings } from "@/services/cookie-consent";
import { useEffect } from "react";
import { useLocation } from "react-router";

import { CookieConsentBanner } from "./cookie-consent-banner";
import { CookieConsentSettingsModal } from "./cookie-consent-settings-modal";

function useOpenSettingsFromPath() {
    const { pathname } = useLocation();
    useEffect(() => {
        if (pathname === "/cookie-settings") {
            openCookieSettings();
        }
    }, [pathname]);
}

export function CookieConsentHost() {
    useOpenSettingsFromPath();

    return (
        <>
            <CookieConsentBanner />
            <CookieConsentSettingsModal />
        </>
    );
}

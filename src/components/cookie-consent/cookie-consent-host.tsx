import { CookieConsentBanner } from "./cookie-consent-banner";
import { CookieConsentSettingsModal } from "./cookie-consent-settings-modal";

export function CookieConsentHost() {
    return (
        <>
            <CookieConsentBanner />
            <CookieConsentSettingsModal />
        </>
    );
}

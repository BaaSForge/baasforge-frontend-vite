import { AppLogoSquare } from "@/components/logo/app-logo-square";
import { Button } from "@/components/ui/button";
import { openCookieSettings } from "@/services/cookie-consent";
import { useEffect } from "react";
import { Link } from "react-router";

import "../legal-page.css";

export default function CookieSettingsPage() {
    useEffect(() => {
        document.title = "Cookie settings | BaaSForge";
        openCookieSettings();
    }, []);

    return (
        <div className="bf-legal">
            <header className="bf-legal-nav">
                <div className="bf-legal-nav-inner">
                    <Link to="/" className="bf-legal-brand" aria-label="BaaSForge home">
                        <AppLogoSquare className="size-[22px]" />
                        <span>BaaSForge</span>
                    </Link>
                    <nav className="bf-legal-links" aria-label="Legal">
                        <Link to="/privacy-policy">Privacy</Link>
                        <Link to="/terms-of-use">Terms</Link>
                        <Link to="/cookie-settings" aria-current="page">
                            Cookies
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="bf-legal-main">
                <article className="bf-legal-document">
                    <header className="bf-legal-document-header">
                        <h1>Cookie settings</h1>
                    </header>
                    <p>
                        Use the cookie preferences dialog to accept, reject, or customize analytics and marketing
                        cookies. Strictly necessary cookies stay on so the site can function.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-2">
                        <Button type="button" onClick={() => openCookieSettings()}>
                            Open cookie settings
                        </Button>
                        <Button type="button" variant="outline" asChild>
                            <Link to="/privacy-policy">Privacy Policy</Link>
                        </Button>
                    </div>
                </article>
            </main>
        </div>
    );
}

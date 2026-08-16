import { AppLogoSquare } from "@/components/logo/app-logo-square";
import { Button } from "@/components/ui/button";
import { openCookieSettings } from "@/services/cookie-consent";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";

import "./marketing-shell.css";

const MARKETING_LINKS = [
    { id: "pitch", label: "Pitch", href: "/" },
    { id: "docs", label: "Docs", href: "/docs" },
    { id: "pricing", label: "Pricing", href: "/pricing" },
] as const;
type MarketingPage = (typeof MARKETING_LINKS)[number]["id"];

function getActiveMarketingPage(pathname: string): MarketingPage | undefined {
    if (pathname === "/") return "pitch";
    if (pathname === "/docs" || pathname.startsWith("/docs/")) return "docs";
    if (pathname === "/pricing" || pathname.startsWith("/pricing/")) return "pricing";
    return undefined;
}

function Brand() {
    return (
        <Link to="/" reloadDocument className="bf-logo" aria-label="BaaSForge home">
            <AppLogoSquare width={22} height={22} sizes="22px" className="size-[22px]" />
            BaaSForge
        </Link>
    );
}

export function MarketingHeader() {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuButtonRef = useRef<HTMLButtonElement | null>(null);
    const { pathname } = useLocation();
    const currentPage = getActiveMarketingPage(pathname);

    useEffect(() => {
        if (!menuOpen) return;
        const previousOverflow = document.body.style.overflow;
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key !== "Escape") return;
            setMenuOpen(false);
            menuButtonRef.current?.focus();
        };
        document.body.style.overflow = "hidden";
        document.addEventListener("keydown", closeOnEscape);
        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", closeOnEscape);
        };
    }, [menuOpen]);

    useEffect(() => {
        const desktopQuery = matchMedia("(min-width:1280px)");
        const closeForDesktop = (event: MediaQueryListEvent) => {
            if (event.matches) setMenuOpen(false);
        };
        desktopQuery.addEventListener("change", closeForDesktop);
        return () => desktopQuery.removeEventListener("change", closeForDesktop);
    }, []);

    return (
        <>
            <nav className="bf-nav">
                <div className="mx-auto flex h-[68px] max-w-[1080px] items-center justify-between px-7">
                    <Brand />
                    <div className="hidden gap-5 text-sm xl:flex" aria-label="Main navigation">
                        {MARKETING_LINKS.map(({ id, label, href }) => {
                            const isCurrent = currentPage === id;
                            return (
                            <Link
                                key={label}
                                to={href}
                                reloadDocument={!isCurrent}
                                aria-current={isCurrent ? "page" : undefined}
                                className="bf-nav-link border-b pb-[3px]"
                                style={{
                                    color: isCurrent ? "var(--foreground)" : "var(--muted-foreground)",
                                    borderColor: isCurrent ? "var(--foreground)" : "transparent",
                                }}
                            >
                                {label}
                            </Link>
                            );
                        })}
                    </div>
                    <div className="flex items-center gap-3.5">
                        <div className="hidden items-center gap-3.5 xl:flex">
                            <Button variant="ghost" size="sm" className="rounded-full" asChild>
                                <a href="/login">
                                    Sign in
                                </a>
                            </Button>
                            <Button
                                size="sm"
                                className="rounded-full bg-primary font-semibold hover:bg-primary/90 active:bg-primary/80"
                                style={{ color: "var(--primary-foreground)" }}
                                asChild
                            >
                                <a href="/login">
                                    Start building
                                </a>
                            </Button>
                        </div>
                        <button
                            ref={menuButtonRef}
                            type="button"
                            className="bf-menu-toggle flex size-10 items-center justify-center rounded-md text-foreground hover:bg-foreground/8 xl:hidden"
                            aria-label={menuOpen ? "Close menu" : "Open menu"}
                            aria-expanded={menuOpen}
                            data-open={menuOpen}
                            onClick={() => setMenuOpen((open) => !open)}
                        >
                            <Menu className="bf-menu-icon menu size-[18px]" />
                            <X className="bf-menu-icon close size-[18px]" />
                        </button>
                    </div>
                </div>
            </nav>
            <div
                className="bf-mobile-menu-backdrop xl:hidden"
                aria-hidden={!menuOpen}
                data-open={menuOpen}
                onClick={() => setMenuOpen(false)}
            />
            <div
                className="bf-mobile-menu xl:hidden"
                data-open={menuOpen}
                aria-hidden={!menuOpen}
                aria-label="Navigation menu"
                inert={!menuOpen}
                role="dialog"
            >
                <nav className="bf-mobile-menu-nav" aria-label="Mobile navigation">
                    {MARKETING_LINKS.map(({ id, label, href }) => {
                        const isCurrent = currentPage === id;
                        return (
                        <Link
                            key={label}
                            to={href}
                            reloadDocument={!isCurrent}
                            aria-current={isCurrent ? "page" : undefined}
                            onClick={() => setMenuOpen(false)}
                            className="bf-nav-link bf-mobile-menu-link"
                            style={{ color: isCurrent ? "var(--foreground)" : "var(--muted-foreground)" }}
                        >
                            {label}
                        </Link>
                        );
                    })}
                </nav>
                <div className="bf-mobile-menu-actions">
                    <Button variant="outline" className="h-12 rounded-full" asChild>
                        <a className="bf-mobile-action" href="/login" onClick={() => setMenuOpen(false)}>
                            Sign in
                        </a>
                    </Button>
                    <Button
                        className="h-12 rounded-full bg-primary font-semibold hover:bg-primary/90 active:bg-primary/80"
                        style={{ color: "var(--primary-foreground)" }}
                        asChild
                    >
                        <a className="bf-mobile-action" href="/login" onClick={() => setMenuOpen(false)}>
                            Start building
                        </a>
                    </Button>
                </div>
            </div>
        </>
    );
}

export function MarketingFooter() {
    return (
        <footer className="bf-footer">
            <div className="bf-container">
                <div className="bf-footer-inner">
                    <div className="bf-footer-main">
                        <div className="bf-footer-brand">
                            <Brand />
                            <p className="bf-footer-copy">
                                We got tired of juggling different tools and infrastructure just to ship a backend. So we built the one we wished we'd had.
                            </p>
                        </div>
                        <nav className="bf-footer-nav" aria-label="Footer navigation">
                            <div>
                                <h2 className="bf-footer-column-title">Product</h2>
                                <ul className="bf-footer-list">
                                    <li>
                                        <Link className="bf-footer-link" to="/pricing" reloadDocument>
                                            Pricing
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h2 className="bf-footer-column-title">Resources</h2>
                                <ul className="bf-footer-list">
                                    <li>
                                        <Link className="bf-footer-link" to="/docs" reloadDocument>
                                            Docs
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h2 className="bf-footer-column-title">Social</h2>
                                <ul className="bf-footer-list">
                                    <li>
                                        <a
                                            className="bf-footer-link"
                                            href="https://www.linkedin.com/company/baasforge/"
                                            target="_blank"
                                            rel="noreferrer"
                                            aria-label="BaaSForge on LinkedIn"
                                        >
                                            LinkedIn
                                            <ArrowUpRight className="size-3.5" aria-hidden="true" />
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </nav>
                    </div>
                    <div className="bf-footer-meta">
                        <span className="bf-footer-mark">© 2026 BaaSForge</span>
                        <div className="bf-footer-legal">
                            <Link className="bf-footer-link" to="/privacy-policy" reloadDocument>
                                Privacy
                            </Link>
                            <Link className="bf-footer-link" to="/terms-of-use" reloadDocument>
                                Terms
                            </Link>
                            <button type="button" className="bf-footer-link" onClick={() => openCookieSettings()}>
                                Cookies
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

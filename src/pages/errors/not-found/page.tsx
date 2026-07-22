import { AppLogoSquare } from "@/components/logo/app-logo-square";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { Link } from "react-router";

import "./not-found.css";

function useNotFoundMetadata() {
    useEffect(() => {
        const previousTitle = document.title;
        const descriptionMeta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
        const robotsMeta = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
        const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
        const homepageSchema = document.querySelector<HTMLScriptElement>("#baasforge-homepage-schema");
        const socialMeta = [...document.querySelectorAll<HTMLMetaElement>('meta[property^="og:"], meta[name^="twitter:"]')];
        const previousDescription = descriptionMeta?.content ?? null;
        const previousRobotsContent = robotsMeta?.getAttribute("content") ?? null;
        const meta = robotsMeta ?? document.createElement("meta");

        if (!robotsMeta) {
            meta.name = "robots";
            document.head.append(meta);
        }

        document.title = "404 | BaaSForge";
        if (descriptionMeta) descriptionMeta.content = "The requested page could not be found on BaaSForge.";
        meta.content = "noindex, nofollow";
        canonical?.remove();
        homepageSchema?.remove();
        socialMeta.forEach((element) => element.remove());

        return () => {
            document.title = previousTitle;
            if (descriptionMeta && previousDescription !== null) descriptionMeta.content = previousDescription;
            if (robotsMeta) {
                if (previousRobotsContent === null) robotsMeta.removeAttribute("content");
                else robotsMeta.content = previousRobotsContent;
            } else {
                meta.remove();
            }
            if (canonical) document.head.append(canonical);
            if (homepageSchema) document.head.append(homepageSchema);
            socialMeta.forEach((element) => document.head.append(element));
        };
    }, []);
}

export default function NotFoundPage() {
    useNotFoundMetadata();

    return (
        <div className="bf-not-found">
            <header className="bf-not-found-nav">
                <div className="bf-not-found-nav-inner">
                    <Link to="/" className="bf-not-found-brand" aria-label="BaaSForge home">
                        <AppLogoSquare className="size-[22px]" />
                        <span>BaaSForge</span>
                    </Link>
                </div>
            </header>

            <main className="bf-not-found-main">
                <section className="bf-not-found-content" aria-labelledby="not-found-title">
                    <div className="bf-not-found-number-wrap">
                        <h1 id="not-found-title" className="bf-not-found-title" aria-label="404 — Page not found">
                            {Array.from("404").map((glyph, index) => (
                                <span
                                    key={`${glyph}-${index}`}
                                    className="bf-not-found-glyph"
                                    style={{ "--glyph-delay": `${(index + 1) * 40}ms` } as React.CSSProperties}
                                    aria-hidden="true"
                                >
                                    {glyph}
                                </span>
                            ))}
                        </h1>
                        <span className="bf-not-found-signal" aria-hidden="true">
                            <span className="bf-not-found-tear bf-not-found-tear-left">404</span>
                            <span className="bf-not-found-tear bf-not-found-tear-right">404</span>
                        </span>
                    </div>

                    <p className="bf-not-found-copy">
                        <strong>Nothing is broken.</strong> <span>No unit claims this path.</span>
                    </p>

                    <div className="bf-not-found-actions">
                        <Button
                            size="lg"
                            className="bf-not-found-button rounded-full bg-primary font-semibold hover:bg-primary/90 active:bg-primary/80"
                            style={{ color: "var(--primary-foreground)" }}
                            asChild
                        >
                            <Link to="/">Back to home</Link>
                        </Button>
                    </div>
                </section>
            </main>
        </div>
    );
}

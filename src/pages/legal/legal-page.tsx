import { AppLogoSquare } from "@/components/logo/app-logo-square";
import { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router";
import remarkGfm from "remark-gfm";

import "./legal-page.css";

type LegalPageProps = {
    canonicalPath: string;
    content: string;
    description: string;
    title: string;
};

function useLegalMetadata({ canonicalPath, description, title }: Omit<LegalPageProps, "content">) {
    useEffect(() => {
        const previousTitle = document.title;
        const descriptionMeta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
        const robotsMeta = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
        const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
        const homepageSchema = document.querySelector<HTMLScriptElement>("#baasforge-homepage-schema");
        const previousDescription = descriptionMeta?.content;
        const previousRobots = robotsMeta?.content;
        const previousCanonical = canonical?.href;

        const nextDescription = descriptionMeta ?? document.head.appendChild(document.createElement("meta"));
        const nextRobots = robotsMeta ?? document.head.appendChild(document.createElement("meta"));
        const nextCanonical = canonical ?? document.head.appendChild(document.createElement("link"));

        nextDescription.name = "description";
        nextDescription.content = description;
        nextRobots.name = "robots";
        nextRobots.content = "index, follow";
        nextCanonical.rel = "canonical";
        nextCanonical.href = `${window.location.origin}${canonicalPath}`;
        document.title = `${title} | BaaSForge`;
        homepageSchema?.remove();

        return () => {
            document.title = previousTitle;
            if (descriptionMeta && previousDescription != null) descriptionMeta.content = previousDescription;
            else nextDescription.remove();
            if (robotsMeta && previousRobots != null) nextRobots.content = previousRobots;
            else nextRobots.remove();
            if (canonical && previousCanonical != null) nextCanonical.href = previousCanonical;
            else nextCanonical.remove();
            if (homepageSchema) document.head.append(homepageSchema);
        };
    }, [canonicalPath, description, title]);
}

export function LegalPage({ canonicalPath, content, description, title }: LegalPageProps) {
    useLegalMetadata({ canonicalPath, description, title });

    return (
        <div className="bf-legal">
            <header className="bf-legal-nav">
                <div className="bf-legal-nav-inner">
                    <Link to="/" className="bf-legal-brand" aria-label="BaaSForge home">
                        <AppLogoSquare className="size-[22px]" />
                        <span>BaaSForge</span>
                    </Link>
                    <nav className="bf-legal-links" aria-label="Legal">
                        <Link to="/privacy-policy" aria-current={canonicalPath === "/privacy-policy" ? "page" : undefined}>
                            Privacy
                        </Link>
                        <Link to="/terms-of-use" aria-current={canonicalPath === "/terms-of-use" ? "page" : undefined}>
                            Terms
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="bf-legal-main">
                <article className="bf-legal-document">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                </article>
            </main>
        </div>
    );
}

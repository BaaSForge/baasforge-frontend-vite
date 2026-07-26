import { AppLogoSquare } from "@/components/logo/app-logo-square";
import { openCookieSettings } from "@/services/cookie-consent";
import { Children, cloneElement, isValidElement, useEffect, type ReactNode } from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router";
import remarkGfm from "remark-gfm";

import "./legal-page.css";

type LegalPageProps = {
    canonicalPath: string;
    content: string;
    dateModified: string;
    description: string;
    title: string;
};

const COOKIE_SETTINGS_MARKER = "{{cookie-settings}}";

function CookieSettingsButton() {
    return (
        <button type="button" className="bf-legal-inline-action" onClick={() => openCookieSettings()}>
            Cookie settings
        </button>
    );
}

function injectCookieSettingsControls(children: ReactNode): ReactNode {
    return Children.map(children, (child) => {
        if (typeof child === "string") {
            if (!child.includes(COOKIE_SETTINGS_MARKER)) return child;

            return child.split(COOKIE_SETTINGS_MARKER).flatMap((part, index) =>
                index === 0
                    ? [part]
                    : [<CookieSettingsButton key={`cookie-settings-${index}`} />, part],
            );
        }

        if (isValidElement<{ children?: ReactNode }>(child) && child.props.children != null) {
            return cloneElement(child, {
                children: injectCookieSettingsControls(child.props.children),
            });
        }

        return child;
    });
}

const legalMarkdownComponents: Components = {
    table({ children }) {
        return (
            <div className="bf-legal-table-wrap">
                <table>{children}</table>
            </div>
        );
    },
    p({ children }) {
        return <p>{injectCookieSettingsControls(children)}</p>;
    },
    li({ children }) {
        return <li>{injectCookieSettingsControls(children)}</li>;
    },
};

function parseLegalDocument(content: string) {
    const headerPattern = /^# (.+)\n\n\*\*Version ([^|]+)\| Last updated: ([^*]+)\*\*\n\n/;
    const match = content.match(headerPattern);

    if (!match) {
        return { body: content, documentTitle: null, lastUpdated: null, version: null };
    }

    return {
        body: content.slice(match[0].length),
        documentTitle: match[1].trim(),
        lastUpdated: match[3].trim(),
        version: match[2].trim(),
    };
}

function useLegalMetadata({ canonicalPath, dateModified, description, title }: Omit<LegalPageProps, "content">) {
    useEffect(() => {
        const previousTitle = document.title;
        const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
        const homepageSchema = document.querySelector<HTMLScriptElement>("#baasforge-homepage-schema");
        const existingLegalSchema = document.querySelector<HTMLScriptElement>("#baasforge-legal-schema");
        const previousCanonical = canonical?.href;
        const pageTitle = `${title} | BaaSForge`;
        const canonicalUrl = `${window.location.origin}${canonicalPath}`;
        const metadata = [
            ['meta[name="description"]', "name", "description", description],
            ['meta[name="robots"]', "name", "robots", "index, follow, max-image-preview:large"],
            ['meta[property="og:type"]', "property", "og:type", "article"],
            ['meta[property="og:site_name"]', "property", "og:site_name", "BaaSForge"],
            ['meta[property="og:title"]', "property", "og:title", pageTitle],
            ['meta[property="og:description"]', "property", "og:description", description],
            ['meta[property="og:url"]', "property", "og:url", canonicalUrl],
            ['meta[name="twitter:card"]', "name", "twitter:card", "summary"],
            ['meta[name="twitter:title"]', "name", "twitter:title", pageTitle],
            ['meta[name="twitter:description"]', "name", "twitter:description", description],
        ] as const;
        const managedMetadata = metadata.map(([selector, attribute, name, content]) => {
            const existing = document.head.querySelector<HTMLMetaElement>(selector);
            const element = existing ?? document.head.appendChild(document.createElement("meta"));
            const previousContent = existing?.content;
            element.setAttribute(attribute, name);
            element.content = content;
            return { element, existing, previousContent };
        });

        const nextCanonical = canonical ?? document.head.appendChild(document.createElement("link"));
        nextCanonical.rel = "canonical";
        nextCanonical.href = canonicalUrl;
        const legalSchema = existingLegalSchema ?? document.createElement("script");
        const previousLegalSchema = existingLegalSchema?.text;
        legalSchema.id = "baasforge-legal-schema";
        legalSchema.type = "application/ld+json";
        legalSchema.text = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: pageTitle,
            url: canonicalUrl,
            description,
            dateModified,
            isPartOf: {
                "@type": "WebSite",
                name: "BaaSForge",
                url: window.location.origin,
            },
        });
        if (!existingLegalSchema) document.head.append(legalSchema);
        document.title = pageTitle;
        homepageSchema?.remove();

        return () => {
            document.title = previousTitle;
            managedMetadata.forEach(({ element, existing, previousContent }) => {
                if (existing && previousContent != null) element.content = previousContent;
                else element.remove();
            });
            if (canonical && previousCanonical != null) nextCanonical.href = previousCanonical;
            else nextCanonical.remove();
            if (existingLegalSchema && previousLegalSchema != null) legalSchema.text = previousLegalSchema;
            else legalSchema.remove();
            if (homepageSchema) document.head.append(homepageSchema);
        };
    }, [canonicalPath, dateModified, description, title]);
}

export function LegalPage({ canonicalPath, content, dateModified, description, title }: LegalPageProps) {
    useLegalMetadata({ canonicalPath, dateModified, description, title });
    const document = parseLegalDocument(content);

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
                        <button type="button" onClick={() => openCookieSettings()}>
                            Cookies
                        </button>
                    </nav>
                </div>
            </header>

            <main className="bf-legal-main">
                <article className="bf-legal-document">
                    {document.documentTitle && (
                        <header className="bf-legal-document-header">
                            <h1>{document.documentTitle}</h1>
                            <div className="bf-legal-document-meta">
                                <span>Version {document.version}</span>
                                <span className="bf-legal-document-meta-dot" aria-hidden="true" />
                                <span>Last updated {document.lastUpdated}</span>
                            </div>
                        </header>
                    )}
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={legalMarkdownComponents}>
                        {document.body}
                    </ReactMarkdown>
                </article>
            </main>
        </div>
    );
}

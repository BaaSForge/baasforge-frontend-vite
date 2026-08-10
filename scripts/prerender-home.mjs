import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const templatePath = path.join(rootDir, "dist/index.html");
const serverEntryPath = path.join(rootDir, "dist/server/entry-server.js");
const siteUrl = "https://baasforge.com";

const legalPageDefaults = {
    ogType: "article",
    schemaId: "baasforge-legal-schema",
    schemaType: "WebPage",
    twitterCard: "summary",
};

const legalPages = [
    {
        ...legalPageDefaults,
        path: "/privacy-policy",
        title: "Privacy Policy | BaaSForge",
        description: "Learn how BaaSForge collects, uses, protects, and retains personal data.",
        dateModified: "2026-07-23",
    },
    {
        ...legalPageDefaults,
        path: "/terms-of-use",
        title: "Terms of Use | BaaSForge",
        description: "Review the terms governing access to and use of BaaSForge services.",
        dateModified: "2026-07-23",
    },
];

const pricingPage = {
    path: "/pricing",
    title: "Pricing | BaaSForge",
    description: "Start free with BaaSForge, then choose a monthly or annual credit plan for compute, storage, and AI usage.",
    ogType: "website",
    schemaId: "baasforge-pricing-schema",
    schemaType: "Product",
    twitterCard: "summary_large_image",
};

function replaceMeta(html, selector, content) {
    const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return html.replace(new RegExp(`(<meta ${escapedSelector} content=")[^"]*(" \\/>)`), `$1${content}$2`);
}

function createStructuredData(page, canonicalUrl) {
    if (page.schemaType === "Product") {
        return {
            "@context": "https://schema.org",
            "@type": "Product",
            name: "BaaSForge",
            description: page.description,
            url: canonicalUrl,
            brand: { "@type": "Brand", name: "BaaSForge" },
        };
    }

    return {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: page.title,
        url: canonicalUrl,
        description: page.description,
        dateModified: page.dateModified,
        isPartOf: {
            "@type": "WebSite",
            name: "BaaSForge",
            url: siteUrl,
        },
    };
}

function createPublicPageShell(template, page, content) {
    const canonicalUrl = `${siteUrl}${page.path}`;
    let html = template
        .replace(/<title>[^<]*<\/title>/, `<title>${page.title}</title>`)
        .replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${canonicalUrl}" />`)
        .replace(/\s*<script id="baasforge-homepage-schema"[\s\S]*?<\/script>/, "");

    html = replaceMeta(html, 'name="description"', page.description);
    html = replaceMeta(html, 'name="robots"', "index, follow, max-image-preview:large");
    html = replaceMeta(html, 'property="og:type"', page.ogType);
    html = replaceMeta(html, 'property="og:title"', page.title);
    html = replaceMeta(html, 'property="og:description"', page.description);
    html = replaceMeta(html, 'property="og:url"', canonicalUrl);
    html = replaceMeta(html, 'name="twitter:card"', page.twitterCard);
    html = replaceMeta(html, 'name="twitter:title"', page.title);
    html = replaceMeta(html, 'name="twitter:description"', page.description);

    const schema = JSON.stringify(createStructuredData(page, canonicalUrl));

    return html
        .replace("</head>", `    <script id="${page.schemaId}" type="application/ld+json">${schema}</script>\n  </head>`)
        .replace('<div id="root"></div>', `<div id="root">${content}</div>`);
}

function createNotFoundShell(template, content) {
    let html = template
        .replace(/<title>[^<]*<\/title>/, "<title>404 | BaaSForge</title>")
        .replace(/\s*<link rel="canonical" href="[^"]*" \/>/, "")
        .replace(/\s*<script id="baasforge-homepage-schema"[\s\S]*?<\/script>/, "")
        .replace(/\s*<meta property="og:[^"]+"[^>]*\/>/g, "")
        .replace(/\s*<meta name="twitter:[^"]+"[^>]*\/>/g, "");

    html = replaceMeta(html, 'name="description"', "The requested page could not be found on BaaSForge.");
    html = replaceMeta(html, 'name="robots"', "noindex, nofollow");

    return html.replace('<div id="root"></div>', `<div id="root" data-prerendered-page="not-found">${content}</div>`);
}

async function prerenderHome() {
    const { renderHomePage, renderLegalPage, renderNotFoundPage, renderPricingPage } = await import(serverEntryPath);
    const template = fs.readFileSync(templatePath, "utf-8");
    const html = renderHomePage("/");

    const rendered = template.replace('<div id="root"></div>', `<div id="root">${html}</div>`);

    fs.writeFileSync(templatePath, rendered);
    for (const page of legalPages) {
        fs.writeFileSync(
            path.join(rootDir, `dist${page.path}.html`),
            createPublicPageShell(template, page, renderLegalPage(page.path)),
        );
    }
    fs.writeFileSync(
        path.join(rootDir, "dist/pricing.html"),
        createPublicPageShell(template, pricingPage, renderPricingPage()),
    );
    fs.writeFileSync(
        path.join(rootDir, "dist/404.html"),
        createNotFoundShell(template, renderNotFoundPage("/404")),
    );
    console.log("Prerendered homepage, pricing, legal, and not-found HTML shells");
}

prerenderHome().catch((error) => {
    console.error(error);
    process.exit(1);
});

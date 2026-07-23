import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const templatePath = path.join(rootDir, "dist/index.html");
const serverEntryPath = path.join(rootDir, "dist/server/entry-server.js");

const legalPages = [
    {
        path: "/privacy-policy",
        title: "Privacy Policy | BaaSForge",
        description: "Learn how BaaSForge collects, uses, protects, and retains personal data.",
        dateModified: "2026-07-23",
    },
    {
        path: "/terms-of-use",
        title: "Terms of Use | BaaSForge",
        description: "Review the terms governing access to and use of BaaSForge services.",
        dateModified: "2026-07-23",
    },
];

function replaceMeta(html, selector, content) {
    const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return html.replace(new RegExp(`(<meta ${escapedSelector} content=")[^"]*(" \\/>)`), `$1${content}$2`);
}

function createLegalShell(template, page, content) {
    const canonicalUrl = `https://baasforge.com${page.path}`;
    let html = template
        .replace(/<title>[^<]*<\/title>/, `<title>${page.title}</title>`)
        .replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${canonicalUrl}" />`)
        .replace(/\s*<script id="baasforge-homepage-schema"[\s\S]*?<\/script>/, "");

    html = replaceMeta(html, 'name="description"', page.description);
    html = replaceMeta(html, 'name="robots"', "index, follow, max-image-preview:large");
    html = replaceMeta(html, 'property="og:type"', "article");
    html = replaceMeta(html, 'property="og:title"', page.title);
    html = replaceMeta(html, 'property="og:description"', page.description);
    html = replaceMeta(html, 'property="og:url"', canonicalUrl);
    html = replaceMeta(html, 'name="twitter:card"', "summary");
    html = replaceMeta(html, 'name="twitter:title"', page.title);
    html = replaceMeta(html, 'name="twitter:description"', page.description);

    const schema = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: page.title,
        url: canonicalUrl,
        description: page.description,
        dateModified: page.dateModified,
        isPartOf: {
            "@type": "WebSite",
            name: "BaaSForge",
            url: "https://baasforge.com",
        },
    });

    return html
        .replace("</head>", `    <script id="baasforge-legal-schema" type="application/ld+json">${schema}</script>\n  </head>`)
        .replace('<div id="root"></div>', `<div id="root">${content}</div>`);
}

async function prerenderHome() {
    const { renderHomePage, renderLegalPage } = await import(serverEntryPath);
    const template = fs.readFileSync(templatePath, "utf-8");
    const html = renderHomePage("/");

    const rendered = template.replace('<div id="root"></div>', `<div id="root">${html}</div>`);

    fs.writeFileSync(templatePath, rendered);
    for (const page of legalPages) {
        fs.writeFileSync(
            path.join(rootDir, `dist${page.path}.html`),
            createLegalShell(template, page, renderLegalPage(page.path)),
        );
    }
    console.log("Prerendered homepage and generated legal-page HTML shells");
}

prerenderHome().catch((error) => {
    console.error(error);
    process.exit(1);
});

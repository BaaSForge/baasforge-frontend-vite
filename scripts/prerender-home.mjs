import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defaultTreeAdapter, html, parse, parseFragment, serialize } from "parse5";

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

function getAttribute(element, name) {
    return defaultTreeAdapter.getAttrList(element).find((attribute) => attribute.name === name)?.value;
}

function setAttribute(element, name, value) {
    const attributes = defaultTreeAdapter.getAttrList(element);
    const attribute = attributes.find((candidate) => candidate.name === name);

    if (attribute == null) {
        attributes.push({ name, value });
        return;
    }

    attribute.value = value;
}

function findElements(node, predicate, matches = []) {
    for (const child of node.childNodes ?? []) {
        if (!defaultTreeAdapter.isElementNode(child)) continue;
        if (predicate(child)) matches.push(child);
        findElements(child, predicate, matches);
    }

    return matches;
}

function findElement(node, predicate) {
    return findElements(node, predicate)[0];
}

function requireElement(node, predicate, description) {
    const element = findElement(node, predicate);
    if (element == null) throw new Error(`Expected ${description} in the HTML template`);
    return element;
}

function findElementByAttribute(document, tagName, attributeName, attributeValue) {
    return findElement(document, (element) => defaultTreeAdapter.getTagName(element) === tagName && getAttribute(element, attributeName) === attributeValue);
}

function requireElementByAttribute(document, tagName, attributeName, attributeValue) {
    return requireElement(
        document,
        (element) => defaultTreeAdapter.getTagName(element) === tagName && getAttribute(element, attributeName) === attributeValue,
        `<${tagName} ${attributeName}="${attributeValue}">`,
    );
}

function replaceChildren(element, content) {
    for (const child of [...defaultTreeAdapter.getChildNodes(element)]) {
        defaultTreeAdapter.detachNode(child);
    }

    const fragment = parseFragment(element, content);
    for (const child of [...defaultTreeAdapter.getChildNodes(fragment)]) {
        defaultTreeAdapter.detachNode(child);
        defaultTreeAdapter.appendChild(element, child);
    }
}

function setTextContent(element, content) {
    replaceChildren(element, "");
    defaultTreeAdapter.appendChild(element, defaultTreeAdapter.createTextNode(content));
}

function setMetaContent(document, attributeName, attributeValue, content) {
    const meta = requireElementByAttribute(document, "meta", attributeName, attributeValue);
    setAttribute(meta, "content", content);
}

function removeElement(element) {
    if (element != null) defaultTreeAdapter.detachNode(element);
}

function setRootContent(document, content, attributes = {}) {
    const root = requireElementByAttribute(document, "div", "id", "root");
    replaceChildren(root, content);

    for (const [name, value] of Object.entries(attributes)) {
        setAttribute(root, name, value);
    }
}

function appendStructuredData(document, page, canonicalUrl) {
    const head = requireElement(document, (element) => defaultTreeAdapter.getTagName(element) === "head", "<head>");
    const schema = defaultTreeAdapter.createElement("script", html.NS.HTML, [
        { name: "id", value: page.schemaId },
        { name: "type", value: "application/ld+json" },
    ]);

    defaultTreeAdapter.appendChild(schema, defaultTreeAdapter.createTextNode(JSON.stringify(createStructuredData(page, canonicalUrl))));
    defaultTreeAdapter.appendChild(head, schema);
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
    const document = parse(template);
    const title = requireElement(document, (element) => defaultTreeAdapter.getTagName(element) === "title", "<title>");
    const canonical = requireElementByAttribute(document, "link", "rel", "canonical");

    setTextContent(title, page.title);
    setAttribute(canonical, "href", canonicalUrl);
    removeElement(findElementByAttribute(document, "script", "id", "baasforge-homepage-schema"));
    setMetaContent(document, "name", "description", page.description);
    setMetaContent(document, "name", "robots", "index, follow, max-image-preview:large");
    setMetaContent(document, "property", "og:type", page.ogType);
    setMetaContent(document, "property", "og:title", page.title);
    setMetaContent(document, "property", "og:description", page.description);
    setMetaContent(document, "property", "og:url", canonicalUrl);
    setMetaContent(document, "name", "twitter:card", page.twitterCard);
    setMetaContent(document, "name", "twitter:title", page.title);
    setMetaContent(document, "name", "twitter:description", page.description);
    appendStructuredData(document, page, canonicalUrl);
    setRootContent(document, content);

    return serialize(document);
}

function createNotFoundShell(template, content) {
    const document = parse(template);
    const title = requireElement(document, (element) => defaultTreeAdapter.getTagName(element) === "title", "<title>");

    setTextContent(title, "404 | BaaSForge");
    removeElement(findElementByAttribute(document, "link", "rel", "canonical"));
    removeElement(findElementByAttribute(document, "script", "id", "baasforge-homepage-schema"));

    const socialMeta = findElements(document, (element) => {
        if (defaultTreeAdapter.getTagName(element) !== "meta") return false;
        return getAttribute(element, "property")?.startsWith("og:") || getAttribute(element, "name")?.startsWith("twitter:");
    });
    socialMeta.forEach(removeElement);

    setMetaContent(document, "name", "description", "The requested page could not be found on BaaSForge.");
    setMetaContent(document, "name", "robots", "noindex, nofollow");
    setRootContent(document, content, { "data-prerendered-page": "not-found" });

    return serialize(document);
}

async function prerenderHome() {
    const { renderHomePage, renderLegalPage, renderNotFoundPage, renderPricingPage } = await import(serverEntryPath);
    const template = fs.readFileSync(templatePath, "utf-8");
    const homeDocument = parse(template);
    setRootContent(homeDocument, renderHomePage("/"));

    fs.writeFileSync(templatePath, serialize(homeDocument));
    for (const page of legalPages) {
        fs.writeFileSync(path.join(rootDir, `dist${page.path}.html`), createPublicPageShell(template, page, renderLegalPage(page.path)));
    }
    fs.writeFileSync(path.join(rootDir, "dist/pricing.html"), createPublicPageShell(template, pricingPage, renderPricingPage()));
    fs.writeFileSync(path.join(rootDir, "dist/404.html"), createNotFoundShell(template, renderNotFoundPage("/404")));
    console.log("Prerendered homepage, pricing, legal, and not-found HTML shells");
}

prerenderHome().catch((error) => {
    console.error(error);
    process.exit(1);
});

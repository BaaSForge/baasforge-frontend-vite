import { MarketingFooter, MarketingHeader } from "@/components/marketing-shell";
import { Button } from "@/components/ui/button";
import { useMagnet } from "@/hooks/use-magnet";
import {
    ANNUAL_BILLING_DISCOUNT_PERCENT,
    packageAmountForBillingPeriod,
    packageCreditForBillingPeriod,
    usePackagesQuery,
    type BillingPeriod,
    type Package,
} from "@/modules/payment";
import { BrainCircuit, ChevronDown, Cloud, Cpu, Database, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import "./pricing.css";

const TITLE = "Pricing | BaaSForge";
const DESCRIPTION = "Start free with BaaSForge, then choose a monthly or annual credit plan for compute, storage, and AI usage.";

const METERS = [
    { icon: Cpu, title: "Compute", copy: "Memory multiplied by how long your units run, metered from 1 ms." },
    { icon: Cloud, title: "Hot storage", copy: "Memory kept warm for low-latency access." },
    { icon: Database, title: "Disk storage", copy: "Block storage retained when data is not in memory." },
    { icon: BrainCircuit, title: "AI tokens", copy: "Model input and output at the provider rate plus platform margin." },
] as const;

const RATES = [
    { amount: "$0.10", title: "1 million API calls", detail: "128 MB at 100 ms per request" },
    { amount: "$3.89", title: "1 GB hot storage", detail: "Retained in memory for a 30-day month" },
    { amount: "$0.65", title: "10 GB disk storage", detail: "Retained for a 30-day month" },
] as const;

const FAQS = [
    [
        "So the plan price is not an extra charge?",
        "Correct. Your plan payment becomes usable balance credit at the list price. Package and annual discounts lower what you are charged; the difference is promotional credit for usage. Higher tiers also spend that credit at a lower rate.",
    ],
    [
        "Does unused credit roll over?",
        "Yes. Unused balance credit stays until you spend it. Usage-rate discounts apply only while your plan period is active.",
    ],
    [
        "What happens if I use more than my credit?",
        "When your balance runs out, billing freezes and workloads pause until you add credit (top-up, renew, or upgrade). Free plans also renew with $5 each month while you stay on Free.",
    ],
    [
        "Do I pay for projects that are not running?",
        "No. Compute is metered per millisecond of execution. A deployed project receiving no traffic draws no compute credit.",
    ],
    [
        "How does annual billing work?",
        `Annual billing saves ${ANNUAL_BILLING_DISCOUNT_PERCENT}% on the plan fee. You are billed once for the year, and twelve months of list-price credit is added to your balance.`,
    ],
    [
        "What is the difference between a project and a stage runtime?",
        "A project is one backend. A stage runtime is an additional deployment environment, such as staging alongside production. Production counts as one runtime per project on every plan.",
    ],
    [
        "Can I change plans?",
        "You can upgrade to a higher tier at any time. Remaining credit stays, and usage rates follow the new tier from that point forward.",
    ],
] as const;

function formatPackagePrice(amount: number) {
    return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

function PricingMagneticLink({ children, className, to }: { children: string; className: string; to: string }) {
    const ref = useRef<HTMLAnchorElement | null>(null);
    useMagnet(ref);
    return (
        <a ref={ref} className={className} href={to}>
            {children}
        </a>
    );
}

function PricingSeo() {
    useEffect(() => {
        const previousTitle = document.title;
        const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
        const previousCanonical = canonical?.href;
        const homepageSchema = document.querySelector<HTMLScriptElement>("#baasforge-homepage-schema");
        const canonicalUrl = `${window.location.origin}/pricing`;
        const metadata = [
            ['meta[name="description"]', "name", "description", DESCRIPTION],
            ['meta[name="robots"]', "name", "robots", "index, follow, max-image-preview:large"],
            ['meta[property="og:type"]', "property", "og:type", "website"],
            ['meta[property="og:title"]', "property", "og:title", TITLE],
            ['meta[property="og:description"]', "property", "og:description", DESCRIPTION],
            ['meta[property="og:url"]', "property", "og:url", canonicalUrl],
            ['meta[name="twitter:title"]', "name", "twitter:title", TITLE],
            ['meta[name="twitter:description"]', "name", "twitter:description", DESCRIPTION],
        ] as const;
        const managed = metadata.map(([selector, attribute, name, content]) => {
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
        const schema = document.createElement("script");
        schema.id = "baasforge-pricing-schema";
        schema.type = "application/ld+json";
        schema.text = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: "BaaSForge",
            description: DESCRIPTION,
            url: canonicalUrl,
            brand: { "@type": "Brand", name: "BaaSForge" },
        });
        document.head.append(schema);
        homepageSchema?.remove();
        document.title = TITLE;
        return () => {
            document.title = previousTitle;
            managed.forEach(({ element, existing, previousContent }) =>
                existing && previousContent != null ? (element.content = previousContent) : element.remove(),
            );
            if (canonical && previousCanonical) nextCanonical.href = previousCanonical;
            else nextCanonical.remove();
            schema.remove();
            if (homepageSchema) document.head.append(homepageSchema);
        };
    }, []);
    return null;
}

function usePricingReveal() {
    useEffect(() => {
        if (typeof IntersectionObserver === "undefined") return;
        const items = [...document.querySelectorAll<HTMLElement>("[data-pricing-reveal]")];
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    (entry.target as HTMLElement).dataset.visible = "true";
                    observer.unobserve(entry.target);
                });
            },
            { threshold: 0.12, rootMargin: "0px 0px -48px" },
        );
        items.forEach((item) => observer.observe(item));
        return () => observer.disconnect();
    }, []);
}

function PlanCard({ billingPeriod, pkg }: { billingPeriod: BillingPeriod; pkg: Package }) {
    const periodAmount = packageAmountForBillingPeriod(pkg, billingPeriod);
    const creditAmount = packageCreditForBillingPeriod(pkg, billingPeriod);
    const monthlyAmount = billingPeriod === "annual" ? periodAmount / 12 : periodAmount;
    const isFree = periodAmount <= 0;
    const isFeatured = pkg.slug.trim().toLowerCase() === "solo";
    const href = isFree ? "/dashboard/packages" : `/dashboard/purchase?kind=package&package_id=${encodeURIComponent(pkg.id)}&billing_period=${billingPeriod}`;

    return (
        <article className="bf-pricing-plan" data-featured={isFeatured || undefined}>
            <div className="bf-pricing-plan-top">
                <h2>{pkg.title}</h2>
                {isFeatured && <span className="bf-pricing-popular">Most popular</span>}
            </div>
            <div className="bf-pricing-price">
                <strong>{formatPackagePrice(monthlyAmount)}</strong>
                <span>/mo</span>
            </div>
            <p className="bf-pricing-credit">
                {isFree ? "$5 in credit" : `${formatPackagePrice(creditAmount)} in credit`}
                {!isFree && pkg.discount_percent != null && pkg.discount_percent > 0 && ` (${pkg.discount_percent}% off plan fee)`}
            </p>
            {pkg.description && (
                <div className="bf-pricing-description">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{pkg.description}</ReactMarkdown>
                </div>
            )}
            <Button
                className="bf-pricing-plan-cta rounded-full bg-primary font-semibold hover:bg-primary/90 active:bg-primary/80"
                style={{ color: "var(--primary-foreground)" }}
                asChild
            >
                <a href={href}>
                    {isFree ? "Start building" : `Get ${pkg.title}`}
                </a>
            </Button>
        </article>
    );
}

function Plans({ billingPeriod, setBillingPeriod }: { billingPeriod: BillingPeriod; setBillingPeriod: (value: BillingPeriod) => void }) {
    const { data: packages = [], error, isLoading, refetch, isFetching } = usePackagesQuery();
    const visiblePackages = useMemo(() => packages.filter((pkg) => !pkg.is_trial && pkg.is_active !== false).sort((a, b) => a.tier - b.tier), [packages]);

    return (
        <div className="bf-pricing-plans-wrap">
            <div className="bf-pricing-billing" role="group" aria-label="Billing period">
                <button type="button" data-active={billingPeriod === "monthly"} onClick={() => setBillingPeriod("monthly")}>
                    Monthly
                </button>
                <button type="button" data-active={billingPeriod === "annual"} onClick={() => setBillingPeriod("annual")}>
                    Annual <span>Save {ANNUAL_BILLING_DISCOUNT_PERCENT}%</span>
                </button>
            </div>
            <p className="bf-pricing-tier-note" data-pricing-reveal>
                Higher tiers spend credit at a lower rate, so the same dollar goes further.
            </p>
            {isLoading ? (
                <div className="bf-pricing-plan-grid" aria-label="Loading plans">
                    {Array.from({ length: 4 }, (_, index) => (
                        <div className="bf-pricing-plan bf-pricing-skeleton" key={index} />
                    ))}
                </div>
            ) : error ? (
                <div className="bf-pricing-error" role="alert">
                    <p>Plans did not load. Your backend deserves a retry.</p>
                    <Button variant="outline" className="rounded-full" disabled={isFetching} onClick={() => refetch()}>
                        <RefreshCw aria-hidden="true" />
                        Try again
                    </Button>
                </div>
            ) : (
                <div className="bf-pricing-plan-grid">
                    {visiblePackages.map((pkg) => (
                        <PlanCard key={pkg.id} pkg={pkg} billingPeriod={billingPeriod} />
                    ))}
                </div>
            )}
        </div>
    );
}

function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    return (
        <div className="bf-pricing-faq" data-pricing-reveal>
            {FAQS.map(([question, answer], index) => {
                const open = openIndex === index;
                return (
                    <div className="bf-pricing-faq-item" key={question} data-open={open}>
                        <button type="button" aria-expanded={open} aria-controls={`pricing-faq-${index}`} onClick={() => setOpenIndex(open ? null : index)}>
                            <span>{question}</span>
                            <ChevronDown aria-hidden="true" />
                        </button>
                        <div id={`pricing-faq-${index}`} role="region" aria-hidden={!open}>
                            <div>
                                <p>{answer}</p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default function PricingPage() {
    const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly");
    usePricingReveal();
    return (
        <div className="bf-pricing-page">
            <PricingSeo />
            <MarketingHeader />
            <main>
                <section className="bf-pricing-hero">
                    <div className="bf-pricing-container">
                        <div className="bf-pricing-hero-copy">
                            <h1>Every dollar becomes credit.</h1>
                            <p>Your plan is a monthly credit balance, not a platform fee.</p>
                        </div>
                        <Plans billingPeriod={billingPeriod} setBillingPeriod={setBillingPeriod} />
                        <p className="bf-pricing-meters-intro" data-pricing-reveal>
                            Pricing is calculated from four meters.
                        </p>
                        <div className="bf-pricing-meters" aria-label="What your credit covers">
                            {METERS.map(({ icon: Icon, title, copy }, index) => (
                                <article key={title} data-pricing-reveal style={{ "--delay": `${index * 55}ms` } as React.CSSProperties}>
                                    <Icon aria-hidden="true" />
                                    <div>
                                        <h2>{title}</h2>
                                        <p>{copy}</p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="bf-pricing-section bf-pricing-section-alt">
                    <div className="bf-pricing-container">
                        <div className="bf-pricing-section-heading" data-pricing-reveal>
                            <span className="bf-pricing-kicker">THE MATH</span>
                            <h2>
                                Metered precisely. <span>Priced plainly.</span>
                            </h2>
                        </div>
                        <div className="bf-pricing-rates">
                            {RATES.map((rate, index) => (
                                <article key={rate.title} data-pricing-reveal style={{ "--delay": `${index * 65}ms` } as React.CSSProperties}>
                                    <strong>{rate.amount}</strong>
                                    <h3>{rate.title}</h3>
                                    <p>{rate.detail}</p>
                                </article>
                            ))}
                        </div>
                        <p className="bf-pricing-rate-note" data-pricing-reveal>
                            Team spends 15% below these. Scale spends 30% below.
                        </p>
                    </div>
                </section>

                <section className="bf-pricing-section">
                    <div className="bf-pricing-container">
                        <div className="bf-pricing-section-heading" data-pricing-reveal>
                            <span className="bf-pricing-kicker">FAQ</span>
                            <h2>
                                Questions people <span>actually ask.</span>
                            </h2>
                        </div>
                        <FAQ />
                    </div>
                </section>

                <section className="bf-pricing-close">
                    <div className="bf-pricing-glow" aria-hidden="true" />
                    <div className="bf-container" data-pricing-reveal>
                        <h2>Your first Backend is on us.</h2>
                        <div>
                            <PricingMagneticLink className="bf-pricing-pill secondary" to="/docs">
                                Go to docs
                            </PricingMagneticLink>
                            <PricingMagneticLink className="bf-pricing-pill primary" to="/dashboard/packages">
                                Start building
                            </PricingMagneticLink>
                        </div>
                        <p>Start free with $5 in credit. No card required.</p>
                    </div>
                </section>
            </main>
            <MarketingFooter />
        </div>
    );
}

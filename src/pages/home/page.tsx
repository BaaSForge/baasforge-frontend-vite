import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MarketingLogoSquare } from "@/components/logo/marketing-logo-square";
import stepOneMark from "@/assets/home/steps/step-01-mark.svg";
import stepOneMessage from "@/assets/home/steps/step-01-message.svg";
import stepTwoInputSides from "@/assets/home/steps/step-02-input-sides.svg";
import stepTwoInputTop from "@/assets/home/steps/step-02-input-top.svg";
import stepTwoOutput from "@/assets/home/steps/step-02-output.svg";
import { StepThreeArtwork } from "./step-three-artwork";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMagnet } from "@/hooks/use-magnet";
import { openCookieSettings } from "@/services/cookie-consent";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { type RefObject, type TransitionEvent, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Link } from "react-router";

type UnitKind = "api" | "workflow" | "queue" | "actor" | "sql" | "graph" | "record" | "object" | "vector" | "common";
type StepPhase = { sel: string; prop: "strokeDashoffset" | "opacity"; from: number; to: number; t0: number; t1: number };
type RuntimeStepPhase = StepPhase & { el: SVGElement; startVal?: number };

const LOGIN_PATH = "/login";
const HOME_TITLE = "BaaSForge | AI Backend Platform";
const HOME_DESCRIPTION = "BaaSForge is an AI backend platform that turns plain-language requirements into production-ready APIs, workflows, workers, and data units.";
const PHRASES = ["Mock APIs", "Payment workflows", "Approval flows", "Subscription logic", "Background jobs", "Stateful entities", "AI agent orchestration", "Tenant onboarding", "Multi-step sagas"];
const SECTION_LINKS = [
    { href: "#what", id: "what", label: "The Pitch" },
    { href: "#how", id: "how", label: "Build Flow" },
    { href: "#build", id: "build", label: "Backend Units" },
    { href: "#usecases", id: "usecases", label: "What Builders Ship" },
    { href: "#category", id: "category", label: "BaaSForge Edge" },
    { href: "#debug", id: "debug", label: "No-Pager Mode" },
] as const;
type SectionId = (typeof SECTION_LINKS)[number]["id"];
const OBSERVED_SECTION_IDS = SECTION_LINKS.map((link) => link.id);
const STEPS = [
    ["01 / DESCRIBE", "Tell AI what you need.", "In plain language. No schema design, no boilerplate, no config files."],
    ["02 / BUILD", "AI writes the code.", "Every change passes compile, lint, and rule checks before it saves. You review."],
    ["03 / SHIP", "One click to stage, then production.", "Live in seconds. Full history. Roll back anytime."],
] as const;
const STEP_ANIMS: { duration: number; phases: StepPhase[] }[] = [
    {
        duration: 2800,
        phases: [
            { sel: '[data-a="l1"]', prop: "strokeDashoffset", from: 36, to: 0, t0: 0, t1: 0.38 },
            { sel: '[data-a="l2"]', prop: "strokeDashoffset", from: 56, to: 0, t0: 0.33, t1: 0.62 },
            { sel: '[data-a="arr"]', prop: "opacity", from: 0.08, to: 1, t0: 0.58, t1: 0.74 },
            { sel: '[data-a="cube"]', prop: "opacity", from: 0.08, to: 1, t0: 0.7, t1: 0.92 },
        ],
    },
    {
        duration: 2800,
        phases: [
            { sel: '[data-a="p2"]', prop: "opacity", from: 0.08, to: 1, t0: 0, t1: 0.3 },
            { sel: '[data-a="p3"]', prop: "opacity", from: 0.08, to: 1, t0: 0.28, t1: 0.56 },
            { sel: '[data-a="chk"]', prop: "opacity", from: 0.08, to: 1, t0: 0.54, t1: 0.76 },
            { sel: '[data-a="chk-line"]', prop: "strokeDashoffset", from: 30, to: 0, t0: 0.65, t1: 0.92 },
        ],
    },
    {
        duration: 2800,
        phases: [
            { sel: '[data-a="dashes"]', prop: "opacity", from: 0.08, to: 1, t0: 0, t1: 0.34 },
            { sel: '[data-a="tcube"]', prop: "opacity", from: 0.08, to: 1, t0: 0.32, t1: 0.72 },
        ],
    },
];
const COMPUTE_UNITS = [
    { title: "API", desc: "Public HTTP endpoints, documented automatically on deploy.", icon: "api" },
    { title: "Workflow", desc: "Multi-step processes that pause and resume across days.", icon: "workflow" },
    { title: "Queue worker", desc: "Background batch jobs pulled from a queue and executed in order.", icon: "queue" },
    { title: "Common", desc: "Shared code and logic reused across units to avoid duplication.", icon: "common" },
] satisfies Unit[];
const STORAGE_UNITS = [
    { title: "Actor", desc: "Stateful unit scoped to a single entity, safe under load. Inspired by Orleans.", icon: "actor" },
    { title: "Graph", desc: "Graph database for connected data, queried without Cypher.", icon: "graph", status: "SOON" },
    { title: "Record / aggregate", desc: "Typed record or aggregate, modeled as a structured object.", icon: "record", status: "SOON" },
    { title: "SQL", desc: "Relational database, provisioned and scaled by the platform.", icon: "sql", status: "SOON" },
    { title: "Object storage", desc: "Files and blobs, stored and referenced by a unique key.", icon: "object", status: "SOON" },
    { title: "Vector Database", desc: "Vector database for embeddings, searched by similarity.", icon: "vector", status: "SOON" },
] satisfies Unit[];
const MOATS = [
    ["It's Fast.", "A production API, live in about two minutes."],
    ["It's Scalable.", "Thousands of units, no drop in speed or quality."],
    ["It's Cheap.", "The output other AIs need many more tokens for."],
    ["It's Badass.", "From a simple endpoint to your hardest backend."],
] as const;
const DEBUG_TEXT =
    "The charge.worker retried three times, then moved the job to the dead-letter queue. The payment provider returned a timeout, not a decline, so the order is safe to retry. The workflow already rolled back the inventory reservation.";
const DASH_STEPS = ["Exploring (1 tool call)", "Reading relevant units", "Reading unit contexts", "Finished architecture analysis"];
const DASH_UNITS = [
    ["coach.profile.actor.coach.1", "Actor to manage coach profiles, including name and a list of associated trainee IDs."],
    ["trainee.profile.actor.trainee.1", "Actor to manage trainee profiles, including name and their assigned coach ID."],
    ["training.plan.actor.plan.1", "Actor to manage training plans, including trainee/coach IDs and a list of exercises."],
] as const;

type Unit = { title: string; desc: string; icon: UnitKind; status?: string };

function useMedia(query: string) {
    return useSyncExternalStore(
        (onStoreChange) => {
            const media = matchMedia(query);
            media.addEventListener("change", onStoreChange);
            return () => media.removeEventListener("change", onStoreChange);
        },
        () => matchMedia(query).matches,
        () => false,
    );
}

function HomePageSeo() {
    useEffect(() => {
        const previousTitle = document.title;
        const canonicalUrl = `${window.location.origin}${window.location.pathname}`;
        document.title = HOME_TITLE;

        const upsertMeta = (selector: string, attribute: "name" | "property", value: string, content: string) => {
            const meta = document.head.querySelector<HTMLMetaElement>(selector) ?? document.head.appendChild(document.createElement("meta"));
            meta.setAttribute(attribute, value);
            meta.content = content;
            return meta;
        };
        const description = upsertMeta('meta[name="description"]', "name", "description", HOME_DESCRIPTION);
        const openGraphUrl = upsertMeta('meta[property="og:url"]', "property", "og:url", canonicalUrl);
        const twitterCard = upsertMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
        const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]') ?? document.head.appendChild(document.createElement("link"));
        canonical.rel = "canonical";
        canonical.href = canonicalUrl;

        const existingSchema = document.querySelector<HTMLScriptElement>("#baasforge-homepage-schema");
        const schema = existingSchema ?? document.createElement("script");
        const previousSchemaText = schema.text;
        if (!existingSchema) {
            schema.id = "baasforge-homepage-schema";
            schema.type = "application/ld+json";
            document.head.appendChild(schema);
        }
        schema.text = JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "Organization",
                    name: "BaaSForge",
                    url: window.location.origin,
                    logo: `${window.location.origin}/logo-256x256.png`,
                    description: HOME_DESCRIPTION,
                },
                {
                    "@type": "WebSite",
                    name: "BaaSForge",
                    url: window.location.origin,
                    description: HOME_DESCRIPTION,
                },
            ],
        });
        return () => {
            document.title = previousTitle;
            if (existingSchema) schema.text = previousSchemaText;
            else schema.remove();
            canonical.remove();
            openGraphUrl.remove();
            description.content = HOME_DESCRIPTION;
            twitterCard.content = "summary_large_image";
        };
    }, []);
    return null;
}

function useActiveSection() {
    const [active, setActive] = useState<SectionId>("what");
    useEffect(() => {
        const updateActive = () => {
            const readLine = Math.min(window.innerHeight * 0.38, 360);
            const sections = OBSERVED_SECTION_IDS.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
            const current = sections
                .map((section) => {
                    const rect = section.getBoundingClientRect();
                    const containsReadLine = rect.top <= readLine && rect.bottom >= readLine;
                    const distance = containsReadLine ? 0 : Math.min(Math.abs(rect.top - readLine), Math.abs(rect.bottom - readLine));
                    return { id: section.id, distance };
                })
                .sort((a, b) => a.distance - b.distance)[0]?.id;
            setActive((current as SectionId | undefined) ?? "what");
        };
        updateActive();
        window.addEventListener("scroll", updateActive, { passive: true });
        window.addEventListener("resize", updateActive);
        return () => {
            window.removeEventListener("scroll", updateActive);
            window.removeEventListener("resize", updateActive);
        };
    }, []);
    return active;
}

function useReveal(ids: string[]) {
    const [visible, setVisible] = useState<Record<string, boolean>>(() => Object.fromEntries(ids.map((id) => [id, true])));
    const key = ids.join(",");
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) =>
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    setVisible((prev) => ({ ...prev, [entry.target.id]: true }));
                    observer.unobserve(entry.target);
                }),
            { threshold: 0.16 },
        );
        key.split(",").forEach((id) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
    }, [key]);
    return visible;
}

function setSvgValue(el: SVGElement, prop: StepPhase["prop"], value: number) {
    if (prop === "strokeDashoffset") el.style.strokeDashoffset = `${value}`;
    else el.style.opacity = `${value}`;
}

function clearSvgValue(el: SVGElement, prop: StepPhase["prop"]) {
    if (prop === "strokeDashoffset") el.style.strokeDashoffset = "";
    else el.style.opacity = "";
}

function readSvgValue(phase: RuntimeStepPhase) {
    const inline = phase.prop === "strokeDashoffset" ? phase.el.style.strokeDashoffset : phase.el.style.opacity;
    let value = parseFloat(inline);
    if (!Number.isNaN(value)) return value;
    value = parseFloat(phase.el.getAttribute(phase.prop === "strokeDashoffset" ? "stroke-dashoffset" : "opacity") ?? `${phase.to}`);
    return Number.isNaN(value) ? phase.to : value;
}

function useStepHoverAnimations(ref: RefObject<HTMLElement | null>, enabled = true) {
    useEffect(() => {
        const container = ref.current;
        if (!container || !enabled) return;
        const reducedMotionQuery = matchMedia("(prefers-reduced-motion: reduce)");
        const hoverQuery = matchMedia("(hover: hover) and (pointer: fine)");
        const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
        const activeAnims: ({ cancel: () => void } | null)[] = [null, null, null];
        const runStepAnim = (div: Element, def: { duration: number; phases: StepPhase[] }, onComplete: () => void) => {
            const preFade = 280;
            const phases = def.phases.map((phase) => ({ ...phase, el: div.querySelector<SVGElement>(phase.sel) })).filter((phase): phase is RuntimeStepPhase => !!phase.el);
            const prePhases = phases.map((phase) => ({ ...phase, startVal: readSvgValue(phase) }));
            let raf = 0;
            const preStart = performance.now();
            const preTick = (now: number) => {
                const t = Math.min((now - preStart) / preFade, 1);
                const eased = easeInOut(t);
                prePhases.forEach((phase) => setSvgValue(phase.el, phase.prop, (phase.startVal ?? phase.to) + (phase.from - (phase.startVal ?? phase.to)) * eased));
                if (t < 1) {
                    raf = requestAnimationFrame(preTick);
                    return;
                }
                const mainStart = performance.now();
                const mainTick = (mainNow: number) => {
                    const tMain = Math.min((mainNow - mainStart) / def.duration, 1);
                    phases.forEach((phase) => {
                        const local = Math.max(0, Math.min(1, (tMain - phase.t0) / Math.max(phase.t1 - phase.t0, 0.001)));
                        setSvgValue(phase.el, phase.prop, phase.from + (phase.to - phase.from) * easeInOut(local));
                    });
                    if (tMain < 1) {
                        raf = requestAnimationFrame(mainTick);
                    } else {
                        phases.forEach((phase) => clearSvgValue(phase.el, phase.prop));
                        onComplete();
                    }
                };
                raf = requestAnimationFrame(mainTick);
            };
            raf = requestAnimationFrame(preTick);
            return { cancel: () => {
                cancelAnimationFrame(raf);
                phases.forEach((phase) => clearSvgValue(phase.el, phase.prop));
            } };
        };

        const stepDivs = [...container.querySelectorAll("[data-step-anim]")];
        const cleanups = stepDivs.flatMap((div, index) => {
            if (index === 1) {
                const stepTwoOutput = div.querySelector<HTMLElement>(".bf-step-two-output");
                if (!stepTwoOutput) return [];
                let running = false;
                const finish = (event: AnimationEvent) => {
                    if (event.animationName !== "stepTwoOutput") return;
                    running = false;
                    div.removeAttribute("data-step-two-active");
                };
                const enter = () => {
                    if (reducedMotionQuery.matches || !hoverQuery.matches || running) return;
                    running = true;
                    div.setAttribute("data-step-two-active", "");
                };
                stepTwoOutput.addEventListener("animationend", finish);
                stepTwoOutput.addEventListener("animationcancel", finish);
                div.addEventListener("mouseenter", enter);
                return [() => {
                    div.removeEventListener("mouseenter", enter);
                    stepTwoOutput.removeEventListener("animationend", finish);
                    stepTwoOutput.removeEventListener("animationcancel", finish);
                    div.removeAttribute("data-step-two-active");
                }];
            }
            if (index === 2) {
                const stepThreeCore = div.querySelector<SVGElement>(".bf-step-three-core");
                if (!stepThreeCore) return [];
                let running = false;
                const finish = (event: AnimationEvent) => {
                    if (event.animationName !== "stepThreeCore") return;
                    running = false;
                    div.removeAttribute("data-step-three-active");
                };
                const enter = () => {
                    if (reducedMotionQuery.matches || !hoverQuery.matches || running) return;
                    running = true;
                    div.setAttribute("data-step-three-active", "");
                };
                stepThreeCore.addEventListener("animationend", finish);
                stepThreeCore.addEventListener("animationcancel", finish);
                div.addEventListener("mouseenter", enter);
                return [() => {
                    div.removeEventListener("mouseenter", enter);
                    stepThreeCore.removeEventListener("animationend", finish);
                    stepThreeCore.removeEventListener("animationcancel", finish);
                    div.removeAttribute("data-step-three-active");
                }];
            }
            const def = STEP_ANIMS[index];
            if (!def) return [];
            const stepOneMark = div.querySelector<HTMLElement>(".bf-step-one-mark");
            if (index === 0 && stepOneMark) {
                let running = false;
                const finish = () => {
                    running = false;
                    div.removeAttribute("data-step-one-active");
                };
                const enter = () => {
                    if (reducedMotionQuery.matches || !hoverQuery.matches || running) return;
                    running = true;
                    div.setAttribute("data-step-one-active", "");
                };
                stepOneMark.addEventListener("animationend", finish);
                stepOneMark.addEventListener("animationcancel", finish);
                div.addEventListener("mouseenter", enter);
                return [() => {
                    div.removeEventListener("mouseenter", enter);
                    stepOneMark.removeEventListener("animationend", finish);
                    stepOneMark.removeEventListener("animationcancel", finish);
                    div.removeAttribute("data-step-one-active");
                }];
            }
            const enter = () => {
                if (reducedMotionQuery.matches || !hoverQuery.matches || activeAnims[index]) return;
                activeAnims[index] = runStepAnim(div, def, () => {
                    activeAnims[index] = null;
                });
            };
            div.addEventListener("mouseenter", enter);
            return [() => div.removeEventListener("mouseenter", enter)];
        });
        const reduceMotion = (event: MediaQueryListEvent) => {
            if (!event.matches) return;
            stepDivs.forEach((div) => {
                div.removeAttribute("data-step-one-active");
                div.removeAttribute("data-step-two-active");
                div.removeAttribute("data-step-three-active");
            });
            activeAnims.forEach((anim, index) => {
                anim?.cancel();
                activeAnims[index] = null;
            });
        };
        reducedMotionQuery.addEventListener("change", reduceMotion);
        return () => {
            cleanups.forEach((cleanup) => cleanup());
            activeAnims.forEach((anim) => anim?.cancel());
            reducedMotionQuery.removeEventListener("change", reduceMotion);
        };
    }, [ref, enabled]);
}

function useWhatTitleFits(ref: RefObject<HTMLElement | null>) {
    const [fits, setFits] = useState(true);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const measure = () => {
            const styles = getComputedStyle(el);
            ctx.font = `${styles.fontWeight} ${styles.fontSize} ${styles.fontFamily}`;
            const lineWidth = ctx.measureText("AI turns your description into").width;
            setFits(lineWidth <= el.clientWidth);
        };
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(el);
        return () => observer.disconnect();
    }, [ref]);
    return fits;
}

function Styles() {
    return (
        <style>{`
            html { scroll-behavior: smooth; scrollbar-gutter: stable; }
            .bf-page{--font-sans:"Geist",ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;--font-heading:var(--font-sans);--font-mono:"Geist Mono",ui-monospace,SFMono-Regular,"SF Mono",Menlo,Consolas,"Liberation Mono",monospace;--radius:0.625rem;--radius-sm:calc(var(--radius)*.6);--radius-md:calc(var(--radius)*.8);--radius-lg:var(--radius);--radius-xl:calc(var(--radius)*1.4);--radius-full:9999px;--motion-response:cubic-bezier(.22,1,.36,1);--motion-press:cubic-bezier(.2,.8,.2,1);--background:oklch(1 0 0);--foreground:oklch(0% 0 0);--card:oklch(1 0 0);--card-foreground:oklch(0% 0 0);--popover:oklch(1 0 0);--popover-foreground:oklch(0% 0 0);--primary:oklch(0% 0 0);--primary-foreground:oklch(.985 0 0);--secondary:oklch(.97 0 0);--secondary-foreground:oklch(.205 0 0);--muted:oklch(.97 0 0);--muted-foreground:oklch(.556 0 0);--accent:oklch(.97 0 0);--accent-foreground:oklch(.205 0 0);--destructive:oklch(.577 .245 27.325);--destructive-foreground:oklch(.97 .01 17);--border:oklch(.922 0 0);--input:oklch(.922 0 0);--ring:oklch(.708 0 0);--surface:oklch(.98 0 0);--surface-foreground:var(--foreground);--code:var(--surface);--code-foreground:var(--surface-foreground);--code-highlight:oklch(.96 0 0);--code-number:oklch(.56 0 0);--selection:oklch(0% 0 0);--selection-foreground:oklch(1 0 0);--shadow-xs:0 1px 2px 0 rgb(0 0 0 / .05);--shadow-sm:0 1px 3px 0 rgb(0 0 0 / .1),0 1px 2px -1px rgb(0 0 0 / .1);--shadow-md:0 4px 6px -1px rgb(0 0 0 / .1),0 2px 4px -2px rgb(0 0 0 / .1);--shadow-lg:0 10px 15px -3px rgb(0 0 0 / .1),0 4px 6px -4px rgb(0 0 0 / .1);--alt-bg:oklch(.97 0 0);--glow-rgb:0,0,0;--accent-glow:oklch(0.65 0.02 260);font-family:var(--font-sans);font-optical-sizing:auto;line-height:1.5;background:var(--background);color:var(--foreground);min-height:100vh;overflow-x:hidden;transition:background .4s ease,color .4s ease}
            .bf-page.dark{--background:oklch(.145 0 0);--foreground:oklch(.985 0 0);--card:oklch(.205 0 0);--card-foreground:oklch(.985 0 0);--popover:oklch(.205 0 0);--popover-foreground:oklch(.985 0 0);--primary:oklch(.922 0 0);--primary-foreground:oklch(.205 0 0);--secondary:oklch(.269 0 0);--secondary-foreground:oklch(.985 0 0);--muted:oklch(.269 0 0);--muted-foreground:oklch(.708 0 0);--accent:oklch(.371 0 0);--accent-foreground:oklch(.985 0 0);--destructive:oklch(.704 .191 22.216);--destructive-foreground:oklch(.58 .22 27);--border:oklch(1 0 0 / 10%);--input:oklch(1 0 0 / 15%);--ring:oklch(.556 0 0);--surface:oklch(.2 0 0);--surface-foreground:oklch(.708 0 0);--code:var(--surface);--code-foreground:var(--surface-foreground);--code-highlight:oklch(.27 0 0);--code-number:oklch(.72 0 0);--selection:oklch(.922 0 0);--selection-foreground:oklch(.205 0 0);--alt-bg:oklch(.08 0 0);--glow-rgb:255,255,255;--accent-glow:oklch(0.9 0.01 260)}
            .bf-page.midnight{--background:oklch(0.17 0.032 264);--foreground:oklch(0.96 0.012 260);--card:oklch(0.21 0.034 264);--card-foreground:oklch(0.96 0.012 260);--popover:oklch(0.21 0.034 264);--popover-foreground:oklch(0.96 0.012 260);--primary:oklch(0.74 0.15 260);--primary-foreground:oklch(0.15 0.03 264);--secondary:oklch(0.27 0.038 264);--secondary-foreground:oklch(0.96 0.012 260);--muted:oklch(0.25 0.034 264);--muted-foreground:oklch(0.67 0.03 260);--accent:oklch(0.31 0.045 264);--accent-foreground:oklch(0.96 0.012 260);--border:oklch(1 0 0 / 12%);--input:oklch(1 0 0 / 16%);--ring:oklch(0.56 0.06 260);--alt-bg:oklch(.14 .03 264);--glow-rgb:145,175,255;--accent-glow:oklch(0.68 0.12 260);--selection:var(--primary);--selection-foreground:var(--primary-foreground)}
            .bf-page.dense{--alt-bg:oklch(.08 0 0);--glow-rgb:255,255,255;--accent-glow:oklch(0.9 0.01 260)}.bf-page{--font-sans:"Plus Jakarta Sans",sans-serif;--font-heading:var(--font-sans)}
            .bf-page ::selection{background:var(--selection);color:var(--selection-foreground)}.bf-page a{color:inherit;text-decoration:none}.bf-page :where([data-slot="button"],.bf-pill,.bf-menu-toggle,.bf-nav-link,.bf-tabs-trigger,.bf-draft-toggle){-webkit-tap-highlight-color:transparent;touch-action:manipulation;scale:1}.bf-page [data-slot="button"]{transition-property:color,background-color,border-color,box-shadow,opacity,transform,scale;transition-duration:.15s;transition-timing-function:var(--motion-response)}.bf-page :where(.bf-pill,.bf-menu-toggle,.bf-nav-link,.bf-tabs-trigger,.bf-draft-toggle){transition-property:color,background-color,border-color,box-shadow,opacity,transform,scale;transition-duration:.18s;transition-timing-function:var(--motion-response)}.bf-page :where([data-slot="button"],.bf-pill,.bf-menu-toggle,.bf-nav-link,.bf-tabs-trigger,.bf-draft-toggle):not(:disabled):active{scale:.97;transition-duration:.1s;transition-timing-function:var(--motion-press)}.bf-container{max-width:1080px;margin:0 auto;padding:0 28px}
            .bf-logo{display:flex;align-items:center;gap:10px;font-size:16px;font-weight:600;letter-spacing:-.02em;color:var(--foreground)}
            .bf-nav{position:fixed;inset:0 0 auto;z-index:100;background:oklch(0.17 0.03 263 / .7);backdrop-filter:blur(14px) saturate(140%);-webkit-backdrop-filter:blur(14px) saturate(140%)}.bf-menu-toggle{position:relative}.bf-menu-icon{position:absolute;transition:opacity .2s var(--motion-response),transform .3s var(--motion-response)}.bf-menu-icon.menu{opacity:1;transform:rotate(0deg) scale(1)}.bf-menu-icon.close{opacity:0;transform:rotate(-45deg) scale(.72)}.bf-menu-toggle[data-open="true"] .bf-menu-icon.menu{opacity:0;transform:rotate(45deg) scale(.72)}.bf-menu-toggle[data-open="true"] .bf-menu-icon.close{opacity:1;transform:rotate(0deg) scale(1)}.bf-mobile-menu-backdrop{position:fixed;inset:0;z-index:90;background:rgba(0,0,0,.45);opacity:0;visibility:hidden;pointer-events:none;transition:opacity .28s var(--motion-response),visibility 0s linear .28s}.bf-mobile-menu-backdrop[data-open="true"]{opacity:1;visibility:visible;pointer-events:auto;transition-delay:0s}.bf-mobile-menu{position:fixed;top:0;right:0;bottom:0;z-index:95;display:flex;width:360px;max-width:100vw;height:100dvh;flex-direction:column;padding-top:68px;background:var(--background);border-left:1px solid var(--border);opacity:0;visibility:hidden;pointer-events:none;transform:translateX(100%);transition:opacity .28s var(--motion-response),transform .34s var(--motion-response),visibility 0s linear .34s;will-change:opacity,transform}.bf-mobile-menu[data-open="true"]{opacity:1;visibility:visible;pointer-events:auto;transform:none;transition-delay:0s}.bf-mobile-menu-nav{display:flex;width:100%;flex-direction:column;padding:40px 28px 0}.bf-mobile-menu-link{padding:10px 0;font-size:28px;font-weight:500;line-height:1.2}.bf-mobile-menu-actions{display:grid;width:100%;grid-template-columns:1fr 1fr;gap:12px;margin-top:auto;padding:32px 28px 28px}
            .bf-primary-nav{align-items:center;gap:20px}.bf-section-rail{position:fixed;top:50%;right:clamp(20px,2.4vw,36px);z-index:80;display:none;opacity:0;pointer-events:none;transform:translate(8px,-50%);transition:opacity .28s var(--motion-response),transform .34s var(--motion-response)}@media(min-width:1280px){.bf-section-rail{display:block}}.bf-section-rail[data-visible="true"]{opacity:1;pointer-events:auto;transform:translate(0,-50%)}.bf-section-rail-inner{display:flex;width:40px;flex-direction:column;align-items:stretch;gap:1px;padding:7px 6px;border:1px solid transparent;border-radius:var(--radius-xl);background:transparent;overflow:hidden;transform-origin:right center;transition:width .28s var(--motion-response),background .24s var(--motion-response),border-color .24s var(--motion-response),box-shadow .24s var(--motion-response),backdrop-filter .24s var(--motion-response)}.bf-section-rail:hover .bf-section-rail-inner,.bf-section-rail:focus-within .bf-section-rail-inner{width:190px;border-color:var(--border);background:color-mix(in oklch,var(--background) 68%,transparent);box-shadow:0 18px 48px -30px rgba(0,0,0,.8);backdrop-filter:blur(14px) saturate(140%);-webkit-backdrop-filter:blur(14px) saturate(140%)}.bf-section-rail-link{display:grid;width:100%;height:32px;grid-template-columns:minmax(0,1fr) 26px;align-items:center;border-radius:var(--radius-md);padding:0 3px 0 10px;color:var(--muted-foreground);transition:background .16s ease,color .16s ease}.bf-section-rail:hover .bf-section-rail-link:hover,.bf-section-rail-link:focus-visible{background:color-mix(in oklch,var(--foreground) 6%,transparent);color:var(--foreground)}.bf-section-rail-label{display:flex;min-width:0;align-items:center;gap:9px;overflow:hidden;font-size:12px;font-weight:500;line-height:1.2;opacity:0;white-space:nowrap;transform:translateX(7px);transition:opacity .16s ease .02s,transform .24s var(--motion-response)}.bf-section-rail-label span{flex:0 0 auto;color:var(--muted-foreground);font-family:var(--font-mono);font-size:9px}.bf-section-rail:hover .bf-section-rail-label,.bf-section-rail:focus-within .bf-section-rail-label{opacity:1;transform:none}.bf-section-rail-link[aria-current="location"]{color:var(--primary)}.bf-section-rail-marker{justify-self:end;display:block;width:4px;height:4px;margin-right:4px;border-radius:9999px;background:color-mix(in oklch,var(--muted-foreground) 68%,transparent);transition:width .32s var(--motion-response),height .32s var(--motion-response),background .2s ease,box-shadow .24s ease}.bf-section-rail-link[data-complete="true"] .bf-section-rail-marker{background:color-mix(in oklch,var(--primary) 50%,var(--muted-foreground))}.bf-section-rail-link:hover .bf-section-rail-marker,.bf-section-rail-link:focus-visible .bf-section-rail-marker{width:9px;background:var(--foreground)}.bf-section-rail-link[aria-current="location"] .bf-section-rail-marker{width:15px;height:3px;background:var(--primary);box-shadow:0 0 14px color-mix(in oklch,var(--primary) 52%,transparent)}.bf-section-rail-current{position:absolute;top:50%;right:calc(100% + 10px);display:flex;width:max-content;align-items:center;gap:8px;padding:6px 9px;border:1px solid var(--border);border-radius:var(--radius-md);background:var(--popover);color:var(--foreground);box-shadow:0 12px 34px -22px rgba(0,0,0,.9);font-size:11.5px;font-weight:500;line-height:1.2;opacity:0;pointer-events:none;transform:translate(5px,-50%) scale(.98);transform-origin:right center;transition:opacity .16s ease,transform .2s var(--motion-response)}.bf-section-rail-current span{color:var(--muted-foreground);font-family:var(--font-mono);font-size:9px}.bf-section-rail-current[data-visible="true"]{opacity:1;transform:translate(0,-50%)}.bf-section-rail:hover .bf-section-rail-current,.bf-section-rail:focus-within .bf-section-rail-current{opacity:0;transform:translate(5px,-50%) scale(.98)}.bf-mobile-section-group{margin-top:22px;padding-top:22px;border-top:1px solid var(--border)}.bf-mobile-section-title{display:block;margin-bottom:12px;color:var(--muted-foreground);font-family:var(--font-mono);font-size:10px;letter-spacing:.08em;text-transform:uppercase}.bf-mobile-section-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}.bf-mobile-section-link{display:flex;min-height:42px;align-items:center;gap:8px;border:1px solid transparent;border-radius:var(--radius-md);padding:8px 10px;color:var(--muted-foreground);font-size:13px;font-weight:500;line-height:1.25}.bf-mobile-section-link[aria-current="true"]{border-color:var(--border);background:var(--secondary);color:var(--foreground)}.bf-mobile-section-index{font-family:var(--font-mono);font-size:9px;opacity:.7}
            .bf-hero{position:relative;min-height:100svh;display:grid;grid-template-rows:2fr 1fr;align-items:stretch;text-align:center;overflow:hidden;padding:68px 24px 32px;background:var(--background)}
            .bf-hero-title-wrap{position:relative;display:grid;width:100%;place-items:center;perspective:800px}.bf-hero h1{position:relative;display:flex;align-items:baseline;justify-content:center;gap:clamp(10px,1.6vw,30px);max-width:1400px;margin:0 auto;color:var(--foreground);font-family:"Plus Jakarta Sans Hero","Plus Jakarta Sans",sans-serif;font-size:clamp(50px,12.8vw,210px);font-weight:700;letter-spacing:-.07em;line-height:.98;white-space:nowrap}
            .bf-char{display:inline-block}.bf-hero-support{position:relative;align-self:center;display:flex;flex-direction:column;align-items:center;gap:28px}.bf-copy{max-width:560px;margin:0;color:var(--foreground);font-size:22px;line-height:1.45;animation:blurFocus .6s cubic-bezier(.16,1,.3,1) .5s both}.bf-actions{display:flex;gap:14px;align-items:center;justify-content:center;flex-wrap:wrap;animation:blurFocus .6s cubic-bezier(.16,1,.3,1) .65s both}.bf-pill{display:inline-flex;justify-content:center;border-radius:9999px;padding:14px 30px;font-size:15px;font-weight:600}.bf-pill.secondary{background:var(--secondary);color:var(--secondary-foreground);border:1px solid var(--border)}.bf-pill.primary{background:var(--primary);color:var(--primary-foreground)}.bf-down{color:var(--muted-foreground);animation:blurFocus .6s cubic-bezier(.16,1,.3,1) .8s both,bob 2.2s ease-in-out 2.8s infinite}
            .bf-section{position:relative;padding:100px 0;border-top:1px solid var(--border)}.bf-section.alt{background:var(--alt-bg)}.bf-kicker{display:block;margin-bottom:22px;color:var(--muted-foreground);font-family:var(--font-mono);font-size:11.5px;letter-spacing:.08em}.bf-title{margin:0;color:var(--foreground);font-size:clamp(28px,4.4vw,46px);font-weight:600;letter-spacing:-.035em;line-height:1.05}.bf-title.wrap{line-height:1.05}.bf-muted{opacity:.55}.bf-reveal{opacity:0;transform:translateY(20px);transition:opacity .8s cubic-bezier(.16,1,.3,1),transform .8s cubic-bezier(.16,1,.3,1)}.bf-reveal.blur{filter:blur(10px);transition:opacity .8s cubic-bezier(.16,1,.3,1),transform .8s cubic-bezier(.16,1,.3,1),filter .8s cubic-bezier(.16,1,.3,1)}.bf-reveal.visible{opacity:1;transform:none}.bf-reveal.blur.visible{filter:blur(0)}
            .bf-chip-row{display:flex;gap:10px;flex-wrap:nowrap;overflow-x:auto;overflow-y:visible;margin-top:26px;margin-left:-14px;padding:10px 14px 14px}.bf-chip{display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;border-radius:9999px;border:1px solid var(--border);padding:6px 13px;color:var(--foreground);font-size:13.5px;font-weight:500;white-space:nowrap;transition:transform .45s cubic-bezier(.16,1,.3,1),border-color .45s ease,box-shadow .45s ease}@media(hover:hover){.bf-chip:hover{transform:translateY(-1px) scale(1.03);border-color:var(--accent-glow);box-shadow:0 10px 22px -18px rgba(var(--glow-rgb),.72),0 0 0 1px rgba(var(--glow-rgb),.16)}}
            .bf-dash{position:relative;margin-top:52px;overflow:hidden;border:1px solid var(--border);border-radius:var(--radius-xl);background:var(--card);box-shadow:var(--shadow-sm);transition:box-shadow .4s cubic-bezier(.16,1,.3,1)}.bf-dash.active{box-shadow:0 40px 120px -40px rgba(var(--glow-rgb),.22),0 0 0 1px rgba(var(--glow-rgb),.15)}.bf-dash-grid{display:grid;grid-template-columns:1fr 340px;height:500px}.bf-convo{display:flex;flex-direction:column;border-right:1px solid var(--border)}.bf-bar{display:flex;align-items:center;gap:8px;height:52px;padding:0 18px;border-bottom:1px solid var(--border)}.bf-window-dot{width:11px;height:11px;border-radius:50%;background:var(--secondary)}.bf-chat{position:relative;display:flex;flex:1;flex-direction:column;gap:14px;overflow-y:auto;padding:22px 22px 10px}.bf-empty{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;pointer-events:none;transition:opacity .5s cubic-bezier(.16,1,.3,1),transform .5s cubic-bezier(.16,1,.3,1)}.bf-msg{max-width:88%;padding:12px 15px;border-radius:12px;font-size:14px;line-height:1.55;animation:fadeUp .55s cubic-bezier(.16,1,.3,1) both}.bf-msg.user{align-self:flex-end;border:1px solid var(--border);border-bottom-right-radius:2px;background:var(--secondary);color:var(--secondary-foreground)}.bf-msg.ai{align-self:flex-start;border:1px solid var(--border);border-top-left-radius:2px;background:var(--secondary);color:var(--muted-foreground)}.bf-input{display:flex;align-items:center;gap:10px;padding:16px 18px;border-top:1px solid var(--border)}.bf-draft{display:flex;flex-direction:column;align-self:start}.bf-draft-card{border:1px solid var(--border);border-radius:var(--radius-lg);background:var(--card);padding:14px 15px;transition:opacity .24s cubic-bezier(.23,1,.32,1),transform .24s cubic-bezier(.23,1,.32,1)}.bf-unit-status{display:inline-grid;align-items:center;font-weight:600}.bf-unit-status-label{grid-area:1 / 1;display:inline-flex;align-items:center;gap:4px;transition:opacity 160ms cubic-bezier(.23,1,.32,1),transform 160ms cubic-bezier(.23,1,.32,1)}.bf-unit-status-pending{color:var(--muted-foreground);opacity:1;transform:none}.bf-unit-status-live{color:oklch(.78 .19 150);opacity:0;transform:translateY(2px) scale(.95)}.bf-unit-status[data-live="true"] .bf-unit-status-pending{opacity:0;transform:translateY(-2px) scale(.98)}.bf-unit-status[data-live="true"] .bf-unit-status-live{opacity:1;transform:none}.bf-draft-backdrop{position:absolute;inset:0;z-index:199;background:rgba(0,0,0,.45);opacity:0;pointer-events:none;transition:opacity .4s ease}.bf-pulse{display:inline-flex;border-radius:var(--radius-md);animation:ctaPulse 1.8s cubic-bezier(.4,0,.6,1) infinite}.bf-toast{position:absolute;top:16px;left:50%;z-index:6;display:flex;align-items:center;gap:10px;width:max-content;max-width:420px;padding:13px 18px 13px 14px;border:1px solid var(--border);border-radius:var(--radius-lg);background:var(--popover);color:var(--foreground);box-shadow:0 10px 34px rgba(0,0,0,.45),0 2px 8px rgba(0,0,0,.3);opacity:0;pointer-events:none;transform:translate(-50%,-10px);transition:opacity .3s cubic-bezier(.16,1,.3,1),transform .3s cubic-bezier(.16,1,.3,1)}.bf-toast.visible{opacity:1;transform:translate(-50%,0)}
            .bf-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:0;margin-top:48px;position:relative}.bf-step{position:relative;z-index:1;padding:0 30px;cursor:default}
            .bf-step-art{--step-glow-soft:drop-shadow(0 8px 14px rgba(223,142,89,.08));--step-glow-accent:drop-shadow(0 0 8px rgba(223,142,89,.28));position:relative;width:100%;height:220px;overflow:hidden;margin-bottom:26px;background:transparent;isolation:isolate}.bf-step-one-stage,.bf-step-two-stage,.bf-step-three-svg{position:absolute;top:50%;left:50%;width:min(100%,320px);aspect-ratio:1}.bf-step-one-stage{transform:translate(-50%,-50%) scale(1.3) translateY(6%)}.bf-step-two-stage{transform:translate(-50%,-50%) scale(1.225) translateY(4.8%)}.bf-step-three-svg{transform:translate(-50%,-50%)}.bf-step-one-platform{position:absolute;left:27.4%;top:37%;width:45%;height:28.2%;animation:stepOnePlatform 2s 1;animation-name:none}.bf-step-one-platform svg{display:block;width:100%;height:100%;overflow:visible}.bf-step-one-frame{transform-box:fill-box;transform-origin:center;animation:stepOneFrame 2s 1;animation-name:none}.bf-step-one-mark{position:absolute;left:37.16%;top:43.05%;z-index:2;width:24.07%;height:auto;transform-origin:center;animation:stepOneMark 2s 1;animation-name:none}.bf-step-one-message{position:absolute;left:56.95%;top:21.57%;z-index:3;width:15.4%;height:auto;transform-origin:center;animation:stepOneMessage 2s 1;animation-name:none}@media(hover:hover) and (pointer:fine){.bf-step[data-step-one-active] .bf-step-one-platform{animation-name:stepOnePlatform}.bf-step[data-step-one-active] .bf-step-one-frame{animation-name:stepOneFrame}.bf-step[data-step-one-active] .bf-step-one-mark{animation-name:stepOneMark}.bf-step[data-step-one-active] .bf-step-one-message{animation-name:stepOneMessage}}
            .bf-step-two-layer{position:absolute;left:27.4%;display:grid;width:44.9%;height:25.93%;place-items:center}.bf-step-two-layer::before{display:block;width:57.74%;aspect-ratio:1;border-radius:2.2%;content:"";transform:rotate(-30deg) scaleY(.866) skewX(30deg)}.bf-step-two-layer-back{top:41.94%}.bf-step-two-layer-back::before{background:color-mix(in oklch,var(--foreground) 7%,transparent)}.bf-step-two-layer-middle{top:39.35%}.bf-step-two-layer-middle::before{border:1px solid #737373}.bf-step-two-editor{position:absolute;left:27.4%;top:37.04%;z-index:1;display:grid;width:44.9%;height:25.93%;place-items:center}.bf-step-two-editor-shell{display:flex;width:57.74%;aspect-ratio:1;flex-direction:column;overflow:hidden;border:1px solid #df8e59;border-radius:2.2%;background:var(--alt-bg);transform:rotate(-30deg) scaleY(.866) skewX(30deg)}.bf-step-two-toolbar{display:flex;height:8.58%;flex:0 0 auto;align-items:center;gap:1.43%;border-bottom:1px solid #404040;background:#262626;padding:0 2.86%}.bf-step-two-dot{width:2.15%;aspect-ratio:1;border-radius:50%}.bf-step-two-dot:nth-child(1){background:#f87171}.bf-step-two-dot:nth-child(2){background:#facc15}.bf-step-two-dot:nth-child(3){background:#4ade80}.bf-step-two-body{display:flex;min-height:0;flex:1}.bf-step-two-sidebar{width:25.72%;border-right:1px solid #404040;padding:2.86%}.bf-step-two-sidebar::before{display:block;width:100%;height:5.2%;border-radius:2px;background:#d4d4d4;content:""}.bf-step-two-code{position:relative;flex:1}.bf-step-two-code span{position:absolute;height:1.1%;border-radius:999px;background:#fafafa;transform-origin:left center;animation-duration:.54s;animation-timing-function:cubic-bezier(.22,1,.36,1);animation-fill-mode:both;animation-name:none}.bf-step-two-code span:nth-child(1){left:9.1%;top:9.6%;width:40.9%}.bf-step-two-code span:nth-child(2){left:9.1%;top:17.9%;width:51.4%}.bf-step-two-code span:nth-child(3){left:12%;top:22.7%;width:43.3%}.bf-step-two-code span:nth-child(4){left:12%;top:26.2%;width:51.9%}.bf-step-two-code span:nth-child(5){left:13.9%;top:30.6%;width:17.8%}.bf-step-two-code span:nth-child(6){left:13.9%;top:34.1%;width:16.3%}.bf-step-two-code span:nth-child(7){left:13.9%;top:38.5%;width:13%}.bf-step-two-code span:nth-child(8){left:13.9%;top:42.8%;width:16.8%}.bf-step-two-code span:nth-child(9){left:12%;top:47.2%;width:3.4%}.bf-step-two-code span:nth-child(10){left:12%;top:51.1%;width:50.5%}.bf-step-two-code span:nth-child(11){left:12%;top:59.4%;width:58.7%}.bf-step-two-code span:nth-child(12){left:12%;top:63.3%;width:77.9%}.bf-step-two-code span:nth-child(13){left:12%;top:71.6%;width:35.6%}.bf-step-two-code span:nth-child(14){left:12%;top:75.5%;width:79.3%}.bf-step-two-code span:nth-child(15){left:12%;top:79.5%;width:2.9%}.bf-step-two-input{position:absolute;inset:0;z-index:2}.bf-step-two-input-sides{position:absolute;left:29.84%;top:38.72%;z-index:2;width:9.08%;height:auto}.bf-step-two-input-top{position:absolute;left:27.96%;top:35.09%;z-index:3;display:grid;width:12.84%;height:7.41%;place-items:center}.bf-step-two-input-top-face{position:relative;width:57.74%;aspect-ratio:1;transform:rotate(-30deg) scaleY(.866) skewX(30deg)}.bf-step-two-input-top-face img{position:absolute;inset:-1.25%;display:block;width:102.5%;height:102.5%;max-width:none}.bf-step-two-output{position:absolute;left:56.94%;top:21.57%;z-index:2;width:15.58%;height:auto;transform-origin:center}.bf-step-two-layer,.bf-step-two-editor,.bf-step-two-input,.bf-step-two-output{animation-duration:2.1s;animation-timing-function:cubic-bezier(.22,1,.36,1);animation-iteration-count:1;animation-fill-mode:both;animation-name:none}.bf-step-two-code span:nth-child(1){animation-delay:.34s}.bf-step-two-code span:nth-child(2){animation-delay:.38s}.bf-step-two-code span:nth-child(3){animation-delay:.42s}.bf-step-two-code span:nth-child(4){animation-delay:.46s}.bf-step-two-code span:nth-child(5){animation-delay:.50s}.bf-step-two-code span:nth-child(6){animation-delay:.54s}.bf-step-two-code span:nth-child(7){animation-delay:.58s}.bf-step-two-code span:nth-child(8){animation-delay:.62s}.bf-step-two-code span:nth-child(9){animation-delay:.66s}.bf-step-two-code span:nth-child(10){animation-delay:.70s}.bf-step-two-code span:nth-child(11){animation-delay:.74s}.bf-step-two-code span:nth-child(12){animation-delay:.78s}.bf-step-two-code span:nth-child(13){animation-delay:.82s}.bf-step-two-code span:nth-child(14){animation-delay:.86s}.bf-step-two-code span:nth-child(15){animation-delay:.90s}@media(hover:hover) and (pointer:fine){.bf-step[data-step-two-active] .bf-step-two-layer-back{animation-name:stepTwoLayerBack}.bf-step[data-step-two-active] .bf-step-two-layer-middle{animation-name:stepTwoLayerMiddle}.bf-step[data-step-two-active] .bf-step-two-editor{animation-name:stepTwoEditor}.bf-step[data-step-two-active] .bf-step-two-input{animation-name:stepTwoInput}.bf-step[data-step-two-active] .bf-step-two-output{animation-name:stepTwoOutput}.bf-step[data-step-two-active] .bf-step-two-code span{animation-name:stepTwoCodeLine}}
            .bf-step-three-svg{display:block;height:auto;overflow:visible}.bf-step-three-payload{transform-box:view-box;transform-origin:center}.bf-step-three-core{transform-box:fill-box;transform-origin:center}.bf-step-three-target{opacity:0}.bf-step-three-payload,.bf-step-three-core,.bf-step-three-side-guides,.bf-step-three-center-guide,.bf-step-three-destination,.bf-step-three-target{animation-duration:2.1s;animation-timing-function:cubic-bezier(.22,1,.36,1);animation-iteration-count:1;animation-fill-mode:both;animation-name:none}@media(hover:hover) and (pointer:fine){.bf-step[data-step-three-active] .bf-step-three-payload{animation-name:stepThreePayload}.bf-step[data-step-three-active] .bf-step-three-core{animation-name:stepThreeCore}.bf-step[data-step-three-active] .bf-step-three-destination{animation-name:stepThreeDestination}.bf-step[data-step-three-active] .bf-step-three-side-guides,.bf-step[data-step-three-active] .bf-step-three-center-guide{animation-name:stepThreeGuide}.bf-step[data-step-three-active] .bf-step-three-target{animation-name:stepThreeTarget}}
            .bf-steps,.bf-unit-grid{scrollbar-width:none}.bf-steps::-webkit-scrollbar,.bf-unit-grid::-webkit-scrollbar{display:none}
            .bf-unit-grid{display:grid;gap:14px;margin-top:32px}.bf-unit-grid.compute{grid-template-columns:repeat(4,minmax(0,1fr))}.bf-unit-grid.storage{grid-template-columns:repeat(3,minmax(0,1fr))}.bf-unit-card{height:226px;border-radius:var(--radius-xl);outline:1px solid transparent;outline-offset:-1px;transition:transform .45s cubic-bezier(.16,1,.3,1),outline-color .45s ease,box-shadow .45s ease}@media(hover:hover){.bf-unit-card:hover{transform:translateY(-1px) scale(1.03);outline-color:var(--accent-glow);box-shadow:0 10px 22px -18px rgba(var(--glow-rgb),.72),0 0 0 1px rgba(var(--glow-rgb),.16)}}
            .bf-tabs-list{display:inline-flex;width:fit-content;align-items:center;gap:4px;border-bottom:1px solid var(--border);background:transparent;border-radius:0;height:auto;padding:0}.bf-tabs-trigger{display:inline-flex;height:40px;align-items:center;justify-content:center;gap:6px;border:0;border-bottom:2px solid transparent;border-radius:0;background:transparent!important;box-shadow:none!important;padding:8px 4px;color:var(--muted-foreground);font-size:14px;font-weight:500;white-space:nowrap;transition:color .15s ease,border-color .15s ease}.bf-tabs-trigger:hover{color:var(--foreground)}.bf-tabs-trigger[data-state="active"]{color:var(--foreground);border-bottom-color:var(--foreground);background:transparent!important;box-shadow:none!important}@media(max-width:640px){.bf-tabs-list{display:grid;width:100%;grid-template-columns:repeat(2,minmax(0,1fr));gap:0}.bf-tabs-trigger{width:100%!important}}
            .bf-carousel{position:relative;width:100%;height:380px;overflow:hidden;border-radius:var(--radius-sm);outline:none;touch-action:pan-y}.bf-carousel:focus-visible{box-shadow:0 0 0 2px var(--background),0 0 0 4px var(--ring)}.bf-carousel-track{position:absolute;top:0;left:0;width:100%;will-change:transform;transition:transform .72s var(--motion-response)}.bf-carousel-item{height:60px;width:100%;display:flex;align-items:center;font-size:clamp(22px,3vw,32px);font-weight:600;letter-spacing:-.01em;transition:color .64s var(--motion-response),opacity .64s var(--motion-response)}.bf-moat{display:flex;align-items:baseline;gap:6px 14px;flex-wrap:wrap;padding:20px 4px;border-bottom:1px solid var(--border);font-weight:600;transform-origin:left center;transition:background .3s var(--motion-response),transform .35s var(--motion-response)}.bf-moat:hover{background:color-mix(in oklch,var(--foreground) 4%,transparent);transform:translateX(4px)}.bf-debug-grid{display:grid;grid-template-columns:1fr 1fr;gap:50px;align-items:center}.bf-debug-card{overflow:hidden;border:1px solid var(--border);border-radius:var(--radius-lg);background:var(--card);box-shadow:var(--shadow-sm);transition:border-color .45s var(--motion-response),box-shadow .45s var(--motion-response)}.bf-debug-card.live{border-color:var(--foreground);box-shadow:0 0 0 1px rgba(var(--glow-rgb),.15),0 30px 80px -30px rgba(var(--glow-rgb),.2)}.bf-debug-query,.bf-debug-response{opacity:0;transform:translate3d(0,10px,0);transition:opacity .55s var(--motion-response),transform .55s var(--motion-response);will-change:opacity,transform}.bf-debug-query{transition-delay:.12s}.bf-debug-response{transition-delay:.46s}.bf-debug-card.live .bf-debug-query,.bf-debug-card.live .bf-debug-response{opacity:1;transform:translate3d(0,0,0)}.bf-glow{position:absolute;left:50%;bottom:-220px;width:1000px;height:560px;transform:translateX(-50%);background:radial-gradient(ellipse at center,color-mix(in oklch,var(--foreground) 16%,transparent),transparent 62%);pointer-events:none;filter:blur(24px);animation:glowPulse 5s ease-in-out infinite}.bf-footer{position:relative;border-top:1px solid var(--border);padding:48px 0 42px;background:var(--background)}.bf-footer-inner{display:flex;flex-direction:column;gap:44px}.bf-footer-main{display:grid;grid-template-columns:minmax(280px,1fr) repeat(2,minmax(120px,160px));gap:56px}.bf-footer-brand{max-width:420px}.bf-footer-copy{margin:12px 0 0;color:var(--muted-foreground);font-size:13px;line-height:1.65}.bf-footer-nav{display:grid;grid-template-columns:subgrid;grid-column:2 / -1;gap:56px}.bf-footer-column-title{margin:1px 0 15px;color:var(--muted-foreground);font-size:11px;font-weight:500;line-height:1.4;text-transform:uppercase}.bf-footer-list{display:flex;flex-direction:column;align-items:flex-start;gap:10px;margin:0;padding:0;list-style:none}.bf-footer-link{display:inline-flex;align-items:center;gap:5px;border:0;border-radius:4px;padding:0;background:transparent;color:color-mix(in oklch,var(--foreground) 82%,var(--muted-foreground));font:inherit;font-size:13px;font-weight:500;line-height:1.4;cursor:pointer;touch-action:manipulation;transition:color .16s cubic-bezier(.23,1,.32,1),transform .12s cubic-bezier(.23,1,.32,1)}.bf-footer-link svg{opacity:.6;transition:opacity .16s cubic-bezier(.23,1,.32,1),transform .16s cubic-bezier(.23,1,.32,1)}.bf-footer-link:active{transform:scale(.97)}.bf-footer-meta{display:flex;width:100%;align-items:center;justify-content:space-between;gap:32px}.bf-footer-mark{color:var(--muted-foreground);font-family:var(--font-mono);font-size:12px;line-height:1.4;white-space:nowrap}.bf-footer-legal{display:flex;align-items:center;gap:22px}@media(hover:hover) and (pointer:fine){.bf-footer-link:hover{color:var(--foreground)}.bf-footer-link:hover svg{opacity:1;transform:translate(1px,-1px)}}
            @keyframes blurFocus{from{opacity:0;filter:blur(10px);transform:translateY(18px)}to{opacity:1;filter:blur(0);transform:none}}@keyframes themeIconIn{from{opacity:0;transform:scale(.7) rotate(-90deg);filter:blur(4px)}to{opacity:1;transform:scale(1) rotate(0deg);filter:blur(0)}}@keyframes menuIn{from{opacity:0;transform:translateY(-6px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(6px)}}@keyframes blink{0%,50%{opacity:1}51%,100%{opacity:0}}@keyframes pulseDot{0%,100%{opacity:1}50%{opacity:.35}}@keyframes ctaPulse{0%{box-shadow:0 0 0 0 oklch(0.9 0.01 260 / .55)}70%{box-shadow:0 0 0 9px oklch(0.9 0.01 260 / 0)}100%{box-shadow:0 0 0 0 oklch(0.9 0.01 260 / 0)}}@keyframes glowPulse{0%,100%{opacity:.7;transform:translateX(-50%) scale(1)}50%{opacity:1;transform:translateX(-50%) scale(1.06)}}
            @keyframes stepOnePlatform{0%,100%{transform:translateY(0);filter:none;animation-timing-function:cubic-bezier(.25,.1,.25,1)}40%{transform:translateY(-2.15%);filter:var(--step-glow-soft);animation-timing-function:linear}75%{transform:translateY(-2.15%);filter:var(--step-glow-soft);animation-timing-function:cubic-bezier(.25,.1,.25,1)}}@keyframes stepOneFrame{0%,100%{transform:translateY(0) scale(1);animation-timing-function:cubic-bezier(.25,.1,.25,1)}40%{transform:translateY(-1.7%) scale(1.02);animation-timing-function:linear}75%{transform:translateY(-1.7%) scale(1.02);animation-timing-function:cubic-bezier(.25,.1,.25,1)}}@keyframes stepOneMark{0%,100%{transform:translateY(0) rotate(0deg) scale(1);filter:none}25%{transform:translateY(-6%) rotate(0deg) scale(1.08);filter:none}30%{transform:translateY(-8%) rotate(3deg) scale(1.08)}35%{transform:translateY(-8%) rotate(2deg) scale(1.03)}45%{transform:translateY(-8%) rotate(1deg) scale(1.06)}50%{transform:translateY(-8%) rotate(0deg) scale(1.05)}55%,75%{transform:translateY(-8%) rotate(0deg) scale(1.04);filter:var(--step-glow-accent)}}@keyframes stepOneMessage{0%,100%{transform:translate(0,0) scale(1)}27.5%{transform:translate(0,0) scale(.92)}52.5%,75%{transform:translate(3%,-8.6%) scale(1.08)}}
            @keyframes stepThreeCore{0%,12%,100%{transform:scale(1);opacity:1}20%{transform:scale(1.06);opacity:1}58%,78%{transform:scale(.92);opacity:.94}84%{transform:scale(.98);opacity:0}}@keyframes stepThreePayload{0%,12%,100%{transform:translateY(0)}58%,84%{transform:translateY(18%)}}@keyframes stepThreeGuide{0%,20%,100%{stroke-dashoffset:0;opacity:1}52%,84%{stroke-dashoffset:-28;opacity:0}}@keyframes stepThreeDestination{0%,48%,100%{filter:none}58%,82%{filter:drop-shadow(0 0 10px rgba(223,142,89,.16))}}@keyframes stepThreeTarget{0%,52%,100%{opacity:0}58%,82%{opacity:.26}}
            @keyframes stepTwoLayerBack{0%,100%{transform:translate3d(0,0,0)}30%,72%{transform:translate3d(0,6%,0)}}@keyframes stepTwoLayerMiddle{0%,100%{transform:translate3d(0,0,0)}28%,74%{transform:translate3d(0,3%,0)}}@keyframes stepTwoEditor{0%,100%{transform:translate3d(0,0,0);filter:none}26%,74%{transform:translate3d(0,-2%,0);filter:var(--step-glow-soft)}}@keyframes stepTwoInput{0%,100%{transform:translate3d(0,0,0) scale(1)}14%{transform:translate3d(-1.5%,-1%,0) scale(.96)}38%,66%{transform:translate3d(8.5%,2%,0) scale(1.02)}}@keyframes stepTwoCodeLine{from{opacity:.14;transform:scaleX(.08)}to{opacity:1;transform:scaleX(1)}}@keyframes stepTwoOutput{0%,42%,100%{transform:translate3d(0,0,0) scale(1);filter:none}58%,76%{transform:translate3d(6%,-12%,0) scale(1.05);filter:var(--step-glow-accent)}}
            @media(max-width:1024px){.bf-title.wrap{line-height:1.35}.bf-dash-grid{grid-template-columns:1fr;height:auto}.bf-convo{height:500px;border-right:0;border-bottom:1px solid var(--border)}.bf-draft.compact{position:absolute;top:0;right:0;bottom:0;width:min(88vw,380px);z-index:200;align-self:initial;overflow-y:auto;background:var(--card);border-left:1px solid var(--border);transform:translateX(100%);box-shadow:none;transition:transform .38s var(--motion-response),box-shadow .38s var(--motion-response);will-change:transform}.bf-draft.compact.open{transform:translateX(0);box-shadow:-24px 0 60px -20px rgba(0,0,0,.45)}.bf-steps{display:flex;gap:16px;margin-top:40px;overflow-x:auto;padding-bottom:10px;scroll-snap-type:x proximity;-webkit-overflow-scrolling:touch}.bf-unit-grid.compute,.bf-unit-grid.storage{display:flex;gap:14px;margin-top:18px;margin-left:-14px;margin-right:-14px;overflow-x:auto;padding:14px 14px 22px;scroll-padding-left:14px;scroll-snap-type:x proximity;scroll-behavior:smooth;-webkit-overflow-scrolling:touch}.bf-step,.bf-unit-card{min-width:300px;max-width:300px;flex:0 0 300px;scroll-snap-align:start}.bf-unit-card{scroll-snap-stop:always}.bf-step{border:1px solid var(--border);border-radius:var(--radius-xl);background:var(--card);box-shadow:var(--shadow-sm);padding:26px 22px}.bf-moat{align-items:flex-start;flex-direction:column}.bf-footer-main{grid-template-columns:minmax(260px,1fr) repeat(2,minmax(112px,140px));gap:36px}.bf-footer-nav{gap:36px}}@media(max-width:640px){.bf-mobile-menu-backdrop{display:none}.bf-mobile-menu{inset:0;width:auto;height:auto;min-height:100dvh;border-left:0;transform:translateY(-8px) scale(.992);transform-origin:top right}.bf-mobile-menu[data-open="true"]{transform:none}.bf-mobile-menu-nav{max-width:1080px;margin:0 auto;padding-top:34px;overflow-y:auto}.bf-mobile-menu-link{padding:7px 0;font-size:clamp(30px,8vw,42px);line-height:1.13}.bf-mobile-menu-actions{max-width:1080px;margin-left:auto;margin-right:auto}.bf-container{padding:0 20px}.bf-carousel{-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}.bf-hero{grid-template-rows:2fr 1fr;min-height:100svh;padding:68px 20px 24px}.bf-hero h1{flex-direction:column;align-items:center;gap:clamp(6px,2.4vw,16px);font-size:clamp(46px,17vw,90px);line-height:.98;white-space:normal}.bf-copy{max-width:100%;font-size:clamp(16px,5vw,22px);line-height:1.45}.bf-down{margin-top:0}.bf-dash{margin-left:-8px;margin-right:-8px}.bf-debug-grid{grid-template-columns:1fr;gap:32px}.bf-footer{padding:40px 0 36px}.bf-footer-inner{gap:34px}.bf-footer-main{display:flex;flex-direction:column;gap:34px}.bf-footer-brand{max-width:100%}.bf-footer-nav{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:28px}.bf-footer-meta{align-items:flex-start;flex-direction:column-reverse;gap:18px}.bf-footer-legal{flex-wrap:wrap;gap:10px 18px}.bf-footer-mark{white-space:normal}}@media(prefers-reduced-transparency:reduce){.bf-nav{background:var(--background);backdrop-filter:none;-webkit-backdrop-filter:none}}@media(prefers-contrast:more){.bf-nav{background:var(--background);backdrop-filter:none;-webkit-backdrop-filter:none}.bf-muted{opacity:.72}.bf-page :focus-visible{outline-color:var(--foreground)}}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}.bf-char{opacity:1!important;filter:none!important;transform:none!important}.bf-page *{animation-duration:.01ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important}.bf-reveal,.bf-empty,.bf-toast,.bf-draft-backdrop,.bf-unit-card,.bf-carousel-item{filter:none!important;transition:opacity .2s ease!important}.bf-draft,.bf-carousel-track,.bf-mobile-menu,.bf-mobile-menu-backdrop,.bf-menu-icon{transition:none!important}.bf-unit-status-label{transition:opacity 120ms ease!important;transform:none!important}.bf-footer-link,.bf-footer-link svg{transition:none!important}.bf-footer-link:hover svg{transform:none!important}.bf-page :where([data-slot="button"],.bf-pill,.bf-menu-toggle,.bf-nav-link,.bf-tabs-trigger,.bf-draft-toggle):active{scale:1!important}.bf-chip:hover,.bf-unit-card:hover,.bf-moat:hover{transform:none!important}}
            @media(prefers-reduced-motion:reduce){.bf-page *{animation-delay:0ms!important}}
            .bf-kicker{margin-bottom:18px}.bf-title,.bf-title.wrap{line-height:1.08;text-wrap:balance}.bf-pitch-copy{max-width:840px;margin:20px 0 0;color:var(--muted-foreground);font-size:clamp(20px,2.6vw,26px);line-height:1.5;text-wrap:pretty}.bf-section-copy{max-width:620px;margin:20px 0 0;color:var(--muted-foreground);font-size:17px;line-height:1.6;text-wrap:pretty}.bf-footer-copy{line-height:1.6;text-wrap:pretty}.bf-footer-main{grid-template-columns:minmax(280px,1fr) repeat(3,minmax(100px,140px));gap:48px}.bf-footer-nav{gap:48px}
            @media(max-width:1024px){.bf-title.wrap{line-height:1.12}.bf-footer-main{grid-template-columns:minmax(240px,1fr) repeat(3,minmax(92px,120px));gap:32px}.bf-footer-nav{gap:32px}}
            @media(max-width:640px){.bf-section{padding:82px 0}.bf-kicker{margin-bottom:16px}.bf-title,.bf-title.wrap{line-height:1.12}.bf-pitch-copy{margin-top:18px;font-size:18px;line-height:1.55}.bf-section-copy{margin-top:18px;font-size:16px;line-height:1.6}.bf-footer-main{gap:34px}.bf-footer-nav{grid-template-columns:repeat(2,minmax(0,1fr));gap:28px}}
            .bf-section-rail-inner{overflow:visible}.bf-section-rail:hover .bf-section-rail-inner,.bf-section-rail:focus-within .bf-section-rail-inner{width:40px;border-color:transparent;background:transparent;box-shadow:none;backdrop-filter:none;-webkit-backdrop-filter:none}.bf-section-rail-link{position:relative;display:flex;width:26px;height:28px;grid-template-columns:none;align-items:center;justify-content:center;margin:0 auto;padding:0;border-radius:9999px;background:transparent}.bf-section-rail:hover .bf-section-rail-link:hover,.bf-section-rail-link:focus-visible{outline:none;background:transparent;box-shadow:none}.bf-section-rail-marker{justify-self:auto;margin-right:0}.bf-section-rail-label{position:absolute;top:50%;right:calc(100% + 9px);z-index:1;display:flex;width:max-content;min-width:0;align-items:center;gap:8px;overflow:visible;padding:6px 10px;border:1px solid var(--border);border-radius:9999px;background:var(--popover);box-shadow:0 12px 34px -22px rgba(0,0,0,.9);color:var(--foreground);line-height:1.2;opacity:0;pointer-events:none;transform:translate(6px,-50%) scale(.98);transform-origin:right center;transition:opacity .16s ease,transform .2s var(--motion-response)}.bf-section-rail:hover .bf-section-rail-label,.bf-section-rail:focus-within .bf-section-rail-label{opacity:0;transform:translate(6px,-50%) scale(.98)}.bf-section-rail-link:hover .bf-section-rail-label,.bf-section-rail-link:focus-visible .bf-section-rail-label{opacity:1;transform:translate(0,-50%) scale(1)}
            .bf-mobile-section-link[aria-current="location"]{border-color:var(--border);background:var(--secondary);color:var(--foreground)}
        `}</style>
    );
}

function Magnetic({ to, variant, children }: { to: string; variant: "primary" | "secondary"; children: string }) {
    const ref = useRef<HTMLAnchorElement | null>(null);
    useMagnet(ref);
    return (
        <a ref={ref} href={to} className={`bf-pill ${variant}`}>
            {children}
        </a>
    );
}

function Brand() {
    return (
        <Link to="/" className="bf-logo">
            <MarketingLogoSquare width={22} height={22} sizes="22px" className="size-[22px]" />
            BaaSForge
        </Link>
    );
}

function scrollToSection(index: number) {
    const section = SECTION_LINKS[index];
    if (!section) return;
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(section.id)?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    window.history.replaceState(null, "", section.href);
}

function SectionRail({ active }: { active: SectionId }) {
    const [visible, setVisible] = useState(false);
    const activeIndex = SECTION_LINKS.findIndex((link) => link.id === active);

    useEffect(() => {
        let frame = 0;
        const updateVisibility = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
                const firstSection = document.getElementById("what");
                const lastSection = document.getElementById("debug");
                if (!firstSection || !lastSection) return;
                const enteredContent = firstSection.getBoundingClientRect().top <= window.innerHeight * 0.72;
                const beforeClosingCta = lastSection.getBoundingClientRect().bottom >= window.innerHeight * 0.62;
                setVisible(enteredContent && beforeClosingCta);
            });
        };
        updateVisibility();
        window.addEventListener("scroll", updateVisibility, { passive: true });
        window.addEventListener("resize", updateVisibility);
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener("scroll", updateVisibility);
            window.removeEventListener("resize", updateVisibility);
        };
    }, []);

    return (
        <nav className="bf-section-rail" aria-label="Homepage sections" data-visible={visible}>
            <div className="bf-section-rail-inner">
                {SECTION_LINKS.map((link, index) => (
                    <a
                        key={link.id}
                        href={link.href}
                        className="bf-section-rail-link"
                        aria-current={active === link.id ? "location" : undefined}
                        aria-label={`${String(index + 1).padStart(2, "0")} ${link.label}`}
                        data-complete={index < activeIndex}
                        onClick={(event) => {
                            event.preventDefault();
                            scrollToSection(index);
                        }}
                    >
                        <span className="bf-section-rail-label" aria-hidden="true">
                            <span>{String(index + 1).padStart(2, "0")}</span>
                            {link.label}
                        </span>
                        <span className="bf-section-rail-marker" aria-hidden="true" />
                    </a>
                ))}
            </div>
        </nav>
    );
}

function Navbar({ active }: { active: SectionId }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuButtonRef = useRef<HTMLButtonElement | null>(null);

    const goToSection = useCallback((index: number) => {
        scrollToSection(index);
        setMenuOpen(false);
    }, []);

    useEffect(() => {
        if (!menuOpen) return;
        const previousOverflow = document.body.style.overflow;
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setMenuOpen(false);
                menuButtonRef.current?.focus();
            }
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
                    <div className="bf-primary-nav hidden text-sm xl:flex" aria-label="Primary navigation">
                        <Link to="/" aria-current="page" className="bf-nav-link border-b border-foreground pb-[3px] text-foreground">Pitch</Link>
                        <Link to="/docs" reloadDocument className="bf-nav-link border-b border-transparent pb-[3px] text-muted-foreground">Docs</Link>
                        <Link to="/pricing" reloadDocument className="bf-nav-link border-b border-transparent pb-[3px] text-muted-foreground">
                            Pricing
                        </Link>
                    </div>
                    <div className="flex items-center gap-3.5">
                        <div className="hidden items-center gap-3.5 xl:flex">
                            <Button variant="ghost" size="sm" className="rounded-full" asChild>
                                <a href={LOGIN_PATH}>Sign in</a>
                            </Button>
                            <Button size="sm" className="rounded-full bg-primary font-semibold hover:bg-primary/90 active:bg-primary/80" style={{ color: "var(--primary-foreground)" }} asChild>
                                <a href={LOGIN_PATH}>Start building</a>
                            </Button>
                        </div>
                        <button ref={menuButtonRef} type="button" onClick={() => setMenuOpen((open) => !open)} className="bf-menu-toggle flex size-10 items-center justify-center rounded-md text-foreground hover:bg-foreground/8 xl:hidden" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} data-open={menuOpen}>
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
                aria-hidden={!menuOpen}
                aria-label="Navigation menu"
                data-open={menuOpen}
                inert={!menuOpen}
                role="dialog"
            >
                <nav className="bf-mobile-menu-nav" aria-label="Mobile navigation">
                    <Link to="/" aria-current="page" onClick={() => setMenuOpen(false)} className="bf-nav-link bf-mobile-menu-link text-foreground">Pitch</Link>
                    <Link to="/docs" reloadDocument onClick={() => setMenuOpen(false)} className="bf-nav-link bf-mobile-menu-link text-muted-foreground">Docs</Link>
                    <Link to="/pricing" reloadDocument onClick={() => setMenuOpen(false)} className="bf-nav-link bf-mobile-menu-link text-muted-foreground">
                        Pricing
                    </Link>
                    <div className="bf-mobile-section-group">
                        <span className="bf-mobile-section-title">On this page</span>
                        <div className="bf-mobile-section-grid">
                            {SECTION_LINKS.map((link, index) => (
                                <a key={link.id} href={link.href} className="bf-mobile-section-link" aria-current={active === link.id ? "location" : undefined} onClick={(event) => { event.preventDefault(); goToSection(index); }}>
                                    <span className="bf-mobile-section-index">{String(index + 1).padStart(2, "0")}</span>
                                    {link.label}
                                </a>
                            ))}
                        </div>
                    </div>
                </nav>
                <div className="bf-mobile-menu-actions">
                    <Button variant="outline" className="h-12 rounded-full" asChild>
                        <a className="bf-mobile-action" href={LOGIN_PATH} onClick={() => setMenuOpen(false)}>Sign in</a>
                    </Button>
                    <Button className="h-12 rounded-full bg-primary font-semibold hover:bg-primary/90 active:bg-primary/80" style={{ color: "var(--primary-foreground)" }} asChild>
                        <a className="bf-mobile-action" href={LOGIN_PATH} onClick={() => setMenuOpen(false)}>Start building</a>
                    </Button>
                </div>
            </div>
        </>
    );
}

function Hero() {
    return (
        <header className="bf-hero">
            <div className="bf-hero-title-wrap">
                <h1 aria-label="Build Backend.">
                    {"Build Backend.".split(" ").map((word) => (
                        <span
                            key={word}
                            className="bf-char inline-block whitespace-nowrap"
                            aria-hidden="true"
                        >
                            {word}
                        </span>
                    ))}
                </h1>
            </div>
            <div className="bf-hero-support">
                <p className="bf-copy">
                    <span className="whitespace-nowrap">BaaSForge delivers</span> <span className="whitespace-nowrap">your whole backend,</span>
                    <br />
                    from prompt to production.
                </p>
                <div className="bf-actions">
                    <Magnetic to="/docs" variant="secondary">
                        Go to docs
                    </Magnetic>
                    <Magnetic to={LOGIN_PATH} variant="primary">
                        Start building
                    </Magnetic>
                </div>
                <div className="bf-down">
                    <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <path d="M12 4v14M6 13l6 6 6-6" />
                    </svg>
                </div>
            </div>
        </header>
    );
}

function What({ visible, compact }: { visible: boolean; compact: boolean }) {
    const titleRef = useRef<HTMLHeadingElement | null>(null);
    const fitsTwoLines = useWhatTitleFits(titleRef);
    return (
        <section id="what" className="bf-section">
            <div className="bf-container">
                <div className={`bf-reveal blur ${visible ? "visible" : ""}`}>
                    <span className="bf-kicker">01 · THE PITCH</span>
                    <h2 ref={titleRef} className="bf-title !leading-[1.18]">
                        AI turns your description
                        <br style={{ display: fitsTwoLines ? "none" : "initial" }} /> into
                        <br style={{ display: fitsTwoLines ? "initial" : "none" }} />{" "}
                        <span className="bf-muted">
                            production-ready
                            <br style={{ display: fitsTwoLines ? "none" : "initial" }} /> code
                        </span>
                    </h2>
                    <p className="bf-pitch-copy">Describe what your backend should do. AI writes it, you ship it to production, then AI knows what's broken before your users do.</p>
                    <div className="bf-chip-row">{["AI Chat", "CI/CD", "Monitoring", "Live Debugging", "Version Control"].map((chip) => <span key={chip} className="bf-chip">{chip}</span>)}</div>
                </div>
                <Dashboard compact={compact} />
            </div>
        </section>
    );
}

function Dashboard({ compact }: { compact: boolean }) {
    const reducedMotion = useMedia("(prefers-reduced-motion: reduce)");
    const [running, setRunning] = useState(false);
    const [active, setActive] = useState(false);
    const [message, setMessage] = useState(false);
    const [steps, setSteps] = useState<{ text: string; show: boolean; done: boolean }[]>([]);
    const [reply, setReply] = useState(false);
    const [units, setUnits] = useState<{ name: string; desc: string; show: boolean; live: boolean }[]>([]);
    const [deploy, setDeploy] = useState<"disabled" | "ready" | "deploying" | "done">("disabled");
    const [toast, setToast] = useState(false);
    const [draftOpen, setDraftOpen] = useState(false);
    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    const send = async () => {
        if (running) return;
        setRunning(true);
        setActive(true);
        setMessage(true);
        setSteps([]);
        setReply(false);
        setUnits([]);
        setDeploy("disabled");
        setDraftOpen(false);
        await wait(500);
        const nextSteps: { text: string; show: boolean; done: boolean }[] = [];
        for (const text of DASH_STEPS) {
            nextSteps.push({ text, show: false, done: false });
            setSteps([...nextSteps]);
            await wait(40);
            nextSteps[nextSteps.length - 1].show = true;
            setSteps([...nextSteps]);
            await wait(300);
            nextSteps[nextSteps.length - 1].done = true;
            setSteps([...nextSteps]);
            await wait(110);
        }
        setReply(true);
        await wait(300);
        const nextUnits: { name: string; desc: string; show: boolean; live: boolean }[] = [];
        for (const [name, desc] of DASH_UNITS) {
            nextUnits.push({ name, desc, show: false, live: false });
            setUnits([...nextUnits]);
            await wait(40);
            nextUnits[nextUnits.length - 1].show = true;
            setUnits([...nextUnits]);
            await wait(220);
        }
        if (compact) setDraftOpen(true);
        setDeploy("ready");
        setActive(false);
        setRunning(false);
    };
    const runDeploy = async () => {
        if (deploy !== "ready") return;
        setDeploy("deploying");
        setToast(true);
        await wait(1600);
        setToast(false);
        for (let index = 0; index < units.length; index += 1) {
            if (!reducedMotion && index > 0) await wait(70);
            setUnits((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, live: true } : item));
        }
        setDeploy("done");
    };
    return (
        <div className={`bf-dash ${active ? "active" : ""}`}>
            <div className={`bf-draft-backdrop ${compact && draftOpen ? "visible" : ""}`} onClick={() => setDraftOpen(false)} style={{ opacity: compact && draftOpen ? 1 : 0, pointerEvents: compact && draftOpen ? "auto" : "none" }} />
            <div className={`bf-toast ${toast ? "visible" : ""}`} style={{ zIndex: compact && draftOpen ? 260 : 6 }}>
                <span className="flex size-[18px] items-center justify-center rounded-full bg-foreground text-[11px] text-background">✓</span>
                <div><div className="text-[13.5px] font-semibold">Deploying has started</div><div className="text-xs text-muted-foreground">Building units and provisioning runtime.</div></div>
            </div>
            <div className="bf-dash-grid">
                <div className="bf-convo">
                    <div className="bf-bar">
                        <span className="bf-window-dot" /><span className="bf-window-dot" /><span className="bf-window-dot" /><span className="ml-2 font-mono text-[12.5px] text-muted-foreground">Conversation</span>
                        {compact && !draftOpen && (
                            <button
                                type="button"
                                onClick={() => setDraftOpen(true)}
                                className="bf-draft-toggle ml-auto inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:border-[var(--accent-glow)] hover:bg-accent hover:text-accent-foreground"
                            >
                                Draft units
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                    <polyline points="12 5 19 12 12 19" />
                                </svg>
                            </button>
                        )}
                    </div>
                    <div className="bf-chat">
                        <div className="bf-empty" style={{ opacity: message ? 0 : 1, transform: message ? "translateY(-26px) scale(.97)" : "none" }}><div className="text-[17px] font-semibold">What would you like to build?</div></div>
                        {message && <div className="bf-msg user">I want to create an app for a running coach to give exercise plans to her trainees.</div>}
                        {steps.map((step) => <div key={step.text} className="flex items-center gap-2 font-mono text-[12.5px] text-muted-foreground transition-[opacity,transform] duration-200 ease-out" style={{ opacity: step.show ? 1 : 0, transform: step.show ? "none" : "translateY(4px)" }}><span className="size-1.5 rounded-full" style={{ background: step.done ? "var(--foreground)" : "var(--muted-foreground)", boxShadow: step.done ? "0 0 8px rgba(var(--glow-rgb),.5)" : "none" }} />{step.text}</div>)}
                        {reply && <div className="bf-msg ai">The core actors have been created: <b className="font-medium text-foreground">coach.profile.actor.coach</b>, <b className="font-medium text-foreground">trainee.profile.actor.trainee</b>, and <b className="font-medium text-foreground">training.plan.actor.plan</b>. Ready to review the draft units.</div>}
                    </div>
                    <div className="bf-input">
                        <div className="flex-1 font-mono text-[13px] text-muted-foreground">{message ? "Type a message, Shift+Enter for new line" : "I want to create an app for a running coach to give exercise plans to her trainees."}{!message && <span className="ml-0.5 inline-block h-3.5 w-[7px] animate-[blink_1s_steps(2)_infinite] bg-foreground align-[-2px]" />}</div>
                        <span className={!running && deploy !== "ready" && deploy !== "done" ? "bf-pulse" : "inline-flex"}><Button size="sm" onClick={send} disabled={running}>Send ↑</Button></span>
                    </div>
                </div>
                <div className={`bf-draft ${compact ? `compact ${draftOpen ? "open" : ""}` : ""}`} aria-hidden={compact && !draftOpen} inert={compact && !draftOpen}>
                    <div className="flex h-[52px] items-center justify-between border-b px-[18px]"><span className="font-mono text-xs text-muted-foreground">DRAFT UNITS</span><span className="flex items-center gap-2"><span className={deploy === "ready" ? "bf-pulse" : "inline-flex"}><Button variant="outline" size="sm" onClick={runDeploy} disabled={deploy === "disabled" || deploy === "deploying" || deploy === "done"} className="h-[30px] gap-1.5">{deploy === "deploying" && <Spinner className="size-3.5" />}{deploy === "done" ? "Deployed" : deploy === "deploying" ? "Deploying" : "Deploy"}</Button></span>{compact && <Button type="button" variant="ghost" size="icon" className="size-8" onClick={() => setDraftOpen(false)} aria-label="Close draft units"><X className="size-4" /></Button>}</span></div>
                    <div className="flex flex-col gap-2.5 p-4">
                        {units.length === 0 && <div className="px-1 py-3.5 text-[13px] leading-6 text-muted-foreground">Units will appear here once BaaSForge starts building.</div>}
                        {units.map((unit) => <div key={unit.name} className="bf-draft-card" style={{ opacity: unit.show ? 1 : 0, transform: unit.show ? "none" : "translateY(8px) scale(.98)" }}><div className="mb-2 font-mono text-[11.5px] text-muted-foreground">{unit.name}</div><div className="mb-2.5 text-[12.5px] leading-5 text-muted-foreground">{unit.desc}</div><div className="flex gap-2 text-[11px]"><span className="rounded-[5px] border bg-secondary px-2 py-0.5 text-foreground">⛁ Actor</span><span className="bf-unit-status" data-live={unit.live}><span className="sr-only">{unit.live ? "Live" : "Not shipped"}</span><span className="bf-unit-status-label bf-unit-status-pending" aria-hidden="true">Not shipped</span><span className="bf-unit-status-label bf-unit-status-live" aria-hidden="true"><span className="size-1.5 rounded-full bg-[oklch(0.78_0.19_150)]" />Live</span></span></div></div>)}
                    </div>
                </div>
            </div>
        </div>
    );
}

function How({ visible }: { visible: boolean }) {
    const stepsRef = useRef<HTMLDivElement | null>(null);
    const [artworkReady, setArtworkReady] = useState(false);
    useStepHoverAnimations(stepsRef, artworkReady);
    useEffect(() => {
        const target = stepsRef.current;
        if (!target || artworkReady) return;
        if (!("IntersectionObserver" in window)) {
            const timeout = globalThis.setTimeout(() => setArtworkReady(true), 0);
            return () => globalThis.clearTimeout(timeout);
        }
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return;
                setArtworkReady(true);
                observer.disconnect();
            },
            { rootMargin: "200px 0px" },
        );
        observer.observe(target);
        return () => observer.disconnect();
    }, [artworkReady]);
    return <section id="how" className="bf-section alt"><div className="bf-container"><div className={`bf-reveal ${visible ? "visible" : ""}`}><span className="bf-kicker">02 · BUILD FLOW</span><h2 className="bf-title wrap"><span className="whitespace-nowrap">Three steps.</span> <span className="bf-muted whitespace-nowrap">Live in production.</span></h2></div><div ref={stepsRef} className={`bf-steps bf-reveal ${visible ? "visible" : ""}`}>{STEPS.map((step, index) => <div key={step[0]} className="bf-step" data-step-anim><StepSvg index={index} ready={artworkReady} /><div className="mb-4 font-mono text-xl font-bold tracking-[0.02em]">{step[0]}</div><p className="m-0 text-[15.5px] leading-[1.65] text-muted-foreground"><strong className="font-bold text-foreground">{step[1]}</strong> {step[2]}</p></div>)}</div></div></section>;
}

function StepOneArtwork() {
    return (
        <div className="bf-step-art" aria-hidden="true">
            <div className="bf-step-one-stage">
                <div className="bf-step-one-platform">
                    <svg viewBox="0 0 486 305" fill="none">
                        <g className="bf-step-one-base">
                            <path d="M1 140 243 1l242 139-242 140L1 140Z" fill="var(--alt-bg)" stroke="#404040" strokeWidth="2" />
                            <path d="m1 140 242 140v24L1 164v-24Z" fill="var(--alt-bg)" stroke="#404040" strokeWidth="2" strokeLinejoin="bevel" />
                            <path d="m243 280 242-140v24L243 304v-24Z" fill="var(--alt-bg)" stroke="#404040" strokeWidth="2" strokeLinejoin="bevel" />
                        </g>
                        <g className="bf-step-one-frame">
                            <path d="m243 21 208 119-208 120L35 140 243 21Z" stroke="#404040" strokeWidth="1.5" />
                            <path d="m210 40 33-19 33 19M418 121l33 19-33 19M276 241l-33 19-33-19M68 159l-33-19 33-19" stroke="#D4D4D4" strokeWidth="3" />
                        </g>
                    </svg>
                </div>
                <img className="bf-step-one-mark" src={stepOneMark} alt="" loading="lazy" decoding="async" fetchPriority="low" draggable={false} />
                <img className="bf-step-one-message" src={stepOneMessage} alt="" loading="lazy" decoding="async" fetchPriority="low" draggable={false} />
            </div>
        </div>
    );
}

function StepSvg({ index, ready }: { index: number; ready: boolean }) {
    if (!ready) return <div className="bf-step-art" aria-hidden="true" />;
    if (index === 0) return <StepOneArtwork />;
    if (index === 1) return <StepTwoArtwork />;
    if (index === 2) return <StepThreeArtwork />;
    return <LegacyStepSvg index={index} />;
}

function StepTwoArtwork() {
    return (
        <div className="bf-step-art" aria-hidden="true">
            <div className="bf-step-two-stage">
                <div className="bf-step-two-layer bf-step-two-layer-back" />
                <div className="bf-step-two-layer bf-step-two-layer-middle" />
                <div className="bf-step-two-editor">
                    <div className="bf-step-two-editor-shell">
                        <div className="bf-step-two-toolbar">
                            <i className="bf-step-two-dot" />
                            <i className="bf-step-two-dot" />
                            <i className="bf-step-two-dot" />
                        </div>
                        <div className="bf-step-two-body">
                            <div className="bf-step-two-sidebar" />
                            <div className="bf-step-two-code">{Array.from({ length: 15 }, (_, line) => <span key={line} />)}</div>
                        </div>
                    </div>
                </div>
                <div className="bf-step-two-input">
                    <img className="bf-step-two-input-sides" src={stepTwoInputSides} alt="" loading="lazy" decoding="async" fetchPriority="low" draggable={false} />
                    <div className="bf-step-two-input-top"><div className="bf-step-two-input-top-face"><img src={stepTwoInputTop} alt="" loading="lazy" decoding="async" fetchPriority="low" draggable={false} /></div></div>
                </div>
                <img className="bf-step-two-output" src={stepTwoOutput} alt="" loading="lazy" decoding="async" fetchPriority="low" draggable={false} />
            </div>
        </div>
    );
}

function LegacyStepSvg({ index }: { index: number }) {
    if (index === 0) return <div className="mb-[26px] flex h-[220px] items-center justify-center"><svg viewBox="-18 0 160 160" className="h-[190px] w-[190px] overflow-visible"><g fill="none" strokeLinecap="round" strokeLinejoin="round"><rect fill="var(--secondary)" stroke="var(--muted-foreground)" x="14" y="8" width="96" height="42" rx="10" vectorEffect="non-scaling-stroke" /><polyline fill="var(--secondary)" stroke="var(--muted-foreground)" points="32,50 32,62 44,50" vectorEffect="non-scaling-stroke" /><line data-a="l1" stroke="var(--foreground)" strokeWidth="1.2" x1="28" y1="22" x2="64" y2="22" strokeDasharray="36" strokeDashoffset="0" vectorEffect="non-scaling-stroke" /><line data-a="l2" stroke="var(--muted-foreground)" x1="28" y1="34" x2="84" y2="34" strokeDasharray="56" strokeDashoffset="0" vectorEffect="non-scaling-stroke" /><g data-a="arr"><line stroke="var(--muted-foreground)" x1="46" y1="74" x2="46" y2="94" strokeDasharray="3 5" vectorEffect="non-scaling-stroke" /><polyline stroke="var(--muted-foreground)" points="40,88 46,96 52,88" vectorEffect="non-scaling-stroke" /></g><g data-a="cube"><polygon fill="var(--secondary)" fillOpacity=".7" stroke="var(--muted-foreground)" points="46,104 78,122 46,140 14,122" vectorEffect="non-scaling-stroke" /><polygon fill="var(--secondary)" fillOpacity=".7" stroke="var(--muted-foreground)" points="14,122 46,140 46,158 14,140" vectorEffect="non-scaling-stroke" /><polygon fill="var(--secondary)" fillOpacity=".7" stroke="var(--muted-foreground)" points="78,122 46,140 46,158 78,140" vectorEffect="non-scaling-stroke" /><polyline stroke="var(--foreground)" points="46,104 78,122 46,140 14,122 46,104" vectorEffect="non-scaling-stroke" /></g></g></svg></div>;
    return <div className="mb-[26px] flex h-[220px] items-center justify-center"><svg viewBox="0 0 160 160" className="h-[190px] w-[190px] overflow-visible"><g fill="none" strokeLinecap="round" strokeLinejoin="round"><g data-a="tcube"><polygon fill="var(--secondary)" fillOpacity=".8" stroke="var(--muted-foreground)" points="80,14 112,32 80,50 48,32" vectorEffect="non-scaling-stroke" /><polygon fill="var(--secondary)" fillOpacity=".8" stroke="var(--muted-foreground)" points="48,32 80,50 80,68 48,50" vectorEffect="non-scaling-stroke" /><polygon fill="var(--secondary)" fillOpacity=".8" stroke="var(--muted-foreground)" points="112,32 80,50 80,68 112,50" vectorEffect="non-scaling-stroke" /><polyline stroke="var(--foreground)" points="80,14 112,32 80,50 48,32 80,14" vectorEffect="non-scaling-stroke" /></g><g data-a="dashes"><line stroke="var(--muted-foreground)" x1="64" y1="76" x2="64" y2="96" strokeDasharray="3 5" vectorEffect="non-scaling-stroke" /><line stroke="var(--muted-foreground)" x1="96" y1="76" x2="96" y2="96" strokeDasharray="3 5" vectorEffect="non-scaling-stroke" /></g><g data-a="diamond"><polygon fill="var(--secondary)" fillOpacity=".8" stroke="var(--muted-foreground)" points="80,104 122,126 80,148 38,126" vectorEffect="non-scaling-stroke" /><polyline stroke="var(--foreground)" points="80,104 122,126 80,148 38,126 80,104" vectorEffect="non-scaling-stroke" /></g></g></svg></div>;
}

function Build({ visible }: { visible: boolean }) {
    const reducedMotion = useMedia("(prefers-reduced-motion: reduce)");
    const [tab, setTab] = useState("compute");
    const [tabVisible, setTabVisible] = useState(true);
    const tabFrameRef = useRef<number | null>(null);
    const setUnitTab = (value: string) => {
        if (value === tab) return;
        if (tabFrameRef.current !== null) cancelAnimationFrame(tabFrameRef.current);
        setTab(value);
        setTabVisible(false);
        tabFrameRef.current = requestAnimationFrame(() => {
            tabFrameRef.current = requestAnimationFrame(() => {
                setTabVisible(true);
                tabFrameRef.current = null;
            });
        });
    };
    useEffect(
        () => () => {
            if (tabFrameRef.current !== null) cancelAnimationFrame(tabFrameRef.current);
        },
        [],
    );
    const tabContentStyle = {
        opacity: tabVisible ? 1 : 0,
        transform: reducedMotion || tabVisible ? "none" : "translateY(8px)",
        transition: reducedMotion ? "opacity .2s ease" : "opacity .24s cubic-bezier(.23,1,.32,1), transform .24s cubic-bezier(.23,1,.32,1)",
    };
    return (
        <section id="build" className="bf-section">
            <div className="bf-container">
                <div className={`bf-reveal ${visible ? "visible" : ""}`}>
                    <span className="bf-kicker">03 · BACKEND UNITS</span>
                    <h2 className="bf-title wrap">BaaSForge creates your backend <span className="bf-muted">with Units.</span></h2>
                    <p className="bf-section-copy">Based on the backend behavior you describe, BaaSForge intelligently arranges the right units and builds your APIs from these building blocks.</p>
                </div>
                <Tabs value={tab} onValueChange={setUnitTab} className="mt-12">
                    <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
                        <TabsList className="bf-tabs-list">
                            <TabsTrigger value="compute" className="bf-tabs-trigger w-[160px]">
                                <svg viewBox="0 0 24 24" className="size-[15px] shrink-0" stroke="currentColor" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <rect x="7" y="7" width="10" height="10" rx="2" />
                                    <path d="M9.5 2v3M14.5 2v3M9.5 19v3M14.5 19v3M2 9.5h3M2 14.5h3M19 9.5h3M19 14.5h3" />
                                    <path d="M10 12h4" />
                                </svg>
                                Compute
                            </TabsTrigger>
                            <TabsTrigger value="storage" className="bf-tabs-trigger w-[120px]">
                                <svg viewBox="0 0 24 24" className="size-[15px] shrink-0" stroke="currentColor" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <ellipse cx="12" cy="6" rx="7" ry="3" />
                                    <path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6" />
                                    <path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" />
                                </svg>
                                Storage
                            </TabsTrigger>
                        </TabsList>
                    </div>
                    <TabsContent value="compute" style={tabContentStyle}>
                        <div className="bf-unit-grid compute">{COMPUTE_UNITS.map((unit) => <UnitCard key={unit.title} unit={unit} />)}</div>
                    </TabsContent>
                    <TabsContent value="storage" style={tabContentStyle}>
                        <div className="bf-unit-grid storage">{STORAGE_UNITS.map((unit) => <UnitCard key={unit.title} unit={unit} />)}</div>
                    </TabsContent>
                </Tabs>
            </div>
        </section>
    );
}

function UnitCard({ unit }: { unit: Unit }) {
    return <div className="bf-unit-card"><Card className="h-full shadow-none"><CardContent className="flex h-[176px] flex-col px-6 pb-3"><div className="mb-[18px] flex items-start justify-between"><div className="flex size-[46px] items-center justify-center rounded-md border bg-secondary"><UnitIcon kind={unit.icon} /></div>{unit.status && <Badge variant="secondary" className="rounded-md">{unit.status}</Badge>}</div><h3 className="mb-2 text-[19px] font-semibold tracking-[-.02em]">{unit.title}</h3><p className="m-0 text-[14.5px] leading-[1.55] text-muted-foreground">{unit.desc}</p></CardContent></Card></div>;
}

function UseCases({ visible }: { visible: boolean }) {
    const sectionRef = useRef<HTMLElement | null>(null);
    const resetFrameRef = useRef<number | null>(null);
    const items = useMemo(() => [...PHRASES, ...PHRASES, ...PHRASES], []);
    const reducedMotion = useMedia("(prefers-reduced-motion: reduce)");
    const [index, setIndex] = useState(PHRASES.length);
    const [jump, setJump] = useState(false);
    const [inView, setInView] = useState(false);
    const [pageVisible, setPageVisible] = useState(() => typeof document === "undefined" || document.visibilityState === "visible");

    const resetLoop = useCallback(() => {
        setJump(true);
        setIndex((current) => (current >= PHRASES.length * 2 ? current - PHRASES.length : current));
        resetFrameRef.current = requestAnimationFrame(() => {
            resetFrameRef.current = requestAnimationFrame(() => {
                setJump(false);
                resetFrameRef.current = null;
            });
        });
    }, []);

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;
        const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: "120px 0px", threshold: 0.08 });
        observer.observe(section);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const onVisibilityChange = () => setPageVisible(document.visibilityState === "visible");
        document.addEventListener("visibilitychange", onVisibilityChange);
        return () => document.removeEventListener("visibilitychange", onVisibilityChange);
    }, []);

    useEffect(() => {
        if (reducedMotion || !visible || !inView || !pageVisible || jump) return;
        const timer = window.setTimeout(() => {
            setIndex((current) => current + 1);
        }, 2300);
        return () => window.clearTimeout(timer);
    }, [inView, index, jump, pageVisible, reducedMotion, visible]);

    useEffect(() => {
        if (reducedMotion || jump || index < PHRASES.length * 2) return;
        const fallback = window.setTimeout(resetLoop, 1050);
        return () => window.clearTimeout(fallback);
    }, [index, jump, reducedMotion, resetLoop]);

    useEffect(() => () => {
        if (resetFrameRef.current !== null) cancelAnimationFrame(resetFrameRef.current);
    }, []);

    const onTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
        if (event.target !== event.currentTarget || event.propertyName !== "transform" || index < PHRASES.length * 2) return;
        resetLoop();
    };

    return <section ref={sectionRef} id="usecases" className="bf-section"><div className="bf-container"><div className={`bf-reveal ${visible ? "visible" : ""}`}><span className="bf-kicker">04 · WHAT BUILDERS SHIP</span><h2 className="bf-title wrap"><span className="whitespace-nowrap">The top builders use</span> <span className="whitespace-nowrap"><span className="bf-muted">BaaSForge</span> for:</span></h2></div><div className={`bf-carousel mt-11 bf-reveal ${visible ? "visible" : ""}`} role="region" aria-label="BaaSForge use cases"><div className="bf-carousel-track" onTransitionEnd={onTransitionEnd} style={{ transform: `translateY(calc(190px - 30px - ${index * 60}px))`, transition: jump ? "none" : undefined }}>{items.map((item, itemIndex) => { const distance = Math.abs(itemIndex - index); const opacity = distance === 0 ? 1 : distance === 1 ? 0.68 : distance === 2 ? 0.58 : 0.52; return <div key={`${item}-${itemIndex}`} className="bf-carousel-item" aria-hidden={distance !== 0} style={{ opacity, color: "var(--foreground)", transition: jump ? "none" : undefined }}>{item}</div>; })}</div></div></div></section>;
}

function Category({ visible }: { visible: boolean }) {
    return <section id="category" className="bf-section alt"><div className="bf-container"><div className={`bf-reveal ${visible ? "visible" : ""}`}><span className="bf-kicker">05 · THE BAASFORGE EDGE</span><h2 className="bf-title wrap">Why builders choose <span className="bf-muted">BaaSForge.</span></h2></div><div className={`mt-11 flex flex-col border-t bf-reveal ${visible ? "visible" : ""}`}>{MOATS.map(([title, desc]) => <div key={title} className="bf-moat"><span className="shrink-0 text-[19.5px] tracking-[-.01em]"><span className="mr-2.5 inline-block size-1.5 rounded-full bg-foreground align-middle" />{title}</span><span className="text-[15px] font-normal leading-[1.5] text-muted-foreground">{desc}</span></div>)}</div></div></section>;
}

function Debug({ visible }: { visible: boolean }) {
    const ref = useRef<HTMLDivElement | null>(null);
    const reducedMotion = useMedia("(prefers-reduced-motion: reduce)");
    const [started, setStarted] = useState(false);
    const [text, setText] = useState("");
    useEffect(() => {
        const element = ref.current;
        if (!element) return;
        const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && setStarted(true)), { threshold: 0.5 });
        observer.observe(element);
        return () => observer.disconnect();
    }, []);
    useEffect(() => {
        if (!started) return;
        if (reducedMotion) {
            const frame = requestAnimationFrame(() => setText(DEBUG_TEXT));
            return () => cancelAnimationFrame(frame);
        }
        let index = 0;
        let timer = 0;
        const typeNext = () => {
            index += 1;
            setText(DEBUG_TEXT.slice(0, index));
            if (index >= DEBUG_TEXT.length) return;
            timer = window.setTimeout(typeNext, 26);
        };
        timer = window.setTimeout(typeNext, 620);
        return () => window.clearTimeout(timer);
    }, [reducedMotion, started]);
    const needle = text.indexOf("charge.worker");
    const pre = needle === -1 ? text : text.slice(0, needle);
    const mid = needle === -1 ? "" : "charge.worker";
    const post = needle === -1 ? "" : text.slice(needle + mid.length);
    return <section id="debug" className="bf-section"><div className="bf-container"><div className={`bf-debug-grid bf-reveal ${visible ? "visible" : ""}`}><div><span className="bf-kicker">06 · NO-PAGER MODE</span><h2 className="bf-title">Built for your <span className="bf-muted">freedom.</span></h2><p className="mt-[22px] max-w-[620px] text-[17px] leading-[1.6] text-muted-foreground">BaaSForge is the support behind you. Even when things go wrong, it traces production, catches the failure, and clears the mess — before your users ever find out.</p></div><div ref={ref} className={`bf-debug-card ${started ? "live" : ""}`}><div className="flex items-center gap-2 border-b px-4 py-3 font-mono text-xs text-muted-foreground"><span className="size-1.5 rounded-full bg-foreground" style={{ animation: started ? "pulseDot 1.8s ease-in-out infinite" : "none" }} />observability · trace #4471</div><div className="flex flex-col gap-3 p-4"><div className="bf-debug-query max-w-[78%] self-end rounded-[12px_12px_2px_12px] bg-foreground px-3.5 py-2.5 text-[13.5px] leading-[1.5] text-background">Why did checkout fail at 14:22?</div><div className="bf-debug-response grid max-w-[92%] self-start rounded-[2px_12px_12px_12px] border bg-secondary px-3.5 py-3 font-mono text-[13px] leading-[1.6] text-secondary-foreground"><span aria-hidden="true" className="invisible col-start-1 row-start-1">{DEBUG_TEXT}</span><span className="col-start-1 row-start-1">{pre}<span className="font-semibold text-foreground">{mid}</span>{post}{text.length > 0 && text.length < DEBUG_TEXT.length && <span className="inline-block h-3.5 w-[7px] animate-[pulseDot_1.4s_ease-in-out_infinite] bg-foreground align-[-2px]" />}</span></div></div></div></div></div></section>;
}

function Close() {
    return <section className="relative overflow-hidden border-t py-[130px] text-center"><div className="bf-glow" /><div className="bf-container relative"><h2 className="m-0 whitespace-nowrap bg-gradient-to-b from-foreground to-muted-foreground bg-clip-text text-[clamp(40px,7.5vw,90px)] font-bold leading-[1.05] tracking-[-.05em] text-transparent">Build Backend.</h2><div className="mt-[34px] flex justify-center gap-3.5"><Magnetic to="/docs" variant="secondary">Go to docs</Magnetic><Magnetic to={LOGIN_PATH} variant="primary">Start building</Magnetic></div><p className="mt-[26px] font-mono text-[13px] text-muted-foreground">Start Building Your Backend Today</p></div></section>;
}

function Footer() {
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
                                    <li><Link className="bf-footer-link" to="/pricing" reloadDocument>Pricing</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h2 className="bf-footer-column-title">Resources</h2>
                                <ul className="bf-footer-list">
                                    <li><a className="bf-footer-link" href="/docs">Docs</a></li>
                                </ul>
                            </div>
                            <div>
                                <h2 className="bf-footer-column-title">Social</h2>
                                <ul className="bf-footer-list">
                                    <li>
                                        <a className="bf-footer-link" href="https://www.linkedin.com/company/baasforge/" target="_blank" rel="noreferrer" aria-label="BaaSForge on LinkedIn">
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
                            <Link className="bf-footer-link" to="/privacy-policy" reloadDocument>Privacy</Link>
                            <Link className="bf-footer-link" to="/terms-of-use" reloadDocument>Terms</Link>
                            <button type="button" className="bf-footer-link" onClick={() => openCookieSettings()}>Cookies</button>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function UnitIcon({ kind }: { kind: UnitKind }) {
    const props = { className: "size-[21px]", fill: "none", stroke: "var(--foreground)", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
    if (kind === "api") return <svg viewBox="0 0 24 24" {...props}><path d="M8 8l-4 4 4 4" /><path d="M16 8l4 4-4 4" /><path d="M14 5l-4 14" /></svg>;
    if (kind === "workflow") return <svg viewBox="0 0 24 24" {...props}><rect x="4" y="4" width="4" height="4" rx="1" /><rect x="16" y="10" width="4" height="4" rx="1" /><rect x="4" y="16" width="4" height="4" rx="1" /><path d="M8 6h3.5a4.5 4.5 0 0 1 4.3 3.2" /><path d="M16 13.5a4.5 4.5 0 0 1-4.5 4.5H8" /><path d="M13.8 7.6l2 1.7-2 1.7" /></svg>;
    if (kind === "queue") return <svg viewBox="0 0 24 24" {...props}><path d="M5 6h14" /><path d="M5 12h14" /><path d="M5 18h10" /><path d="M17 16l2 2-2 2" /></svg>;
    if (kind === "actor") return <svg viewBox="0 0 24 24" {...props}><rect x="4" y="4" width="16" height="16" rx="3.5" /><circle cx="12" cy="10" r="2.3" /><path d="M8.5 16c.7-2 2-3 3.5-3s2.8 1 3.5 3" /></svg>;
    if (kind === "sql") return <svg viewBox="0 0 24 24" {...props}><ellipse cx="12" cy="5.5" rx="7" ry="3" /><path d="M5 5.5v9c0 1.7 3.1 3 7 3s7-1.3 7-3v-9" /><path d="M5 10c0 1.7 3.1 3 7 3s7-1.3 7-3" /><path d="M8.5 20h7" /><path d="M12 17.5V20" /></svg>;
    if (kind === "graph") return <svg viewBox="0 0 24 24" {...props}><circle cx="7" cy="7" r="2.2" /><circle cx="17" cy="7" r="2.2" /><circle cx="6" cy="17" r="2.2" /><circle cx="18" cy="17" r="2.2" /><path d="M9.1 7h5.8M7 9.2v5.6M17 9.2l1 5.6M8 15.5l7.5-7" /><path d="M8.2 17h7.6" /></svg>;
    if (kind === "record") return <svg viewBox="0 0 24 24" {...props}><rect x="5" y="4" width="14" height="16" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></svg>;
    if (kind === "object") return <svg viewBox="0 0 24 24" {...props}><path d="M5 8.5h14l-1.2 10A2 2 0 0 1 15.8 20H8.2a2 2 0 0 1-2-1.5L5 8.5Z" /><path d="M8 8.5V6.8A2.8 2.8 0 0 1 10.8 4h2.4A2.8 2.8 0 0 1 16 6.8v1.7" /><path d="M9 12h6" /><path d="M9 15h4" /></svg>;
    if (kind === "vector") return <svg viewBox="0 0 24 24" {...props}><path d="M5 19V5" /><path d="M5 19h14" /><circle cx="9" cy="15" r="1.4" fill="var(--foreground)" stroke="none" /><circle cx="13" cy="10" r="1.4" fill="var(--foreground)" stroke="none" /><circle cx="17" cy="7" r="1.4" fill="var(--foreground)" stroke="none" /><path d="M9 15l4-5 4-3" /><path d="M8 8l2.2 1.4M15 15l-2.2-1.4" opacity=".45" /></svg>;
    return <svg viewBox="0 0 24 24" {...props}><rect x="4" y="5" width="7" height="6" rx="1.5" /><rect x="13" y="5" width="7" height="6" rx="1.5" /><rect x="8.5" y="14" width="7" height="6" rx="1.5" /><path d="M11 8h2" /><path d="M12 11v3" /><path d="M8.5 17H7a3 3 0 0 1-3-3v-1" /><path d="M15.5 17H17a3 3 0 0 0 3-3v-1" /></svg>;
}

export default function HomePage() {
    const compact = useMedia("(max-width: 1024px)");
    const active = useActiveSection();
    const visible = useReveal(["what", "how", "build", "usecases", "category", "debug"]);
    return (
        <div className="bf-page midnight">
            <HomePageSeo />
            <Styles />
            <Navbar active={active} />
            <SectionRail active={active} />
            <main>
                <Hero />
                <What visible={!!visible.what} compact={compact} />
                <How visible={!!visible.how} />
                <Build visible={!!visible.build} />
                <UseCases visible={!!visible.usecases} />
                <Category visible={!!visible.category} />
                <Debug visible={!!visible.debug} />
                <Close />
            </main>
            <Footer />
        </div>
    );
}

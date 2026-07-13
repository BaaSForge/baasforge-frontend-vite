import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AppLogoSquare } from "@/components/logo/app-logo-square";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Menu, X } from "lucide-react";
import { type RefObject, type TransitionEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

type UnitKind = "api" | "workflow" | "queue" | "actor" | "sql" | "graph" | "record" | "object" | "vector" | "common";
type StepPhase = { sel: string; prop: "strokeDashoffset" | "opacity"; from: number; to: number; t0: number; t1: number };
type RuntimeStepPhase = StepPhase & { el: SVGElement; startVal?: number };

const LOGIN_PATH = "/login";
const PHRASES = ["Mock APIs", "Payment workflows", "Approval flows", "Subscription logic", "Background jobs", "Stateful entities", "AI agent orchestration", "Tenant onboarding", "Multi-step sagas"];
const NAV_LINKS = [
    { href: "#what", id: "product", label: "Product", sections: ["what"] },
    { href: "#how", id: "how", label: "How it works", sections: ["how"] },
    { href: "#build", id: "units", label: "Units", sections: ["build"] },
    { href: "#usecases", id: "use-cases", label: "Use cases", sections: ["usecases"] },
    { href: "#category", id: "why", label: "Why BaaSForge", sections: ["category"] },
    { href: "#debug", id: "reliability", label: "Reliability", sections: ["debug"] },
] as const;
type NavId = (typeof NAV_LINKS)[number]["id"];
const OBSERVED_SECTION_IDS = NAV_LINKS.flatMap((link) => link.sections);
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
    const [matches, setMatches] = useState(() => (typeof matchMedia === "undefined" ? false : matchMedia(query).matches));
    useEffect(() => {
        if (typeof matchMedia === "undefined") return;
        const media = matchMedia(query);
        const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);
        media.addEventListener("change", onChange);
        return () => media.removeEventListener("change", onChange);
    }, [query]);
    return matches;
}

function getNavIdForSection(sectionId: string): NavId {
    return NAV_LINKS.find((link) => link.sections.some((id) => id === sectionId))?.id ?? "product";
}

function useActiveSection() {
    const [active, setActive] = useState<NavId>("product");
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
            setActive(current ? getNavIdForSection(current) : "product");
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
    const [visible, setVisible] = useState<Record<string, boolean>>({});
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

function useMagnet(ref: RefObject<HTMLElement | null>) {
    useEffect(() => {
        const el = ref.current;
        if (!el || typeof matchMedia === "undefined" || !matchMedia("(hover:hover) and (pointer:fine)").matches) return;
        let tx = 0;
        let ty = 0;
        let cx = 0;
        let cy = 0;
        let raf = 0;
        const tick = () => {
            cx += (tx - cx) * 0.18;
            cy += (ty - cy) * 0.18;
            el.style.transform = `translate(${cx}px, ${cy}px)`;
            raf = requestAnimationFrame(tick);
        };
        const move = (event: MouseEvent) => {
            const rect = el.getBoundingClientRect();
            tx = (event.clientX - rect.left - rect.width / 2) * 0.28;
            ty = (event.clientY - rect.top - rect.height / 2) * 0.32;
        };
        const leave = () => {
            tx = 0;
            ty = 0;
        };
        raf = requestAnimationFrame(tick);
        el.addEventListener("mousemove", move);
        el.addEventListener("mouseleave", leave);
        return () => {
            cancelAnimationFrame(raf);
            el.removeEventListener("mousemove", move);
            el.removeEventListener("mouseleave", leave);
        };
    }, [ref]);
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

function useStepHoverAnimations(ref: RefObject<HTMLElement | null>) {
    useEffect(() => {
        const container = ref.current;
        if (!container) return;
        const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
        const activeAnims: ({ phases: RuntimeStepPhase[]; cancel: () => void } | null)[] = [null, null, null];
        const activeSettles: (((() => void) | null))[] = [null, null, null];

        const settlePhases = (phases: RuntimeStepPhase[]) => {
            const settleDuration = 320;
            const startPhases = phases.map((phase) => ({ ...phase, startVal: readSvgValue(phase) }));
            let raf = 0;
            const start = performance.now();
            const tick = (now: number) => {
                const t = Math.min((now - start) / settleDuration, 1);
                const eased = easeInOut(t);
                startPhases.forEach((phase) => setSvgValue(phase.el, phase.prop, (phase.startVal ?? phase.to) + (phase.to - (phase.startVal ?? phase.to)) * eased));
                if (t < 1) raf = requestAnimationFrame(tick);
                else startPhases.forEach((phase) => clearSvgValue(phase.el, phase.prop));
            };
            raf = requestAnimationFrame(tick);
            return () => cancelAnimationFrame(raf);
        };

        const runStepAnim = (div: Element, def: { duration: number; phases: StepPhase[] }) => {
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
                    if (tMain < 1) raf = requestAnimationFrame(mainTick);
                    else phases.forEach((phase) => clearSvgValue(phase.el, phase.prop));
                };
                raf = requestAnimationFrame(mainTick);
            };
            raf = requestAnimationFrame(preTick);
            return { phases, cancel: () => cancelAnimationFrame(raf) };
        };

        const stepDivs = [...container.querySelectorAll("[data-step-anim]")];
        const cleanups = stepDivs.flatMap((div, index) => {
            const def = STEP_ANIMS[index];
            if (!def) return [];
            const enter = () => {
                activeSettles[index]?.();
                activeSettles[index] = null;
                activeAnims[index]?.cancel();
                activeAnims[index] = runStepAnim(div, def);
            };
            const leave = () => {
                const active = activeAnims[index];
                if (!active) return;
                active.cancel();
                activeAnims[index] = null;
                activeSettles[index] = settlePhases(active.phases);
            };
            div.addEventListener("mouseenter", enter);
            div.addEventListener("mouseleave", leave);
            return [() => div.removeEventListener("mouseenter", enter), () => div.removeEventListener("mouseleave", leave)];
        });
        return () => {
            cleanups.forEach((cleanup) => cleanup());
            activeAnims.forEach((anim) => anim?.cancel());
            activeSettles.forEach((settle) => settle?.());
        };
    }, [ref]);
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
            const lineWidth = ctx.measureText("We built the Backend platform").width;
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
            html { scroll-behavior: smooth; }
            .bf-page{--font-sans:"Geist",ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;--font-heading:var(--font-sans);--font-mono:"Geist Mono",ui-monospace,SFMono-Regular,"SF Mono",Menlo,Consolas,"Liberation Mono",monospace;--radius:0.625rem;--radius-sm:calc(var(--radius)*.6);--radius-md:calc(var(--radius)*.8);--radius-lg:var(--radius);--radius-xl:calc(var(--radius)*1.4);--radius-full:9999px;--background:oklch(1 0 0);--foreground:oklch(0% 0 0);--card:oklch(1 0 0);--card-foreground:oklch(0% 0 0);--popover:oklch(1 0 0);--popover-foreground:oklch(0% 0 0);--primary:oklch(0% 0 0);--primary-foreground:oklch(.985 0 0);--secondary:oklch(.97 0 0);--secondary-foreground:oklch(.205 0 0);--muted:oklch(.97 0 0);--muted-foreground:oklch(.556 0 0);--accent:oklch(.97 0 0);--accent-foreground:oklch(.205 0 0);--destructive:oklch(.577 .245 27.325);--destructive-foreground:oklch(.97 .01 17);--border:oklch(.922 0 0);--input:oklch(.922 0 0);--ring:oklch(.708 0 0);--surface:oklch(.98 0 0);--surface-foreground:var(--foreground);--code:var(--surface);--code-foreground:var(--surface-foreground);--code-highlight:oklch(.96 0 0);--code-number:oklch(.56 0 0);--selection:oklch(0% 0 0);--selection-foreground:oklch(1 0 0);--shadow-xs:0 1px 2px 0 rgb(0 0 0 / .05);--shadow-sm:0 1px 3px 0 rgb(0 0 0 / .1),0 1px 2px -1px rgb(0 0 0 / .1);--shadow-md:0 4px 6px -1px rgb(0 0 0 / .1),0 2px 4px -2px rgb(0 0 0 / .1);--shadow-lg:0 10px 15px -3px rgb(0 0 0 / .1),0 4px 6px -4px rgb(0 0 0 / .1);--alt-bg:oklch(.97 0 0);--glow-rgb:0,0,0;--accent-glow:oklch(0.65 0.02 260);font-family:var(--font-sans);line-height:1.5;background:var(--background);color:var(--foreground);min-height:100vh;overflow-x:hidden;transition:background .4s ease,color .4s ease}
            .bf-page.dark{--background:oklch(.145 0 0);--foreground:oklch(.985 0 0);--card:oklch(.205 0 0);--card-foreground:oklch(.985 0 0);--popover:oklch(.205 0 0);--popover-foreground:oklch(.985 0 0);--primary:oklch(.922 0 0);--primary-foreground:oklch(.205 0 0);--secondary:oklch(.269 0 0);--secondary-foreground:oklch(.985 0 0);--muted:oklch(.269 0 0);--muted-foreground:oklch(.708 0 0);--accent:oklch(.371 0 0);--accent-foreground:oklch(.985 0 0);--destructive:oklch(.704 .191 22.216);--destructive-foreground:oklch(.58 .22 27);--border:oklch(1 0 0 / 10%);--input:oklch(1 0 0 / 15%);--ring:oklch(.556 0 0);--surface:oklch(.2 0 0);--surface-foreground:oklch(.708 0 0);--code:var(--surface);--code-foreground:var(--surface-foreground);--code-highlight:oklch(.27 0 0);--code-number:oklch(.72 0 0);--selection:oklch(.922 0 0);--selection-foreground:oklch(.205 0 0);--alt-bg:oklch(.08 0 0);--glow-rgb:255,255,255;--accent-glow:oklch(0.9 0.01 260)}
            .bf-page.midnight{--background:oklch(0.17 0.032 264);--foreground:oklch(0.96 0.012 260);--card:oklch(0.21 0.034 264);--card-foreground:oklch(0.96 0.012 260);--popover:oklch(0.21 0.034 264);--popover-foreground:oklch(0.96 0.012 260);--primary:oklch(0.74 0.15 260);--primary-foreground:oklch(0.15 0.03 264);--secondary:oklch(0.27 0.038 264);--secondary-foreground:oklch(0.96 0.012 260);--muted:oklch(0.25 0.034 264);--muted-foreground:oklch(0.67 0.03 260);--accent:oklch(0.31 0.045 264);--accent-foreground:oklch(0.96 0.012 260);--border:oklch(1 0 0 / 12%);--input:oklch(1 0 0 / 16%);--ring:oklch(0.56 0.06 260);--alt-bg:oklch(.14 .03 264);--glow-rgb:145,175,255;--accent-glow:oklch(0.68 0.12 260)}
            .bf-page.dense{--alt-bg:oklch(.08 0 0);--glow-rgb:255,255,255;--accent-glow:oklch(0.9 0.01 260)}
            .bf-page ::selection{background:var(--selection);color:var(--selection-foreground)}.bf-page a{color:inherit;text-decoration:none}.bf-container{max-width:1080px;margin:0 auto;padding:0 28px}
            .bf-logo{display:flex;align-items:center;gap:10px;font-size:16px;font-weight:600;letter-spacing:-.02em;color:var(--foreground)}
            .bf-nav{position:fixed;inset:0 0 auto;z-index:100;background:transparent;backdrop-filter:blur(14px);border-bottom:1px solid transparent}
            .bf-hero{position:relative;min-height:100svh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:clamp(36px,6svh,86px);text-align:center;overflow:hidden;padding:calc(68px + clamp(32px,6svh,88px)) 24px clamp(32px,7svh,84px);background:var(--background)}
            .bf-hero-title-wrap{position:relative;width:100%;perspective:800px}.bf-hero h1{position:relative;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:clamp(22px,4svh,72px);max-width:1400px;margin:0 auto;color:var(--foreground);font-size:clamp(72px,min(12.8vw,19svh),210px);font-weight:700;letter-spacing:-.07em;line-height:.82}
            .bf-char{display:inline-block;opacity:0;filter:blur(10px);transform:translateY(18px);animation:blurFocus .6s cubic-bezier(.16,1,.3,1) forwards}.bf-hero-support{position:relative;display:flex;flex-direction:column;align-items:center;gap:clamp(22px,3.2svh,34px)}.bf-copy{max-width:560px;margin:0;color:var(--foreground);font-size:clamp(20px,min(2.2vw,3.8svh),22px);line-height:1.45;animation:blurFocus .6s cubic-bezier(.16,1,.3,1) .5s both}.bf-actions{display:flex;gap:14px;align-items:center;justify-content:center;flex-wrap:wrap;animation:blurFocus .6s cubic-bezier(.16,1,.3,1) .65s both}.bf-pill{display:inline-flex;justify-content:center;border-radius:9999px;padding:14px 30px;font-size:15px;font-weight:600;will-change:transform}.bf-pill.secondary{background:var(--secondary);color:var(--secondary-foreground);border:1px solid var(--border)}.bf-pill.primary{background:var(--primary);color:var(--primary-foreground)}.bf-down{color:var(--muted-foreground);animation:blurFocus .6s cubic-bezier(.16,1,.3,1) .8s both,bob 2.2s ease-in-out 2.8s infinite}
            .bf-section{position:relative;padding:100px 0;border-top:1px solid var(--border)}.bf-section.alt{background:var(--alt-bg)}.bf-kicker{display:block;margin-bottom:22px;color:var(--muted-foreground);font-family:var(--font-mono);font-size:11.5px;letter-spacing:.08em}.bf-title{margin:0;color:var(--foreground);font-size:clamp(28px,4.4vw,46px);font-weight:600;letter-spacing:-.035em;line-height:1.05}.bf-title.wrap{line-height:1.05}.bf-muted{opacity:.55}.bf-reveal{opacity:0;transform:translateY(20px);transition:opacity .8s cubic-bezier(.16,1,.3,1),transform .8s cubic-bezier(.16,1,.3,1)}.bf-reveal.blur{filter:blur(10px);transition:opacity .8s cubic-bezier(.16,1,.3,1),transform .8s cubic-bezier(.16,1,.3,1),filter .8s cubic-bezier(.16,1,.3,1)}.bf-reveal.visible{opacity:1;transform:none}.bf-reveal.blur.visible{filter:blur(0)}
            .bf-chip-row{display:flex;gap:10px;flex-wrap:nowrap;overflow-x:auto;overflow-y:visible;margin-top:26px;margin-left:-14px;padding:10px 14px 14px}.bf-chip{display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;border-radius:9999px;border:1px solid var(--border);padding:6px 13px;color:var(--foreground);font-size:13.5px;font-weight:500;white-space:nowrap;transition:transform .5s cubic-bezier(.16,1,.3,1),border-color .6s ease,box-shadow .6s ease}.bf-chip:hover{transform:scale(1.12);border-color:var(--accent-glow);box-shadow:0 0 10px oklch(0.9 0.01 260 / .55),0 0 2px oklch(0.9 0.01 260 / .8)}
            .bf-dash{position:relative;margin-top:52px;overflow:hidden;border:1px solid var(--border);border-radius:var(--radius-xl);background:var(--card);box-shadow:var(--shadow-sm);transition:box-shadow .4s cubic-bezier(.16,1,.3,1)}.bf-dash.active{box-shadow:0 40px 120px -40px rgba(var(--glow-rgb),.22),0 0 0 1px rgba(var(--glow-rgb),.15)}.bf-dash-grid{display:grid;grid-template-columns:1fr 340px;height:500px}.bf-convo{display:flex;flex-direction:column;border-right:1px solid var(--border)}.bf-bar{display:flex;align-items:center;gap:8px;height:52px;padding:0 18px;border-bottom:1px solid var(--border)}.bf-window-dot{width:11px;height:11px;border-radius:50%;background:var(--secondary)}.bf-chat{position:relative;display:flex;flex:1;flex-direction:column;gap:14px;overflow-y:auto;padding:22px 22px 10px}.bf-empty{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;pointer-events:none;transition:opacity .5s cubic-bezier(.16,1,.3,1),transform .5s cubic-bezier(.16,1,.3,1)}.bf-msg{max-width:88%;padding:12px 15px;border-radius:12px;font-size:14px;line-height:1.55;animation:fadeUp .55s cubic-bezier(.16,1,.3,1) both}.bf-msg.user{align-self:flex-end;border:1px solid var(--border);border-bottom-right-radius:2px;background:var(--secondary);color:var(--secondary-foreground)}.bf-msg.ai{align-self:flex-start;border:1px solid var(--border);border-top-left-radius:2px;background:var(--secondary);color:var(--muted-foreground)}.bf-input{display:flex;align-items:center;gap:10px;padding:16px 18px;border-top:1px solid var(--border)}.bf-draft{display:flex;flex-direction:column;align-self:start}.bf-draft-card{border:1px solid var(--border);border-radius:var(--radius-lg);background:var(--card);padding:14px 15px;transition:all .5s cubic-bezier(.34,1.4,.64,1)}.bf-draft-backdrop{position:absolute;inset:0;z-index:199;background:rgba(0,0,0,.45);opacity:0;pointer-events:none;transition:opacity .4s ease}.bf-pulse{display:inline-flex;border-radius:var(--radius-md);animation:ctaPulse 1.8s cubic-bezier(.4,0,.6,1) infinite}.bf-toast{position:absolute;top:16px;left:50%;z-index:6;display:flex;align-items:center;gap:10px;width:max-content;max-width:420px;padding:13px 18px 13px 14px;border:1px solid var(--border);border-radius:var(--radius-lg);background:var(--popover);color:var(--foreground);box-shadow:0 10px 34px rgba(0,0,0,.45),0 2px 8px rgba(0,0,0,.3);opacity:0;pointer-events:none;transform:translate(-50%,-10px);transition:opacity .3s cubic-bezier(.16,1,.3,1),transform .3s cubic-bezier(.16,1,.3,1)}.bf-toast.visible{opacity:1;transform:translate(-50%,0)}
            .bf-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:0;margin-top:48px;position:relative}.bf-steps-line{position:absolute;top:85px;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--border) 12%,var(--border) 88%,transparent);pointer-events:none;z-index:0}.bf-step{position:relative;z-index:1;padding:0 30px;cursor:default}
            .bf-steps,.bf-unit-grid{scrollbar-width:none}.bf-steps::-webkit-scrollbar,.bf-unit-grid::-webkit-scrollbar{display:none}
            .bf-unit-grid{display:grid;gap:14px;margin-top:32px}.bf-unit-grid.compute{grid-template-columns:repeat(4,minmax(0,1fr))}.bf-unit-grid.storage{grid-template-columns:repeat(3,minmax(0,1fr))}.bf-unit-card{height:226px;border-radius:var(--radius-xl);transition:transform .6s cubic-bezier(.16,1,.3,1),box-shadow .6s cubic-bezier(.16,1,.3,1)}.bf-unit-card:hover{transform:translateY(-3px) scale(1.012);box-shadow:0 0 0 1px var(--accent-glow),0 0 10px oklch(0.9 0.01 260 / .55),0 0 2px oklch(0.9 0.01 260 / .8)}
            .bf-tabs-list{display:inline-flex;width:fit-content;align-items:center;gap:4px;border-bottom:1px solid var(--border);background:transparent;border-radius:0;height:auto;padding:0}.bf-tabs-trigger{display:inline-flex;height:40px;align-items:center;justify-content:center;gap:6px;border:0;border-bottom:2px solid transparent;border-radius:0;background:transparent!important;box-shadow:none!important;padding:8px 4px;color:var(--muted-foreground);font-size:14px;font-weight:500;white-space:nowrap;transition:color .15s ease,border-color .15s ease}.bf-tabs-trigger:hover{color:var(--foreground)}.bf-tabs-trigger[data-state="active"]{color:var(--foreground);border-bottom-color:var(--foreground);background:transparent!important;box-shadow:none!important}
            .bf-carousel{position:relative;width:100%;height:380px;overflow:hidden}.bf-carousel-track{position:absolute;top:0;left:0;width:100%;transition:transform .9s cubic-bezier(.65,0,.35,1)}.bf-carousel-item{height:60px;display:flex;align-items:center;font-size:clamp(22px,3vw,32px);font-weight:600;letter-spacing:-.01em;transition:color .8s ease,opacity .8s ease}.bf-moat{display:flex;align-items:baseline;gap:6px 14px;flex-wrap:wrap;padding:20px 4px;border-bottom:1px solid var(--border);font-weight:600;transform-origin:left center;transition:background .3s,transform .5s,font-weight .5s}.bf-moat:hover{background:color-mix(in oklch,var(--foreground) 4%,transparent);transform:scale(1.05);font-weight:800}.bf-debug-grid{display:grid;grid-template-columns:1fr 1fr;gap:50px;align-items:center}.bf-debug-card{overflow:hidden;border:1px solid var(--border);border-radius:var(--radius-lg);background:var(--card);box-shadow:var(--shadow-sm);transition:border-color .3s,box-shadow .3s}.bf-debug-card.live{border-color:var(--foreground);box-shadow:0 0 0 1px rgba(var(--glow-rgb),.15),0 30px 80px -30px rgba(var(--glow-rgb),.2)}.bf-glow{position:absolute;left:50%;bottom:-220px;width:1000px;height:560px;transform:translateX(-50%);background:radial-gradient(ellipse at center,color-mix(in oklch,var(--foreground) 16%,transparent),transparent 62%);pointer-events:none;filter:blur(24px);animation:glowPulse 5s ease-in-out infinite}.bf-footer{position:relative;border-top:1px solid var(--border);padding:38px 0 42px;background:var(--background)}.bf-footer-inner{display:flex;align-items:center;justify-content:space-between;gap:24px}.bf-footer-brand{max-width:420px}.bf-footer-copy{margin:12px 0 0;color:var(--muted-foreground);font-size:13px;line-height:1.65}.bf-footer-mark{color:var(--muted-foreground);font-family:var(--font-mono);font-size:12.5px;line-height:1.4;white-space:nowrap}
            @keyframes blurFocus{from{opacity:0;filter:blur(10px);transform:translateY(18px)}to{opacity:1;filter:blur(0);transform:none}}@keyframes themeIconIn{from{opacity:0;transform:scale(.7) rotate(-90deg);filter:blur(4px)}to{opacity:1;transform:scale(1) rotate(0deg);filter:blur(0)}}@keyframes menuIn{from{opacity:0;transform:translateY(-6px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(6px)}}@keyframes blink{0%,50%{opacity:1}51%,100%{opacity:0}}@keyframes pulseDot{0%,100%{opacity:1}50%{opacity:.35}}@keyframes ctaPulse{0%{box-shadow:0 0 0 0 oklch(0.9 0.01 260 / .55)}70%{box-shadow:0 0 0 9px oklch(0.9 0.01 260 / 0)}100%{box-shadow:0 0 0 0 oklch(0.9 0.01 260 / 0)}}@keyframes glowPulse{0%,100%{opacity:.7;transform:translateX(-50%) scale(1)}50%{opacity:1;transform:translateX(-50%) scale(1.06)}}
            @media(max-width:1024px){.bf-hero{gap:clamp(42px,7svh,78px);padding:calc(68px + 56px) 24px 48px}.bf-title.wrap{line-height:1.35}.bf-dash-grid{grid-template-columns:1fr;height:auto}.bf-convo{height:500px;border-right:0;border-bottom:1px solid var(--border)}.bf-draft{position:absolute;top:0;right:0;bottom:0;width:min(88vw,380px);z-index:200;align-self:initial;overflow-y:auto;background:var(--card);border-left:1px solid var(--border);transition:transform .5s cubic-bezier(.16,1,.3,1),box-shadow .5s ease}.bf-steps{display:flex;gap:16px;margin-top:40px;overflow-x:auto;padding-bottom:10px;scroll-snap-type:x proximity;-webkit-overflow-scrolling:touch}.bf-unit-grid.compute,.bf-unit-grid.storage{display:flex;gap:14px;margin-top:18px;margin-left:-14px;margin-right:-14px;overflow-x:auto;padding:14px 14px 22px;scroll-padding-left:14px;scroll-snap-type:x proximity;scroll-behavior:smooth;-webkit-overflow-scrolling:touch}.bf-step,.bf-unit-card{min-width:300px;max-width:300px;flex:0 0 300px;scroll-snap-align:start}.bf-unit-card{scroll-snap-stop:always}.bf-step{border:1px solid var(--border);border-radius:var(--radius-xl);background:var(--card);box-shadow:var(--shadow-sm);padding:26px 22px}.bf-steps-line{display:none}.bf-moat{align-items:flex-start;flex-direction:column}}@media(max-width:640px){.bf-container{padding:0 20px}.bf-hero{min-height:100svh;justify-content:center;gap:clamp(44px,8svh,72px);padding:calc(68px + 44px) 20px 38px}.bf-hero h1{font-size:clamp(54px,18vw,92px);gap:clamp(12px,4vw,22px);line-height:.86}.bf-copy{max-width:360px;font-size:clamp(22px,5.6vw,28px);line-height:1.45}.bf-actions{width:100%;max-width:610px;flex-wrap:nowrap;gap:14px}.bf-pill{flex:1 1 0;align-items:center;min-height:56px;padding:14px 18px}.bf-down{margin-top:0}.bf-dash{margin-left:-8px;margin-right:-8px}.bf-debug-grid{grid-template-columns:1fr;gap:32px}.bf-footer{padding:34px 0 36px}.bf-footer-inner{align-items:flex-start;flex-direction:column;gap:22px}.bf-footer-brand{max-width:100%}.bf-footer-mark{white-space:normal}}@media(max-width:380px){.bf-actions{flex-wrap:wrap}.bf-pill{flex-basis:100%}}@media(prefers-reduced-motion:reduce){.bf-page *{animation:none!important;transition:none!important}}
        `}</style>
    );
}

function Magnetic({ to, variant, children }: { to: string; variant: "primary" | "secondary"; children: string }) {
    const ref = useRef<HTMLAnchorElement | null>(null);
    useMagnet(ref);
    const className = `bf-pill ${variant}`;
    return to.startsWith("/") ? (
        <Link ref={ref} to={to} className={className}>
            {children}
        </Link>
    ) : (
        <a ref={ref} href={to} className={className}>
            {children}
        </a>
    );
}

function Brand() {
    return (
        <Link to="/" className="bf-logo">
            <AppLogoSquare className="size-[22px]" />
            BaaSForge
        </Link>
    );
}

function Navbar({ active, compact }: { active: NavId; compact: boolean }) {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <>
            <nav className="bf-nav">
                <div className="mx-auto flex h-[68px] max-w-[1080px] items-center justify-between px-7">
                    <Brand />
                    <div className="hidden gap-5 text-sm xl:flex">
                        {NAV_LINKS.map((link) => (
                            <a key={link.label} href={link.href} aria-current={active === link.id ? "page" : undefined} className="border-b pb-[3px]" style={{ color: active === link.id ? "var(--foreground)" : "var(--muted-foreground)", borderColor: active === link.id ? "var(--foreground)" : "transparent" }}>
                                {link.label}
                            </a>
                        ))}
                    </div>
                    <div className="flex items-center gap-3.5">
                        <div className="hidden items-center gap-3.5 xl:flex">
                            <Button variant="ghost" size="sm" asChild>
                                <Link to={LOGIN_PATH}>Sign in</Link>
                            </Button>
                            <Button size="sm" className="bg-primary hover:bg-primary/90" style={{ color: "var(--primary-foreground)" }} asChild>
                                <Link to={LOGIN_PATH}>Start building</Link>
                            </Button>
                        </div>
                        <button type="button" onClick={() => setMenuOpen((open) => !open)} className="flex size-9 items-center justify-center rounded-md border bg-card text-foreground xl:hidden" aria-label="Open menu">
                            {menuOpen ? <X className="size-[18px]" /> : <Menu className="size-[18px]" />}
                        </button>
                    </div>
                </div>
            </nav>
            {compact && (
                <>
                    <div className="fixed inset-0 z-[150] bg-black/45 transition-opacity duration-300" onClick={() => setMenuOpen(false)} style={{ opacity: menuOpen ? 1 : 0, pointerEvents: menuOpen ? "auto" : "none" }} />
                    <div
                        className="fixed bottom-0 right-0 top-0 z-[151] flex w-[min(82vw,340px)] flex-col gap-1.5 overflow-y-auto border-l bg-background px-[22px] py-5 transition-transform duration-300"
                        style={{ transform: menuOpen ? "translateX(0)" : "translateX(100%)", transition: "transform .4s cubic-bezier(.16,1,.3,1)" }}
                    >
                        <div className="mb-2.5 flex justify-end">
                            <button type="button" onClick={() => setMenuOpen(false)} className="flex size-9 items-center justify-center rounded-md border bg-card text-foreground" aria-label="Close menu">
                                <X className="size-[18px]" />
                            </button>
                        </div>
                        {NAV_LINKS.map((link) => (
                            <a key={link.label} href={link.href} aria-current={active === link.id ? "page" : undefined} onClick={() => setMenuOpen(false)} className="block border-b border-border px-0.5 py-3.5 text-[21px] font-medium" style={{ color: active === link.id ? "var(--foreground)" : "var(--muted-foreground)" }}>
                                {link.label}
                            </a>
                        ))}
                        <div className="mt-6 flex flex-col gap-3">
                            <Button variant="outline" asChild>
                                <Link to={LOGIN_PATH}>Sign in</Link>
                            </Button>
                            <Button className="bg-primary hover:bg-primary/90" style={{ color: "var(--primary-foreground)" }} asChild>
                                <Link to={LOGIN_PATH}>Start building</Link>
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}

function Hero() {
    let index = 0;
    return (
        <header className="bf-hero">
            <div className="bf-hero-title-wrap">
                <h1 aria-label="Build Backend.">
                    {"Build Backend.".split(" ").map((word) => (
                        <span key={word} className="inline-block whitespace-nowrap" aria-hidden="true">
                            {[...word].map((char) => {
                                const delay = index++ * 0.012;
                                return (
                                    <span key={`${char}-${delay}`} className="bf-char" style={{ animationDelay: `${delay}s` }}>
                                        {char}
                                    </span>
                                );
                            })}
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
                    <Magnetic to="#" variant="secondary">
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
                    <span className="bf-kicker">FIG 01 · WHAT IT IS</span>
                    <h2 ref={titleRef} className="bf-title !leading-[1.18]">
                        We built the Backend
                        <br style={{ display: fitsTwoLines ? "none" : "initial" }} /> platform
                        <br style={{ display: fitsTwoLines ? "initial" : "none" }} />{" "}
                        <span className="bf-muted">
                            we wished
                            <br style={{ display: fitsTwoLines ? "none" : "initial" }} /> we'd had
                        </span>
                    </h2>
                    <p className="mt-5 max-w-[840px] text-[clamp(20px,2.6vw,26px)] leading-[1.5] text-muted-foreground">Describe what your backend should do. AI writes it, ships it to production, and knows what's broken before your users do.</p>
                    <div className="bf-chip-row">{["AI Chat", "CI/CD", "Monitoring", "Live Debugging", "Version Control"].map((chip) => <span key={chip} className="bf-chip">{chip}</span>)}</div>
                </div>
                <Dashboard compact={compact} />
            </div>
        </section>
    );
}

function Dashboard({ compact }: { compact: boolean }) {
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
        setUnits((items) => items.map((item) => ({ ...item, live: true })));
        setDeploy("done");
    };
    return (
        <div className={`bf-dash ${active ? "active" : ""}`}>
            <div className="bf-draft-backdrop" onClick={() => setDraftOpen(false)} style={{ opacity: compact && draftOpen ? 1 : 0, pointerEvents: compact && draftOpen ? "auto" : "none" }} />
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
                                className="ml-auto inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors duration-150 hover:border-[var(--accent-glow)] hover:bg-accent hover:text-accent-foreground"
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
                        {steps.map((step) => <div key={step.text} className="flex items-center gap-2 font-mono text-[12.5px] text-muted-foreground transition-all" style={{ opacity: step.show ? 1 : 0, transform: step.show ? "none" : "translateY(4px)" }}><span className="size-1.5 rounded-full" style={{ background: step.done ? "var(--foreground)" : "var(--muted-foreground)", boxShadow: step.done ? "0 0 8px rgba(var(--glow-rgb),.5)" : "none" }} />{step.text}</div>)}
                        {reply && <div className="bf-msg ai">The core actors have been created: <b className="font-medium text-foreground">coach.profile.actor.coach</b>, <b className="font-medium text-foreground">trainee.profile.actor.trainee</b>, and <b className="font-medium text-foreground">training.plan.actor.plan</b>. Ready to review the draft units.</div>}
                    </div>
                    <div className="bf-input">
                        <div className="flex-1 font-mono text-[13px] text-muted-foreground">{message ? "Type a message, Shift+Enter for new line" : "I want to create an app for a running coach to give exercise plans to her trainees."}{!message && <span className="ml-0.5 inline-block h-3.5 w-[7px] animate-[blink_1s_steps(2)_infinite] bg-foreground align-[-2px]" />}</div>
                        <span className={!running && deploy !== "ready" && deploy !== "done" ? "bf-pulse" : "inline-flex"}><Button size="sm" onClick={send} disabled={running}>Send ↑</Button></span>
                    </div>
                </div>
                <div className="bf-draft" style={compact ? { transform: draftOpen ? "translateX(0)" : "translateX(100%)", boxShadow: draftOpen ? "-24px 0 60px -20px rgba(0,0,0,.45)" : "none" } : undefined}>
                    <div className="flex h-[52px] items-center justify-between border-b px-[18px]"><span className="font-mono text-xs text-muted-foreground">DRAFT UNITS</span><span className="flex items-center gap-2"><span className={deploy === "ready" ? "bf-pulse" : "inline-flex"}><Button variant="outline" size="sm" onClick={runDeploy} disabled={deploy === "disabled" || deploy === "deploying" || deploy === "done"} className="h-[30px] gap-1.5">{deploy === "deploying" && <Spinner className="size-3.5" />}{deploy === "done" ? "Deployed" : deploy === "deploying" ? "Deploying" : "Deploy"}</Button></span>{compact && <Button type="button" variant="ghost" size="icon" className="size-8" onClick={() => setDraftOpen(false)} aria-label="Close draft units"><X className="size-4" /></Button>}</span></div>
                    <div className="flex flex-col gap-2.5 p-4">
                        {units.length === 0 && <div className="px-1 py-3.5 text-[13px] leading-6 text-muted-foreground">Units will appear here once BaaSForge starts building.</div>}
                        {units.map((unit) => <div key={unit.name} className="bf-draft-card" style={{ opacity: unit.show ? 1 : 0, transform: unit.show ? "none" : "translateY(8px) scale(.98)" }}><div className="mb-2 font-mono text-[11.5px] text-muted-foreground">{unit.name}</div><div className="mb-2.5 text-[12.5px] leading-5 text-muted-foreground">{unit.desc}</div><div className="flex gap-2 text-[11px]"><span className="rounded-[5px] border bg-secondary px-2 py-0.5 text-foreground">⛁ Actor</span><span className="inline-flex items-center gap-1 font-semibold" style={{ color: unit.live ? "oklch(0.78 0.19 150)" : "var(--muted-foreground)" }}>{unit.live && <span className="size-1.5 rounded-full bg-[oklch(0.78_0.19_150)]" />}{unit.live ? "Live" : "Not shipped"}</span></div></div>)}
                    </div>
                </div>
            </div>
        </div>
    );
}

function How({ visible }: { visible: boolean }) {
    const stepsRef = useRef<HTMLDivElement | null>(null);
    useStepHoverAnimations(stepsRef);
    return <section id="how" className="bf-section alt"><div className="bf-container"><div className={`bf-reveal ${visible ? "visible" : ""}`}><span className="bf-kicker">FIG 02 · HOW IT WORKS</span><h2 className="bf-title wrap"><span className="whitespace-nowrap">Three steps.</span> <span className="bf-muted whitespace-nowrap">Live in production.</span></h2></div><div ref={stepsRef} className={`bf-steps bf-reveal ${visible ? "visible" : ""}`}><div className="bf-steps-line" />{STEPS.map((step, index) => <div key={step[0]} className="bf-step" data-step-anim><StepSvg index={index} /><div className="mb-4 font-mono text-xl font-bold tracking-[0.02em]">{step[0]}</div><p className="m-0 text-[15.5px] leading-[1.65] text-muted-foreground"><strong className="font-bold text-foreground">{step[1]}</strong> {step[2]}</p></div>)}</div></div></section>;
}

function StepSvg({ index }: { index: number }) {
    if (index === 0) return <div className="mb-[26px] flex h-[220px] items-center justify-center"><svg viewBox="-18 0 160 160" className="h-[190px] w-[190px] overflow-visible"><g fill="none" strokeLinecap="round" strokeLinejoin="round"><rect fill="var(--secondary)" stroke="var(--muted-foreground)" x="14" y="8" width="96" height="42" rx="10" vectorEffect="non-scaling-stroke" /><polyline fill="var(--secondary)" stroke="var(--muted-foreground)" points="32,50 32,62 44,50" vectorEffect="non-scaling-stroke" /><line data-a="l1" stroke="var(--foreground)" strokeWidth="1.2" x1="28" y1="22" x2="64" y2="22" strokeDasharray="36" strokeDashoffset="0" vectorEffect="non-scaling-stroke" /><line data-a="l2" stroke="var(--muted-foreground)" x1="28" y1="34" x2="84" y2="34" strokeDasharray="56" strokeDashoffset="0" vectorEffect="non-scaling-stroke" /><g data-a="arr"><line stroke="var(--muted-foreground)" x1="46" y1="74" x2="46" y2="94" strokeDasharray="3 5" vectorEffect="non-scaling-stroke" /><polyline stroke="var(--muted-foreground)" points="40,88 46,96 52,88" vectorEffect="non-scaling-stroke" /></g><g data-a="cube"><polygon fill="var(--secondary)" fillOpacity=".7" stroke="var(--muted-foreground)" points="46,104 78,122 46,140 14,122" vectorEffect="non-scaling-stroke" /><polygon fill="var(--secondary)" fillOpacity=".7" stroke="var(--muted-foreground)" points="14,122 46,140 46,158 14,140" vectorEffect="non-scaling-stroke" /><polygon fill="var(--secondary)" fillOpacity=".7" stroke="var(--muted-foreground)" points="78,122 46,140 46,158 78,140" vectorEffect="non-scaling-stroke" /><polyline stroke="var(--foreground)" points="46,104 78,122 46,140 14,122 46,104" vectorEffect="non-scaling-stroke" /></g></g></svg></div>;
    if (index === 1) return <div className="mb-[26px] flex h-[220px] items-center justify-center"><svg viewBox="0 0 160 160" className="h-[190px] w-[190px] overflow-visible"><g fill="none" strokeLinecap="round" strokeLinejoin="round"><g data-a="p1"><polygon fill="var(--secondary)" fillOpacity=".8" stroke="var(--muted-foreground)" points="50,30 92,52 50,74 8,52" vectorEffect="non-scaling-stroke" /></g><g data-a="p2"><polygon fill="var(--secondary)" fillOpacity=".8" stroke="var(--muted-foreground)" points="60,58 102,80 60,102 18,80" vectorEffect="non-scaling-stroke" /></g><g data-a="p3"><polygon fill="var(--secondary)" fillOpacity=".8" stroke="var(--muted-foreground)" points="50,86 92,108 50,130 8,108" vectorEffect="non-scaling-stroke" /><polyline stroke="var(--foreground)" points="50,86 92,108 50,130 8,108 50,86" vectorEffect="non-scaling-stroke" /></g><g data-a="chk"><circle fill="var(--secondary)" fillOpacity=".8" stroke="var(--foreground)" cx="124" cy="44" r="19" vectorEffect="non-scaling-stroke" /><polyline data-a="chk-line" stroke="var(--foreground)" strokeWidth="1.4" strokeDasharray="30" strokeDashoffset="0" points="114,44 121,51 136,36" vectorEffect="non-scaling-stroke" /></g></g></svg></div>;
    return <div className="mb-[26px] flex h-[220px] items-center justify-center"><svg viewBox="0 0 160 160" className="h-[190px] w-[190px] overflow-visible"><g fill="none" strokeLinecap="round" strokeLinejoin="round"><g data-a="tcube"><polygon fill="var(--secondary)" fillOpacity=".8" stroke="var(--muted-foreground)" points="80,14 112,32 80,50 48,32" vectorEffect="non-scaling-stroke" /><polygon fill="var(--secondary)" fillOpacity=".8" stroke="var(--muted-foreground)" points="48,32 80,50 80,68 48,50" vectorEffect="non-scaling-stroke" /><polygon fill="var(--secondary)" fillOpacity=".8" stroke="var(--muted-foreground)" points="112,32 80,50 80,68 112,50" vectorEffect="non-scaling-stroke" /><polyline stroke="var(--foreground)" points="80,14 112,32 80,50 48,32 80,14" vectorEffect="non-scaling-stroke" /></g><g data-a="dashes"><line stroke="var(--muted-foreground)" x1="64" y1="76" x2="64" y2="96" strokeDasharray="3 5" vectorEffect="non-scaling-stroke" /><line stroke="var(--muted-foreground)" x1="96" y1="76" x2="96" y2="96" strokeDasharray="3 5" vectorEffect="non-scaling-stroke" /></g><g data-a="diamond"><polygon fill="var(--secondary)" fillOpacity=".8" stroke="var(--muted-foreground)" points="80,104 122,126 80,148 38,126" vectorEffect="non-scaling-stroke" /><polyline stroke="var(--foreground)" points="80,104 122,126 80,148 38,126 80,104" vectorEffect="non-scaling-stroke" /></g></g></svg></div>;
}

function Build({ visible }: { visible: boolean }) {
    const [tab, setTab] = useState("compute");
    const [tabOpacity, setTabOpacity] = useState(1);
    const setUnitTab = (value: string) => {
        if (value === tab) return;
        setTabOpacity(0);
        setTimeout(() => {
            setTab(value);
            requestAnimationFrame(() => requestAnimationFrame(() => setTabOpacity(1)));
        }, 480);
    };
    const tabContentStyle = { opacity: tabOpacity, transform: tabOpacity < 1 ? "translateY(12px)" : "none", transition: "opacity .55s cubic-bezier(.16,1,.3,1), transform .55s cubic-bezier(.16,1,.3,1)" };
    return (
        <section id="build" className="bf-section">
            <div className="bf-container">
                <div className={`bf-reveal ${visible ? "visible" : ""}`}>
                    <span className="bf-kicker">FIG 03 · THE CORE PRIMITIVE</span>
                    <h2 className="bf-title wrap">BaaSForge creates your backend <span className="bf-muted">with Units.</span></h2>
                    <p className="mt-[22px] max-w-[620px] text-[17px] leading-[1.6] text-muted-foreground">Based on the backend behavior you describe, BaaSForge intelligently arranges the right units and builds your APIs from these building blocks.</p>
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
                        <div className="bf-unit-grid compute">{COMPUTE_UNITS.map((unit, index) => <UnitCard key={unit.title} unit={unit} index={index} opacity={tabOpacity} />)}</div>
                    </TabsContent>
                    <TabsContent value="storage" style={tabContentStyle}>
                        <div className="bf-unit-grid storage">{STORAGE_UNITS.map((unit, index) => <UnitCard key={unit.title} unit={unit} index={index} opacity={tabOpacity} />)}</div>
                    </TabsContent>
                </Tabs>
            </div>
        </section>
    );
}

function UnitCard({ unit, index = 0, opacity = 1 }: { unit: Unit; index?: number; opacity?: number }) {
    return <div className="bf-unit-card" style={{ opacity, transform: opacity < 1 ? "translateY(16px)" : "none", transition: `opacity .6s cubic-bezier(.16,1,.3,1) ${index * 0.07}s, transform .6s cubic-bezier(.16,1,.3,1) ${index * 0.07}s` }}><Card className="h-full shadow-none"><CardContent className="flex h-[176px] flex-col px-6 pb-3"><div className="mb-[18px] flex items-start justify-between"><div className="flex size-[46px] items-center justify-center rounded-md border bg-secondary"><UnitIcon kind={unit.icon} /></div>{unit.status && <Badge variant="secondary" className="rounded-md">{unit.status}</Badge>}</div><h3 className="mb-2 text-[19px] font-semibold tracking-[-.02em]">{unit.title}</h3><p className="m-0 text-[14.5px] leading-[1.55] text-muted-foreground">{unit.desc}</p></CardContent></Card></div>;
}

function UseCases({ visible, index, jump, onTransitionEnd }: { visible: boolean; index: number; jump: boolean; onTransitionEnd: (event: TransitionEvent<HTMLDivElement>) => void }) {
    const items = useMemo(() => [...PHRASES, ...PHRASES, ...PHRASES], []);
    return <section id="usecases" className="bf-section"><div className="bf-container"><div className={`bf-reveal ${visible ? "visible" : ""}`}><span className="bf-kicker">FIG 04 · WHAT BUILDERS SHIP</span><h2 className="bf-title wrap"><span className="whitespace-nowrap">The top builders use</span> <span className="whitespace-nowrap"><span className="bf-muted">BaaSForge</span> for:</span></h2></div><div className={`bf-carousel mt-11 bf-reveal ${visible ? "visible" : ""}`}><div className="bf-carousel-track" onTransitionEnd={onTransitionEnd} style={{ transform: `translateY(calc(190px - 30px - ${index * 60}px))`, transition: jump ? "none" : undefined }}>{items.map((item, itemIndex) => { const distance = Math.abs(itemIndex - index); const opacity = distance === 0 ? 1 : distance === 1 ? 0.45 : distance === 2 ? 0.22 : 0.14; return <div key={`${item}-${itemIndex}`} className="bf-carousel-item" style={{ opacity, color: distance === 0 ? "var(--foreground)" : "var(--muted-foreground)", transition: jump ? "none" : undefined }}>{item}</div>; })}</div></div></div></section>;
}

function Category({ visible }: { visible: boolean }) {
    return <section id="category" className="bf-section alt"><div className="bf-container"><div className={`bf-reveal ${visible ? "visible" : ""}`}><span className="bf-kicker">FIG 05 · DEFENSIBILITY</span><h2 className="bf-title wrap">Why builders choose <span className="bf-muted">BaaSForge.</span></h2></div><div className={`mt-11 flex flex-col border-t bf-reveal ${visible ? "visible" : ""}`}>{MOATS.map(([title, desc]) => <div key={title} className="bf-moat"><span className="shrink-0 text-[19.5px] tracking-[-.01em]"><span className="mr-2.5 inline-block size-1.5 rounded-full bg-foreground align-middle" />{title}</span><span className="text-[15px] font-normal leading-[1.5] text-muted-foreground">{desc}</span></div>)}</div></div></section>;
}

function Debug({ visible }: { visible: boolean }) {
    const ref = useRef<HTMLDivElement | null>(null);
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
        let i = 0;
        const interval = setInterval(() => {
            i += 1;
            setText(DEBUG_TEXT.slice(0, i));
            if (i >= DEBUG_TEXT.length) clearInterval(interval);
        }, 14);
        return () => clearInterval(interval);
    }, [started]);
    const needle = text.indexOf("charge.worker");
    const pre = needle === -1 ? text : text.slice(0, needle);
    const mid = needle === -1 ? "" : "charge.worker";
    const post = needle === -1 ? "" : text.slice(needle + mid.length);
    return <section id="debug" className="bf-section"><div className="bf-container"><div className={`bf-debug-grid bf-reveal ${visible ? "visible" : ""}`}><div><span className="bf-kicker">FIG 06 · WHEN THINGS BREAK</span><h2 className="bf-title">Built for your <span className="bf-muted">freedom.</span></h2><p className="mt-[22px] max-w-[620px] text-[17px] leading-[1.6] text-muted-foreground">BaaSForge is the support behind you. Even when things go wrong, it traces production, catches the failure, and clears the mess — before your users ever find out.</p></div><div ref={ref} className={`bf-debug-card ${started ? "live" : ""}`}><div className="flex items-center gap-2 border-b px-4 py-3 font-mono text-xs text-muted-foreground"><span className="size-1.5 rounded-full bg-foreground" style={{ animation: started ? "pulseDot 1.4s ease-in-out infinite" : "none" }} />observability · trace #4471</div><div className="flex flex-col gap-3 p-4"><div className="max-w-[78%] self-end rounded-[12px_12px_2px_12px] bg-foreground px-3.5 py-2.5 text-[13.5px] leading-[1.5] text-background">Why did checkout fail at 14:22?</div><div className="grid max-w-[92%] self-start rounded-[2px_12px_12px_12px] border bg-secondary px-3.5 py-3 font-mono text-[13px] leading-[1.6] text-secondary-foreground"><span aria-hidden="true" className="invisible col-start-1 row-start-1">{DEBUG_TEXT}</span><span className="col-start-1 row-start-1">{pre}<span className="font-semibold text-foreground">{mid}</span>{post}{text.length > 0 && text.length < DEBUG_TEXT.length && <span className="inline-block h-3.5 w-[7px] animate-[blink_1s_steps(2)_infinite] bg-foreground align-[-2px]" />}</span></div></div></div></div></div></section>;
}

function Close() {
    return <section className="relative overflow-hidden border-t py-[130px] text-center"><div className="bf-glow" /><div className="bf-container relative"><h2 className="m-0 whitespace-nowrap bg-gradient-to-b from-foreground to-muted-foreground bg-clip-text text-[clamp(40px,7.5vw,90px)] font-bold tracking-[-.05em] text-transparent">Build Backend.</h2><div className="mt-[34px] flex justify-center gap-3.5"><Magnetic to="#" variant="secondary">Go to docs</Magnetic><Magnetic to={LOGIN_PATH} variant="primary">Start building</Magnetic></div><p className="mt-[26px] font-mono text-[13px] text-muted-foreground">Free credit included, No payment info needed</p></div></section>;
}

function Footer() {
    return (
        <footer className="bf-footer">
            <div className="bf-container">
                <div className="bf-footer-inner">
                    <div className="bf-footer-brand">
                        <Brand />
                        <p className="bf-footer-copy">
                            We got tired of juggling different tools and infrastructure just to ship a backend. So we built the one we wished we'd had.
                        </p>
                    </div>
                    <span className="bf-footer-mark">© 2026 BaaSForge</span>
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
    const [carousel, setCarousel] = useState(PHRASES.length);
    const [carouselJump, setCarouselJump] = useState(false);
    useEffect(() => {
        const interval = setInterval(() => setCarousel((index) => index + 1), 2200);
        return () => clearInterval(interval);
    }, []);
    const onCarouselTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
        if (event.propertyName !== "transform") return;
        setCarousel((index) => {
            if (index < PHRASES.length * 2) return index;
            setCarouselJump(true);
            requestAnimationFrame(() => requestAnimationFrame(() => setCarouselJump(false)));
            return index - PHRASES.length;
        });
    };

    return (
        <div className="bf-page midnight">
            <Styles />
            <Navbar active={active} compact={compact} />
            <main>
                <Hero />
                <What visible={!!visible.what} compact={compact} />
                <How visible={!!visible.how} />
                <Build visible={!!visible.build} />
                <UseCases visible={!!visible.usecases} index={carousel} jump={carouselJump} onTransitionEnd={onCarouselTransitionEnd} />
                <Category visible={!!visible.category} />
                <Debug visible={!!visible.debug} />
                <Close />
            </main>
            <Footer />
        </div>
    );
}

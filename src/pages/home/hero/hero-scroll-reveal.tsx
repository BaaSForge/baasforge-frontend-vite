import { ShinyButton } from "@/components/ui/shiny-button";
import {
    motion,
    useMotionValueEvent,
    useScroll,
    useTransform,
} from "motion/react";
import {
    ArrowUpRight,
    Github,
    ChevronDown,
    BookOpen,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { AiPromptBox } from "./ai-prompt-box";
import { ScenarioCard } from "./scenario-card";
import { ScenarioDetailDialog } from "./scenario-detail-dialog";
import {
    ALL_RECIPES,
    type RecipeItem,
} from "./recipes-data";

const GITHUB_ORGANIZATION_URL = "https://github.com/BaaSForge/";

// 6 iconic recipes for the homepage showcase (fits in 2 rows of 3 without internal scrolling)
const HOMEPAGE_FEATURED_IDS = [1, 8, 44, 10, 46, 61];
const HOMEPAGE_FEATURED_RECIPES = HOMEPAGE_FEATURED_IDS
    .map((id) => ALL_RECIPES.find((r) => r.id === id))
    .filter((r): r is RecipeItem => r !== undefined);

export function HeroScrollReveal() {
    const trackRef = useRef<HTMLDivElement | null>(null);
    const [searchParams] = useSearchParams();
    const initialPrompt = searchParams.get("prompt") ?? "";

    // AI Prompt input state
    const [promptValue, setPromptValue] = useState(initialPrompt);
    const [selectedScenario, setSelectedScenario] = useState<RecipeItem | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isCardsActive, setIsCardsActive] = useState(false);
    const cardsRef = useRef<HTMLDivElement | null>(null);

    // Calculate dynamic peeking offset so cards window always peeks by ~44px from the bottom
    const [peekingOffset, setPeekingOffset] = useState(() => {
        if (typeof window === "undefined") return 700;
        const vh = window.innerHeight;
        const modalH = window.innerWidth < 768 ? 640 : 606;
        const peekingDesired = vh < 700 ? 28 : 44;
        return Math.max(0, Math.round((vh + modalH) / 2 - (peekingDesired + 2)));
    });

    useEffect(() => {
        const updateOffset = () => {
            const vh = window.innerHeight;
            const modalH = window.innerWidth < 768 ? 640 : 606;
            const peekingDesired = vh < 700 ? 28 : 44;
            const target = Math.max(0, Math.round((vh + modalH) / 2 - (peekingDesired + 2)));
            setPeekingOffset(target);
        };
        updateOffset();
        window.addEventListener("resize", updateOffset);
        return () => window.removeEventListener("resize", updateOffset);
    }, []);

    // Track scroll through the pinned track
    const { scrollYProgress } = useScroll({
        target: trackRef,
        offset: ["start start", "end end"],
    });

    // Update active layer state based on scroll progress
    useMotionValueEvent(scrollYProgress, "change", (latest) => {
        setIsCardsActive(latest > 0.28);
    });

    // LAYER 1: Headline & Prompt Box transforms
    // High-performance GPU-only transforms (no dynamic CSS blur to prevent scroll stutter)
    const heroY = useTransform(scrollYProgress, [0, 0.36, 0.46, 1], [0, -80, -110, -110]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.25, 0.40, 1], [1, 0.4, 0, 0]);
    const heroScale = useTransform(scrollYProgress, [0, 0.40, 1], [1, 0.94, 0.94]);

    // LAYER 2: Cards Showcase (Screenshot Scroll Reveal) transforms
    // Dynamically pins the peeking cards window to peek by exactly 48px from the bottom on all screen heights
    const cardsY = useTransform(scrollYProgress, (p) => {
        if (p <= 0) return peekingOffset;
        if (p >= 0.44) return 0;
        const t = p / 0.44;
        return Math.round(peekingOffset * (1 - t));
    });
    const cardsRotateX = useTransform(scrollYProgress, [0, 0.44, 0.72, 1], [14, 0, 0, 0]);
    const cardsScale = useTransform(scrollYProgress, [0, 0.44, 0.72, 1], [0.94, 1.0, 1.0, 1.0]);

    const handleSelectScenario = (scenario: RecipeItem) => {
        setSelectedScenario(scenario);
        setDialogOpen(true);
    };

    const handleSelectRelated = (recipeId: number) => {
        const found = ALL_RECIPES.find((r) => r.id === recipeId);
        if (found) {
            setSelectedScenario(found);
        }
    };

    const handleUsePrompt = (promptText: string) => {
        window.location.href = `/login?prompt=${encodeURIComponent(promptText)}`;
    };

    const handlePromptSubmit = (submittedPrompt: string) => {
        window.location.href = `/login?prompt=${encodeURIComponent(submittedPrompt)}`;
    };

    const handleExpandCards = () => {
        if (trackRef.current) {
            const trackTop = trackRef.current.offsetTop;
            const targetY = trackTop + window.innerHeight * 0.48;
            window.scrollTo({ top: targetY, behavior: "smooth" });
        }
    };

    return (
        <section
            ref={trackRef}
            id="scenarios-section"
            className="relative w-full h-[185vh] bg-[var(--background)] text-[var(--foreground)]"
        >
            {/* Ambient Background Glow matching BaaSForge midnight palette */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-[750px] overflow-hidden opacity-30 select-none"
            >
                <div className="absolute left-1/2 -top-[220px] -translate-x-1/2 w-[1000px] h-[520px] bg-[radial-gradient(ellipse_at_center,oklch(0.74_0.15_260_/_16%),transparent_70%)] blur-[120px] rounded-full" />
            </div>

            {/* STICKY VIEWPORT CONTAINER: Pinned for the duration of the scroll */}
            <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col items-center justify-start pt-20 sm:pt-0 sm:justify-center px-4 sm:px-6 lg:px-8">
                {/* LAYER 1: HERO HEADLINE & AI PROMPT BOX
                    Centered in viewport. Lifts and fades away smoothly as user scrolls. */}
                <motion.div
                    style={{
                        y: heroY,
                        opacity: heroOpacity,
                        scale: heroScale,
                        willChange: "transform, opacity",
                    }}
                    className={`w-full max-w-4xl mx-auto flex flex-col items-center z-10 pt-2 sm:pt-6 pb-2 ${
                        isCardsActive ? "pointer-events-none" : "pointer-events-auto"
                    }`}
                >
                    {/* Open Source Announcement Badge */}
                    <div className="mb-3 sm:mb-4 flex items-center justify-center">
                        <ShinyButton
                            asChild
                            className="bf-announcement"
                            fillColor="color-mix(in srgb, #ffaf74 10%, var(--background))"
                            labelColor="#ffaf74"
                            accentColor="#ffaf74"
                            accentSoftColor="#ffd0ad"
                            sweepDuration={4}
                            easeDuration={0.25}
                            cornerRadius={9999}
                            speckleOpacity={0.12}
                        >
                            <a
                                href={GITHUB_ORGANIZATION_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Now open source. Explore BaaSForge on GitHub (opens in a new tab)"
                            >
                                <span className="shiny-button-content bf-announcement-content">
                                    <Github className="size-4 shrink-0" aria-hidden="true" />
                                    <span className="bf-announcement-label">Now open source</span>
                                    <span className="bf-announcement-action">
                                        Explore on GitHub
                                        <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />
                                    </span>
                                </span>
                            </a>
                        </ShinyButton>
                    </div>

                    {/* Main Headline: Build Scalable Backends. */}
                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-center text-[var(--foreground)] mb-2 sm:mb-4 leading-[1.05]">
                        Build Scalable Backends.
                    </h1>

                    {/* Subtitle */}
                    <p className="text-[var(--muted-foreground)] text-sm sm:text-base md:text-lg text-center max-w-xl mb-4 sm:mb-6 leading-relaxed">
                        <span className="block">Plain language in, scalable backend out.</span>
                        <span className="block">From prompt to production with zero DevOps.</span>
                    </p>

                    {/* AI Prompt Input Box */}
                    <AiPromptBox
                        value={promptValue}
                        onChange={setPromptValue}
                        onSubmit={handlePromptSubmit}
                    />

                    {/* Scroll hint to recipes section: button styled like baasforge.com with arrow below */}
                    <div className="mt-5 sm:mt-8 md:mt-9 flex flex-col items-center gap-2">
                        <button
                            type="button"
                            onClick={handleExpandCards}
                            className="inline-flex items-center justify-center rounded-full bg-[var(--secondary)] hover:bg-[var(--secondary)]/80 text-[var(--foreground)] border border-[var(--border)] hover:border-[var(--muted-foreground)]/30 px-5 py-2 sm:px-6 sm:py-2.5 text-sm font-medium shadow-xs transition-all duration-200 cursor-pointer active:scale-95"
                        >
                            Start with a recipe
                        </button>
                        <button
                            type="button"
                            onClick={handleExpandCards}
                            aria-label="Scroll to recipes"
                            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer p-1"
                        >
                            <ChevronDown className="size-4 animate-bob-down" />
                        </button>
                    </div>
                </motion.div>

                {/* LAYER 2: CARDS SHOWCASE (SCREENSHOT SCROLL REVEAL)
                    GPU accelerated smooth 3D tilt and slide UP OVER the prompt box.
                    Centered in viewport, natural compact height, zero dead empty space */}
                <div className="absolute inset-0 z-20 flex items-center justify-center p-3 sm:p-6 lg:p-8 pt-16 sm:pt-20 pointer-events-none">
                    <motion.div
                        ref={cardsRef}
                        style={{
                            y: cardsY,
                            rotateX: cardsRotateX,
                            scale: cardsScale,
                            transformPerspective: 1200,
                            transformOrigin: "top center",
                            willChange: "transform",
                        }}
                        className="pointer-events-auto w-full max-w-6xl flex flex-col rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-[0_24px_80px_rgba(0,0,0,0.65),0_0_0_1px_var(--border)] overflow-hidden max-h-[calc(100vh-5.5rem)]"
                    >
                        {/* Window Chrome Header: Single line on mobile, full on desktop */}
                        <div
                            onClick={!isCardsActive ? handleExpandCards : undefined}
                            className={`px-4 sm:px-5 py-3 sm:py-3.5 bg-[color-mix(in_oklch,var(--background)_80%,transparent)] border-b border-[var(--border)] flex items-center justify-between gap-3 sm:gap-4 shrink-0 select-none ${
                                !isCardsActive ? "cursor-pointer hover:bg-[color-mix(in_oklch,var(--background)_90%,transparent)] transition" : ""
                            }`}
                        >
                            {/* Traffic lights & Title */}
                            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                                <div className="flex items-center gap-1.5 shrink-0" aria-hidden="true">
                                    <span className="size-2.5 sm:size-3 rounded-full bg-red-500/80 inline-block" />
                                    <span className="size-2.5 sm:size-3 rounded-full bg-yellow-500/80 inline-block" />
                                    <span className="size-2.5 sm:size-3 rounded-full bg-green-500/80 inline-block" />
                                </div>
                                <div className="flex items-center gap-2 min-w-0">
                                    <BookOpen className="size-3.5 text-[var(--primary)] hidden sm:inline-block shrink-0" />
                                    <span className="text-[11px] sm:text-xs font-mono font-medium text-[var(--foreground)] truncate">
                                        <span className="hidden sm:inline">Recipe Book · </span>
                                        <span>What can you build with BaaSForge?</span>
                                    </span>
                                </div>
                            </div>

                            {/* Direct link to all recipes directory: hidden on mobile per user instruction */}
                            <a
                                href="/recipes"
                                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono text-[var(--primary)] hover:underline whitespace-nowrap"
                            >
                                <span>Explore all recipes</span>
                                <ArrowUpRight className="size-3.5" />
                            </a>
                        </div>

                        {/* Cards Grid: Snug, balanced padding, zero empty void above or below */}
                        <div className="p-3.5 sm:p-5 lg:p-6 flex flex-col gap-3.5 sm:gap-4 overflow-y-auto sm:overflow-hidden">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 lg:gap-5">
                                {HOMEPAGE_FEATURED_RECIPES.map((recipe, idx) => (
                                    <div key={recipe.id} className={idx >= 3 ? "hidden md:block" : "block"}>
                                        <ScenarioCard
                                            scenario={recipe}
                                            onSelect={handleSelectScenario}
                                            onUsePrompt={handleUsePrompt}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Bottom Banner: Single Clean CTA right below the cards */}
                            <div className="flex items-center justify-center shrink-0 pt-1">
                                <a
                                    href="/recipes"
                                    className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--secondary)]/60 hover:bg-[var(--secondary)] border border-[var(--border)] hover:border-[var(--primary)]/50 text-[var(--foreground)] transition-all font-medium text-xs shadow-xs"
                                >
                                    <span>Browse complete Recipe Book</span>
                                    <ArrowUpRight className="size-3.5 text-[var(--primary)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Recipe Details Dialog Modal */}
            <ScenarioDetailDialog
                scenario={selectedScenario}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onUsePrompt={handleUsePrompt}
                onSelectRelated={handleSelectRelated}
            />
        </section>
    );
}

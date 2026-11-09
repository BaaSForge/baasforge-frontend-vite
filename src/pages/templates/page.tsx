import { Button } from "@/components/ui/button";
import {
    Search,
    Sparkles,
    X,
    Building2,
    CreditCard,
    ShoppingBag,
    Store,
    Wrench,
    Film,
    GraduationCap,
    Truck,
    HeartPulse,
    Users,
    Calendar,
    Gamepad2,
    Briefcase,
    Compass,
    Cpu,
    type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { Navbar, Footer, Styles } from "../home/page";
import { ScenarioDetailDialog } from "../home/hero/scenario-detail-dialog";
import {
    ALL_RECIPES,
    RECIPE_LEVELS,
    PRODUCT_TAGS,
    type RecipeItem,
    type RecipeLevel,
} from "../home/hero/recipes-data";

// Map every domain tag to an authentic Lucide icon
const DOMAIN_ICONS: Record<string, LucideIcon> = {
    "SaaS": Building2,
    "AI & Automation": Sparkles,
    "Fintech & Payments": CreditCard,
    "E-commerce": ShoppingBag,
    "Marketplace": Store,
    "Internal Tools": Wrench,
    "Media & Content": Film,
    "Education": GraduationCap,
    "Logistics": Truck,
    "Healthcare": HeartPulse,
    "Social & Community": Users,
    "Booking & Scheduling": Calendar,
    "Games": Gamepad2,
    "HR & Recruiting": Briefcase,
    "Travel": Compass,
    "IoT & Hardware": Cpu,
};

// Curated Category Cards with prominent animated domain icons
interface CategoryCardData {
    id: string;
    tag: string;
    title: string;
    subtitle: string;
    count: number;
    icon: LucideIcon;
}

const CATEGORIES_DATA: CategoryCardData[] = [
    {
        id: "auth",
        tag: "SaaS",
        title: "Auth & Identity",
        subtitle: "JWT, OAuth, Magic Links & RBAC",
        count: 47,
        icon: Building2,
    },
    {
        id: "fintech",
        tag: "Fintech & Payments",
        title: "Fintech & Payments",
        subtitle: "Stripe, Subscriptions & Ledgers",
        count: 27,
        icon: CreditCard,
    },
    {
        id: "ai",
        tag: "AI & Automation",
        title: "AI & Automation",
        subtitle: "Memory Chat, RAG & Agents",
        count: 12,
        icon: Sparkles,
    },
    {
        id: "ecommerce",
        tag: "E-commerce",
        title: "E-commerce & Stores",
        subtitle: "Carts, Orders & Refund Sagas",
        count: 27,
        icon: ShoppingBag,
    },
    {
        id: "ops",
        tag: "Internal Tools",
        title: "Internal Tools & Ops",
        subtitle: "Job Queues, Audit & Webhooks",
        count: 17,
        icon: Wrench,
    },
];


export default function TemplatesPage() {
    const [searchParams, setSearchParams] = useSearchParams();

    // URL search params
    const levelParam = searchParams.get("level");
    const tagParam = searchParams.get("tag");

    const selectedLevel: RecipeLevel | "all" = useMemo(() => {
        const num = Number(levelParam);
        if (num >= 1 && num <= 4) return num as RecipeLevel;
        return "all";
    }, [levelParam]);

    const selectedTag: string = useMemo(() => tagParam ?? "all", [tagParam]);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRecipe, setSelectedRecipe] = useState<RecipeItem | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    // Filter handling
    const updateParam = (key: string, value: string | "all") => {
        const next = new URLSearchParams(searchParams);
        if (value === "all") {
            next.delete(key);
        } else {
            next.set(key, value);
        }
        setSearchParams(next, { replace: true });
    };

    const handleSelectRecipe = (recipe: RecipeItem) => {
        setSelectedRecipe(recipe);
        setDialogOpen(true);
    };

    const handleSelectRelated = (recipeId: number) => {
        const found = ALL_RECIPES.find((r) => r.id === recipeId);
        if (found) {
            setSelectedRecipe(found);
        }
    };

    const handleUsePrompt = (promptText: string) => {
        window.location.href = `/login?prompt=${encodeURIComponent(promptText)}`;
    };

    const resetAllFilters = () => {
        setSearchParams(new URLSearchParams(), { replace: true });
        setSearchQuery("");
    };

    // Filtered recipes
    const filteredRecipes = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return ALL_RECIPES.filter((r) => {
            const matchesLevel = selectedLevel === "all" || r.level === selectedLevel;
            const matchesTag = selectedTag === "all" || r.productTags.includes(selectedTag);

            const matchesSearch =
                !query ||
                r.title.toLowerCase().includes(query) ||
                r.promise.toLowerCase().includes(query) ||
                r.category.toLowerCase().includes(query) ||
                r.whatYouCanBuild.some((b) => b.toLowerCase().includes(query)) ||
                r.productTags.some((t) => t.toLowerCase().includes(query));

            return matchesLevel && matchesTag && matchesSearch;
        });
    }, [selectedLevel, selectedTag, searchQuery]);

    const activeFilterCount =
        (selectedLevel !== "all" ? 1 : 0) +
        (selectedTag !== "all" ? 1 : 0) +
        (searchQuery ? 1 : 0);

    const isFiltered = selectedLevel !== "all" || selectedTag !== "all" || searchQuery !== "";

    return (
        <div className="bf-page midnight min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col">
            <Styles />

            {/* Standard Site Navbar (Identical to rest of site) */}
            <Navbar currentPath="/recipes" />

            {/* Main Content Area (Curtain layer elevated above sticky reveal footer) */}
            <div className="relative z-10 bg-[var(--background)] w-full flex-1 border-b border-[var(--border)] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.35)]">
                <main className="max-w-[1240px] w-full mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-16">
                    {/* 1. CENTERED HERO */}
                    <div className="text-center max-w-3xl mx-auto mb-16 pt-3 sm:pt-6">
                        {/* Kicker Pill with pulse dot */}
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--border)] bg-[var(--secondary)]/60 backdrop-blur-xs text-xs font-mono font-medium text-[var(--primary)] mb-6 shadow-xs">
                            <span className="size-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
                            <span className="tracking-widest uppercase font-semibold">RECIPE BOOK</span>
                        </div>

                        {/* Title with generous leading and responsive sizing */}
                        <h1 className="text-3xl sm:text-5xl lg:text-[56px] font-bold tracking-tight text-[var(--foreground)] leading-[1.12] mb-8 max-w-2xl mx-auto">
                            <span>What can you build</span>
                            <span className="block bf-muted">with BaaSForge?</span>
                        </h1>

                        {/* Hero Search Bar - Flagship & Spacious */}
                        <div className="relative max-w-2xl mx-auto mb-4">
                            <div className="relative flex items-center rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-md hover:border-[var(--primary)]/50 focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--primary)]/20 transition-all duration-200">
                                <Search className="absolute left-4 size-5 text-[var(--primary)] pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Search 78 blueprints by feature, keyword, or architecture..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-12 py-3.5 sm:py-4 bg-transparent text-sm sm:text-base text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none"
                                />
                                {searchQuery ? (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-3.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer p-1 rounded-md"
                                        aria-label="Clear search"
                                    >
                                        <X className="size-4" />
                                    </button>
                                ) : (
                                    <kbd className="hidden sm:inline-flex absolute right-4 items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono text-[var(--muted-foreground)] bg-[var(--secondary)] border border-[var(--border)] rounded-md pointer-events-none">
                                        /
                                    </kbd>
                                )}
                            </div>
                        </div>

                        {/* Quick Suggestion Pills */}
                        <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap text-xs text-[var(--muted-foreground)]">
                            <span className="font-mono text-[11px] text-[var(--muted-foreground)]/70 mr-0.5">Popular:</span>
                            {["Auth", "Stripe", "Ledger", "AI Agent", "Queue", "Multi-Tenant"].map((term) => (
                                <button
                                    key={term}
                                    type="button"
                                    onClick={() => setSearchQuery(term)}
                                    className="px-2.5 py-1 rounded-lg bg-[var(--secondary)]/60 hover:bg-[var(--secondary)] hover:text-[var(--primary)] border border-[var(--border)] font-mono text-[11px] transition cursor-pointer"
                                >
                                    {term}
                                </button>
                            ))}
                        </div>
                    </div>

                {/* 2. CATEGORIES SECTION (Permanently visible to prevent layout shift) */}
                <section className="mb-14">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--foreground)]">
                                Categories
                            </h2>
                            {selectedTag !== "all" && (
                                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/30">
                                    Filtered: {selectedTag}
                                </span>
                            )}
                        </div>
                        {selectedTag !== "all" ? (
                            <button
                                type="button"
                                onClick={() => updateParam("tag", "all")}
                                className="inline-flex items-center gap-1 text-xs font-mono text-[var(--primary)] hover:underline cursor-pointer"
                            >
                                <span>Clear Category Filter</span>
                                <X className="size-3.5" />
                            </button>
                        ) : (
                            <span className="text-xs font-mono text-[var(--muted-foreground)]">
                                Click any category to filter
                            </span>
                        )}
                    </div>

                    {/* 5-Column Responsive Cards Grid with prominent animated icon */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                        {CATEGORIES_DATA.map((cat) => {
                            const isSelected = selectedTag === cat.tag;
                            return (
                                <div
                                    key={cat.id}
                                    onClick={() => updateParam("tag", isSelected ? "all" : cat.tag)}
                                    className={`group cursor-pointer p-3.5 sm:p-4 rounded-2xl bg-[var(--card)] border transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl flex flex-col items-center text-center justify-between last:col-span-2 sm:last:col-span-1 ${
                                        isSelected
                                            ? "border-[var(--primary)] shadow-[0_0_24px_-4px_rgba(180,160,255,0.25)] ring-1 ring-[var(--primary)]"
                                            : "border-[var(--border)] hover:border-[var(--primary)]/50"
                                    }`}
                                >
                                    {/* Prominent Category Icon with hover animation & color shift */}
                                    <div
                                        className={`size-14 rounded-2xl border flex items-center justify-center transition-all duration-300 ease-out shadow-xs mb-3.5 ${
                                            isSelected
                                                ? "bg-[var(--primary)]/20 text-[var(--primary)] border-[var(--primary)]/60 scale-105"
                                                : "bg-[var(--secondary)]/70 border-[var(--border)] text-[var(--muted-foreground)] group-hover:text-[var(--primary)] group-hover:border-[var(--primary)]/50 group-hover:bg-[var(--primary)]/10 group-hover:scale-110 group-hover:rotate-3"
                                        }`}
                                    >
                                        <cat.icon className="size-7 transition-all duration-300 group-hover:scale-110" />
                                    </div>

                                    {/* Category Label, Subtitle and Recipe Count */}
                                    <div className="w-full">
                                        <h3
                                            className={`font-semibold text-sm transition-colors mb-1 ${
                                                isSelected
                                                    ? "text-[var(--primary)] font-bold"
                                                    : "text-[var(--foreground)] group-hover:text-[var(--primary)]"
                                            }`}
                                        >
                                            {cat.title}
                                        </h3>
                                        <p className="text-[11px] text-[var(--muted-foreground)] line-clamp-1 mb-2.5">
                                            {cat.subtitle}
                                        </p>
                                        <span
                                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full border inline-block ${
                                                isSelected
                                                    ? "bg-[var(--primary)]/15 border-[var(--primary)]/40 text-[var(--primary)]"
                                                    : "bg-[var(--secondary)] border-[var(--border)] text-[var(--muted-foreground)]"
                                            }`}
                                        >
                                            {cat.count} recipes
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* 3. ALL RECIPES DIRECTORY WITH DOMAIN ICONS & LEVEL TABS */}
                <div id="recipes-directory" className="pt-2">
                    <div className="mb-6 pb-4 border-b border-[var(--border)]">
                        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--foreground)]">
                            {isFiltered ? "Filtered Blueprints" : "Complete Recipe Book"}
                        </h2>
                        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                            Ordered by architectural maturity from Level 1 to Level 4
                        </p>
                    </div>

                    {/* Filter Controls: Level Selector & Domain Pills with Icons */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] mb-8 space-y-4 shadow-sm">
                        {/* Level Selector Tabs */}
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                            <span className="text-[11px] font-mono text-[var(--muted-foreground)] uppercase tracking-wider font-semibold shrink-0 mr-1">
                                Level:
                            </span>

                            <button
                                type="button"
                                onClick={() => updateParam("level", "all")}
                                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                                    selectedLevel === "all"
                                        ? "bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold shadow-xs"
                                        : "bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] border border-[var(--border)]"
                                }`}
                            >
                                <span>All Levels</span>
                                <span className="font-mono text-[10px] opacity-75">({ALL_RECIPES.length})</span>
                            </button>

                            {RECIPE_LEVELS.map((lvl) => {
                                const isSelected = selectedLevel === lvl.level;
                                return (
                                    <button
                                        key={lvl.level}
                                        type="button"
                                        onClick={() => updateParam("level", isSelected ? "all" : String(lvl.level))}
                                        className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                                            isSelected
                                                ? "bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold shadow-xs"
                                                : "bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] border border-[var(--border)]"
                                        }`}
                                    >
                                        <span>{lvl.title}</span>
                                        <span
                                            className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full ${
                                                isSelected
                                                    ? "bg-[var(--primary-foreground)]/20 text-[var(--primary-foreground)]"
                                                    : "bg-[var(--background)] text-[var(--muted-foreground)]"
                                            }`}
                                        >
                                            {lvl.count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Domain Pills with Lucide Icons */}
                        <div className="pt-3 border-t border-[var(--border)] flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-mono text-[var(--muted-foreground)] uppercase tracking-wider font-semibold mr-1">
                                Domains:
                            </span>

                            <button
                                type="button"
                                onClick={() => updateParam("tag", "all")}
                                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition cursor-pointer ${
                                    selectedTag === "all"
                                        ? "bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold shadow-xs"
                                        : "bg-[var(--secondary)]/70 text-[var(--muted-foreground)] hover:text-[var(--foreground)] border border-[var(--border)]"
                                }`}
                            >
                                All ({ALL_RECIPES.length})
                            </button>

                            {PRODUCT_TAGS.map((pt) => {
                                const isSelected = selectedTag === pt.tag;
                                const DomainIcon = DOMAIN_ICONS[pt.tag] ?? Sparkles;
                                return (
                                    <button
                                        key={pt.tag}
                                        type="button"
                                        onClick={() => updateParam("tag", isSelected ? "all" : pt.tag)}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-mono transition cursor-pointer flex items-center gap-1.5 ${
                                            isSelected
                                                ? "bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold shadow-xs"
                                                : "bg-[var(--secondary)]/70 text-[var(--muted-foreground)] hover:text-[var(--foreground)] border border-[var(--border)] hover:border-[var(--primary)]/40"
                                        }`}
                                    >
                                        <DomainIcon className="size-3 text-[var(--primary)]" />
                                        <span>{pt.tag}</span>
                                        <span
                                            className={`text-[10px] font-mono px-1 rounded ${
                                                isSelected
                                                    ? "bg-[var(--primary-foreground)]/20 text-[var(--primary-foreground)]"
                                                    : "bg-[var(--background)] text-[var(--muted-foreground)]"
                                            }`}
                                        >
                                            {pt.count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Active Filter Chips & Clear */}
                        {activeFilterCount > 0 && (
                            <div className="pt-3 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-3 text-xs">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-[var(--muted-foreground)] font-mono">
                                        Showing {filteredRecipes.length} of {ALL_RECIPES.length} recipes
                                    </span>
                                    {selectedLevel !== "all" && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/30 font-mono text-[11px]">
                                            Level {selectedLevel}
                                            <button
                                                type="button"
                                                onClick={() => updateParam("level", "all")}
                                                className="hover:text-white cursor-pointer ml-0.5"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    )}
                                    {selectedTag !== "all" && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/30 font-mono text-[11px]">
                                            Domain: {selectedTag}
                                            <button
                                                type="button"
                                                onClick={() => updateParam("tag", "all")}
                                                className="hover:text-white cursor-pointer ml-0.5"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    )}

                                    {searchQuery && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/30 font-mono text-[11px]">
                                            Search: "{searchQuery}"
                                            <button
                                                type="button"
                                                onClick={() => setSearchQuery("")}
                                                className="hover:text-white cursor-pointer ml-0.5"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={resetAllFilters}
                                    className="text-xs text-[var(--primary)] hover:underline font-mono cursor-pointer font-semibold"
                                >
                                    Reset all filters ({activeFilterCount})
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Level 1-4 Sections or Flat Filter Grid */}
                    {!isFiltered ? (
                        // Grouped view by the 4 authentic levels
                        <div className="space-y-16">
                            {RECIPE_LEVELS.map((lvl) => {
                                const levelRecipes = ALL_RECIPES.filter((r) => r.level === lvl.level);
                                return (
                                    <section key={lvl.level} className="space-y-6">
                                        <div className="border-b border-[var(--border)] pb-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-mono text-xl sm:text-2xl font-bold text-[var(--primary)]">
                                                        {lvl.level}
                                                    </span>
                                                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--foreground)]">
                                                        {lvl.title.replace(`Level ${lvl.level} — `, "")}
                                                    </h2>
                                                </div>
                                                <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1">
                                                    {lvl.subtitle}
                                                </p>
                                            </div>

                                            <span className="font-mono text-xs text-[var(--muted-foreground)]">
                                                {lvl.count} recipes
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                            {levelRecipes.map((recipe) => (
                                                <DirectoryRecipeCard
                                                    key={recipe.id}
                                                    recipe={recipe}
                                                    onSelect={handleSelectRecipe}
                                                    onUsePrompt={handleUsePrompt}
                                                />
                                            ))}
                                        </div>
                                    </section>
                                );
                            })}
                        </div>
                    ) : (
                        // Filtered Flat Grid
                        <div>
                            <div className="mb-6 flex items-center justify-between text-xs font-mono text-[var(--muted-foreground)]">
                                <span>
                                    {filteredRecipes.length} {filteredRecipes.length === 1 ? "recipe found" : "recipes found"}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {filteredRecipes.map((recipe) => (
                                    <DirectoryRecipeCard
                                        key={recipe.id}
                                        recipe={recipe}
                                        onSelect={handleSelectRecipe}
                                        onUsePrompt={handleUsePrompt}
                                    />
                                ))}
                            </div>

                            {filteredRecipes.length === 0 && (
                                <div className="py-20 text-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)]/50">
                                    <p className="text-base font-semibold text-[var(--foreground)] mb-1">
                                        No recipes matched your search
                                    </p>
                                    <p className="text-xs text-[var(--muted-foreground)] mb-4">
                                        Try clearing filters or searching for terms like "login", "checkout", "ai", or "ledger".
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={resetAllFilters}
                                        className="text-xs font-mono"
                                    >
                                        Reset filters
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>

            {/* Standard Site Footer */}
            <Footer />

            {/* Recipe Detail Modal */}
            <ScenarioDetailDialog
                scenario={selectedRecipe}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onUsePrompt={handleUsePrompt}
                onSelectRelated={handleSelectRelated}
            />
        </div>
    );
}

// Directory Recipe Card Component
function DirectoryRecipeCard({
    recipe,
    onSelect,
    onUsePrompt,
}: {
    recipe: RecipeItem;
    onSelect: (recipe: RecipeItem) => void;
    onUsePrompt: (promptText: string) => void;
}) {
    // Pick the icon for the first matching product tag
    const primaryTag = recipe.productTags[0] ?? "SaaS";
    const CardIcon = DOMAIN_ICONS[primaryTag] ?? Sparkles;

    return (
        <div
            onClick={() => onSelect(recipe)}
            className="group relative cursor-pointer flex flex-col justify-between rounded-2xl bg-[var(--card)] border border-[var(--border)] p-5 transition-all duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)] shadow-none outline outline-1 outline-transparent -outline-offset-1 hover:-translate-y-1 hover:scale-[1.02] hover:outline-[var(--primary)]/70 hover:shadow-[0_12px_28px_-12px_rgba(0,0,0,0.8),0_0_20px_-4px_rgba(180,160,255,0.22)] select-none"
        >
            <div className="flex flex-col flex-1">
                {/* Meta Header: Category with Domain Icon and Architectural Level */}
                <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-colors flex items-center gap-1.5">
                        <CardIcon className="size-3.5 text-[var(--primary)]" />
                        <span>{recipe.category}</span>
                    </span>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-[var(--border)] bg-[var(--secondary)] text-[var(--muted-foreground)]">
                        Level {recipe.level}
                    </span>
                </div>

                {/* Title */}
                <h3 className="text-[17px] font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors duration-150 leading-snug mb-2 flex items-start justify-between">
                    <span>{recipe.title}</span>
                </h3>

                {/* The Promise */}
                <p className="text-xs text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]/90 transition-colors leading-relaxed mb-4">
                    {recipe.promise}
                </p>

                {/* What You Can Build (3 Bullets from book) */}
                <div className="space-y-1.5 mb-4 bg-[var(--secondary)]/30 p-3 rounded-xl border border-[var(--border)]/60">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--primary)] block mb-1">
                        What you can build:
                    </span>
                    {recipe.whatYouCanBuild.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-[11px] text-[var(--muted-foreground)] leading-tight">
                            <span className="text-[var(--primary)] shrink-0 font-bold">•</span>
                            <span className="truncate">{item}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Card Footer Actions */}
            <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs mt-auto">
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelect(recipe);
                    }}
                    className="text-xs font-mono text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:underline cursor-pointer"
                >
                    View steps →
                </button>

                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onUsePrompt(recipe.promptText);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[var(--secondary)] hover:bg-[var(--secondary)]/80 hover:text-[var(--primary)] border border-[var(--border)] text-[var(--foreground)] font-mono text-[11px] transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                    <Sparkles className="size-3 text-[var(--primary)]" />
                    <span>Use Prompt</span>
                </button>
            </div>
        </div>
    );
}

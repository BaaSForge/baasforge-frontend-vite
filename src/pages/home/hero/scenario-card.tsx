import {
    ArrowUpRight,
    Briefcase,
    Building2,
    Calendar,
    Compass,
    CreditCard,
    Film,
    Gamepad2,
    GraduationCap,
    HeartPulse,
    type LucideIcon,
    ShoppingBag,
    Sparkles,
    Store,
    Truck,
    Users,
    Wrench,
} from "lucide-react";
import type { RecipeItem } from "./recipes-data";

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
};

interface ScenarioCardProps {
    scenario: RecipeItem;
    onSelect: (scenario: RecipeItem) => void;
    onUsePrompt: (promptText: string) => void;
}

export function ScenarioCard({ scenario, onSelect, onUsePrompt }: ScenarioCardProps) {
    const primaryTag = scenario.productTags?.[0] ?? "SaaS";
    const CardIcon = DOMAIN_ICONS[primaryTag] ?? Sparkles;

    return (
        <div
            onClick={() => onSelect(scenario)}
            className="group relative cursor-pointer flex flex-col justify-between rounded-xl sm:rounded-2xl bg-[var(--card)] border border-[var(--border)] p-3.5 sm:p-5 transition-all duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)] shadow-none outline outline-1 outline-transparent -outline-offset-1 hover:-translate-y-1 hover:scale-[1.02] hover:outline-[var(--primary)]/70 hover:shadow-[0_12px_28px_-12px_rgba(0,0,0,0.8),0_0_20px_-4px_rgba(180,160,255,0.22)] h-full select-none"
        >
            <div className="flex flex-col flex-1">
                {/* Top Row: Clean Category with Domain Icon and Subtle Arrow */}
                <div className="flex items-center justify-between gap-2 mb-1.5 sm:mb-3 h-5 sm:h-6">
                    <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-colors flex items-center gap-1.5">
                        <CardIcon className="size-3 sm:size-3.5 text-[var(--primary)] shrink-0" />
                        <span>{scenario.category}</span>
                    </span>

                    <ArrowUpRight className="size-3.5 sm:size-4 text-[var(--muted-foreground)] group-hover:text-[var(--primary)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200 shrink-0" />
                </div>

                {/* Title */}
                <h3 className="text-sm sm:text-[16px] font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors duration-150 leading-snug line-clamp-2 min-h-[2.25rem] sm:h-11 flex items-start mb-1 sm:mb-2">
                    {scenario.title}
                </h3>

                {/* The Promise: Clean 2 lines on mobile, 3 lines on desktop */}
                <p className="text-[11px] sm:text-xs text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]/90 transition-colors leading-relaxed line-clamp-2 sm:line-clamp-3 mb-2">
                    {scenario.promise}
                </p>
            </div>

            {/* Bottom Card Footer Actions: Aligned 'Use Prompt' action */}
            <div className="pt-2 sm:pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs mt-auto">
                <span className="text-[10px] sm:text-[11px] font-mono text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors">
                    Click to view recipe
                </span>

                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onUsePrompt(scenario.promptText);
                    }}
                    className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-[var(--secondary)] hover:bg-[var(--secondary)]/80 hover:text-[var(--primary)] border border-[var(--border)] text-[var(--foreground)] font-mono text-[10px] sm:text-[11px] transition flex items-center gap-1.5 cursor-pointer shadow-xs ml-auto"
                >
                    <Sparkles className="size-3 text-[var(--primary)]" />
                    <span>Use Prompt</span>
                </button>
            </div>
        </div>
    );
}

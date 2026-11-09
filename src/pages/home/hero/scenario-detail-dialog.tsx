import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertTriangle,
    Layers,
    Sparkles,
    Copy,
    Check,
    Plug,
    Link as LinkIcon,
    X,
    Terminal,
} from "lucide-react";
import { useState } from "react";
import type { RecipeItem } from "./recipes-data";

interface ScenarioDetailDialogProps {
    scenario: RecipeItem | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUsePrompt: (prompt: string) => void;
    onSelectRelated?: (recipeId: number) => void;
}

export function ScenarioDetailDialog({
    scenario,
    open,
    onOpenChange,
    onUsePrompt,
    onSelectRelated,
}: ScenarioDetailDialogProps) {
    const [copied, setCopied] = useState(false);

    if (!scenario) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(scenario.promptText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton={false}
                className="dark-midnight !min-h-0 h-auto max-h-[82vh] max-w-lg w-full flex flex-col p-0 rounded-2xl bg-[oklch(0.21_0.034_264)] border border-[oklch(1_0_0_/_12%)] text-[oklch(0.96_0.012_260)] shadow-2xl z-[200] overflow-hidden outline-none sm:max-w-lg"
            >
                {/* COMPACT HEADER */}
                <DialogHeader className="px-4 py-3 bg-[var(--secondary)]/30 border-b border-[var(--border)] shrink-0 space-y-1 text-left">
                    {/* Top Row: Meta tags and benchmark Exit button */}
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] uppercase tracking-wider text-[var(--primary)] font-mono font-medium bg-[var(--primary)]/10 px-2 py-0.5 rounded border border-[var(--primary)]/20">
                                {scenario.category}
                            </span>
                            <span className="font-mono text-[10px] text-[var(--muted-foreground)]">
                                {scenario.level === 1 && "Level 1"}
                                {scenario.level === 2 && "Level 2"}
                                {scenario.level === 3 && "Level 3"}
                                {scenario.level === 4 && "Level 4"}
                            </span>
                        </div>

                        {/* Benchmark Close Button with ESC keyboard hint */}
                        <div className="flex items-center gap-1.5">
                            <span
                                className="hidden sm:inline-flex items-center text-[9px] font-mono text-[var(--muted-foreground)] border border-[var(--border)] rounded px-1.5 py-0.5 select-none"
                                aria-hidden="true"
                            >
                                ESC
                            </span>
                            <button
                                type="button"
                                onClick={() => onOpenChange(false)}
                                aria-label="Close dialog"
                                className="size-6 rounded-md bg-[var(--secondary)] hover:bg-[var(--secondary)]/80 text-[var(--muted-foreground)] hover:text-[var(--foreground)] border border-[var(--border)] flex items-center justify-center transition-colors cursor-pointer"
                            >
                                <X className="size-3" />
                            </button>
                        </div>
                    </div>

                    {/* Title */}
                    <DialogTitle className="text-base sm:text-lg font-bold tracking-tight text-[var(--foreground)] pt-0.5">
                        {scenario.title}
                    </DialogTitle>

                    {/* The Promise */}
                    <DialogDescription className="text-[11.5px] text-[var(--muted-foreground)] leading-snug">
                        {scenario.promise}
                    </DialogDescription>
                </DialogHeader>

                {/* SCROLLABLE COMPACT BODY */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5 text-xs">
                    {/* How It Works (Three Plain Steps in compact box) */}
                    <div className="p-2.5 rounded-xl bg-[var(--secondary)]/30 border border-[var(--border)]/60 space-y-1.5">
                        <div className="text-[10px] font-mono font-semibold tracking-wider text-[var(--muted-foreground)] uppercase flex items-center gap-1">
                            <Layers className="size-3 text-[var(--primary)]" />
                            <span>How it works:</span>
                        </div>
                        <ol className="space-y-1 text-[11px] text-[var(--foreground)]/90">
                            {scenario.howItWorks.map((step, idx) => (
                                <li key={idx} className="flex items-start gap-1.5">
                                    <span className="font-mono text-[10px] text-[var(--primary)] font-bold shrink-0">{idx + 1}.</span>
                                    <span className="leading-snug">{step}</span>
                                </li>
                            ))}
                        </ol>
                    </div>

                    {/* What You Can Build (Inline chips) */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="text-[10px] font-mono text-[var(--muted-foreground)] uppercase flex items-center gap-1">
                            <Sparkles className="size-3 text-[var(--primary)]" />
                            Builds:
                        </span>
                        {scenario.whatYouCanBuild.map((item, idx) => (
                            <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md bg-[var(--secondary)]/40 border border-[var(--border)]/60 text-[10.5px] text-[var(--foreground)]"
                            >
                                {item}
                            </span>
                        ))}
                    </div>

                    {/* Architectural Gotcha · Watch Out (Compact) */}
                    {scenario.watchOut && (
                        <div className="px-2.5 py-1.5 rounded-lg bg-amber-500/5 border border-amber-500/20 text-amber-300 text-[11px] flex items-start gap-1.5 leading-snug">
                            <AlertTriangle className="size-3 shrink-0 text-amber-400 mt-0.5" />
                            <span>
                                <strong className="font-semibold text-amber-400">Gotcha: </strong>
                                {scenario.watchOut}
                            </span>
                        </div>
                    )}

                    {/* AI Prompt Preview (Compact terminal) */}
                    <div className="p-2.5 rounded-lg bg-[var(--secondary)]/40 border border-[var(--border)] font-mono text-[10.5px] text-[var(--foreground)]/90 flex items-start justify-between gap-2">
                        <div className="flex items-start gap-1.5 flex-1 min-w-0">
                            <Terminal className="size-3 text-[var(--primary)] shrink-0 mt-0.5" />
                            <span className="line-clamp-2 leading-relaxed select-all">{scenario.promptText}</span>
                        </div>
                        <button
                            type="button"
                            onClick={handleCopy}
                            className="text-[var(--primary)] hover:underline shrink-0 text-[10px] font-mono flex items-center gap-1 cursor-pointer"
                        >
                            {copied ? <Check className="size-2.5 text-emerald-400" /> : <Copy className="size-2.5" />}
                            <span>{copied ? "Copied" : "Copy"}</span>
                        </button>
                    </div>

                    {/* External Integrations & Related Recipes */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5 text-[10px] font-mono text-[var(--muted-foreground)]">
                        {scenario.youllNeed ? (
                            <span className="flex items-center gap-1">
                                <Plug className="size-2.5 text-[var(--primary)]" />
                                <span>Needs: {scenario.youllNeed}</span>
                            </span>
                        ) : (
                            <span className="opacity-60">No external dependencies</span>
                        )}

                        {scenario.relatedRecipes && scenario.relatedRecipes.length > 0 && (
                            <div className="flex items-center gap-1">
                                <LinkIcon className="size-2.5" />
                                {scenario.relatedRecipes.slice(0, 2).map((relId) => (
                                    <button
                                        key={relId}
                                        type="button"
                                        onClick={() => onSelectRelated && onSelectRelated(relId)}
                                        className="text-[var(--primary)] hover:underline cursor-pointer"
                                    >
                                        #{String(relId).padStart(2, "0")}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* COMPACT FOOTER */}
                <div className="px-4 py-2.5 bg-[var(--secondary)]/25 border-t border-[var(--border)] shrink-0 flex items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={handleCopy}
                        className="px-2.5 py-1 rounded-md bg-[var(--secondary)] hover:bg-[var(--secondary)]/80 text-[var(--foreground)] font-mono text-[11px] flex items-center gap-1.5 border border-[var(--border)] cursor-pointer transition"
                    >
                        {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                        <span>{copied ? "Copied!" : "Copy Prompt"}</span>
                    </button>

                    <Button
                        type="button"
                        onClick={() => {
                            onUsePrompt(scenario.promptText);
                            onOpenChange(false);
                        }}
                        className="rounded-md bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold text-xs hover:bg-[var(--primary)]/90 cursor-pointer flex items-center gap-1 px-3 py-1 h-7.5"
                    >
                        <Sparkles className="size-3" />
                        <span>Use in BaaSForge</span>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

import { Button } from "@/components/ui/button";
import {
    ArrowUp,
    Bot,
    ChevronDown,
    Cpu,
    Mic,
    RotateCcw,
    Sparkles,
    X,
    Workflow,
    ShieldCheck,
    ShoppingBag,
    CreditCard,
    Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CYCLING_PLACEHOLDERS, SUGGESTED_PROMPTS } from "./scenarios-data";

const ENGINES = [
    {
        id: "orchestrator",
        name: "Orchestrator v2.4",
        shortName: "Orchestrator",
        desc: "Full 78 scenario synthesis with durable compensation",
    },
    {
        id: "prototyper",
        name: "Fast Prototyper v1.8",
        shortName: "Prototyper",
        desc: "Instant REST API & mock schema generator",
    },
    {
        id: "actor-mesh",
        name: "Actor Mesh Agent",
        shortName: "Actor Mesh",
        desc: "Stateful per-entity actors & race condition prevention",
    },
];

interface AiPromptBoxProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit?: (prompt: string) => void;
}

export function AiPromptBox({ value, onChange, onSubmit }: AiPromptBoxProps) {
    const [isFocused, setIsFocused] = useState(false);
    const [selectedEngineId, setSelectedEngineId] = useState("orchestrator");
    const [engineMenuOpen, setEngineMenuOpen] = useState(false);
    const [promptList, setPromptList] = useState(SUGGESTED_PROMPTS);
    const [activeChipId, setActiveChipId] = useState<string>(() => SUGGESTED_PROMPTS[0]?.id || "auth");
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const engineMenuRef = useRef<HTMLDivElement | null>(null);

    const currentEngine = ENGINES.find((e) => e.id === selectedEngineId) || ENGINES[0];

    // Close engine dropdown on outside click
    useEffect(() => {
        if (!engineMenuOpen) return;
        const handleOutsideClick = (e: MouseEvent) => {
            if (engineMenuRef.current && !engineMenuRef.current.contains(e.target as Node)) {
                setEngineMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, [engineMenuOpen]);

    // Typewriter state
    const [typewriterIndex, setTypewriterIndex] = useState(0);
    const [displayedPlaceholder, setDisplayedPlaceholder] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (value.trim().length > 0) return;

        const currentFullPhrase = CYCLING_PLACEHOLDERS[typewriterIndex];
        let timer: ReturnType<typeof setTimeout>;

        if (!isDeleting) {
            // Typing forward
            if (displayedPlaceholder.length < currentFullPhrase.length) {
                timer = setTimeout(() => {
                    setDisplayedPlaceholder(currentFullPhrase.slice(0, displayedPlaceholder.length + 1));
                }, 32);
            } else {
                // Pause at the end before deleting
                timer = setTimeout(() => {
                    setIsDeleting(true);
                }, 2400);
            }
        } else {
            // Deleting backward
            if (displayedPlaceholder.length > 0) {
                timer = setTimeout(() => {
                    setDisplayedPlaceholder(currentFullPhrase.slice(0, displayedPlaceholder.length - 1));
                }, 18);
            } else {
                // Pause briefly before typing next phrase
                timer = setTimeout(() => {
                    setIsDeleting(false);
                    setTypewriterIndex((prev) => (prev + 1) % CYCLING_PLACEHOLDERS.length);
                }, 260);
            }
        }

        return () => clearTimeout(timer);
    }, [displayedPlaceholder, isDeleting, typewriterIndex, value]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            const textToSubmit = value.trim() || CYCLING_PLACEHOLDERS[typewriterIndex];
            if (onSubmit) {
                onSubmit(textToSubmit);
            }
        }
    };

    const handleQuickPromptClick = (promptText: string) => {
        onChange(promptText);
        if (textareaRef.current) {
            textareaRef.current.focus();
            const len = promptText.length;
            textareaRef.current.setSelectionRange(len, len);
        }
    };

    const handleShufflePrompts = () => {
        setPromptList((prev) => {
            const shuffled = [...prev].sort(() => Math.random() - 0.5);
            if (shuffled[0]) {
                setActiveChipId(shuffled[0].id);
            }
            return shuffled;
        });
    };

    const getChipIcon = (label: string) => {
        if (label.includes("Order") || label.includes("Cart")) return <ShoppingBag className="size-3.5 text-amber-400" />;
        if (label.includes("Agent") || label.includes("AI") || label.includes("Chat")) return <Bot className="size-3.5 text-[var(--primary)]" />;
        if (label.includes("Webhook") || label.includes("Stripe") || label.includes("Wallet") || label.includes("Billing") || label.includes("Ledger") || label.includes("Payment")) return <CreditCard className="size-3.5 text-emerald-400" />;
        if (label.includes("Workspaces") || label.includes("User") || label.includes("Auth")) return <Users className="size-3.5 text-sky-400" />;
        if (label.includes("Guardrail")) return <ShieldCheck className="size-3.5 text-emerald-400" />;
        return <Workflow className="size-3.5 text-purple-400" />;
    };

    return (
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
            {/* The Prompt Box Container */}
            <div
                className={`w-full relative rounded-2xl transition-all duration-200 border ${
                    isFocused
                        ? "bg-[var(--card)] border-[var(--primary)] shadow-[0_0_36px_rgba(124,155,248,0.18),0_12px_36px_rgba(0,0,0,0.5)]"
                        : "bg-[var(--card)] border-[var(--border)] hover:border-[color-mix(in_oklch,var(--foreground)_25%,transparent)] shadow-[0_12px_32px_rgba(0,0,0,0.35)]"
                } p-3.5 sm:p-5`}
            >
                {/* Textarea Input with Typewriter Placeholder */}
                <div className="relative min-h-[72px] sm:min-h-[92px]">
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        onKeyDown={handleKeyDown}
                        placeholder={displayedPlaceholder ? `${displayedPlaceholder}|` : "Ask BaaSForge to build..."}
                        rows={3}
                        className="w-full bg-transparent resize-none text-sm sm:text-base text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/70 focus:outline-none leading-relaxed transition-all duration-150"
                    />

                    {/* Clear Button if typed */}
                    {value.trim().length > 0 && (
                        <button
                            type="button"
                            onClick={() => onChange("")}
                            className="absolute top-0 right-0 p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)] transition cursor-pointer"
                            title="Clear input"
                        >
                            <X className="size-4" />
                        </button>
                    )}
                </div>

                {/* Bottom Bar: Engine Selector & Actions */}
                <div className="mt-2.5 pt-2 sm:pt-2.5 border-t border-[var(--border)] flex items-center justify-between gap-2">
                    {/* Engine / Model Pill */}
                    <div className="relative" ref={engineMenuRef}>
                        <button
                            type="button"
                            onClick={() => setEngineMenuOpen(!engineMenuOpen)}
                            className="flex items-center gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg bg-[var(--secondary)]/80 hover:bg-[var(--secondary)] border border-[var(--border)] text-[11px] sm:text-xs text-[var(--foreground)] font-mono transition cursor-pointer shrink min-w-0"
                        >
                            <Cpu className="size-3 sm:size-3.5 text-[var(--muted-foreground)] shrink-0" />
                            <span className="truncate max-w-[120px] sm:max-w-none">{currentEngine.shortName}</span>
                            <span className="hidden sm:inline text-[var(--muted-foreground)]">
                                {currentEngine.id === "orchestrator" ? "v2.4" : ""}
                            </span>
                            <ChevronDown className="size-3 text-[var(--muted-foreground)] shrink-0 ml-0.5" />
                        </button>

                        {/* Engine Dropdown Menu */}
                        {engineMenuOpen && (
                            <div className="absolute left-0 bottom-full mb-2 w-72 max-w-[calc(100vw-3rem)] bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-2xl p-1.5 z-50 text-xs">
                                <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-[var(--muted-foreground)] font-semibold">
                                    Execution Engine
                                </div>
                                {ENGINES.map((eng) => (
                                    <button
                                        key={eng.id}
                                        type="button"
                                        onClick={() => {
                                            setSelectedEngineId(eng.id);
                                            setEngineMenuOpen(false);
                                        }}
                                        className={`w-full text-left p-2 rounded-lg transition cursor-pointer ${
                                            selectedEngineId === eng.id
                                                ? "bg-[var(--secondary)] text-[var(--foreground)] font-medium"
                                                : "text-[var(--muted-foreground)] hover:bg-[var(--secondary)]/50 hover:text-[var(--foreground)]"
                                        }`}
                                    >
                                        <div className="font-semibold text-[var(--foreground)]">{eng.name}</div>
                                        <div className="text-[11px] text-[var(--muted-foreground)] mt-0.5 leading-tight">{eng.desc}</div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Action Icons */}
                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={() => {
                                const currentPrompt = CYCLING_PLACEHOLDERS[typewriterIndex];
                                onChange(currentPrompt);
                            }}
                            className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)] transition cursor-pointer"
                            title="Insert current suggestion"
                        >
                            <Sparkles className="size-3.5 sm:size-4" />
                        </button>

                        <button
                            type="button"
                            className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)] transition cursor-pointer"
                            title="Voice input"
                        >
                            <Mic className="size-3.5 sm:size-4" />
                        </button>

                        {/* Send / Generate Button */}
                        <Button
                            type="button"
                            onClick={() => {
                                const textToSubmit = value.trim() || CYCLING_PLACEHOLDERS[typewriterIndex];
                                if (onSubmit) onSubmit(textToSubmit);
                            }}
                            className="size-8 sm:size-9 rounded-lg sm:rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90 transition-all flex items-center justify-center p-0 shadow-sm font-semibold cursor-pointer shrink-0"
                            title="Generate architecture"
                        >
                            <ArrowUp className="size-3.5 sm:size-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Quick Suggestion Chips: Strictly bounded to prompt box width */}
            <div className="w-full max-w-full mt-3 sm:mt-3.5 flex items-center justify-center gap-1.5 sm:gap-2 text-xs">
                {promptList.slice(0, 4).map((item) => {
                    const isActive = item.id === activeChipId;
                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                                setActiveChipId(item.id);
                                handleQuickPromptClick(item.prompt);
                            }}
                            className={`group flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer shrink-0 active:scale-95 ${
                                isActive
                                    ? "px-3 py-1.5 gap-1.5 bg-[var(--secondary)] border border-[var(--primary)]/50 text-[var(--foreground)] shadow-xs"
                                    : "size-8 md:size-auto md:px-3 md:py-1.5 p-0 md:p-auto gap-0 md:gap-1.5 bg-[var(--secondary)]/60 hover:bg-[var(--secondary)] border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                            }`}
                            title={item.label}
                            aria-label={item.label}
                        >
                            <span className="shrink-0 flex items-center justify-center">{getChipIcon(item.label)}</span>
                            {/* Smooth text transition:
                                - On screens >= 768px (md:): full text visible, fits inside 768px box
                                - On screens < 768px: active chip shows text, inactive chips are compact 32px circles (~240px total), never exceeding the prompt box width */}
                            <span
                                className={`font-medium text-[11px] sm:text-[12px] whitespace-nowrap overflow-hidden transition-[max-width,opacity] duration-300 ease-out ${
                                    isActive
                                        ? "max-w-[120px] opacity-100 ml-0.5 md:ml-0"
                                        : "max-w-0 opacity-0 md:max-w-[120px] md:opacity-100 hidden md:inline-block"
                                }`}
                            >
                                {item.label}
                            </span>
                        </button>
                    );
                })}

                {/* Shuffle / Randomize button */}
                <button
                    type="button"
                    onClick={handleShufflePrompts}
                    className="size-8 flex items-center justify-center rounded-full bg-[var(--secondary)]/60 hover:bg-[var(--secondary)] border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all cursor-pointer shrink-0 active:scale-95"
                    title="Shuffle prompt suggestions"
                    aria-label="Shuffle prompt suggestions"
                >
                    <RotateCcw className="size-3.5" />
                </button>
            </div>
        </div>
    );
}

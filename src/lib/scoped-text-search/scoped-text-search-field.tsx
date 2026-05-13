"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { findInScopeShortcutLabel } from "./find-shortcut-label";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useScopedTextSearch } from "./scoped-text-search-context";

export type ScopedTextSearchFieldProps = {
    className?: string;
};

export function ScopedTextSearchField({ className }: ScopedTextSearchFieldProps) {
    const {
        query,
        setQuery,
        matchCount,
        activeIndex,
        goNext,
        goPrev,
        inputRef,
        searchBarVisible,
        setSearchBarVisible,
        openSearch,
    } = useScopedTextSearch();

    const shortcut = findInScopeShortcutLabel();
    const isMobile = useIsMobile();

    if (!searchBarVisible) {
        return (
            <button
                type="button"
                onClick={openSearch}
                className={cn(
                    "text-muted-foreground hover:text-foreground inline-flex min-h-11 max-w-full shrink-0 items-center rounded-md border border-transparent px-3 py-2.5 text-left text-sm transition-[color,padding] duration-150 focus:px-6 sm:min-h-9 sm:px-1 sm:py-0.5 sm:text-xs sm:focus:px-5",
                    className,
                    "w-fit min-w-min max-w-full shrink-0 self-start md:max-w-[22rem]",
                )}
            >
                {isMobile ? "Click to search in this view" : `Press ${shortcut} to search in this view`}
            </button>
        );
    }

    const label = matchCount > 0 ? `${activeIndex + 1} / ${matchCount}` : query.trim() ? "0 / 0" : "";

    return (
        <div className={cn("relative min-h-11 w-full min-w-0 sm:min-h-9", className)}>
            <Input
                ref={inputRef}
                type="search"
                role="searchbox"
                aria-label="Find in view"
                placeholder={isMobile ? "Search…" : `Search… (${shortcut})`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        if (e.shiftKey) goPrev();
                        else goNext();
                    }
                    if (e.key === "Escape") {
                        e.preventDefault();
                        setSearchBarVisible(false);
                        inputRef.current?.blur();
                    }
                }}
                className="h-11 min-w-0 pr-[7.25rem] text-sm sm:h-9 sm:pr-[6.5rem] sm:text-xs"
                data-scoped-text-search-ignore
            />
            <div className="pointer-events-none absolute inset-y-0 right-1.5 flex max-w-[calc(100%-0.75rem)] items-center gap-0.5 sm:right-1">
                {label ? (
                    <span className="text-muted-foreground pointer-events-none shrink-0 pr-0.5 tabular-nums text-xs">{label}</span>
                ) : null}
                <div className="pointer-events-auto flex shrink-0 items-center gap-px">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 sm:size-7"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={goPrev}
                        aria-label="Previous match"
                    >
                        <ChevronUp className="size-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 sm:size-7"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={goNext}
                        aria-label="Next match"
                    >
                        <ChevronDown className="size-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

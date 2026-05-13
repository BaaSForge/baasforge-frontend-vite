"use client";

import Mark from "mark.js";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";
import { buildMatchRanges } from "./build-match-ranges";

const HIT_CLASS = "scoped-text-search-hit";
const HIT_CURRENT_CLASS = "scoped-text-search-hit-current";
const HIGHLIGHT_OTHERS = "scoped-text-search-others";
const HIGHLIGHT_ACTIVE = "scoped-text-search-active";

type ScopedTextSearchContextValue = {
    setScopeElement: (el: HTMLElement | null) => void;
    query: string;
    setQuery: (q: string) => void;
    activeIndex: number;
    setActiveIndex: (i: number) => void;
    matchCount: number;
    goNext: () => void;
    goPrev: () => void;
    searchBarVisible: boolean;
    setSearchBarVisible: (v: boolean) => void;
    inputRef: React.RefObject<HTMLInputElement | null>;
    openSearch: () => void;
    caseSensitive: boolean;
    onModalEscapeKeyDown: (event: KeyboardEvent) => void;
};

const ScopedTextSearchContext = createContext<ScopedTextSearchContextValue | null>(null);

export function useScopedTextSearch(): ScopedTextSearchContextValue {
    const v = useContext(ScopedTextSearchContext);
    if (!v) throw new Error("useScopedTextSearch must be used within ScopedTextSearchProvider");
    return v;
}

function supportsCssHighlight(): boolean {
    return typeof CSS !== "undefined" && Boolean(CSS.highlights);
}

function clearCssHighlights() {
    if (!CSS.highlights) return;
    CSS.highlights.delete(HIGHLIGHT_OTHERS);
    CSS.highlights.delete(HIGHLIGHT_ACTIVE);
}

function applyCssHighlights(ranges: Range[], activeIndex: number) {
    if (!CSS.highlights || ranges.length === 0) {
        clearCssHighlights();
        return;
    }
    const others = new Highlight();
    const active = new Highlight();
    for (let i = 0; i < ranges.length; i++) {
        if (i === activeIndex) active.add(ranges[i]!);
        else others.add(ranges[i]!);
    }
    CSS.highlights.set(HIGHLIGHT_OTHERS, others);
    CSS.highlights.set(HIGHLIGHT_ACTIVE, active);
}

function elementContainingRangeStart(range: Range): Element | null {
    const n = range.startContainer;
    if (n.nodeType === Node.TEXT_NODE) {
        return (n as Text).parentElement;
    }
    return n instanceof Element ? n : null;
}

function scrollRangeIntoView(range: Range) {
    const el = elementContainingRangeStart(range);
    el?.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
}

function scrollElementIntoView(el: Element) {
    el.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
}

function clampIndex(i: number, count: number): number {
    if (count <= 0) return 0;
    return Math.min(Math.max(0, i), count - 1);
}

export type ScopedTextSearchProviderProps = {
    children: ReactNode;
    active: boolean;
    contentKey?: string | number;
    caseSensitive?: boolean;
};

export function ScopedTextSearchProvider({
    children,
    active,
    contentKey = "",
    caseSensitive = false,
}: ScopedTextSearchProviderProps) {
    const scopeElementRef = useRef<HTMLElement | null>(null);
    const setScopeElement = useCallback((el: HTMLElement | null) => {
        scopeElementRef.current = el;
    }, []);

    const inputRef = useRef<HTMLInputElement | null>(null);
    const markRef = useRef<Mark | null>(null);
    const rangesRef = useRef<Range[]>([]);
    const matchCountRef = useRef(0);

    const [query, setQuery] = useState("");
    const [activeIndex, setActiveIndex] = useState(0);
    const [matchCount, setMatchCount] = useState(0);
    const [searchBarVisible, setSearchBarVisible] = useState(false);
    const [scrollSignal, setScrollSignal] = useState(0);

    const bumpScroll = useCallback(() => {
        setScrollSignal((s) => s + 1);
    }, []);

    const openSearch = useCallback(() => {
        setSearchBarVisible(true);
        queueMicrotask(() => {
            inputRef.current?.focus();
            inputRef.current?.select();
        });
    }, []);

    const onModalEscapeKeyDown = useCallback((event: KeyboardEvent) => {
        const input = inputRef.current;
        if (!searchBarVisible || input == null || document.activeElement !== input) return;
        event.preventDefault();
        setSearchBarVisible(false);
        input.blur();
    }, [searchBarVisible]);

    useLayoutEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- reset match cursor when the query string changes
        setActiveIndex(0);
    }, [query, contentKey]);

    useEffect(() => {
        if (!active) return;
        const onKey = (e: KeyboardEvent) => {
            if (!(e.ctrlKey || e.metaKey) || e.key !== "f" || e.altKey) return;
            if (e.repeat) return;
            e.preventDefault();
            openSearch();
        };
        window.addEventListener("keydown", onKey, true);
        return () => window.removeEventListener("keydown", onKey, true);
    }, [active, openSearch]);

    const goNext = useCallback(() => {
        const mc = matchCountRef.current;
        if (mc <= 0) return;
        setActiveIndex((i) => (i + 1) % mc);
        bumpScroll();
    }, [bumpScroll]);

    const goPrev = useCallback(() => {
        const mc = matchCountRef.current;
        if (mc <= 0) return;
        setActiveIndex((i) => (i - 1 + mc) % mc);
        bumpScroll();
    }, [bumpScroll]);

    useLayoutEffect(() => {
        if (!active) {
            clearCssHighlights();
            const el = scopeElementRef.current;
            if (el && markRef.current) {
                markRef.current.unmark();
                markRef.current = null;
            }
            rangesRef.current = [];
            return;
        }

        const root = scopeElementRef.current;
        if (!root) return;

        const q = query.trim();
        if (q.length === 0) {
            clearCssHighlights();
            markRef.current?.unmark();
            markRef.current = null;
            rangesRef.current = [];
            matchCountRef.current = 0;
            setMatchCount(0); // eslint-disable-line react-hooks/set-state-in-effect -- clear result count when query is cleared
            return;
        }

        const useHighlight = supportsCssHighlight();
        let cancelled = false;

        if (useHighlight) {
            if (markRef.current) {
                markRef.current.unmark();
                markRef.current = null;
            }
            const ranges = buildMatchRanges(root, q, caseSensitive);
            rangesRef.current = ranges;
            const n = ranges.length;
            matchCountRef.current = n;
            setMatchCount(n);
            return () => {
                clearCssHighlights();
                rangesRef.current = [];
                matchCountRef.current = 0;
            };
        }

        if (!markRef.current) markRef.current = new Mark(root);
        markRef.current.unmark({
            done: () => {
                if (cancelled || scopeElementRef.current !== root) return;
                const mark = markRef.current;
                if (!mark) return;
                mark.mark(q, {
                    acrossElements: true,
                    separateWordSearch: false,
                    caseSensitive,
                    className: HIT_CLASS,
                    element: "mark",
                    done: (total) => {
                        if (cancelled || scopeElementRef.current !== root) return;
                        matchCountRef.current = total;
                        setMatchCount(total);
                    },
                });
            },
        });

        return () => {
            cancelled = true;
            clearCssHighlights();
            markRef.current?.unmark();
            markRef.current = null;
            matchCountRef.current = 0;
        };
    }, [active, query, contentKey, caseSensitive]);

    useLayoutEffect(() => {
        if (!active) return;
        const root = scopeElementRef.current;
        if (!root) return;
        const q = query.trim();
        if (q.length === 0) return;

        const mc = matchCountRef.current;
        const idx = clampIndex(activeIndex, mc);

        if (supportsCssHighlight()) {
            const ranges = rangesRef.current;
            if (ranges.length === 0) return;
            applyCssHighlights(ranges, idx);
            const r = ranges[idx];
            if (r) scrollRangeIntoView(r);
            return;
        }

        const hits = root.querySelectorAll(`mark.${HIT_CLASS}`);
        hits.forEach((el, i) => {
            el.classList.toggle(HIT_CURRENT_CLASS, i === idx);
        });
        const cur = hits[idx];
        if (cur) scrollElementIntoView(cur);
    }, [active, activeIndex, query, matchCount, scrollSignal]);

    const value = useMemo(
        () =>
            ({
                setScopeElement,
                query,
                setQuery,
                activeIndex,
                setActiveIndex,
                matchCount,
                goNext,
                goPrev,
                searchBarVisible,
                setSearchBarVisible,
                inputRef,
                openSearch,
                caseSensitive,
                onModalEscapeKeyDown,
            }) satisfies ScopedTextSearchContextValue,
        [
            setScopeElement,
            query,
            activeIndex,
            matchCount,
            goNext,
            goPrev,
            searchBarVisible,
            setSearchBarVisible,
            openSearch,
            caseSensitive,
            onModalEscapeKeyDown,
        ],
    );

    return <ScopedTextSearchContext.Provider value={value}>{children}</ScopedTextSearchContext.Provider>;
}

export type ScopedTextSearchScopeProps = {
    children: ReactNode;
    className?: string;
};

export function ScopedTextSearchScope({ children, className }: ScopedTextSearchScopeProps) {
    const { setScopeElement } = useScopedTextSearch();
    return (
        <div ref={setScopeElement} className={className} data-scoped-text-search-scope>
            {children}
        </div>
    );
}

export { HIT_CLASS, HIT_CURRENT_CLASS, HIGHLIGHT_ACTIVE, HIGHLIGHT_OTHERS };

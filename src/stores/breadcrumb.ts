import * as React from "react";
import { createStore, useStore } from "zustand";

export const STICKY_BAR_TRANSITION_DURATION_MS = 200;
export const STICKY_BAR_TRANSITION_EASING = "ease-out";

export interface BreadcrumbState {
    segmentLabels: Record<string, string>;
    setSegmentLabel: (paramName: string, label: string) => void;
    clearSegmentLabel: (paramName: string) => void;
    clearAllSegmentLabels: () => void;
    stickyBarVisible: boolean;
    setStickyBarVisible: (visible: boolean) => void;
    stickyBarHeight: number;
    setStickyBarHeight: (height: number) => void;
    pageTitleBoxHeight: number;
    setPageTitleBoxHeight: (height: number) => void;
    stickyBarTransitionDurationMs: number;
    stickyBarTransitionEasing: string;
}

const breadcrumbStore = createStore<BreadcrumbState>((set) => ({
    segmentLabels: {},
    setSegmentLabel: (paramName, label) =>
        set((state) => ({
            segmentLabels: { ...state.segmentLabels, [paramName]: label },
        })),
    clearSegmentLabel: (paramName) =>
        set((state) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [paramName]: _removed, ...rest } = state.segmentLabels;
            return { segmentLabels: rest };
        }),
    clearAllSegmentLabels: () => set({ segmentLabels: {} }),
    stickyBarVisible: true,
    setStickyBarVisible: (visible) => set({ stickyBarVisible: visible }),
    stickyBarHeight: 0,
    setStickyBarHeight: (height) => set({ stickyBarHeight: height }),
    pageTitleBoxHeight: 0,
    setPageTitleBoxHeight: (height) => set({ pageTitleBoxHeight: height }),
    stickyBarTransitionDurationMs: STICKY_BAR_TRANSITION_DURATION_MS,
    stickyBarTransitionEasing: STICKY_BAR_TRANSITION_EASING,
}));

export { breadcrumbStore };

export function useBreadcrumbSegmentLabels(): Record<string, string> {
    return useStore(breadcrumbStore, (s) => s.segmentLabels);
}

export function useBreadcrumbActions() {
    const setSegmentLabel = useStore(breadcrumbStore, (s) => s.setSegmentLabel);
    const clearSegmentLabel = useStore(breadcrumbStore, (s) => s.clearSegmentLabel);
    const clearAllSegmentLabels = useStore(breadcrumbStore, (s) => s.clearAllSegmentLabels);
    return { setSegmentLabel, clearSegmentLabel, clearAllSegmentLabels };
}

export function useStickyBreadcrumbBarVisible(): boolean {
    return useStore(breadcrumbStore, (s) => s.stickyBarVisible);
}

export function useStickyBreadcrumbBarHeight(): number {
    return useStore(breadcrumbStore, (s) => s.stickyBarHeight);
}

export function usePageTitleBoxHeight(): number {
    return useStore(breadcrumbStore, (s) => s.pageTitleBoxHeight);
}

export function useStickyBreadcrumbBarState() {
    return useStore(breadcrumbStore, (s) => ({
        stickyBarVisible: s.stickyBarVisible,
        stickyBarHeight: s.stickyBarHeight,
        setStickyBarVisible: s.setStickyBarVisible,
        setStickyBarHeight: s.setStickyBarHeight,
    }));
}

export function useStickyBreadcrumbBarTransition(): { classes: string; styles: React.CSSProperties } {
    const durationMs = useStore(breadcrumbStore, (s) => s.stickyBarTransitionDurationMs);
    const easing = useStore(breadcrumbStore, (s) => s.stickyBarTransitionEasing);
    return React.useMemo(
        () => ({
            classes: `duration-[var(--dur)] ease-[var(--ease)]`,
            styles: {
                ["--dur" as string]: `${durationMs}ms`,
                ["--ease" as string]: easing,
            } as React.CSSProperties,
        }),
        [durationMs, easing],
    );
}

export function useStickyBreadcrumbBarTransitionConfig(): {
    durationMs: number;
    easing: string;
} {
    return useStore(breadcrumbStore, (s) => ({
        durationMs: s.stickyBarTransitionDurationMs,
        easing: s.stickyBarTransitionEasing,
    }));
}

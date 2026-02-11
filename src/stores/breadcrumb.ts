import { createStore, useStore } from "zustand";

export interface BreadcrumbState {
  segmentLabels: Record<string, string>;
  setSegmentLabel: (paramName: string, label: string) => void;
  clearSegmentLabel: (paramName: string) => void;
  clearAllSegmentLabels: () => void;
}

const breadcrumbStore = createStore<BreadcrumbState>((set) => ({
  segmentLabels: {},
  setSegmentLabel: (paramName, label) =>
    set((state) => ({
      segmentLabels: { ...state.segmentLabels, [paramName]: label },
    })),
  clearSegmentLabel: (paramName) =>
    set((state) => {
      const { [paramName]: _, ...rest } = state.segmentLabels;
      return { segmentLabels: rest };
    }),
  clearAllSegmentLabels: () => set({ segmentLabels: {} }),
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

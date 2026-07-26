"use client";

import * as React from "react";

import { appStateStore } from "@/modules/app-state/store";

import { StartDebugModal } from "./start-debug-modal";

type StartDebugModalContextValue = {
    open: () => void;
    close: () => void;
};

const StartDebugModalContext = React.createContext<StartDebugModalContextValue | null>(null);

export function StartDebugModalProvider({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = React.useState(false);

    const value = React.useMemo(
        () => ({
            open: () => setOpen(true),
            close: () => setOpen(false),
        }),
        [],
    );

    React.useEffect(() => {
        appStateStore.getState().setDebugModalOpen(open);
    }, [open]);

    return (
        <StartDebugModalContext.Provider value={value}>
            {children}
            <StartDebugModal open={open} onOpenChange={setOpen} />
        </StartDebugModalContext.Provider>
    );
}

export function useStartDebugModal() {
    const ctx = React.useContext(StartDebugModalContext);
    if (ctx == null) {
        throw new Error("useStartDebugModal must be used within StartDebugModalProvider");
    }
    return ctx;
}

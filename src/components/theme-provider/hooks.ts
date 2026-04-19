import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "dark-default" | "dark-midnight" | "light" | "system";

export type ThemeProviderState = {
    theme: Theme;
    setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
    theme: "system",
    setTheme: () => null,
};

export const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export const useTheme = () => {
    const context = useContext(ThemeProviderContext);

    if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider");

    return context;
};

const PREFERS_COLOR_SCHEME_DARK = "(prefers-color-scheme: dark)";

function getPrefersColorSchemeDark(): boolean {
    return typeof window !== "undefined" && window.matchMedia(PREFERS_COLOR_SCHEME_DARK).matches;
}

function subscribePrefersColorSchemeDark(onChange: (prefersDark: boolean) => void): () => void {
    const media = window.matchMedia(PREFERS_COLOR_SCHEME_DARK);
    const handler = () => onChange(media.matches);
    queueMicrotask(() => onChange(media.matches));
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
}

function resolveThemeLightDark(theme: Theme): "light" | "dark" {
    if (theme === "light") return "light";
    if (theme === "dark-default" || theme === "dark-midnight") return "dark";
    return getPrefersColorSchemeDark() ? "dark" : "light";
}

export function useResolvedTheme() {
    const { theme } = useTheme();
    const [resolved, setResolved] = useState<"light" | "dark">(() => resolveThemeLightDark(theme));

    useEffect(() => {
        if (theme === "system") {
            return subscribePrefersColorSchemeDark((prefersDark) => {
                setResolved(prefersDark ? "dark" : "light");
            });
        }
        queueMicrotask(() => setResolved(theme === "light" ? "light" : "dark"));
    }, [theme]);

    return resolved;
}

export type ResolvedAppTheme = "light" | "dark-default" | "dark-midnight";

function resolveAppTheme(theme: Theme): ResolvedAppTheme {
    if (theme === "light") return "light";
    if (theme === "dark-default") return "dark-default";
    if (theme === "dark-midnight") return "dark-midnight";
    return getPrefersColorSchemeDark() ? "dark-midnight" : "light";
}

export function useResolvedAppTheme() {
    const { theme } = useTheme();
    const [resolved, setResolved] = useState<ResolvedAppTheme>(() => resolveAppTheme(theme));

    useEffect(() => {
        if (theme === "system") {
            return subscribePrefersColorSchemeDark((prefersDark) => {
                setResolved(prefersDark ? "dark-midnight" : "light");
            });
        }
        queueMicrotask(() => {
            if (theme === "light") setResolved("light");
            else if (theme === "dark-default") setResolved("dark-default");
            else if (theme === "dark-midnight") setResolved("dark-midnight");
        });
    }, [theme]);

    return resolved;
}

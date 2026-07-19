import { useEffect, useState } from "react";
import { ThemeProviderContext, type Theme } from "./hooks";

type ThemeProviderProps = {
    children: React.ReactNode;
    defaultTheme?: Theme;
    storageKey: string;
};

function normalizeStoredTheme(raw: string | null, fallback: Theme): Theme {
    if (raw === "dark") return "dark-midnight";
    if (raw === "light" || raw === "system" || raw === "dark-default" || raw === "dark-midnight") return raw;
    return fallback;
}

export function ThemeProvider({ children, defaultTheme = "system", storageKey, ...props }: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window === "undefined") return defaultTheme;
        return normalizeStoredTheme(localStorage.getItem(storageKey), defaultTheme);
    });

    useEffect(() => {
        const root = window.document.documentElement;

        const applyLight = () => {
            root.classList.remove("dark-default", "dark-midnight");
            root.classList.add("light");
        };

        const applyDarkVariant = (variant: "dark-default" | "dark-midnight") => {
            root.classList.remove("light");
            root.classList.remove("dark-default", "dark-midnight");
            root.classList.add(variant);
        };

        if (theme === "system") {
            const media = window.matchMedia("(prefers-color-scheme: dark)");
            const sync = () => {
                if (media.matches) {
                    applyDarkVariant("dark-midnight");
                } else {
                    applyLight();
                }
            };
            sync();
            media.addEventListener("change", sync);
            return () => media.removeEventListener("change", sync);
        }

        if (theme === "light") {
            applyLight();
            return;
        }

        applyDarkVariant(theme);
    }, [theme]);

    const value = {
        theme,
        setTheme: (next: Theme) => {
            localStorage.setItem(storageKey, next);
            setTheme(next);
        },
    };

    return (
        <ThemeProviderContext.Provider {...props} value={value}>
            {children}
        </ThemeProviderContext.Provider>
    );
}

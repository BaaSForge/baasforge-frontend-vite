import { createContext, useContext, useEffect, useState } from "react"

export type Theme = "dark" | "light" | "system"

export type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

export const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}

export function useResolvedTheme() {
  const { theme } = useTheme();
  const [resolved, setResolved] = useState<"light" | "dark">("dark");

  useEffect(() => {
    if (theme === "system") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      setResolved(media.matches ? "dark" : "light");
      const handler = () => setResolved(media.matches ? "dark" : "light");
      media.addEventListener("change", handler);
      return () => media.removeEventListener("change", handler);
    }
    setResolved(theme);
  }, [theme]);

  return resolved;
}
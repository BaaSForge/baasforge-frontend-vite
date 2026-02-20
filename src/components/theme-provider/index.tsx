import { useEffect, useState } from "react"
import { ThemeProviderContext, type Theme } from "./hooks"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )

  useEffect(() => {
    const root = window.document.documentElement

    const applyTheme = (value: "light" | "dark") => {
      root.classList.remove("light", "dark")
      root.classList.add(value)
    }

    if (theme === "system") {
      const media = window.matchMedia("(prefers-color-scheme: dark)")
      applyTheme(media.matches ? "dark" : "light")
      const handler = () => applyTheme(media.matches ? "dark" : "light")
      media.addEventListener("change", handler)
      return () => media.removeEventListener("change", handler)
    }

    applyTheme(theme)
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export { useTheme } from "./hooks";
import { Monitor, Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useTheme } from "@/components/theme-provider"
import type { Theme } from "@/components/theme-provider/hooks"

const THEME_ORDER: Theme[] = ["light", "dark", "system"]
const THEME_LABELS: Record<Theme, string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
}

function getNextTheme(current: Theme): Theme {
  const i = THEME_ORDER.indexOf(current)
  return THEME_ORDER[(i + 1) % THEME_ORDER.length]
}

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const nextTheme = getNextTheme(theme)

  const handleClick = () => {
    setTheme(nextTheme)
  }

  const Icon =
    theme === "light"
      ? Sun
      : theme === "dark"
        ? Moon
        : Monitor

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          onClick={handleClick}
          aria-label={`Theme: ${THEME_LABELS[theme]}. Switch to ${THEME_LABELS[nextTheme]}.`}
        >
          <Icon className="h-[1.2rem] w-[1.2rem]" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {THEME_LABELS[theme]}, click to switch to {THEME_LABELS[nextTheme]}
      </TooltipContent>
    </Tooltip>
  )
}

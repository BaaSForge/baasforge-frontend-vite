import { Contrast, Monitor, Moon, Sun } from "lucide-react";
import * as React from "react";

import type { Theme } from "@/components/theme-provider/hooks";
import { useTheme } from "@/components/theme-provider/hooks";
import { Button } from "@/components/ui/button";
import { RotatingCombobox, type RotatingComboboxOption } from "@/components/ui/rotating-combobox";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { appStateStore } from "@/modules/app-state";

const THEME_ORDER = ["light", "dark-midnight", "dark-default", "system"] as const satisfies readonly Theme[];

const THEME_LABELS: Record<Theme, string> = {
    light: "Light",
    "dark-midnight": "Midnight",
    "dark-default": "Dense dark",
    system: "System",
};

function themeIcon(t: Theme) {
    if (t === "light") return <Sun className="h-[1.2rem] w-[1.2rem]" />;
    if (t === "system") return <Monitor className="h-[1.2rem] w-[1.2rem]" />;
    if (t === "dark-default") return <Contrast className="h-[1.2rem] w-[1.2rem]" />;
    return <Moon className="h-[1.2rem] w-[1.2rem]" />;
}

function getNextTheme(current: Theme): Theme {
    const i = THEME_ORDER.indexOf(current);
    return THEME_ORDER[(i + 1) % THEME_ORDER.length];
}

export const APP_THEME_SWITCHER_BUTTON_ID = "app-theme-switcher-button";

type ModeToggleProps = {
    label?: string;
};

export function ModeToggle({ label }: ModeToggleProps) {
    const isMobile = useIsMobile();
    const { theme, setTheme } = useTheme();
    const nextTheme = getNextTheme(theme);

    const options = React.useMemo<RotatingComboboxOption<Theme>[]>(
        () =>
            THEME_ORDER.map((t) => ({
                value: t,
                label: THEME_LABELS[t],
                keywords: [THEME_LABELS[t], t, ...(t === "dark-default" ? ["deep dark", "high contrast", "default dark"] : [])],
                icon: themeIcon(t),
            })),
        [],
    );

    const Icon = theme === "light" ? Sun : theme === "system" ? Monitor : theme === "dark-default" ? Contrast : Moon;

    return (
        <RotatingCombobox
            key={isMobile ? "mobile" : "desktop"}
            value={theme}
            onValueChange={setTheme}
            options={options}
            tooltipSide="left"
            contentAlign="end"
            onOpenChange={(open) => appStateStore.getState().setThemeSwitchDropdownOpen(open)}
            renderTrigger={({ className, ...triggerProps }, { open }) => (
                <Button
                    {...triggerProps}
                    id={APP_THEME_SWITCHER_BUTTON_ID}
                    variant="outline"
                    size={label ? "default" : "icon"}
                    className={cn(label && "gap-2", className)}
                    aria-label={`Theme: ${THEME_LABELS[theme]}. ${open ? `Rotate to ${THEME_LABELS[nextTheme]}` : "Open theme menu"}.`}
                >
                    <Icon className="h-[1.2rem] w-[1.2rem]" />
                    {label ? <span>{label}</span> : null}
                </Button>
            )}
        />
    );
}

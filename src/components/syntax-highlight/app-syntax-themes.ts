import type { SyntaxHighlighterProps } from "react-syntax-highlighter";
import { nightOwl, oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { ResolvedAppTheme } from "@/components/theme-provider/hooks";

type PrismStyle = NonNullable<SyntaxHighlighterProps["style"]>;

export const appSyntaxHighlighterThemes = {
    light: oneLight,
    darkMidnight: oneDark,
    darkDefault: nightOwl,
} as const;

export function resolveSyntaxHighlighterStyle(
    app: ResolvedAppTheme,
    embeddedMarkdown?: "light" | "dark",
): PrismStyle {
    if (embeddedMarkdown === "light") return oneLight;
    if (embeddedMarkdown === "dark") return oneDark;
    if (app === "light") return oneLight;
    if (app === "dark-default") return nightOwl;
    return oneDark;
}

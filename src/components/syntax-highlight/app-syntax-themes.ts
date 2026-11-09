import type { SyntaxHighlighterProps } from "react-syntax-highlighter";
import nightOwl from "react-syntax-highlighter/dist/esm/styles/prism/night-owl";
import oneDark from "react-syntax-highlighter/dist/esm/styles/prism/one-dark";
import oneLight from "react-syntax-highlighter/dist/esm/styles/prism/one-light";
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

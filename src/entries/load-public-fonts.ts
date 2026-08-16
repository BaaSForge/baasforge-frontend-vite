const PUBLIC_FONT_STYLESHEET = "/fonts/public-fonts.css";
const HERO_FONT = "/fonts/plus-jakarta-sans-hero-700.woff2";

export function loadPublicFonts(preloadHero = false): void {
    const hasInlinePublicFonts = document.head.querySelector("[data-baasforge-public-fonts]") != null;

    if (preloadHero && !hasInlinePublicFonts && document.head.querySelector(`link[href="${HERO_FONT}"]`) == null) {
        const preload = document.createElement("link");
        preload.rel = "preload";
        preload.href = HERO_FONT;
        preload.as = "font";
        preload.type = "font/woff2";
        preload.crossOrigin = "anonymous";
        document.head.append(preload);
    }

    if (
        !hasInlinePublicFonts &&
        document.head.querySelector(`link[href="${PUBLIC_FONT_STYLESHEET}"]`) == null
    ) {
        const stylesheet = document.createElement("link");
        stylesheet.rel = "stylesheet";
        stylesheet.href = PUBLIC_FONT_STYLESHEET;
        document.head.append(stylesheet);
    }
}

import type { BackdropPanel, CutoutRect, ViewportSize } from "../types";

export function getCutoutRect(rect: DOMRect, padding: number, viewport: ViewportSize): CutoutRect {
    return {
        top: Math.max(0, rect.top - padding),
        left: Math.max(0, rect.left - padding),
        right: Math.min(viewport.width, rect.right + padding),
        bottom: Math.min(viewport.height, rect.bottom + padding),
    };
}

export function getBackdropPanels(cutout: CutoutRect, viewport: ViewportSize): BackdropPanel[] {
    const cutoutHeight = Math.max(0, cutout.bottom - cutout.top);

    return [
        { key: "top", style: { top: 0, left: 0, width: viewport.width, height: cutout.top } },
        {
            key: "bottom",
            style: {
                top: cutout.bottom,
                left: 0,
                width: viewport.width,
                height: Math.max(0, viewport.height - cutout.bottom),
            },
        },
        { key: "left", style: { top: cutout.top, left: 0, width: cutout.left, height: cutoutHeight } },
        {
            key: "right",
            style: {
                top: cutout.top,
                left: cutout.right,
                width: Math.max(0, viewport.width - cutout.right),
                height: cutoutHeight,
            },
        },
    ].filter((panel) => panel.style.width > 0 && panel.style.height > 0);
}

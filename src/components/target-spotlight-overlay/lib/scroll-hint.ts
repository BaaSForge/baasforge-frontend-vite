import type { ViewportSize } from "../types";

type ScrollAxisDirection = "up" | "down" | "left" | "right";

export type ScrollHintIcon = "up" | "down" | "left" | "right" | "leftTop" | "rightTop" | "leftDown" | "rightDown";

export type ScrollHint = {
    label: string;
    icon: ScrollHintIcon;
};

const VIEWPORT_EDGE_EPSILON_PX = 10;

function getScrollAxisDirections(rect: DOMRect, viewport: ViewportSize): ScrollAxisDirection[] {
    const directions: ScrollAxisDirection[] = [];

    if (rect.top < -VIEWPORT_EDGE_EPSILON_PX) directions.push("up");
    if (rect.bottom > viewport.height + VIEWPORT_EDGE_EPSILON_PX) directions.push("down");
    if (rect.left < -VIEWPORT_EDGE_EPSILON_PX) directions.push("left");
    if (rect.right > viewport.width + VIEWPORT_EDGE_EPSILON_PX) directions.push("right");

    return directions;
}

function resolveConflictingAxisDirections(
    directions: ScrollAxisDirection[],
    rect: DOMRect,
    viewport: ViewportSize,
): ScrollAxisDirection[] {
    let resolved = [...directions];

    if (resolved.includes("up") && resolved.includes("down")) {
        const upOverflow = Math.abs(rect.top);
        const downOverflow = rect.bottom - viewport.height;
        resolved = resolved.filter((direction) => direction !== "up" && direction !== "down");
        resolved.push(downOverflow >= upOverflow ? "down" : "up");
    }

    if (resolved.includes("left") && resolved.includes("right")) {
        const leftOverflow = Math.abs(rect.left);
        const rightOverflow = rect.right - viewport.width;
        resolved = resolved.filter((direction) => direction !== "left" && direction !== "right");
        resolved.push(rightOverflow >= leftOverflow ? "right" : "left");
    }

    return resolved;
}

function getScrollHintIcon(directions: ScrollAxisDirection[]): ScrollHintIcon {
    const hasUp = directions.includes("up");
    const hasDown = directions.includes("down");
    const hasLeft = directions.includes("left");
    const hasRight = directions.includes("right");

    if (hasUp && hasLeft) return "leftTop";
    if (hasUp && hasRight) return "rightTop";
    if (hasDown && hasLeft) return "leftDown";
    if (hasDown && hasRight) return "rightDown";
    if (hasUp) return "up";
    if (hasDown) return "down";
    if (hasLeft) return "left";
    return "right";
}

function formatScrollHintLabel(icon: ScrollHintIcon): string {
    switch (icon) {
        case "leftTop":
            return "click to scroll to left top";
        case "rightTop":
            return "click to scroll to right top";
        case "leftDown":
            return "click to scroll to left down";
        case "rightDown":
            return "click to scroll to right down";
        case "up":
            return "click to scroll up";
        case "down":
            return "click to scroll down";
        case "left":
            return "click to scroll left";
        case "right":
            return "click to scroll right";
    }
}

export function scrollTargetIntoView(element: HTMLElement): void {
    element.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
}

export function getScrollHint(rect: DOMRect, viewport: ViewportSize): ScrollHint | null {
    const directions = resolveConflictingAxisDirections(getScrollAxisDirections(rect, viewport), rect, viewport);
    if (directions.length === 0) return null;

    const icon = getScrollHintIcon(directions);

    return {
        label: formatScrollHintLabel(icon),
        icon,
    };
}

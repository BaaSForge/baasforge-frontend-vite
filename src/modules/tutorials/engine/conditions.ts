import type { Condition } from "./types";

export function elementWithId(elementId: string): Condition {
    return () => document.getElementById(elementId) != null;
}

export function elementMatching(selector: string): Condition {
    return () => document.querySelector(selector) != null;
}

export function pathname(check: (currentPathname: string) => boolean): Condition {
    return () => check(window.location.pathname);
}

export function allOf(...conditions: Condition[]): Condition {
    return () => conditions.every((condition) => condition());
}

export function anyOf(...conditions: Condition[]): Condition {
    return () => conditions.some((condition) => condition());
}

export function not(condition: Condition): Condition {
    return () => !condition();
}

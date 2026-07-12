"use client";

import { useEffect, useRef } from "react";

import { envConfig } from "@/lib/env";

import { type AppState } from "./store";
import { useAppState } from "./use-app-state";

type AppStateChange = {
    key: string;
    prev: string;
    next: string;
};

function formatChangeValue(value: unknown): string {
    if (value === undefined) return "undefined";
    if (value === null) return "null";
    if (typeof value === "string") return JSON.stringify(value);
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
}

function isComparableObject(value: unknown): value is Record<string, unknown> | unknown[] {
    return value !== null && typeof value === "object";
}

function collectDeepChanges(
    prev: unknown,
    next: unknown,
    path = "",
    changes: AppStateChange[] = [],
): AppStateChange[] {
    if (Object.is(prev, next)) return changes;

    const prevIsObject = isComparableObject(prev);
    const nextIsObject = isComparableObject(next);

    if (!prevIsObject || !nextIsObject) {
        changes.push({
            key: path,
            prev: formatChangeValue(prev),
            next: formatChangeValue(next),
        });
        return changes;
    }

    if (Array.isArray(prev) || Array.isArray(next)) {
        if (!Array.isArray(prev) || !Array.isArray(next)) {
            changes.push({
                key: path,
                prev: formatChangeValue(prev),
                next: formatChangeValue(next),
            });
            return changes;
        }

        const maxLength = Math.max(prev.length, next.length);
        for (let index = 0; index < maxLength; index++) {
            collectDeepChanges(prev[index], next[index], `${path}[${index}]`, changes);
        }
        return changes;
    }

    const keys = new Set([...Object.keys(prev), ...Object.keys(next)]);
    for (const key of keys) {
        const childPath = path ? `${path}.${key}` : key;
        collectDeepChanges(prev[key], next[key], childPath, changes);
    }

    return changes;
}

function cloneAppState(state: AppState): AppState {
    return JSON.parse(JSON.stringify(state));
}

function logAppStateChanges(changes: AppStateChange[]) {
    const label = changes.length === 1 ? "1 change" : `${changes.length} changes`;
    const keyWidth = Math.max(3, ...changes.map(({ key }) => key.length));
    const prevWidth = Math.max(4, ...changes.map(({ prev }) => prev.length));

    console.group(
        `%c AppState %c ${label}`,
        "color: #fff; background: #7c3aed; padding: 2px 8px; border-radius: 4px; font-weight: 700;",
        "color: #c4b5fd; font-weight: 600;",
    );

    console.log(
        `%c${"Key".padEnd(keyWidth)}  %c${"Prev".padEnd(prevWidth)}  %cNew`,
        "color: #e9d5ff; font-weight: 700;",
        "color: #fca5a5; font-weight: 700;",
        "color: #86efac; font-weight: 700;",
    );

    for (const { key, prev, next } of changes) {
        console.log(
            `%c${key.padEnd(keyWidth)}  %c${prev.padEnd(prevWidth)}  %c${next}`,
            "color: #ddd6fe; font-weight: 600;",
            "color: #fca5a5;",
            "color: #86efac; font-weight: 500;",
        );
    }

    console.groupEnd();
}

export function AppStateLogger() {
    const appState = useAppState();
    const previousStateRef = useRef<AppState | null>(null);

    useEffect(() => {
        if (!envConfig.isDev) return;

        if (previousStateRef.current === null) {
            previousStateRef.current = cloneAppState(appState);
            return;
        }

        const changes = collectDeepChanges(previousStateRef.current, appState);
        if (changes.length > 0) {
            logAppStateChanges(changes);
        }

        previousStateRef.current = cloneAppState(appState);
    }, [appState]);

    return null;
}

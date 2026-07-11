"use client";

import { useAppState } from "@/modules/app-state";
import { useEffect } from "react";

export function YourFirstProjectTutorial() {
    const appState = useAppState();

    useEffect(() => {
        console.log(JSON.parse(JSON.stringify(appState)));
    }, [appState]);

    return null;
}

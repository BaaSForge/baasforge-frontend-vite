import { useEffect, useState } from "react";
import type { ViewportSize } from "../types";

export function useViewportSize(enabled: boolean): ViewportSize {
    const [viewport, setViewport] = useState<ViewportSize>(() => ({
        width: typeof window !== "undefined" ? window.innerWidth : 0,
        height: typeof window !== "undefined" ? window.innerHeight : 0,
    }));

    useEffect(() => {
        if (!enabled) return;
        const update = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, [enabled]);

    return viewport;
}

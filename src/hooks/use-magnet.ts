import { type RefObject, useEffect } from "react";

export function useMagnet(ref: RefObject<HTMLElement | null>) {
    useEffect(() => {
        const el = ref.current;
        if (!el || typeof matchMedia === "undefined") return;
        const hoverQuery = matchMedia("(hover:hover) and (pointer:fine)");
        const reducedMotionQuery = matchMedia("(prefers-reduced-motion: reduce)");
        if (!hoverQuery.matches || reducedMotionQuery.matches) return;
        let tx = 0;
        let ty = 0;
        let cx = 0;
        let cy = 0;
        let raf = 0;
        const ensureTick = () => {
            if (!raf) raf = requestAnimationFrame(tick);
        };
        const tick = () => {
            cx += (tx - cx) * 0.18;
            cy += (ty - cy) * 0.18;
            el.style.transform = `translate(${cx}px, ${cy}px)`;
            if (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) {
                raf = requestAnimationFrame(tick);
                return;
            }
            cx = tx;
            cy = ty;
            raf = 0;
            if (tx === 0 && ty === 0) {
                el.style.removeProperty("transform");
                el.style.removeProperty("will-change");
            }
        };
        const move = (event: MouseEvent) => {
            const rect = el.getBoundingClientRect();
            tx = (event.clientX - rect.left - rect.width / 2) * 0.28;
            ty = (event.clientY - rect.top - rect.height / 2) * 0.32;
            el.style.willChange = "transform";
            ensureTick();
        };
        const leave = () => {
            tx = 0;
            ty = 0;
            ensureTick();
        };
        const reduceMotion = (event: MediaQueryListEvent) => {
            if (!event.matches) return;
            cancelAnimationFrame(raf);
            raf = 0;
            tx = 0;
            ty = 0;
            cx = 0;
            cy = 0;
            el.style.removeProperty("transform");
            el.style.removeProperty("will-change");
        };
        el.addEventListener("mousemove", move);
        el.addEventListener("mouseleave", leave);
        reducedMotionQuery.addEventListener("change", reduceMotion);
        return () => {
            cancelAnimationFrame(raf);
            el.removeEventListener("mousemove", move);
            el.removeEventListener("mouseleave", leave);
            reducedMotionQuery.removeEventListener("change", reduceMotion);
            el.style.removeProperty("transform");
            el.style.removeProperty("will-change");
        };
    }, [ref]);
}

import * as React from "react";

export const MOBILE_BREAKPOINT = 768;
/** Tailwind `lg` — secondary sidebar uses sheet overlay below this width. */
export const SECONDARY_SIDEBAR_SHEET_BREAKPOINT = 1024;

export function useIsBelowBreakpoint(breakpoint: number) {
    const [isBelow, setIsBelow] = React.useState<boolean | undefined>(undefined);

    React.useEffect(() => {
        const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
        const onChange = () => {
            setIsBelow(window.innerWidth < breakpoint);
        };
        mql.addEventListener("change", onChange);
        setIsBelow(window.innerWidth < breakpoint);
        return () => mql.removeEventListener("change", onChange);
    }, [breakpoint]);

    return !!isBelow;
}

export function useIsMobile() {
    return useIsBelowBreakpoint(MOBILE_BREAKPOINT);
}

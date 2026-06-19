const BACKDROP_PANEL_CLASS = "pointer-events-none fixed bg-black/55 animate-in fade-in-0 duration-300";

type FullScreenBackdropProps = {
    className?: string;
};

export function FullScreenBackdrop({ className }: FullScreenBackdropProps) {
    return <div aria-hidden className={className ?? BACKDROP_PANEL_CLASS} style={{ inset: 0 }} />;
}

export { BACKDROP_PANEL_CLASS };

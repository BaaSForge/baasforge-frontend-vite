export type TargetSpotlightOverlayPlacement = "top" | "bottom" | "left" | "right";

export type PinTopStatus = "info" | "warning" | "error" | "success";

export type PinToTopOptions = {
    hidePinCircles?: boolean;
    status?: PinTopStatus | null;
};

export type ViewportSize = {
    width: number;
    height: number;
};

export type CutoutRect = {
    top: number;
    left: number;
    right: number;
    bottom: number;
};

export type BackdropPanel = {
    key: "top" | "bottom" | "left" | "right";
    style: {
        top: number;
        left: number;
        width: number;
        height: number;
    };
};

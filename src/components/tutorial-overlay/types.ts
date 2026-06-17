export type TutorialOverlayPlacement = "top" | "bottom" | "left" | "right";

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

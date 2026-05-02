const SCALAR_OVERLAY_SELECTOR = ".scalar.scalar-app.z-overlay";
const POPPER_UNDO_STYLE_ID = "scalar-radix-popper-stack-undo";

let stylesPromise: Promise<void> | null = null;

function appendPopperUndoStyle() {
    if (document.getElementById(POPPER_UNDO_STYLE_ID)) return;
    const el = document.createElement("style");
    el.id = POPPER_UNDO_STYLE_ID;
    el.textContent = `body:not(:has(${SCALAR_OVERLAY_SELECTOR})) [data-radix-popper-content-wrapper]{z-index:revert!important}`;
    document.head.appendChild(el);
}

export function ensureScalarApiReferenceStylesLoaded(): Promise<void> {
    if (!stylesPromise) {
        stylesPromise = import("@scalar/api-reference-react/style.css").then(() => {
            appendPopperUndoStyle();
        });
    }
    return stylesPromise;
}

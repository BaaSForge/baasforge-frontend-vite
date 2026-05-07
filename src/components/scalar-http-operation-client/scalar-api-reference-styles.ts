let stylesPromise: Promise<void> | null = null;

export function ensureScalarApiReferenceStylesLoaded(): Promise<void> {
    if (!stylesPromise) {
        stylesPromise = import("@scalar/api-reference-react/style.css").then(() => undefined);
    }
    return stylesPromise;
}

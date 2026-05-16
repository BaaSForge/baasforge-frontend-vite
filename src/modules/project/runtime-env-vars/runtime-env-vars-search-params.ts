export type RuntimeEnvVarsTabValue = "plain" | "encrypted";

export function readRuntimeEnvVarsSearchParams(searchParams: URLSearchParams): {
    envTab: RuntimeEnvVarsTabValue;
} {
    const tabRaw = searchParams.get("envTab");
    const envTab: RuntimeEnvVarsTabValue = tabRaw === "encrypted" ? "encrypted" : "plain";
    return { envTab };
}

export function mergeRuntimeEnvVarsSearchParams(
    prev: URLSearchParams,
    patch: Partial<{ envTab: RuntimeEnvVarsTabValue }>,
): URLSearchParams {
    const next = new URLSearchParams(prev);

    if (patch.envTab != null) {
        if (patch.envTab === "plain") {
            next.delete("envTab");
        } else {
            next.set("envTab", "encrypted");
        }
    }

    return next;
}

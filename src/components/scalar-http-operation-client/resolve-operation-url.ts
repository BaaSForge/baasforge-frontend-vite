export type ResolvedOperationUrl = {
    serverBaseUrl: string;
    path: string;
};

export function resolveOperationUrl(url: string, serverBaseUrl?: string): ResolvedOperationUrl {
    const trimmed = url.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        const parsed = new URL(trimmed);
        return { serverBaseUrl: parsed.origin, path: `${parsed.pathname}${parsed.search}` };
    }
    if (!trimmed.startsWith("/")) {
        throw new Error("Relative operation paths must start with /");
    }
    const base = (serverBaseUrl ?? "").trim().replace(/\/$/, "");
    if (base === "") {
        throw new Error("serverBaseUrl is required when url is a relative path");
    }
    return { serverBaseUrl: base, path: trimmed };
}

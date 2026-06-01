const DEFAULT_POST_LOGIN_PATH = "/dashboard";

export function resolvePostLoginPath(callbackUrlParam: string | null, fallback = DEFAULT_POST_LOGIN_PATH): string {
    if (callbackUrlParam == null || callbackUrlParam === "") {
        return fallback;
    }
    try {
        const decoded = decodeURIComponent(callbackUrlParam);
        const url = new URL(decoded, window.location.origin);
        if (url.origin !== window.location.origin) {
            return fallback;
        }
        const path = `${url.pathname}${url.search}${url.hash}`;
        return path === "" ? fallback : path;
    } catch {
        return fallback;
    }
}

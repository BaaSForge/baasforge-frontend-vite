import { SCALAR_HTTP_OPERATION_WORKSPACE_SLUG } from "./scalar-site-embed";

function isScalarReferenceHistoryUrl(urlArg: string | URL | null | undefined): boolean {
    if (urlArg === undefined || urlArg === null || urlArg === "") return false;
    try {
        const url = typeof urlArg === "string" ? new URL(urlArg, window.location.href) : new URL(urlArg.href);
        const hash = decodeURIComponent(url.hash.slice(1));
        if (!hash) return false;
        if (hash === SCALAR_HTTP_OPERATION_WORKSPACE_SLUG || hash.startsWith(`${SCALAR_HTTP_OPERATION_WORKSPACE_SLUG}/`)) {
            return true;
        }
        return (
            /^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\//i.test(hash) ||
            hash.startsWith("tag/") ||
            hash.startsWith("model/") ||
            hash.startsWith("webhook/")
        );
    } catch {
        return false;
    }
}

let patchDepth = 0;
let originalReplaceState: typeof history.replaceState;
let originalPushState: typeof history.pushState;

function guardedReplaceState(
    this: History,
    data: Parameters<History["replaceState"]>[0],
    unused: Parameters<History["replaceState"]>[1],
    url?: Parameters<History["replaceState"]>[2],
) {
    if (url != null && url !== "" && isScalarReferenceHistoryUrl(url)) return;
    return originalReplaceState.call(this, data, unused, url);
}

function guardedPushState(
    this: History,
    data: Parameters<History["pushState"]>[0],
    unused: Parameters<History["pushState"]>[1],
    url?: Parameters<History["pushState"]>[2],
) {
    if (url != null && url !== "" && isScalarReferenceHistoryUrl(url)) return;
    return originalPushState.call(this, data, unused, url);
}

export function acquireScalarHistoryUrlSyncBlock(): () => void {
    if (patchDepth === 0) {
        originalReplaceState = history.replaceState.bind(history);
        originalPushState = history.pushState.bind(history);
        history.replaceState = guardedReplaceState;
        history.pushState = guardedPushState;
    }
    patchDepth += 1;
    return () => {
        patchDepth -= 1;
        if (patchDepth === 0) {
            history.replaceState = originalReplaceState;
            history.pushState = originalPushState;
        }
    };
}

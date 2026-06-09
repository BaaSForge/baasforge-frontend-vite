import { AUTH_ERROR_PARAM, LOGGED_IN_FROM_PARAM } from "../constants";

const DEFAULT_POST_LOGIN_PATH = "/dashboard";
const CALLBACK_URL_PARAM = "callback-url";

export function buildAuthErrorLoginSearch(pathname: string, searchParams: URLSearchParams): string {
    const loginParams = new URLSearchParams();

    const authError = searchParams.get(AUTH_ERROR_PARAM);
    const loggedInFrom = searchParams.get(LOGGED_IN_FROM_PARAM);
    const existingCallback = searchParams.get(CALLBACK_URL_PARAM);

    if (authError) loginParams.set(AUTH_ERROR_PARAM, authError);
    if (loggedInFrom) loginParams.set(LOGGED_IN_FROM_PARAM, loggedInFrom);

    let callbackUrl: URL;
    if (existingCallback) {
        callbackUrl = new URL(existingCallback, window.location.origin);
    } else {
        const callbackSearchParams = new URLSearchParams(searchParams);
        callbackSearchParams.delete(AUTH_ERROR_PARAM);
        callbackSearchParams.delete(CALLBACK_URL_PARAM);
        const callbackSearch = callbackSearchParams.toString();
        const callbackPath = callbackSearch ? `${pathname}?${callbackSearch}` : pathname;
        callbackUrl = new URL(callbackPath, window.location.origin);
    }

    if (loggedInFrom) {
        callbackUrl.searchParams.set(LOGGED_IN_FROM_PARAM, loggedInFrom);
    }

    loginParams.set(CALLBACK_URL_PARAM, callbackUrl.toString());

    return loginParams.toString();
}

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

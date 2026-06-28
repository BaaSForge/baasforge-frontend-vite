import { envConfig } from "./env";

const AUTH_REFRESH_ENDPOINT = "/v1/auth/refresh";

export interface ApiResponse<T = unknown> {
    isSuccess: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
    };
}

export interface ApiError {
    isSuccess: boolean;
    error: {
        code: string;
        message: string;
    };
    status?: number;
    data?: unknown;
}

const PARSE_ERROR_PAYLOAD: ApiError = {
    isSuccess: false,
    error: { code: "PARSE_ERROR", message: "Failed to parse response body" },
};

function isNeedsRefreshBody(body: unknown): body is { data: { needs_refresh_token: true } } {
    return (
        typeof body === "object" &&
        body !== null &&
        "data" in body &&
        typeof body.data === "object" &&
        body.data !== null &&
        "needs_refresh_token" in body.data &&
        typeof body.data.needs_refresh_token === "boolean" &&
        body.data.needs_refresh_token
    );
}

export interface ApiClientOptions {
    onSessionExpired?: () => void;
    onError?: (error: unknown) => void;
}

/** Optional controls for the global API error handler (`showApiError` / toast); not sent over the wire. */
export type ExtendedOptions = {
    /** Do not invoke the global API error handler for this request. */
    skipErrorToast?: boolean;
    /** Do not invoke the global API error handler for these HTTP status codes only (e.g. expected 404). */
    skipErrorToastForStatuses?: readonly number[];
    /** Public documentation share key sent as `x-share-secret`. */
    shareSecret?: string;
    /** Do not attempt auth refresh or session-expired redirect on 401. */
    skipSessionRefresh?: boolean;
};

class ApiClient {
    private baseUrl: string;
    private timeoutDuration = 10_000;
    private onSessionExpired: (() => void) | undefined;
    private onError: ((error: unknown, statusCode: number) => void) | undefined;
    private refreshPromise: Promise<void> | null = null;

    constructor(baseUrl: string, options: ApiClientOptions = {}) {
        this.baseUrl = baseUrl;
        this.onSessionExpired = options.onSessionExpired;
        this.onError = options.onError;
    }

    setOnSessionExpired(callback: (() => void) | undefined): void {
        this.onSessionExpired = callback;
    }

    setOnError(callback: ((error: unknown, statusCode: number) => void) | undefined): void {
        this.onError = callback;
    }

    private buildUrl(endpoint: string): string {
        return `${this.baseUrl}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
    }

    private async doRefresh(): Promise<void> {
        const url = this.buildUrl(AUTH_REFRESH_ENDPOINT);
        const response = await fetch(url, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || isNeedsRefreshBody(data)) {
            this.onSessionExpired?.();
            throw data;
        }
    }

    private async refreshToken(): Promise<void> {
        if (this.refreshPromise) {
            return this.refreshPromise;
        }
        
        this.refreshPromise = (async () => {
            try {
                await this.doRefresh();
            } finally {
                this.refreshPromise = null;
            }
        })();
        
        return this.refreshPromise;
    }

    private shouldNotifyGlobalError(status: number, extendedOptions: ExtendedOptions): boolean {
        if (extendedOptions.skipErrorToast) {
            return false;
        }
        const statuses = extendedOptions.skipErrorToastForStatuses;
        if (statuses?.includes(status)) {
            return false;
        }
        return true;
    }

    private async request<T = unknown>(
        endpoint: string,
        init: RequestInit = {},
        extendedOptions: ExtendedOptions = {},
    ): Promise<T> {
        const url = this.buildUrl(endpoint);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeoutDuration);

        const isFormData = init.body instanceof FormData;
        const defaultHeaders: HeadersInit = isFormData ? {} : { "Content-Type": "application/json" };
        const shareSecret = extendedOptions.shareSecret?.trim();
        const shareHeaders: HeadersInit =
            shareSecret != null && shareSecret.length > 0 ? { "x-share-secret": shareSecret } : {};

        const config: RequestInit = {
            ...init,
            signal: controller.signal,
            credentials: extendedOptions.skipSessionRefresh ? "omit" : "include",
            headers: { ...defaultHeaders, ...shareHeaders, ...init.headers },
        };

        let response: Response;
        try {
            response = await fetch(url, config);
            clearTimeout(timeoutId);
        } catch (error) {
            clearTimeout(timeoutId);
            if (error instanceof Error && error.name === "AbortError") {
                throw new Error(`Request timed out after ${this.timeoutDuration / 1000} seconds`);
            }
            throw error;
        }

        let responseData: ApiResponse | ApiError;

        try {
            responseData = await response.json();
        } catch (error) {
            if (response.ok) {
                return undefined as T;
            }
            console.error("Failed to parse response data", error);
            responseData = PARSE_ERROR_PAYLOAD;
        }

        if (!response.ok || responseData?.isSuccess === false) {
            if (response.status === 401 && !extendedOptions.skipSessionRefresh) {
                if (isNeedsRefreshBody(responseData)) {
                    await this.refreshToken();
                    return this.request<T>(endpoint, init, extendedOptions);
                }
                this.onSessionExpired?.();
            } else if (this.shouldNotifyGlobalError(response.status, extendedOptions)) {
                this.onError?.(responseData, response.status);
            }
            throw { ...responseData, status: response.status };
        }

        return responseData as T;
    }

    async get<T = unknown>(endpoint: string, init?: RequestInit, extendedOptions?: ExtendedOptions): Promise<T> {
        return this.request<T>(endpoint, { ...init, method: "GET" }, extendedOptions);
    }

    async post<T = unknown>(endpoint: string, data?: unknown, init?: RequestInit, extendedOptions?: ExtendedOptions): Promise<T> {
        return this.request<T>(
            endpoint,
            {
                ...init,
                method: "POST",
                body: data ? JSON.stringify(data) : undefined,
            },
            extendedOptions,
        );
    }

    async put<T = unknown>(endpoint: string, data?: unknown, init?: RequestInit, extendedOptions?: ExtendedOptions): Promise<T> {
        return this.request<T>(
            endpoint,
            {
                ...init,
                method: "PUT",
                body: data ? (data instanceof FormData ? data : JSON.stringify(data)) : undefined,
            },
            extendedOptions,
        );
    }

    async delete<T = unknown>(endpoint: string, init?: RequestInit, extendedOptions?: ExtendedOptions): Promise<T> {
        return this.request<T>(endpoint, { ...init, method: "DELETE" }, extendedOptions);
    }

    async patch<T = unknown>(endpoint: string, data?: unknown, init?: RequestInit, extendedOptions?: ExtendedOptions): Promise<T> {
        return this.request<T>(
            endpoint,
            {
                ...init,
                method: "PATCH",
                body: data ? JSON.stringify(data) : undefined,
            },
            extendedOptions,
        );
    }

    async uploadFile<T = unknown>(endpoint: string, file: File, init?: RequestInit, extendedOptions?: ExtendedOptions): Promise<T> {
        const formData = new FormData();
        formData.append("file", file);

        const url = this.buildUrl(endpoint);
        const config: RequestInit = {
            ...init,
            method: "POST",
            body: formData,
            credentials: "include",
            headers: { ...init?.headers },
        };

        const response = await fetch(url, config);
        const responseData = await response.json().catch(() => ({}));

        if (!response.ok || responseData.isSuccess === false) {
            if (response.status === 401) {
                if (isNeedsRefreshBody(responseData)) {
                    await this.refreshToken();
                    return this.uploadFile<T>(endpoint, file, init, extendedOptions);
                }
                this.onSessionExpired?.();
            } else if (this.shouldNotifyGlobalError(response.status, extendedOptions ?? {})) {
                this.onError?.(responseData, response.status);
            }
            throw { ...responseData, status: response.status };
        }

        return responseData;
    }
}

export const apiClient = new ApiClient(envConfig.apiBaseUrl);

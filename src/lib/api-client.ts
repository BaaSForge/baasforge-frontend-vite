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
      await this.refreshPromise;
      return;
    }
    this.refreshPromise = this.doRefresh();
    try {
      await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async request<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = this.buildUrl(endpoint);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutDuration);

    const isFormData = options.body instanceof FormData;
    const defaultHeaders: HeadersInit = isFormData
      ? {}
      : { "Content-Type": "application/json" };

    const config: RequestInit = {
      ...options,
      signal: controller.signal,
      credentials: "include",
      headers: { ...defaultHeaders, ...options.headers },
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

    let responseData = null;

    try {
      responseData = await response.json();
    } catch (error) {
      console.error("Failed to parse response data", error);
    }

    if (!response.ok || responseData.isSuccess === false) {
      if (response.status === 401) {
        if (isNeedsRefreshBody(responseData)) {
          await this.refreshToken();
          return this.request<T>(endpoint, options);
        }
        this.onSessionExpired?.();
      } else {
        this.onError?.(responseData, response.status);
      }
      throw responseData;
    }

    return responseData;
  }

  async get<T = unknown>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  async post<T = unknown>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = unknown>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? (data instanceof FormData ? data : JSON.stringify(data)) : undefined,
    });
  }

  async delete<T = unknown>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }

  async patch<T = unknown>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async uploadFile<T = unknown>(endpoint: string, file: File, options?: RequestInit): Promise<T> {
    const formData = new FormData();
    formData.append("file", file);

    const url = this.buildUrl(endpoint);
    const config: RequestInit = {
      ...options,
      method: "POST",
      body: formData,
      credentials: "include",
      headers: { ...options?.headers },
    };

    const response = await fetch(url, config);
    const responseData = await response.json().catch(() => ({}));

    if (!response.ok || responseData.isSuccess === false) {
      if (response.status === 401) {
        if (isNeedsRefreshBody(responseData)) {
          await this.refreshToken();
          return this.uploadFile<T>(endpoint, file, options);
        }
        this.onSessionExpired?.();
      }
      this.onError?.(responseData, response.status);
      throw responseData;
    }

    return responseData;
  }
}

export const apiClient = new ApiClient(envConfig.apiBaseUrl);

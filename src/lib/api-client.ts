import { envConfig } from "./env";

export interface ApiResponse<T = any> {
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
  data?: any;
}

class ApiClient {
  private baseUrl: string;
  private timeoutDuration = 10_000;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutDuration);

    const isFormData = options.body instanceof FormData;
    const defaultHeaders: HeadersInit = isFormData
      ? {}
      : {
        "Content-Type": "application/json",
      };

    const config: RequestInit = {
      ...options,

      signal: controller.signal,
      credentials: "include",
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      clearTimeout(timeoutId);

      const responseData = await response.json();

      if (!response.ok || responseData.isSuccess === false) {
        throw responseData;
      }

      return responseData;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(`Request timed out after ${this.timeoutDuration / 1000} seconds`);
      }

      throw error;
    }
  }

  async get<T = any>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  async post<T = any>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = any>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? (data instanceof FormData ? data : JSON.stringify(data)) : undefined,
    });
  }

  async delete<T = any>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }

  async patch<T = any>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async uploadFile<T = any>(endpoint: string, file: File, options?: RequestInit): Promise<T> {
    const formData = new FormData();
    formData.append("file", file);

    const url = `${this.baseUrl}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

    const config: RequestInit = {
      ...options,
      method: "POST",
      body: formData,
      headers: {
        ...options?.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const responseData = await response.json();

      if (!response.ok || responseData.isSuccess === false) {
        throw responseData;
      }

      return responseData;
    } catch (error) {
      throw error;
    }
  }
}

export const apiClient = new ApiClient(envConfig.apiBaseUrl);

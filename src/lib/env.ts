const env = import.meta.env;

export const envConfig = {
    get isDev() {
        return env.DEV;
    },

    get apiBaseUrl() {
        return env.VITE_API_HOST;
    },

    get wsUrl() {
        const base = (env.VITE_API_HOST ?? "").trim().replace(/\/$/, "");
        return base ? `${base}/v1/ws` : "";
    },
} as const;

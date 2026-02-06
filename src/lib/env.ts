const env = import.meta.env;

export const envConfig = {
  get isDev() {
    return env.DEV;
  },
  
  get apiBaseUrl() {
    return env.VITE_API_HOST;
  },
} as const;

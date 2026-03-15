import { envConfig } from "@/lib/env";

const GOOGLE_INITIATE_ENDPOINT = "/v1/auth/google/initiate";

export function getGoogleInitiateFormAction(callbackUrl?: string): string {
    const path = `${envConfig.apiBaseUrl}${GOOGLE_INITIATE_ENDPOINT}`;
    if (!callbackUrl) return path;
    const query = new URLSearchParams({ "callback-url": callbackUrl });
    return `${path}?${query.toString()}`;
}

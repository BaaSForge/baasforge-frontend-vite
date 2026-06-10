import { envConfig } from "@/lib/env";

const GITHUB_INITIATE_ENDPOINT = "/v1/auth/github/initiate";

export function getGithubInitiateFormAction(callbackUrl?: string): string {
    const path = `${envConfig.apiBaseUrl}${GITHUB_INITIATE_ENDPOINT}`;
    if (!callbackUrl) return path;
    const query = new URLSearchParams({ "callback-url": callbackUrl });
    return `${path}?${query.toString()}`;
}

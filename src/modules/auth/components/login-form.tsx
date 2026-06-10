import { Github } from "lucide-react";

import { GoogleIcon } from "@/components/icons/google-icon";
import { useSearchParams } from "react-router";

import { AppLogoSquare } from "@/components/logo/app-logo-square";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AUTH_ERROR_PARAM, LOGGED_IN_FROM_PARAM } from "../constants";
import { getGithubInitiateFormAction } from "../lib/github-auth";
import { getGoogleInitiateFormAction } from "../lib/google-auth";

function formatProviderName(provider: string): string {
    return provider.charAt(0).toUpperCase() + provider.slice(1);
}

function getAuthErrorMessage(authError: string, provider: string | null): string {
    const providerName = provider ? formatProviderName(provider) : null;

    if (authError === "access_denied") {
        return providerName
            ? `${providerName} sign-in was cancelled or denied. Please try again.`
            : "Sign-in was cancelled or denied. Please try again.";
    }

    return providerName ? `${providerName} sign-in failed. Please try again.` : "Sign-in failed. Please try again.";
}

function getCallbackUrl(callbackUrlParam: string | null, loggedInFrom: string | null, provider: string): string {
    if (callbackUrlParam) {
        const decodedUrl = decodeURIComponent(callbackUrlParam);
        const url = new URL(decodedUrl, window.location.origin);
        url.searchParams.set(LOGGED_IN_FROM_PARAM, loggedInFrom ?? provider);
        return url.toString();
    }
    return `${window.location.origin}/dashboard?${LOGGED_IN_FROM_PARAM}=${loggedInFrom ?? provider}`;
}

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
    const [searchParams] = useSearchParams();
    const authError = searchParams.get(AUTH_ERROR_PARAM);
    const loggedInFrom = searchParams.get(LOGGED_IN_FROM_PARAM);
    const callbackUrlParam = searchParams.get("callback-url");

    const googleInitiateAction = getGoogleInitiateFormAction(
        getCallbackUrl(callbackUrlParam, loggedInFrom, "google"),
    );
    const githubInitiateAction = getGithubInitiateFormAction(
        getCallbackUrl(callbackUrlParam, loggedInFrom, "github"),
    );

    return (
        <Card className={cn("w-full", className)} {...props}>
            <CardHeader className="flex flex-col items-center text-center">
                <AppLogoSquare className="mx-auto size-16" />
                <CardTitle className="text-xl">Welcome to BaaSForge</CardTitle>
                <CardDescription>Sign in to continue to your workspace</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                {authError ? (
                    <Alert variant="destructive">
                        <AlertTitle>Sign-in failed</AlertTitle>
                        <AlertDescription>{getAuthErrorMessage(authError, loggedInFrom)}</AlertDescription>
                    </Alert>
                ) : null}
                <form action={googleInitiateAction} method="post" className="contents">
                    <Button variant="outline" type="submit" className="h-11 w-full">
                        <GoogleIcon className="size-4" />
                        Sign in with Google
                    </Button>
                </form>
                <form action={githubInitiateAction} method="post" className="contents">
                    <Button variant="outline" type="submit" className="h-11 w-full">
                        <Github className="size-4" />
                        Sign in with GitHub
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

import { Github } from "lucide-react";

import { GoogleIcon } from "@/components/icons/google-icon";
import { useSearchParams } from "react-router";
import { toast } from "sonner";

import { AppLogoSquare } from "@/components/logo/app-logo-square";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AUTH_ERROR_PARAM, LOGGED_IN_FROM_PARAM } from "../constants";
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

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
    const [searchParams] = useSearchParams();
    const authError = searchParams.get(AUTH_ERROR_PARAM);
    const loggedInFrom = searchParams.get(LOGGED_IN_FROM_PARAM);
    const callbackUrlParam = searchParams.get("callback-url");

    let callbackUrl: string;
    if (callbackUrlParam) {
        const decodedUrl = decodeURIComponent(callbackUrlParam);
        const url = new URL(decodedUrl, window.location.origin);
        url.searchParams.set(LOGGED_IN_FROM_PARAM, loggedInFrom ?? "google");
        callbackUrl = url.toString();
    } else {
        callbackUrl = `${window.location.origin}/dashboard?${LOGGED_IN_FROM_PARAM}=${loggedInFrom ?? "google"}`;
    }

    const googleInitiateAction = getGoogleInitiateFormAction(callbackUrl);

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
                        Login with Google
                    </Button>
                </form>
                <Button
                    variant="outline"
                    type="button"
                    className="h-11 w-full"
                    onClick={() => toast.info("GitHub sign-in is coming soon.")}
                >
                    <Github className="size-4" />
                    Login with GitHub
                </Button>
            </CardContent>
        </Card>
    );
}

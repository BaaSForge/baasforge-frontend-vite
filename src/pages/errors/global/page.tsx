import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { envConfig } from "@/lib/env";
import { AlertTriangle } from "lucide-react";
import { useNavigate, useRouteError } from "react-router";

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    if (typeof error === "string") return error;
    if (error && typeof error === "object" && "message" in error) {
        return String((error as { message: unknown }).message);
    }
    return "An unexpected error occurred while loading this page.";
}

function getErrorStack(error: unknown): string | undefined {
    if (error instanceof Error) return error.stack;
    return undefined;
}

export default function GeneralErrorPage() {
    const error = useRouteError();
    const navigate = useNavigate();
    const message = getErrorMessage(error);
    const stack = getErrorStack(error);
    const isDev = envConfig.isDev;

    return (
        <div className="flex min-h-dvh items-center justify-center bg-background p-4">
            <Card className="w-full max-w-lg border-destructive/50">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                            <AlertTriangle className="size-6 text-destructive" aria-hidden />
                        </div>
                        <div>
                            <CardTitle className="text-xl">Unexpected Error</CardTitle>
                            <p className="text-muted-foreground mt-1 text-sm">Something went wrong</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert variant="destructive">
                        <AlertTitle>Error details</AlertTitle>
                        <AlertDescription>{message}</AlertDescription>
                    </Alert>

                    {isDev && stack && (
                        <>
                            <Separator />
                            <div className="space-y-2">
                                <p className="text-muted-foreground text-sm font-medium">Development: Full error stack</p>
                                <ScrollArea className="bg-muted/50 h-48 rounded-lg border p-3">
                                    <pre className="text-muted-foreground text-xs whitespace-pre-wrap font-mono">{stack}</pre>
                                </ScrollArea>
                            </div>
                        </>
                    )}
                </CardContent>
                <CardFooter className="flex gap-2">
                    <Button onClick={() => navigate(-1)} variant="outline">
                        Go back
                    </Button>
                    <Button
                        onClick={() => {
                            window.location.reload();
                        }}
                    >
                        Try again
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => {
                            navigate("/");
                        }}
                    >
                        Go home
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

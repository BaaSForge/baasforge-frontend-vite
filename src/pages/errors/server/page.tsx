import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ServerCrash } from "lucide-react";
import { Link, useNavigate } from "react-router";

export default function ServerErrorPage() {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-dvh items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md border-destructive/30 text-center">
                <CardHeader className="space-y-4">
                    <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-destructive/10">
                        <ServerCrash className="size-10 text-destructive" aria-hidden />
                    </div>
                    <div className="space-y-1">
                        <p className="text-muted-foreground font-mono text-6xl font-bold tracking-tighter">500</p>
                        <CardTitle className="text-2xl">Server error</CardTitle>
                        <CardDescription className="text-base">Something went wrong on our end. We're working to fix it.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm">Please try again in a few moments, or return to the homepage.</p>
                </CardContent>
                <CardFooter className="flex justify-center gap-3">
                    <Button variant="outline" onClick={() => navigate(-1)}>
                        Go back
                    </Button>
                    <Button
                        onClick={() => {
                            window.location.reload();
                        }}
                    >
                        Try again
                    </Button>
                    <Button asChild variant="secondary">
                        <Link to="/">Go home</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

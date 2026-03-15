import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FileQuestion } from "lucide-react";
import { Link, useNavigate } from "react-router";

export default function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-dvh items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader className="space-y-4">
                    <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-muted">
                        <FileQuestion className="size-10 text-muted-foreground" aria-hidden />
                    </div>
                    <div className="space-y-1">
                        <p className="text-muted-foreground font-mono text-6xl font-bold tracking-tighter">404</p>
                        <CardTitle className="text-2xl">Page not found</CardTitle>
                        <CardDescription className="text-base">The page you're looking for doesn't exist or has been moved.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm">Check the URL for typos, or head back to the homepage.</p>
                </CardContent>
                <CardFooter className="flex justify-center gap-3">
                    <Button variant="outline" onClick={() => navigate(-1)}>
                        Go back
                    </Button>
                    <Button asChild>
                        <Link to="/">Go home</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

import { Button } from "@/components/ui/button";

interface GeneralErrorPageProps {
  error?: Error;
  resetErrorBoundary?: () => void;
}

export default function GeneralErrorPage({ error, resetErrorBoundary }: GeneralErrorPageProps) {
  return (
    <section>
      <span>Unexpected Error</span>
      <h1>Something went wrong</h1>
      <p>{error?.message || "An unexpected error occurred while loading this page."}</p>
      {resetErrorBoundary && (
        <Button onClick={resetErrorBoundary}>
          Try Again
        </Button>
      )}
    </section>
  );
}

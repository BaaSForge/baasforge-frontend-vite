import { Spinner } from "@/components/ui/spinner";

interface LoadingFallbackProps {
  "aria-label"?: string;
}

export function LoadingFallback({
  "aria-label": ariaLabel = "Loading",
}: LoadingFallbackProps = {}) {
  return (
    <div
      className="flex min-h-[50vh] items-center justify-center"
      role="status"
      aria-label={ariaLabel}
    >
      <Spinner className="size-8" />
    </div>
  );
}

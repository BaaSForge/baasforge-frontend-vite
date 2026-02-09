import { Button } from "@/components/ui/button";
import { useGetTokensQuery } from "@/modules/auth/queries";

export default function DashboardPage() {
  const { refetch: refetchTokens } = useGetTokensQuery();

  return (
    <section className="flex flex-1 flex-col gap-4 p-4">
      <div>DashboardPage</div>
      <Button type="button" variant="outline" onClick={() => refetchTokens()}>
        Refetch Tokens
      </Button>
    </section>
  );
}

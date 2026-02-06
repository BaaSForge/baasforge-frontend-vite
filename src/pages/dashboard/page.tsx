import { useAuth } from "@/modules/auth";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { logout } = useAuth();

  return (
    <section>
      <div>DashboardPage</div>
      <Button type="button" variant="outline" onClick={() => logout()}>
        Logout
      </Button>
    </section>
  );
}

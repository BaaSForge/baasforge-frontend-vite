import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useGetTokensQuery } from "@/modules/auth/queries";

export default function DashboardPage() {
  const { refetch: refetchTokens } = useGetTokensQuery();

  return (
    <section className="flex flex-col gap-4">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Dashboard</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <div className="flex-1 p-4">
        <div>DashboardPage</div>
        <Button type="button" variant="outline" onClick={() => refetchTokens()}>
          Refetch Tokens
        </Button>
      </div>
    </section>
  );
}

import { Container } from "@/components/page-container";
import { PageTitleBox } from "@/components/page-title-box";
import { SectionLinkCard } from "@/components/section-link-card";
import { SectionTitle } from "@/components/section-title";
import { FolderIcon, KeyRoundIcon } from "lucide-react";

export default function DashboardPage() {
  return (
    <Container>
      <PageTitleBox title="Dashboard" />
      <Container.MainContent>
        <SectionTitle>Projects</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <SectionLinkCard
            to="/dashboard/projects"
            title="List Projects"
            description="View and manage your projects."
            icon={FolderIcon}
          />
        </div>
        <SectionTitle>Account</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <SectionLinkCard
            to="/dashboard/tokens"
            title="Sessions"
            description="View and manage your active sessions and tokens."
            icon={KeyRoundIcon}
          />
        </div>
      </Container.MainContent>
    </Container>
  );
}

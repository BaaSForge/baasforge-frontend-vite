import { useParams } from "react-router";
import { Container } from "@/components/page-container";
import { PageTitleBox } from "@/components/page-title-box";
import { SectionLinkCard } from "@/components/section-link-card";
import { SectionTitle } from "@/components/section-title";
import { useProjectQuery } from "@/modules/project/queries";
import { SettingsIcon, Trash2Icon } from "lucide-react";

const linkCards = [
  {
    to: "settings/info",
    title: "Project info",
    description: "View and edit project name and details.",
    icon: SettingsIcon,
  },
  {
    to: "settings/delete",
    title: "Delete project",
    description: "Permanently delete this project and its data.",
    icon: Trash2Icon,
  },
] as const;

export default function ProjectOverviewPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const id = projectId ?? undefined;
  const { data: project } = useProjectQuery(id);

  const basePath = `/dashboard/projects/${projectId}`;

  return (
    <>
      <PageTitleBox title={project ? project.name : "Project"} />
      <Container>
        <SectionTitle>Settings &amp; management</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          {linkCards.map(({ to, title, description, icon }) => (
            <SectionLinkCard
              key={to}
              to={`${basePath}/${to}`}
              title={title}
              description={description}
              icon={icon}
            />
          ))}
        </div>
      </Container>
    </>
  );
}

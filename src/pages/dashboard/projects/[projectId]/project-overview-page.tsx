import { Link, useParams } from "react-router";
import { PageTitleBox } from "@/components/page-title-box";
import { useProjectQuery } from "@/modules/project/queries";
import { ChevronRightIcon, SettingsIcon, Trash2Icon } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const id = projectId ? parseInt(projectId, 10) : undefined;
  const { data: project } = useProjectQuery(id);

  const basePath = `/dashboard/projects/${projectId}`;

  return (
    <section className="flex flex-1 flex-col gap-6">
      <PageTitleBox
        title={project ? project.name : "Project"}
      />
      <div className="px-4 space-y-6">
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3 px-1">
            Settings &amp; management
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {linkCards.map(({ to, title, description, icon: Icon }) => (
              <Link
                key={to}
                to={`${basePath}/${to}`}
                className={cn(
                  "group block rounded-xl border bg-card text-card-foreground shadow-sm",
                  "transition-colors hover:bg-muted/50 hover:border-muted-foreground/20",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                )}
              >
                <div className="flex flex-row items-start gap-4 p-5">
                  <div
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted/50",
                      "group-hover:bg-muted transition-colors"
                    )}
                  >
                    <Icon className="size-5 text-muted-foreground" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold leading-none">{title}</span>
                      <ChevronRightIcon
                        className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                        aria-hidden
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

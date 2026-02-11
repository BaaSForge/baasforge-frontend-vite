import { Link } from "react-router";
import { PageTitleBox } from "@/components/page-title-box";
import {
  Item,
  ItemContent,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item";
import { useProjectsQuery } from "@/modules/project";
import { ChevronRightIcon, FolderIcon } from "lucide-react";

export default function ProjectsIndexPage() {
  const { data: projects = [], isLoading } = useProjectsQuery();

  return (
    <section className="flex flex-1 flex-col gap-4">
      <PageTitleBox title="Projects" />
      <div className="px-4">
        {isLoading ? (
          <p className="text-muted-foreground py-8 text-center text-sm">
            Loading projects…
          </p>
        ) : projects.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">
            No projects yet. Create one to get started.
          </p>
        ) : (
          <ItemGroup className="bg-card overflow-hidden">
            {projects.map((project, index) => (
              <div key={project.id}>
                {index > 0 && <ItemSeparator />}
                <Item variant="outline" size="default" asChild>
                  <Link to={`/dashboard/projects/${project.id}`}>
                    <ItemMedia variant="icon">
                      <FolderIcon className="size-4" aria-hidden />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>{project.name}</ItemTitle>
                      <span className="text-muted-foreground text-xs font-mono">
                        {project.slug}
                      </span>
                    </ItemContent>
                    <ChevronRightIcon
                      className="size-4 shrink-0 text-muted-foreground"
                      aria-hidden
                    />
                  </Link>
                </Item>
              </div>
            ))}
          </ItemGroup>
        )}
      </div>
    </section>
  );
}

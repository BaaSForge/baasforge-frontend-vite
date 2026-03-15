import { Container } from "@/components/page-container";
import { PageTitleBox } from "@/components/page-title-box";
import { Button } from "@/components/ui/button";
import { Item, ItemContent, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item";
import { useProjectsQuery } from "@/modules/project";
import { ChevronRightIcon, FolderIcon, PlusIcon } from "lucide-react";
import { Link } from "react-router";

export default function ProjectsIndexPage() {
    const { data: projects = [], isLoading } = useProjectsQuery();

    return (
        <>
            <PageTitleBox
                title="Projects"
                tools={
                    <Button variant="secondary" asChild size="sm">
                        <Link to="/dashboard/projects/new">
                            <PlusIcon className="size-4" />
                            Create Project
                        </Link>
                    </Button>
                }
            />
            <Container>
                {isLoading ? (
                    <p className="text-muted-foreground py-8 text-center text-sm">Loading projects…</p>
                ) : projects.length === 0 ? (
                    <p className="text-muted-foreground py-8 text-center text-sm">No projects yet. Create one to get started.</p>
                ) : (
                    <ItemGroup className="overflow-hidden">
                        {projects.map((project) => (
                            <div key={project.id} className="mb-2 bg-card">
                                <Item variant="outline" size="default" asChild>
                                    <Link to={`/dashboard/projects/${project.id}`}>
                                        <ItemMedia variant="icon">
                                            <FolderIcon className="size-4" aria-hidden />
                                        </ItemMedia>
                                        <ItemContent>
                                            <ItemTitle>{project.name}</ItemTitle>
                                            <span className="text-muted-foreground text-xs font-mono">{project.slug}</span>
                                        </ItemContent>
                                        <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                                    </Link>
                                </Item>
                            </div>
                        ))}
                    </ItemGroup>
                )}
            </Container>
        </>
    );
}

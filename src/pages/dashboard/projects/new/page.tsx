import { Container } from "@/components/page-container";
import { PageTitleBox } from "@/components/page-title-box";
import { CreateProjectForm } from "@/modules/project";

export default function CreateProjectPage() {
    return (
        <>
            <PageTitleBox title="Create project" />
            <Container>
                <div className="rounded-xl border bg-card p-4 max-w-lg">
                    <CreateProjectForm />
                </div>
            </Container>
        </>
    );
}

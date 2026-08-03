import { CenteredAuthPageLayout } from "@/modules/auth/components/centered-auth-page-layout";
import { LoginForm } from "@/modules/auth";

export default function LoginPage() {
    return (
        <CenteredAuthPageLayout>
            <LoginForm />
        </CenteredAuthPageLayout>
    );
}

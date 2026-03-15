import { LoginForm } from "@/modules/auth";

export default function LoginPage() {
    return (
        <section className="flex min-h-[80vh] items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <LoginForm />
            </div>
        </section>
    );
}

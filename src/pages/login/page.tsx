import { ModeToggle } from "@/components/mode-toggle";
import { LoginForm } from "@/modules/auth";

export default function LoginPage() {
    return (
        <section className="relative flex min-h-svh items-center justify-center overflow-hidden p-4">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute top-1/3 left-1/2 h-[min(60vh,420px)] w-[min(100vw,40rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.04] blur-3xl" />
            </div>
            <div className="absolute top-4 right-4">
                <ModeToggle label="Theme" />
            </div>
            <div className="relative w-full min-w-0 max-w-[31.2rem]">
                <LoginForm />
            </div>
        </section>
    );
}

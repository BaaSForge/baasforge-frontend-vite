import { MarketingFooter, MarketingHeader } from "@/components/marketing-shell";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ArrowUpRight, ChevronRight, X } from "lucide-react";

import "./careers.css";

const APPLICATION_URL = "https://forms.gle/mGoWRvzN5rdbDNp77";

type Role = {
    area: string;
    contribution: string;
    fit: string;
    summary: string;
    title: string;
};

const ROLES: readonly Role[] = [
    {
        area: "Engineering",
        contribution:
            "You’ll work across the product and platform, turning ambiguous ideas into dependable systems. The work spans developer experience, deployment, observability, and the details that make software comfortable to use.",
        fit: "You enjoy owning problems from first sketch to production. You make practical engineering decisions, communicate clearly, and care about reliability without losing momentum.",
        summary: "Build the product and platform surfaces that turn an idea into a dependable backend.",
        title: "Software Engineer",
    },
    {
        area: "Applied AI",
        contribution:
            "You’ll shape the generation and agent workflows behind BaaSForge, then build the evaluations and feedback loops that keep their output useful. Your work will connect model behavior with real production constraints.",
        fit: "You are curious about how models fail, not only when they succeed. You can move between experiments and production code, and you value measurable improvements over impressive demos.",
        summary: "Make AI-generated backend systems accurate, useful, and ready for real production traffic.",
        title: "AI Engineer",
    },
    {
        area: "Data",
        contribution:
            "You’ll define the metrics that explain product behavior, build reporting the team can trust, and investigate the patterns behind customer value. Your analysis will directly inform product and business decisions.",
        fit: "You ask clear questions, work carefully with imperfect data, and explain findings without hiding behind dashboards. You are comfortable turning analysis into a practical recommendation.",
        summary: "Turn product, usage, and growth data into decisions the whole team can act on.",
        title: "Data Analyst",
    },
];

function RoleDialog({ role }: { role: Role }) {
    return (
        <DialogPrimitive.Root>
            <article className="bf-careers-role">
                <div className="bf-careers-role-copy">
                    <h3>{role.title}</h3>
                    <p className="bf-careers-role-meta">
                        <span>Remote</span>
                        <span aria-hidden="true">|</span>
                        <span>{role.area}</span>
                    </p>
                </div>
                <DialogPrimitive.Trigger asChild>
                    <button className="bf-careers-detail-trigger" type="button">
                        Position Detail
                        <ChevronRight aria-hidden="true" />
                    </button>
                </DialogPrimitive.Trigger>
            </article>

            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="bf-careers-dialog-overlay" />
                <DialogPrimitive.Content className="bf-careers-dialog-content">
                    <DialogPrimitive.Close className="bf-careers-dialog-close" aria-label="Close position details">
                        <X aria-hidden="true" />
                    </DialogPrimitive.Close>
                    <div className="bf-careers-dialog-heading">
                        <p className="bf-careers-role-meta">
                            <span>Remote</span>
                            <span aria-hidden="true">|</span>
                            <span>{role.area}</span>
                        </p>
                        <DialogPrimitive.Title>{role.title}</DialogPrimitive.Title>
                        <DialogPrimitive.Description>{role.summary}</DialogPrimitive.Description>
                    </div>
                    <div className="bf-careers-dialog-sections">
                        <section>
                            <h3>What you’ll do</h3>
                            <p>{role.contribution}</p>
                        </section>
                        <section>
                            <h3>What makes you a fit</h3>
                            <p>{role.fit}</p>
                        </section>
                    </div>
                    <a className="bf-careers-apply" href={APPLICATION_URL} target="_blank" rel="noreferrer">
                        Apply for this role
                        <ArrowUpRight aria-hidden="true" />
                    </a>
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}

export default function CareersPage() {
    return (
        <div className="bf-careers-page">
            <MarketingHeader />
            <main>
                <section className="bf-careers-openings" aria-labelledby="open-roles-title">
                    <div className="bf-careers-container">
                        <div className="bf-careers-heading">
                            <span className="bf-careers-kicker">OPEN POSITIONS</span>
                            <h1 id="open-roles-title">Open roles at BaaSForge.</h1>
                            <p>Three disciplines, one shared goal: make production backends dramatically easier to build.</p>
                        </div>
                        <div className="bf-careers-list">
                            {ROLES.map((role) => (
                                <RoleDialog key={role.title} role={role} />
                            ))}
                        </div>
                    </div>
                </section>
            </main>
            <MarketingFooter />
        </div>
    );
}

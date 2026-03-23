import type { ProjectUnitType } from "./types";

const PROJECT_UNIT_TYPE_BADGE_CLASS = {
    action: "bg-rose-500/15 text-rose-800 dark:text-rose-400 border-rose-500/30",
    api: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-400 border-emerald-500/30",
    bootstrap: "bg-indigo-500/15 text-indigo-800 dark:text-indigo-400 border-indigo-500/30",
    command: "bg-orange-500/15 text-orange-800 dark:text-orange-400 border-orange-500/30",
    flow: "bg-amber-500/15 text-amber-800 dark:text-amber-400 border-amber-500/30",
    gateway: "bg-cyan-500/15 text-cyan-800 dark:text-cyan-400 border-cyan-500/30",
    projection: "bg-violet-500/15 text-violet-800 dark:text-violet-400 border-violet-500/30",
    query: "bg-sky-500/15 text-sky-800 dark:text-sky-400 border-sky-500/30",
    runtime: "bg-fuchsia-500/15 text-fuchsia-800 dark:text-fuchsia-400 border-fuchsia-500/30",
    schema: "bg-slate-500/15 text-slate-800 dark:text-slate-400 border-slate-500/30",
    timer: "bg-purple-500/15 text-purple-800 dark:text-purple-400 border-purple-500/30",
} as const satisfies Record<ProjectUnitType, string>;

export function getProjectUnitTypeBadgeClass(type: ProjectUnitType): string {
    return PROJECT_UNIT_TYPE_BADGE_CLASS[type];
}

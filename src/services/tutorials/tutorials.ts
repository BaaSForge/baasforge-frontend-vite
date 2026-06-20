import { Coins, FolderKanban, GitBranch, KeyRound, Plug, SearchCode, type LucideIcon } from "lucide-react";

export const WELCOME_TUTORIALS_GROUP_ID = "welcome-tutorials" as const;

export type TutorialGroupId = typeof WELCOME_TUTORIALS_GROUP_ID;

export type TutorialId =
    | "your-first-project"
    | "write-and-call-your-api"
    | "debug-and-release"
    | "units-and-rollbacks"
    | "project-variables"
    | "costs-in-action";

export type TutorialGroup = {
    id: TutorialGroupId;
    title: string;
    isSequence: boolean;
};

export type Tutorial = {
    id: TutorialId;
    groupId: TutorialGroupId;
    title: string;
    description: string;
    icon: LucideIcon;
};

export const TUTORIAL_GROUPS: ReadonlyArray<TutorialGroup> = [
    {
        id: WELCOME_TUTORIALS_GROUP_ID,
        title: "Welcome tutorials",
        isSequence: true,
    },
];

export const TUTORIALS: ReadonlyArray<Tutorial> = [
    {
        id: "your-first-project",
        groupId: WELCOME_TUTORIALS_GROUP_ID,
        title: "Your first project",
        description: "Get ready with the dashboard UI and create your first project.",
        icon: FolderKanban,
    },
    {
        id: "write-and-call-your-api",
        groupId: WELCOME_TUTORIALS_GROUP_ID,
        title: "Write and call your API",
        description:
            "Write your first API, learn about built units, deploy to stage, call it with the built-in HTTP client.",
        icon: Plug,
    },
    {
        id: "debug-and-release",
        groupId: WELCOME_TUTORIALS_GROUP_ID,
        title: "Debug and release",
        description:
            "Use traces to tell the AI what went wrong, update your units, redeploy to stage, then release to production.",
        icon: SearchCode,
    },
    {
        id: "units-and-rollbacks",
        groupId: WELCOME_TUTORIALS_GROUP_ID,
        title: "Units and rollbacks",
        description: "See your units, browse release history, and roll back to an older release.",
        icon: GitBranch,
    },
    {
        id: "project-variables",
        groupId: WELCOME_TUTORIALS_GROUP_ID,
        title: "Project variables",
        description: "Define your first variables—what they are and how they work.",
        icon: KeyRound,
    },
    {
        id: "costs-in-action",
        groupId: WELCOME_TUTORIALS_GROUP_ID,
        title: "Costs in action",
        description: "Learn how costs are calculated and see pricing play out on your project.",
        icon: Coins,
    },
];

export function getTutorialGroup(groupId: TutorialGroupId): TutorialGroup | undefined {
    return TUTORIAL_GROUPS.find((group) => group.id === groupId);
}

export function getTutorialsByGroupId(groupId: TutorialGroupId): ReadonlyArray<Tutorial> {
    return TUTORIALS.filter((tutorial) => tutorial.groupId === groupId);
}

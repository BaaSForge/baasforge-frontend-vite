// Compatibility layer re-exporting the full 78 recipes from recipes-data.ts
export * from "./recipes-data";

import { ALL_RECIPES, type RecipeItem } from "./recipes-data";

export type UnitType = "Workflow" | "Actor" | "Queue Worker" | "API";

export type ScenarioCategory =
    | "commerce-orders"
    | "saas-tenancy"
    | "ai-agents"
    | "fintech-payments"
    | "distributed-sagas"
    | "resilience-data"
    | "all";

export type ScenarioItem = RecipeItem & {
    number: string;
    categoryLabel: string;
    tagline: string;
    units: UnitType[];
    trigger: string;
    steps: string[];
    state: string;
    edgeCases: string[];
    acceptance: string[];
    outside: string;
};

export const PLAYBOOK_SCENARIOS: ScenarioItem[] = ALL_RECIPES.map((r) => ({
    ...r,
    number: "#" + String(r.id).padStart(2, "0"),
    categoryLabel: r.category,
    tagline: r.promise,
    units: ["Workflow", "Actor"] as UnitType[],
    trigger: r.howItWorks[0] || "",
    steps: r.howItWorks,
    state: r.whatYouCanBuild.join(", "),
    edgeCases: [r.watchOut],
    acceptance: [r.watchOut],
    outside: r.youllNeed,
}));

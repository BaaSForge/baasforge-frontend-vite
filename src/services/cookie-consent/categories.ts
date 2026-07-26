import type { CookieCategoryDefinition } from "./types";

export const COOKIE_CATEGORY_DEFINITIONS: readonly CookieCategoryDefinition[] = [
    {
        id: "necessary",
        title: "Strictly necessary",
        description:
            "Required for the site to work — sign-in, security, load balancing, and remembering your cookie choices. These cannot be turned off.",
        required: true,
    },
    {
        id: "analytics",
        title: "Analytics",
        description:
            "Help us understand how the product is used so we can improve it. Only used if you allow them.",
        required: false,
    },
    {
        id: "marketing",
        title: "Marketing",
        description:
            "Used to measure campaigns and show more relevant messages. Only used if you allow them.",
        required: false,
    },
] as const;

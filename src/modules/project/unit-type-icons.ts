import type { LucideIcon } from "lucide-react";
import { Blocks, Bot, GitMerge, Inbox, Plug2 } from "lucide-react";
import type { ProjectUnitType } from "./types";

/** Single source of truth for unit-type → icon. Import from here whenever a unit type needs an icon. */
export const UNIT_TYPE_ICONS = {
    api: Plug2,
    actor: Bot,
    workflow: GitMerge,
    queue_worker: Inbox,
    common: Blocks,
} as const satisfies Record<ProjectUnitType, LucideIcon>;

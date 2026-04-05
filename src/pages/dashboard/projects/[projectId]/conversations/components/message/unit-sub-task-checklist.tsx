import { CheckIcon, XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { UnitSubTaskStatus } from "@/modules/project-chat/types";

export type UnitSubTask = {
    label: string;
    status: UnitSubTaskStatus;
};

function SubTaskItem({ label, status }: UnitSubTask) {
    const isSucceeded = status === "succeeded";
    const isFailed = status === "failed";

    return (
        <li className="flex items-center gap-1.5">
            <span
                className={cn(
                    "pointer-events-none flex size-3.5 shrink-0 items-center justify-center rounded-[3px] border",
                    isSucceeded && "border-primary bg-primary text-primary-foreground",
                    isFailed && "border-destructive bg-destructive text-destructive-foreground",
                    !isSucceeded && !isFailed && "border-input bg-transparent",
                )}
            >
                {isSucceeded && <CheckIcon className="size-2.5" />}
                {isFailed && <XIcon className="size-2.5" />}
            </span>
            <span
                className={cn(
                    "text-xs",
                    isSucceeded && "text-muted-foreground",
                    isFailed && "text-destructive",
                    !isSucceeded && !isFailed && "text-muted-foreground/60",
                )}
            >
                {label}
            </span>
        </li>
    );
}

export function UnitSubTaskChecklist({ subTasks }: { subTasks: UnitSubTask[] }) {
    if (subTasks.length === 0) return null;
    return (
        <ul className="ml-5.5 flex flex-col gap-1">
            {subTasks.map((task) => (
                <SubTaskItem key={task.label} label={task.label} status={task.status} />
            ))}
        </ul>
    );
}

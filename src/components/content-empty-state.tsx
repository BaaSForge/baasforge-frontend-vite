import { PackageOpen, type LucideIcon } from "lucide-react";

import { ContentStatusState, type ContentStatusStateSize } from "@/components/content-status-state";

type ContentEmptyStateProps = {
    title: string;
    description?: string;
    icon?: LucideIcon;
    size?: ContentStatusStateSize;
    className?: string;
};

export function ContentEmptyState({ title, description, icon = PackageOpen, size = "default", className }: ContentEmptyStateProps) {
    return (
        <ContentStatusState
            title={title}
            description={description}
            icon={icon}
            variant="empty"
            size={size}
            className={className}
        />
    );
}

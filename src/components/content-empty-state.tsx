import { PackageOpen, type LucideIcon } from "lucide-react";

import { ContentStatusState } from "@/components/content-status-state";

type ContentEmptyStateProps = {
    title: string;
    description?: string;
    icon?: LucideIcon;
    className?: string;
};

export function ContentEmptyState({ title, description, icon = PackageOpen, className }: ContentEmptyStateProps) {
    return <ContentStatusState title={title} description={description} icon={icon} variant="empty" className={className} />;
}

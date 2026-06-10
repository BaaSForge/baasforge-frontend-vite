import { AlertCircle, type LucideIcon } from "lucide-react";

import { ContentStatusState, type ContentStatusStateSize } from "@/components/content-status-state";

type ContentErrorStateProps = {
    title: string;
    subtitle: string;
    icon?: LucideIcon;
    size?: ContentStatusStateSize;
    className?: string;
};

export function ContentErrorState({ title, subtitle, icon = AlertCircle, size = "default", className }: ContentErrorStateProps) {
    return (
        <ContentStatusState
            title={title}
            description={subtitle}
            icon={icon}
            variant="error"
            size={size}
            className={className}
        />
    );
}

import { AlertCircle, type LucideIcon } from "lucide-react";

import { ContentStatusState } from "@/components/content-status-state";

type ContentErrorStateProps = {
    title: string;
    subtitle: string;
    icon?: LucideIcon;
    className?: string;
};

export function ContentErrorState({ title, subtitle, icon = AlertCircle, className }: ContentErrorStateProps) {
    return <ContentStatusState title={title} description={subtitle} icon={icon} variant="error" className={className} />;
}

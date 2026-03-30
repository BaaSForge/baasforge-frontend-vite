import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ProjectRuntimeResponse } from "@/modules/project/types";
import { DeploymentStatusBadge } from "./deployment-status-badge";
import { LiveBadge } from "./live-badge";
import { PlatformEnvironmentBadge } from "./platform-environment-badge";

export interface RuntimeCardProps {
    runtime: ProjectRuntimeResponse;
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm text-muted-foreground shrink-0">{label}</span>
            <span className="flex-1 min-w-0 border-b border-dashed border-muted-foreground/40" aria-hidden />
            {value}
        </div>
    );
}

export function RuntimeCard({ runtime }: RuntimeCardProps) {
    const revision = runtime.liveRelease?.revision;
    const hasLiveRelease = runtime.liveRelease != null;
    const liveBadge = (
        <LiveBadge
            isOn={hasLiveRelease}
            onLabel={revision != null ? `${revision} is live` : "Live release attached"}
            offLabel="Not live"
            className="text-sm"
            size={0.5}
        />
    );

    return (
        <Card className={`p-0 gap-0 overflow-hidden shadow-none rounded-md`}>
            <CardHeader className={cn("flex flex-row items-center border-b bg-muted justify-between gap-3 !py-2.5 px-3")}>
                <h3 className="font-semibold text-sm truncate">{runtime.name}</h3>
            </CardHeader>
            <CardContent className="py-4 px-4 space-y-3">
                <InfoRow label="Live release revision" value={liveBadge} />
                <InfoRow label="Environment" value={<PlatformEnvironmentBadge environment={runtime.environment} />} />
                <InfoRow label="Server Status" value={<DeploymentStatusBadge status={runtime.server_cluster_deployment_status} />} />
                <InfoRow label="Database Status" value={<DeploymentStatusBadge status={runtime.db_cluster_deployment_status} />} />
            </CardContent>
        </Card>
    );
}

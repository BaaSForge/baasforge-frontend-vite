import { CopyableEntityIdBadge } from "@/components/copyable-entity-id-badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getRuntimeLiveReleaseId } from "@/modules/project/runtime-release";
import { PlatformEnvironmentType, type ProjectRuntimeResponse } from "@/modules/project/types";
import { MessageSquare, Package } from "lucide-react";
import { Link, useLocation } from "react-router";
import { LiveBadge } from "./live-badge";
import { PlatformEnvironmentBadge } from "./platform-environment-badge";

export interface RuntimeCardProps {
    projectId: string;
    runtime: ProjectRuntimeResponse;
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm text-muted-foreground shrink-0">{label}</span>
            <span className="flex-1 min-w-0 border-b border-dashed border-muted-foreground/15" aria-hidden />
            {value}
        </div>
    );
}

export function RuntimeCard({ projectId, runtime }: RuntimeCardProps) {
    const location = useLocation();
    const liveReleaseId = getRuntimeLiveReleaseId(runtime);
    const canOpenUnits = liveReleaseId != null;
    const unitsReleasesHref =
        (runtime.environment === PlatformEnvironmentType.prod
            ? `/dashboard/projects/${projectId}/units-releases`
            : `/dashboard/projects/${projectId}/runtimes/${runtime.id}/units-releases`) + location.search;
    const unitsLinkLabel = runtime.environment === PlatformEnvironmentType.stage ? "Units" : "Units & releases";
    const revision = runtime.live_release?.revision;
    const hasLiveRelease = runtime.live_release != null;
    const chatSessionId = runtime.live_release?.chat_session_id?.trim() ?? "";
    const hasIntroChat = chatSessionId !== "";
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
                <InfoRow
                    label="Runtime id"
                    value={
                        <div className="min-w-0 max-w-full shrink">
                            <CopyableEntityIdBadge
                                id={runtime.id}
                                className="relative max-w-full min-w-0 self-start justify-start"
                            />
                        </div>
                    }
                />
                <InfoRow
                    label="Release intro chat"
                    value={
                        hasIntroChat ? (
                            <Button asChild variant="outline" size="xs" className="min-w-0 max-w-full shrink">
                                <Link
                                    to={`/dashboard/projects/${projectId}/conversations/${chatSessionId}${location.search}`}
                                    className="min-w-0"
                                >
                                    <MessageSquare className="size-3.5 shrink-0" aria-hidden />
                                    <span className="truncate">Open chat</span>
                                </Link>
                            </Button>
                        ) : (
                            <Button type="button" size="xs" variant="outline" disabled>
                                No session
                            </Button>
                        )
                    }
                />
                <InfoRow
                    label={unitsLinkLabel}
                    value={
                        canOpenUnits ? (
                            <Button asChild variant="outline" size="xs" className="min-w-0 max-w-full shrink">
                                <Link to={unitsReleasesHref} className="min-w-0">
                                    <Package className="size-3.5 shrink-0" aria-hidden />
                                    <span className="truncate">Open Units</span>
                                </Link>
                            </Button>
                        ) : (
                            <Button type="button" variant="outline" size="xs" className="min-w-0 max-w-full shrink" disabled>
                                <Package className="size-3.5 shrink-0" aria-hidden />
                                <span className="truncate">No live release</span>
                            </Button>
                        )
                    }
                />
            </CardContent>
        </Card>
    );
}

"use client";

import { UsagePage } from "@/modules/usage";
import { useParams } from "react-router";

export default function ProjectUsagePage() {
    const { projectId } = useParams<{ projectId: string }>();
    return <UsagePage projectId={projectId} title="Usage" />;
}

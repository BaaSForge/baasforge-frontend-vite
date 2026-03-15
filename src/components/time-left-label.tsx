import { formatTimeLeftLabel, getTimeLeft } from "@/utils/time";
import { useEffect, useState } from "react";

const ONE_MINUTE_MS = 60 * 1000;

interface TimeLeftLabelProps {
    expiresAt: string | null;
}

export function TimeLeftLabel({ expiresAt }: TimeLeftLabelProps) {
    const [label, setLabel] = useState(() => formatTimeLeftLabel(getTimeLeft(expiresAt)));

    useEffect(() => {
        const info = getTimeLeft(expiresAt);
        setLabel(formatTimeLeftLabel(info)); // eslint-disable-line react-hooks/set-state-in-effect

        if (info.type !== "active" || info.days >= 1) {
            return;
        }

        const interval = setInterval(() => {
            const next = getTimeLeft(expiresAt);
            setLabel(formatTimeLeftLabel(next));
        }, ONE_MINUTE_MS);

        return () => clearInterval(interval);
    }, [expiresAt]);

    return <>{label}</>;
}

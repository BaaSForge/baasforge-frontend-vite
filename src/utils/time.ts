export const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

const MS_PER_MINUTE = 1000 * 60;
const MS_PER_HOUR = MS_PER_MINUTE * 60;
const MS_PER_DAY = MS_PER_HOUR * 24;

export type TimeLeft =
  | { type: "no_date" }
  | { type: "expired" }
  | {
      type: "active";
      diffMs: number;
      days: number;
      hours: number;
      minutes: number;
    };

export function getTimeLeft(expiresAt: string | null): TimeLeft {
  if (!expiresAt) return { type: "no_date" };

  const now = Date.now();
  const expiry = new Date(expiresAt).getTime();
  const diffMs = expiry - now;

  if (diffMs <= 0) return { type: "expired" };

  const days = Math.floor(diffMs / MS_PER_DAY);
  const hours = Math.floor((diffMs % MS_PER_DAY) / MS_PER_HOUR);
  const minutes = Math.floor((diffMs % MS_PER_HOUR) / MS_PER_MINUTE);

  return { type: "active", diffMs, days, hours, minutes };
}

export function formatTimeLeftLabel(info: TimeLeft): string {
  if (info.type === "no_date") return "";
  if (info.type === "expired") return "Expired";

  const { days, hours, minutes } = info;
  if (days >= 1) return days === 1 ? "1 day left" : `${days} days left`;
  if (days === 0 && hours === 0 && minutes <= 1) return "Less than 1 min left";
  if (days === 0 && hours === 0) return `${minutes} min left`;
  if (days === 0 && minutes === 0) return `${hours}h left`;
  if (days === 0) return `${hours}h ${minutes}m left`;
  return "Expires today";
}

export function formatDateTime(
  dateValue: string | null,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!dateValue) return "";
  const d = new Date(dateValue);
  const opts: Intl.DateTimeFormatOptions =
    options ??
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
  return d.toLocaleString(undefined, opts);
}

export function formatDateTimeMedium(dateValue: string | null): string {
  if (!dateValue) return "";
  return new Date(dateValue).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function formatMonthShort(date: Date): string {
  return date.toLocaleString("default", { month: "short" });
}

export function formatLocaleDateString(date: Date): string {
  return date.toLocaleDateString();
}

export function truncateToWords(text: string, maxWords: number): string {
    const trimmed = text.trim();
    if (!trimmed) return trimmed;
    const words = trimmed.split(/\s+/);
    if (words.length <= maxWords) return trimmed;
    return `${words.slice(0, maxWords).join(" ")}…`;
}

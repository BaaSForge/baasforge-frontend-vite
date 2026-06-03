import {
    Combobox,
    ComboboxChip,
    ComboboxChips,
    ComboboxChipsInput,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxItem,
    ComboboxList,
    ComboboxValue,
    useComboboxAnchor,
} from "@/components/ui/combobox";
import { Loader2Icon } from "lucide-react";
import { Fragment } from "react";

export function ReleaseUnitsContextsCombobox({
    releaseId,
    sortedContextOptions,
    contextsLoading,
    contexts,
    onContextsChange,
}: {
    releaseId: string;
    sortedContextOptions: string[];
    contextsLoading: boolean;
    contexts: string[];
    onContextsChange: (nextContexts: string[]) => void;
}) {
    const contextsAnchor = useComboboxAnchor();

    return (
        <Combobox
            key={`ctx-${releaseId}`}
            multiple
            autoHighlight
            items={sortedContextOptions}
            value={contexts}
            onValueChange={(next) => {
                const nextContexts = [...(next ?? [])].sort((a, b) => a.localeCompare(b));
                onContextsChange(nextContexts);
            }}
        >
            <ComboboxChips ref={contextsAnchor} className="h-auto min-h-8 w-full min-w-0 py-1">
                <ComboboxValue>
                    {(values: string[]) => (
                        <Fragment>
                            {values.map((slug) => (
                                <ComboboxChip key={slug} title={slug}>
                                    {slug}
                                </ComboboxChip>
                            ))}
                            <ComboboxChipsInput placeholder="Contexts" className="text-sm placeholder:text-muted-foreground" />
                        </Fragment>
                    )}
                </ComboboxValue>
            </ComboboxChips>
            <ComboboxContent anchor={contextsAnchor} className="w-[var(--anchor-width)]">
                <ComboboxEmpty>
                    {contextsLoading ? (
                        <span className="inline-flex items-center gap-2">
                            <Loader2Icon className="size-4 shrink-0 animate-spin" />
                            Loading contexts…
                        </span>
                    ) : (
                        "No contexts for this release."
                    )}
                </ComboboxEmpty>
                <ComboboxList>
                    {(slug: string) => (
                        <ComboboxItem key={slug} value={slug}>
                            <span className="truncate">{slug}</span>
                        </ComboboxItem>
                    )}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    );
}

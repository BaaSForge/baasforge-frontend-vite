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
import { cn } from "@/lib/utils";
import { Fragment } from "react";
import { modulePairKeyLabel } from "./release-units-module-pair-keys";

export function ReleaseUnitsModulesCombobox({
    releaseId,
    moduleItemKeys,
    modulesLoading,
    modulesFetching,
    disabled,
    modulePairKeysValue,
    onModulePairsChange,
}: {
    releaseId: string;
    moduleItemKeys: string[];
    modulesLoading: boolean;
    modulesFetching: boolean;
    disabled: boolean;
    modulePairKeysValue: string[];
    onModulePairsChange: (keys: string[]) => void;
}) {
    const modulesAnchor = useComboboxAnchor();

    return (
        <Combobox
            key={`mod-${releaseId}`}
            multiple
            autoHighlight
            items={moduleItemKeys}
            value={modulePairKeysValue}
            disabled={disabled}
            onValueChange={(next) => {
                onModulePairsChange([...(next ?? [])] as string[]);
            }}
        >
            <ComboboxChips
                ref={modulesAnchor}
                className={cn("h-auto min-h-8 w-full min-w-0 py-1", disabled && "opacity-50")}
            >
                <ComboboxValue>
                    {(values: string[]) => (
                        <Fragment>
                            {values.map((key) => (
                                <ComboboxChip key={key} title={modulePairKeyLabel(key)}>
                                    {modulePairKeyLabel(key)}
                                </ComboboxChip>
                            ))}
                            <ComboboxChipsInput placeholder="Modules" className="text-sm placeholder:text-muted-foreground" />
                        </Fragment>
                    )}
                </ComboboxValue>
            </ComboboxChips>
            <ComboboxContent anchor={modulesAnchor} className="w-[var(--anchor-width)]">
                <ComboboxEmpty>
                    {disabled
                        ? "Select one or more contexts."
                        : modulesLoading || modulesFetching
                          ? "Loading modules…"
                          : moduleItemKeys.length === 0
                            ? "No modules for selected contexts."
                            : "No matching modules."}
                </ComboboxEmpty>
                <ComboboxList>
                    {(key: string) => (
                        <ComboboxItem key={key} value={key}>
                            <span className="truncate">{modulePairKeyLabel(key)}</span>
                        </ComboboxItem>
                    )}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    );
}

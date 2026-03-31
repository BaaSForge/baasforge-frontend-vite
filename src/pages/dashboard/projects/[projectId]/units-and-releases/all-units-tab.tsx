import { SectionTitle } from "@/components/section-title";
import { Button } from "@/components/ui/button";
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
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { capitalizeFirstLetter, cn } from "@/lib/utils";
import { UNIT_TYPE_ICONS } from "@/modules/project/components/unit-type-badge";
import { UnitCardCompact } from "@/modules/project/components/unit-card-compact";
import {
    useProjectModulesByContextsQuery,
    useProjectReleaseContextsQuery,
    useProjectReleaseUnitsAllQuery,
} from "@/modules/project/queries";
import type { ContextModulePair, ListReleaseUnitsAllRequest, ProjectUnitResponse, ProjectUnitType } from "@/modules/project/types";
import { STATIC_PROJECT_UNIT_TYPES } from "@/modules/project/types";
import { ChevronLeftIcon, ChevronRightIcon, FilterXIcon, LayersIcon, Loader2Icon, TextAlignJustifyIcon } from "lucide-react";
import { Fragment, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router";
import { groupUnitsByType } from "./group-units-by-type";
import {
    DEFAULT_ALL_UNITS_PAGE,
    mergeAllUnitsSearchParams,
    pairsCompatibleWithContexts,
    readReleaseUnitsSearchParams,
    isAllowedPageSize,
    type AllUnitsGroupMode,
} from "./release-units-search-params";

const MODULE_PAIR_SEP = "\u0000";

function modulePairKey(p: ContextModulePair): string {
    return `${p.context_slug}${MODULE_PAIR_SEP}${p.module_slug}`;
}

function parseModulePairKey(key: string): ContextModulePair | null {
    const i = key.indexOf(MODULE_PAIR_SEP);
    if (i <= 0) return null;
    const context_slug = key.slice(0, i);
    const module_slug = key.slice(i + MODULE_PAIR_SEP.length);
    if (context_slug.length === 0 || module_slug.length === 0) return null;
    return { context_slug, module_slug };
}

function modulePairKeyLabel(key: string): string {
    const p = parseModulePairKey(key);
    return p != null ? `${p.context_slug}: ${p.module_slug}` : key;
}

function sortPairs(a: ContextModulePair, b: ContextModulePair): number {
    const c = a.context_slug.localeCompare(b.context_slug);
    return c !== 0 ? c : a.module_slug.localeCompare(b.module_slug);
}

function UnitsGroupedByType({ projectId, units }: { projectId?: string; units: ProjectUnitResponse[] }) {
    const grouped = useMemo(() => groupUnitsByType(units), [units]);
    const sortedTypes = useMemo(() => [...grouped.keys()].sort((a, b) => a.localeCompare(b)), [grouped]);

    return (
        <div className="space-y-6">
            {sortedTypes.map((unitType) => (
                <div key={unitType}>
                    <SectionTitle>{capitalizeFirstLetter(unitType)}</SectionTitle>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        {grouped.get(unitType)?.map((unit) => (
                            <UnitCardCompact key={unit.id} projectId={projectId} unit={unit} showChatSessionOverflowMenu />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

export function AllUnitsTab({ projectId, releaseId }: { projectId: string; releaseId: string }) {
    const [searchParams, setSearchParams] = useSearchParams();
    const { unitsTab, allUnits } = readReleaseUnitsSearchParams(searchParams);
    const tabActive = unitsTab === "all";

    const { page, pageSize, groupMode, contexts, unitTypes, contextModulePairs } = allUnits;
    const pairs = useMemo(() => pairsCompatibleWithContexts(contexts, contextModulePairs), [contexts, contextModulePairs]);

    const { data: contextSlugs = [], isLoading: contextsLoading } = useProjectReleaseContextsQuery(projectId, releaseId, {
        enabled: tabActive,
    });

    const sortedContextOptions = useMemo(() => [...contextSlugs].sort((a, b) => a.localeCompare(b)), [contextSlugs]);

    const modulesQuery = useProjectModulesByContextsQuery(projectId, contexts, {
        enabled: tabActive && contexts.length > 0,
    });

    const listBody: ListReleaseUnitsAllRequest = useMemo(
        () => ({
            page,
            page_size: pageSize,
            unit_types: unitTypes,
            context_slugs: contexts,
            context_module_pairs: pairs,
        }),
        [page, pageSize, unitTypes, contexts, pairs],
    );

    const unitsQuery = useProjectReleaseUnitsAllQuery(projectId, releaseId, listBody, { enabled: tabActive });

    const { data, isLoading, error, isFetching } = unitsQuery;

    useEffect(() => {
        if (!tabActive || !data) return;
        const totalPages = Math.max(1, Math.ceil(data.total / data.page_size));
        if (data.page > totalPages) {
            setSearchParams((prev) => mergeAllUnitsSearchParams(new URLSearchParams(prev), { page: totalPages }));
        }
    }, [tabActive, data, setSearchParams]);

    const patchUrl = (patch: Parameters<typeof mergeAllUnitsSearchParams>[1]) => {
        if (patch.groupMode != null) {
            try {
                localStorage.setItem(STORAGE_KEYS.UNITS_AND_RELEASES_GROUP_MODE, patch.groupMode);
            } catch {
                // ignore
            }
        }
        setSearchParams((prev) => mergeAllUnitsSearchParams(new URLSearchParams(prev), patch));
    };

    const contextsAnchor = useComboboxAnchor();
    const modulesAnchor = useComboboxAnchor();
    const unitTypesAnchor = useComboboxAnchor();

    const moduleItemKeys = useMemo(() => {
        const keys: string[] = [];
        for (const ctxSlug of contexts) {
            const row = modulesQuery.data?.find((r) => r.context_slug === ctxSlug);
            const mods = [...(row?.module_slugs ?? [])].sort((a, b) => a.localeCompare(b));
            for (const mod of mods) {
                keys.push(modulePairKey({ context_slug: ctxSlug, module_slug: mod }));
            }
        }
        return keys.sort((a, b) => a.localeCompare(b));
    }, [contexts, modulesQuery.data]);

    const modulePairKeysValue = useMemo(
        () => [...pairs].sort(sortPairs).map(modulePairKey),
        [pairs],
    );

    const hasActiveFilters =
        contexts.length > 0 || contextModulePairs.length > 0 || unitTypes.length > 0;

    const clearFilters = () => {
        patchUrl({
            contexts: [],
            contextModulePairs: [],
            unitTypes: [],
            page: DEFAULT_ALL_UNITS_PAGE,
        });
    };

    const total = data?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const units = data?.units ?? [];

    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <SectionTitle className="mb-0">All units (combined)</SectionTitle>
                <p className="text-muted-foreground max-w-prose text-sm">
                    Paginated list of every unit in this release with server-side filters. Grouping only affects how the current page is displayed.
                </p>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                    <Combobox
                        multiple
                        autoHighlight
                        items={sortedContextOptions}
                        value={contexts}
                        onValueChange={(next) => {
                            const nextContexts = [...(next ?? [])].sort((a, b) => a.localeCompare(b));
                            const nextPairs = pairsCompatibleWithContexts(nextContexts, contextModulePairs);
                            patchUrl({ contexts: nextContexts, contextModulePairs: nextPairs, page: DEFAULT_ALL_UNITS_PAGE });
                        }}
                    >
                        <ComboboxChips ref={contextsAnchor} className="h-auto min-h-8 w-full min-w-[10rem] max-w-[14rem] py-1">
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

                    <Combobox
                        multiple
                        autoHighlight
                        items={moduleItemKeys}
                        value={modulePairKeysValue}
                        disabled={contexts.length === 0}
                        onValueChange={(next) => {
                            const keys = [...(next ?? [])] as string[];
                            const parsed: ContextModulePair[] = [];
                            for (const k of keys) {
                                const p = parseModulePairKey(k);
                                if (p != null) parsed.push(p);
                            }
                            parsed.sort(sortPairs);
                            patchUrl({ contextModulePairs: parsed, page: DEFAULT_ALL_UNITS_PAGE });
                        }}
                    >
                        <ComboboxChips ref={modulesAnchor} className="h-auto min-h-8 w-full min-w-[10rem] max-w-[14rem] py-1">
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
                                {contexts.length === 0
                                    ? "Select one or more contexts."
                                    : modulesQuery.isLoading || modulesQuery.isFetching
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

                    <Combobox
                        multiple
                        autoHighlight
                        items={STATIC_PROJECT_UNIT_TYPES.slice()}
                        value={unitTypes}
                        onValueChange={(next) => {
                            const nextTypes = [...(next ?? [])] as ProjectUnitType[];
                            nextTypes.sort((a, b) => a.localeCompare(b));
                            patchUrl({ unitTypes: nextTypes, page: DEFAULT_ALL_UNITS_PAGE });
                        }}
                    >
                        <ComboboxChips ref={unitTypesAnchor} className="h-auto min-h-8 w-full min-w-[10rem] max-w-[14rem] py-1">
                            <ComboboxValue>
                                {(values: ProjectUnitType[]) => (
                                    <Fragment>
                                        {values.map((t) => {
                                            const Icon = UNIT_TYPE_ICONS[t];
                                            return (
                                                <ComboboxChip key={t} title={capitalizeFirstLetter(t)}>
                                                    <Icon className="text-muted-foreground size-3 shrink-0" aria-hidden />
                                                    {capitalizeFirstLetter(t)}
                                                </ComboboxChip>
                                            );
                                        })}
                                        <ComboboxChipsInput placeholder="Unit types" className="text-sm placeholder:text-muted-foreground" />
                                    </Fragment>
                                )}
                            </ComboboxValue>
                        </ComboboxChips>
                        <ComboboxContent anchor={unitTypesAnchor} className="w-[var(--anchor-width)]">
                            <ComboboxEmpty>No unit types.</ComboboxEmpty>
                            <ComboboxList>
                                {(t: ProjectUnitType) => {
                                    const Icon = UNIT_TYPE_ICONS[t];
                                    return (
                                        <ComboboxItem key={t} value={t}>
                                            <Icon className="text-muted-foreground size-4 shrink-0" aria-hidden />
                                            <span className="truncate">{capitalizeFirstLetter(t)}</span>
                                        </ComboboxItem>
                                    );
                                }}
                            </ComboboxList>
                        </ComboboxContent>
                    </Combobox>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="shrink-0 border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40"
                        disabled={!hasActiveFilters}
                        onClick={clearFilters}
                    >
                        <FilterXIcon className="size-4" />
                        Clear filters
                    </Button>
                </div>

                <ToggleGroup
                    type="single"
                    value={groupMode}
                    onValueChange={(v) => v != null && v !== "" && patchUrl({ groupMode: v as AllUnitsGroupMode })}
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                >
                    <ToggleGroupItem value="ungrouped">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span>
                                    <TextAlignJustifyIcon />
                                </span>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">Ungrouped view</TooltipContent>
                        </Tooltip>
                    </ToggleGroupItem>
                    <ToggleGroupItem value="grouped">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span>
                                    <LayersIcon />
                                </span>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">Group by type</TooltipContent>
                        </Tooltip>
                    </ToggleGroupItem>
                </ToggleGroup>
            </div>

            {isLoading ? (
                <div className="text-muted-foreground p-6 text-center text-sm">Loading units…</div>
            ) : error ? (
                <div className="text-destructive p-6 text-center text-sm">Failed to load combined units.</div>
            ) : units.length === 0 ? (
                <div className="text-muted-foreground border-border rounded-lg border border-dashed p-8 text-center text-sm">
                    No units match the current filters for this page.
                </div>
            ) : groupMode === "ungrouped" ? (
                <div className={cn("grid grid-cols-1 gap-4 lg:grid-cols-2", isFetching && "opacity-70")}>
                    {units.map((unit) => (
                        <UnitCardCompact key={unit.id} projectId={projectId} unit={unit} showChatSessionOverflowMenu />
                    ))}
                </div>
            ) : (
                <div className={cn(isFetching && "opacity-70")}>
                    <UnitsGroupedByType projectId={projectId} units={units} />
                </div>
            )}

            {totalPages > 1 ? (
                <div className="text-muted-foreground flex flex-col gap-3 border-t pt-4 text-sm sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                        <span>
                            Page <span className="text-foreground font-medium">{page}</span> of {totalPages}
                            <span className="mx-1.5">·</span>
                            {total} unit{total === 1 ? "" : "s"}
                        </span>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="size-8"
                                disabled={page <= 1 || isFetching}
                                onClick={() => patchUrl({ page: Math.max(1, page - 1) })}
                                aria-label="Previous page"
                            >
                                <ChevronLeftIcon className="size-4" />
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="size-8"
                                disabled={page >= totalPages || isFetching}
                                onClick={() => patchUrl({ page: Math.min(totalPages, page + 1) })}
                                aria-label="Next page"
                            >
                                <ChevronRightIcon className="size-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="whitespace-nowrap">Page size</span>
                        <NativeSelect
                            size="sm"
                            className="w-[4.5rem]"
                            value={String(pageSize)}
                            onChange={(e) => {
                                const next = Number.parseInt(e.target.value, 10);
                                if (!isAllowedPageSize(next)) return;
                                patchUrl({ pageSize: next, page: DEFAULT_ALL_UNITS_PAGE });
                            }}
                        >
                            <NativeSelectOption value="10">10</NativeSelectOption>
                            <NativeSelectOption value="20">20</NativeSelectOption>
                            <NativeSelectOption value="50">50</NativeSelectOption>
                        </NativeSelect>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

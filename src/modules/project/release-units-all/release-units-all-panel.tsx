import { ContentEmptyState } from "@/components/content-empty-state";
import { ContentErrorState } from "@/components/content-error-state";
import { ContentLoadingState } from "@/components/content-loading-state";
import { SectionTitle } from "@/components/section-title";
import { Button } from "@/components/ui/button";
import { FilterClearButton } from "@/components/ui/filter-clear-button";

export const APP_RELEASE_UNITS_FILTER_INPUT_ID = "app-release-units-filter-input";
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
import { ConfirmableButton } from "@/components/ui/confirmable-button";
import { FreeformMultiCombobox } from "@/components/ui/freeform-multi-combobox";
import { capitalizeFirstLetter, cn } from "@/lib/utils";
import { DocumentationShareBlock } from "@/modules/project/documentation-share/documentation-share-block";
import {
    useSharedModulesByContextsQuery,
    useSharedReleaseContextsQuery,
    useSharedReleaseUnitsAllPinnedQuery,
    useSharedReleaseUnitsAllQuery,
} from "@/modules/project/documentation-share/share-release-queries";
import { ProjectUnitTypeSectionHeading } from "@/modules/project/components/project-unit-type-section-heading";
import {
    useProjectModulesByContextsQuery,
    useProjectReleaseContextsQuery,
    useProjectReleaseUnitsAllPinnedQuery,
    useProjectReleaseUnitsAllQuery,
} from "@/modules/project/queries";
import type { ContextModulePair, ListReleaseUnitsAllRequest, ProjectUnitResponse, ProjectUnitType } from "@/modules/project/types";
import { SORTED_PROJECT_UNIT_TYPES } from "@/modules/project/types";
import { projectUnitStablePath } from "@/modules/project/project-unit-stable-path";
import { UNIT_TYPE_ICONS } from "@/modules/project/unit-type-icons";
import { useAllUnitsPins } from "@/modules/project/use-all-units-pins";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Fragment, useCallback, useEffect, useMemo, type ReactNode } from "react";
import { useSearchParams } from "react-router";
import { events, listenAppEvent, triggerAppEvent } from "@/services/events";
import { groupUnitsByType, sortedProjectUnitTypes } from "@/pages/dashboard/projects/[projectId]/units-and-releases/group-units-by-type";
import {
    DEFAULT_ALL_UNITS_PAGE,
    mergeAllUnitsSearchParams,
    pairsCompatibleWithContexts,
    readReleaseUnitsSearchParams,
    isAllowedPageSize,
} from "@/pages/dashboard/projects/[projectId]/units-and-releases/release-units-search-params";
import { ReleaseUnitsContextsCombobox } from "@/pages/dashboard/projects/[projectId]/units-and-releases/release-units-contexts-combobox";
import { modulePairKey, parseModulePairKey, sortPairs } from "@/pages/dashboard/projects/[projectId]/units-and-releases/release-units-module-pair-keys";
import { ReleaseUnitsModulesCombobox } from "@/pages/dashboard/projects/[projectId]/units-and-releases/release-units-modules-combobox";
import { AllUnitsUnitRow } from "@/pages/dashboard/projects/[projectId]/units-and-releases/all-units-unit-row";

function sameSortedStrings(a: string[], b: string[]): boolean {
    if (a.length !== b.length) return false;
    const sa = [...a].sort((x, y) => x.localeCompare(y));
    const sb = [...b].sort((x, y) => x.localeCompare(y));
    return sa.every((v, i) => v === sb[i]);
}

function sameContextModulePairs(a: ContextModulePair[], b: ContextModulePair[]): boolean {
    if (a.length !== b.length) return false;
    const ka = [...a].map(modulePairKey).sort((x, y) => x.localeCompare(y));
    const kb = [...b].map(modulePairKey).sort((x, y) => x.localeCompare(y));
    return ka.every((v, i) => v === kb[i]);
}

function UnitsGroupedByType({
    units,
    renderUnit,
}: {
    units: ProjectUnitResponse[];
    renderUnit: (unit: ProjectUnitResponse) => ReactNode;
}) {
    const grouped = useMemo(() => groupUnitsByType(units), [units]);
    const sortedTypes = useMemo(() => sortedProjectUnitTypes(grouped.keys()), [grouped]);

    return (
        <div className="space-y-6">
            {sortedTypes.map((unitType) => (
                <div key={unitType}>
                    <ProjectUnitTypeSectionHeading unitType={unitType} />
                    <div className="flex flex-col gap-4">
                        {grouped.get(unitType)?.map((unit) => (
                            <Fragment key={unit.id}>{renderUnit(unit)}</Fragment>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

export type ReleaseUnitsAllPanelProps = {
    projectId: string;
    releaseId: string;
    shareSecret?: string;
    enabled?: boolean;
    showDocumentationShare?: boolean;
    showPinnedUnits?: boolean;
    showUnitTypesFilter?: boolean;
    stageRuntimeId?: string;
    releaseIsStage?: boolean;
    releaseIsLive?: boolean;
    renderUnitCard?: (unit: ProjectUnitResponse, cardPinned: boolean) => ReactNode;
};

export function ReleaseUnitsAllPanel({
    projectId,
    releaseId,
    shareSecret,
    enabled = true,
    showDocumentationShare = false,
    showPinnedUnits = false,
    showUnitTypesFilter = false,
    stageRuntimeId,
    releaseIsStage,
    releaseIsLive = true,
    renderUnitCard,
}: ReleaseUnitsAllPanelProps) {
    const isShareMode = shareSecret != null && shareSecret.trim().length > 0;
    const [searchParams, setSearchParams] = useSearchParams();
    const { allUnits } = readReleaseUnitsSearchParams(searchParams);
    const tabActive = enabled;

    const { page, pageSize, groupMode, contexts, unitTypes, contextModulePairs, unitsPaths } = allUnits;
    const pairs = useMemo(() => pairsCompatibleWithContexts(contexts, contextModulePairs), [contexts, contextModulePairs]);

    const authContextsQuery = useProjectReleaseContextsQuery(projectId, releaseId, {
        enabled: tabActive && !isShareMode,
    });
    const shareContextsQuery = useSharedReleaseContextsQuery(projectId, releaseId, shareSecret, {
        enabled: tabActive && isShareMode,
    });
    const contextsQuery = isShareMode ? shareContextsQuery : authContextsQuery;
    const contextSlugs = useMemo(() => contextsQuery.data ?? [], [contextsQuery.data]);
    const contextsLoading = contextsQuery.isLoading;

    const sortedContextOptions = useMemo(() => [...contextSlugs].sort((a, b) => a.localeCompare(b)), [contextSlugs]);

    const authModulesQuery = useProjectModulesByContextsQuery(projectId, releaseId, contexts, {
        enabled: tabActive && !isShareMode && contexts.length > 0,
    });
    const shareModulesQuery = useSharedModulesByContextsQuery(projectId, releaseId, shareSecret, contexts, {
        enabled: tabActive && isShareMode && contexts.length > 0,
    });
    const modulesQuery = isShareMode ? shareModulesQuery : authModulesQuery;

    const listBody: ListReleaseUnitsAllRequest = useMemo(
        () => ({
            page,
            page_size: pageSize,
            unit_types: showUnitTypesFilter ? unitTypes : [],
            context_slugs: contexts,
            context_module_pairs: pairs,
            ...(unitsPaths.length > 0 ? { units_paths: unitsPaths } : {}),
        }),
        [page, pageSize, showUnitTypesFilter, unitTypes, contexts, pairs, unitsPaths],
    );

    const authUnitsQuery = useProjectReleaseUnitsAllQuery(projectId, releaseId, listBody, { enabled: tabActive && !isShareMode });
    const shareUnitsQuery = useSharedReleaseUnitsAllQuery(projectId, releaseId, shareSecret, listBody, {
        enabled: tabActive && isShareMode,
    });
    const unitsQuery = isShareMode ? shareUnitsQuery : authUnitsQuery;

    const { data, isLoading, error, isFetching } = unitsQuery;

    useEffect(() => {
        if (!tabActive || !data) return;
        triggerAppEvent(events.RELEASE_UNITS_LOADED_EVENT);
        const totalPages = Math.max(1, Math.ceil(data.total / data.page_size));
        if (data.page > totalPages) {
            setSearchParams((prev) => mergeAllUnitsSearchParams(new URLSearchParams(prev), { page: totalPages }));
        }
    }, [tabActive, data, setSearchParams]);

    /** Drop context / module filters that do not exist for this release; replace URL (no extra history). */
    useEffect(() => {
        if (!tabActive) return;
        if (contextsLoading) return;

        const ctxSet = new Set(contextSlugs);
        const nextContexts = [...contexts].filter((c) => ctxSet.has(c)).sort((a, b) => a.localeCompare(b));

        let nextPairs: ContextModulePair[];
        if (nextContexts.length === 0) {
            nextPairs = [];
        } else {
            if (modulesQuery.isLoading || modulesQuery.isFetching) return;
            if (!modulesQuery.isSuccess || modulesQuery.data == null) return;

            const allowedKeys = new Set<string>();
            for (const ctx of nextContexts) {
                const row = modulesQuery.data.find((r) => r.context_slug === ctx);
                for (const m of row?.module_slugs ?? []) {
                    allowedKeys.add(modulePairKey({ context_slug: ctx, module_slug: m }));
                }
            }
            nextPairs = pairsCompatibleWithContexts(nextContexts, contextModulePairs)
                .filter((p) => allowedKeys.has(modulePairKey(p)))
                .sort(sortPairs);
        }

        const contextsMatch = sameSortedStrings(nextContexts, contexts);
        const pairsMatch = sameContextModulePairs(nextPairs, contextModulePairs);
        if (contextsMatch && pairsMatch) return;

        setSearchParams(
            (prev) =>
                mergeAllUnitsSearchParams(new URLSearchParams(prev), {
                    contexts: nextContexts,
                    contextModulePairs: nextPairs,
                }),
            { replace: true },
        );
    }, [
        tabActive,
        contextsLoading,
        contextSlugs,
        contexts,
        contextModulePairs,
        modulesQuery.isLoading,
        modulesQuery.isFetching,
        modulesQuery.isSuccess,
        modulesQuery.data,
        releaseId,
        setSearchParams,
    ]);

    const patchUrl = useCallback((patch: Parameters<typeof mergeAllUnitsSearchParams>[1]) => {
        setSearchParams((prev) => mergeAllUnitsSearchParams(new URLSearchParams(prev), patch));
    }, [setSearchParams]);

    const applyUnitsPathsFilter = useCallback(
        (next: string[]) => {
            patchUrl({ unitsPaths: next, page: DEFAULT_ALL_UNITS_PAGE });
            triggerAppEvent(events.RELEASE_UNITS_FILTER_APPLIED_EVENT, { unitsPaths: next });
        },
        [patchUrl],
    );

    useEffect(() => {
        return listenAppEvent(events.RELEASE_UNITS_FILTER_FILL_UNIT_ID_EVENT, (event) => {
            const unitId = event.detail.unitId;
            if (!unitsPaths.includes(unitId)) {
                applyUnitsPathsFilter([...unitsPaths, unitId]);
            }
        });
    }, [unitsPaths, applyUnitsPathsFilter]);

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
        contexts.length > 0 ||
        contextModulePairs.length > 0 ||
        (showUnitTypesFilter && unitTypes.length > 0) ||
        unitsPaths.length > 0;

    const modulesComboboxDisabled = contexts.length === 0;

    const clearFilters = () => {
        patchUrl({
            contexts: [],
            contextModulePairs: [],
            unitTypes: [],
            unitsPaths: [],
            page: DEFAULT_ALL_UNITS_PAGE,
        });
    };

    const total = data?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const units = useMemo(() => data?.units ?? [], [data]);

    const pinRuntimeKey = stageRuntimeId ?? "__production_runtime__";
    const { pins, pathSet, pin, unpinPath, clearAll } = useAllUnitsPins(projectId, pinRuntimeKey);
    const pinnedPathList = useMemo(() => pins.map((p) => p.path), [pins]);

    const authPinnedUnitsQuery = useProjectReleaseUnitsAllPinnedQuery(projectId, releaseId, pinnedPathList, {
        enabled: tabActive && showPinnedUnits && !isShareMode && pins.length > 0,
    });
    const sharePinnedUnitsQuery = useSharedReleaseUnitsAllPinnedQuery(projectId, releaseId, shareSecret, pinnedPathList, {
        enabled: tabActive && showPinnedUnits && isShareMode && pins.length > 0,
    });
    const pinnedUnitsQuery = isShareMode ? sharePinnedUnitsQuery : authPinnedUnitsQuery;

    const pinnedUnitsOrdered = useMemo(() => {
        const raw = pinnedUnitsQuery.data?.units ?? [];
        const rank = new Map(pins.map((p, i) => [p.path, i]));
        return [...raw].sort((a, b) => {
            const pa = projectUnitStablePath(a);
            const pb = projectUnitStablePath(b);
            return (rank.get(pa) ?? 1e9) - (rank.get(pb) ?? 1e9);
        });
    }, [pinnedUnitsQuery.data?.units, pins]);

    const defaultRenderUnitCard = useCallback(
        (unit: ProjectUnitResponse, cardPinned: boolean) => (
            <AllUnitsUnitRow
                projectId={projectId}
                unit={unit}
                cardPinned={cardPinned}
                stageRuntimeId={stageRuntimeId}
                releaseIsStage={releaseIsStage}
                releaseIsLive={releaseIsLive}
                onPin={pin}
                onUnpinPath={unpinPath}
            />
        ),
        [projectId, stageRuntimeId, releaseIsStage, releaseIsLive, pin, unpinPath],
    );

    const resolveRenderUnitCard = renderUnitCard ?? defaultRenderUnitCard;

    const renderUnit = useCallback(
        (unit: ProjectUnitResponse, cardPinned: boolean) => resolveRenderUnitCard(unit, cardPinned),
        [resolveRenderUnitCard],
    );

    return (
        <div className="space-y-4">
            {showDocumentationShare ? <DocumentationShareBlock projectId={projectId} releaseId={releaseId} /> : null}
            <div className="flex flex-col gap-2">
                <div className="flex min-h-9 min-w-0 flex-wrap items-start gap-2">
                    <div className="min-w-40 flex-1 basis-40">
                        <ReleaseUnitsContextsCombobox
                            releaseId={releaseId}
                            sortedContextOptions={sortedContextOptions}
                            contextsLoading={contextsLoading}
                            contexts={contexts}
                            onContextsChange={(nextContexts) => {
                                const nextPairs = pairsCompatibleWithContexts(nextContexts, contextModulePairs);
                                patchUrl({ contexts: nextContexts, contextModulePairs: nextPairs, page: DEFAULT_ALL_UNITS_PAGE });
                            }}
                        />
                    </div>

                    <div className="min-w-40 flex-1 basis-40">
                        <ReleaseUnitsModulesCombobox
                            releaseId={releaseId}
                            moduleItemKeys={moduleItemKeys}
                            modulesLoading={modulesQuery.isLoading}
                            modulesFetching={modulesQuery.isFetching}
                            disabled={modulesComboboxDisabled}
                            modulePairKeysValue={modulePairKeysValue}
                            onModulePairsChange={(keys) => {
                                const parsed: ContextModulePair[] = [];
                                for (const k of keys) {
                                    const p = parseModulePairKey(k);
                                    if (p != null) parsed.push(p);
                                }
                                parsed.sort(sortPairs);
                                patchUrl({ contextModulePairs: parsed, page: DEFAULT_ALL_UNITS_PAGE });
                            }}
                        />
                    </div>

                    {showUnitTypesFilter ? (
                        <div className="min-w-40 flex-1 basis-40">
                            <Combobox
                                multiple
                                autoHighlight
                                items={SORTED_PROJECT_UNIT_TYPES.slice()}
                                value={unitTypes}
                                onValueChange={(next) => {
                                    const nextTypes = [...(next ?? [])] as ProjectUnitType[];
                                    nextTypes.sort((a, b) => a.localeCompare(b));
                                    patchUrl({ unitTypes: nextTypes, page: DEFAULT_ALL_UNITS_PAGE });
                                }}
                            >
                                <ComboboxChips ref={unitTypesAnchor} className="h-auto min-h-8 w-full min-w-0 max-w-none py-1">
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
                        </div>
                    ) : null}
                </div>

                <div className="flex min-h-9 min-w-0 items-start gap-2">
                    <div className="min-w-0 flex-1">
                        <FreeformMultiCombobox
                            id={APP_RELEASE_UNITS_FILTER_INPUT_ID}
                            placeholder="Unit paths or ids"
                            value={unitsPaths}
                            onValueChange={applyUnitsPathsFilter}
                            chipsClassName="h-auto min-h-8 w-full min-w-0 py-1"
                        />
                    </div>
                    {hasActiveFilters ? <FilterClearButton onClear={clearFilters} /> : null}
                </div>
            </div>

            {showPinnedUnits && pins.length > 0 ? (
                <div
                    className={cn(
                        "border-primary/25 bg-primary/[0.06] ring-primary/15 space-y-4 rounded-lg border border-dashed p-4 shadow-sm ring-1 sm:p-5",
                        "dark:bg-primary/10 dark:ring-primary/20",
                    )}
                >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                            <SectionTitle className="mb-0">Pinned units</SectionTitle>
                        </div>
                        <ConfirmableButton
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-muted-foreground shrink-0"
                            confirmationTooltip="Re-click to confirm"
                            onClick={() => {
                                void clearAll();
                            }}
                            confirmChildren={<span>Unpin all</span>}
                        >
                            <span>Unpin all</span>
                        </ConfirmableButton>
                    </div>
                    {pinnedUnitsQuery.isError ? (
                        <ContentErrorState
                            title="Failed to load pinned units."
                            subtitle="Try refreshing the page and try again."
                        />
                    ) : pinnedUnitsQuery.isLoading ? (
                        <ContentLoadingState label="Loading pinned units…" />
                    ) : pinnedUnitsOrdered.length === 0 && pins.length > 0 ? (
                        <div className="text-muted-foreground text-center text-sm">No pinned units in this release.</div>
                    ) : groupMode === "ungrouped" ? (
                        <div className="flex flex-col gap-4">
                            {pinnedUnitsOrdered.map((unit) => (
                                <Fragment key={projectUnitStablePath(unit)}>{renderUnit(unit, true)}</Fragment>
                            ))}
                        </div>
                    ) : (
                        <UnitsGroupedByType
                            units={pinnedUnitsOrdered}
                            renderUnit={(unit) => renderUnit(unit, true)}
                        />
                    )}
                </div>
            ) : null}

            {isLoading ? (
                <ContentLoadingState label="Loading units…" />
            ) : error ? (
                <ContentErrorState
                    title="Failed to load all units."
                    subtitle="Try changing the filters and try again."
                />
            ) : units.length === 0 && (!showPinnedUnits || pins.length === 0) ? (
                <ContentEmptyState
                    title="No units found"
                    description="No units match the current filters for this page."
                />
            ) : units.length === 0 && showPinnedUnits && pins.length > 0 ? (
                <ContentEmptyState
                    title="No additional units"
                    description="No units match your current filters on this page. Try adjusting or clearing filters to see more."
                />
            ) : groupMode === "ungrouped" ? (
                <div className={cn("flex flex-col gap-4", isFetching && "opacity-70")}>
                    {units.map((unit) => (
                        <Fragment key={unit.id}>
                            {renderUnit(unit, showPinnedUnits ? pathSet.has(projectUnitStablePath(unit)) : false)}
                        </Fragment>
                    ))}
                </div>
            ) : (
                <div className={cn(isFetching && "opacity-70")}>
                    <UnitsGroupedByType
                        units={units}
                        renderUnit={(unit) =>
                            renderUnit(unit, showPinnedUnits ? pathSet.has(projectUnitStablePath(unit)) : false)
                        }
                    />
                </div>
            )}

            {totalPages > 1 || total > 0 ? (
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

import { SectionTitle } from "@/components/section-title";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, LayersIcon, Loader2Icon, TextAlignJustifyIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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

function FilterPopoverButton({
    label,
    count,
    disabled,
    loading,
    children,
    className,
}: {
    label: string;
    count: number;
    disabled?: boolean;
    loading?: boolean;
    children: React.ReactNode;
    className?: string;
}) {
    const [open, setOpen] = useState(false);
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={disabled}
                    className={cn("min-w-[9rem] justify-between gap-2 font-normal", className)}
                >
                    <span className="truncate">
                        {label}
                        {count > 0 ? ` (${count})` : ""}
                    </span>
                    {loading ? <Loader2Icon className="size-4 shrink-0 animate-spin" /> : <ChevronDownIcon className="size-4 shrink-0 opacity-60" />}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[min(100vw-2rem,22rem)] p-0">
                {children}
            </PopoverContent>
        </Popover>
    );
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
                            <UnitCardCompact key={unit.id} projectId={projectId} unit={unit} />
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
        setSearchParams((prev) => mergeAllUnitsSearchParams(new URLSearchParams(prev), patch));
    };

    const toggleContext = (slug: string, checked: boolean) => {
        const nextContexts = checked
            ? [...contexts, slug].sort((a, b) => a.localeCompare(b))
            : contexts.filter((c) => c !== slug);
        const nextPairs = pairsCompatibleWithContexts(nextContexts, contextModulePairs);
        patchUrl({ contexts: nextContexts, contextModulePairs: nextPairs, page: DEFAULT_ALL_UNITS_PAGE });
    };

    const togglePair = (context_slug: string, module_slug: string, checked: boolean) => {
        let next: ContextModulePair[] = [...pairs];
        if (checked) {
            if (!next.some((p) => p.context_slug === context_slug && p.module_slug === module_slug)) {
                next.push({ context_slug, module_slug });
            }
        } else {
            next = next.filter((p) => !(p.context_slug === context_slug && p.module_slug === module_slug));
        }
        patchUrl({ contextModulePairs: next, page: DEFAULT_ALL_UNITS_PAGE });
    };

    const toggleUnitType = (t: ProjectUnitType, checked: boolean) => {
        const next = checked ? [...unitTypes, t].sort((a, b) => a.localeCompare(b)) : unitTypes.filter((x) => x !== t);
        patchUrl({ unitTypes: next, page: DEFAULT_ALL_UNITS_PAGE });
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
                    <FilterPopoverButton label="Contexts" count={contexts.length} loading={contextsLoading}>
                        <div className="border-b px-3 py-2 text-xs font-medium text-muted-foreground">Filter by context</div>
                        <ScrollArea className="h-[min(18rem,50vh)]">
                            <div className="space-y-2 p-3">
                                {contextsLoading && sortedContextOptions.length === 0 ? (
                                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                                        <Loader2Icon className="size-4 animate-spin" />
                                        Loading contexts…
                                    </div>
                                ) : sortedContextOptions.length === 0 ? (
                                    <div className="text-muted-foreground text-sm">No contexts for this release.</div>
                                ) : (
                                    sortedContextOptions.map((slug) => (
                                        <div key={slug} className="flex items-center gap-2">
                                            <Checkbox
                                                id={`ctx-${slug}`}
                                                checked={contexts.includes(slug)}
                                                onCheckedChange={(v) => toggleContext(slug, v === true)}
                                            />
                                            <Label htmlFor={`ctx-${slug}`} className="cursor-pointer font-normal">
                                                {slug}
                                            </Label>
                                        </div>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </FilterPopoverButton>

                    <FilterPopoverButton
                        label="Modules"
                        count={pairs.length}
                        disabled={contexts.length === 0}
                        loading={modulesQuery.isLoading || modulesQuery.isFetching}
                    >
                        <div className="border-b px-3 py-2 text-xs font-medium text-muted-foreground">Filter by module (scoped to selected contexts)</div>
                        <ScrollArea className="h-[min(18rem,50vh)]">
                            <div className="space-y-4 p-3">
                                {contexts.length === 0 ? (
                                    <p className="text-muted-foreground text-sm">Select one or more contexts to choose modules.</p>
                                ) : modulesQuery.isLoading || modulesQuery.isFetching ? (
                                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                                        <Loader2Icon className="size-4 animate-spin" />
                                        Loading modules…
                                    </div>
                                ) : (
                                    contexts.map((ctxSlug) => {
                                        const row = modulesQuery.data?.find((r) => r.context_slug === ctxSlug);
                                        const mods = row?.module_slugs ?? [];
                                        const sortedMods = [...mods].sort((a, b) => a.localeCompare(b));
                                        return (
                                            <div key={ctxSlug} className="space-y-2">
                                                <div className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">{ctxSlug}</div>
                                                {sortedMods.length === 0 ? (
                                                    <p className="text-muted-foreground pl-1 text-xs">No modules listed for this context.</p>
                                                ) : (
                                                    sortedMods.map((mod) => {
                                                        const id = `mod-${ctxSlug}:${mod}`;
                                                        const checked = pairs.some((p) => p.context_slug === ctxSlug && p.module_slug === mod);
                                                        return (
                                                            <div key={id} className="flex items-center gap-2 pl-1">
                                                                <Checkbox
                                                                    id={id}
                                                                    checked={checked}
                                                                    onCheckedChange={(v) => togglePair(ctxSlug, mod, v === true)}
                                                                />
                                                                <Label htmlFor={id} className="cursor-pointer font-normal">
                                                                    {mod}
                                                                </Label>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </ScrollArea>
                    </FilterPopoverButton>

                    <FilterPopoverButton label="Unit types" count={unitTypes.length}>
                        <div className="border-b px-3 py-2 text-xs font-medium text-muted-foreground">Filter by unit type</div>
                        <ScrollArea className="h-[min(18rem,50vh)]">
                            <div className="space-y-2 p-3">
                                {STATIC_PROJECT_UNIT_TYPES.map((t) => {
                                    const Icon = UNIT_TYPE_ICONS[t];
                                    const id = `ut-${t}`;
                                    const checked = unitTypes.includes(t);
                                    return (
                                        <div key={t} className="flex items-center gap-2">
                                            <Checkbox id={id} checked={checked} onCheckedChange={(v) => toggleUnitType(t, v === true)} />
                                            <Label htmlFor={id} className="flex cursor-pointer items-center gap-2 font-normal">
                                                <Icon className="text-muted-foreground size-3.5 shrink-0" aria-hidden />
                                                {capitalizeFirstLetter(t)}
                                            </Label>
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    </FilterPopoverButton>
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
                            <TooltipContent side="bottom">Ungrouped view (this page)</TooltipContent>
                        </Tooltip>
                    </ToggleGroupItem>
                    <ToggleGroupItem value="grouped">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span>
                                    <LayersIcon />
                                </span>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">Group by type (this page)</TooltipContent>
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
                        <UnitCardCompact key={unit.id} projectId={projectId} unit={unit} />
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

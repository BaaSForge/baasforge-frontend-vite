export interface ProjectResponse {
    id: string;
    name: string;
    slug: string;
}

export interface ProjectRuntimesBaseUrls {
    api: string;
    workflow: string;
    actor: string;
    queue_worker: string;
}

export type ProjectDetailResponse = ProjectResponse & {
    runtimes: ProjectRuntimesBaseUrls;
};

export interface ProjectRequest {
    name: string;
    slug: string;
}

export interface ProjectPatchRequest {
    name: string;
}

export type ProjectUnitType = "api" | "actor" | "workflow" | "queue_worker" | "common";

export type ProjectUnitTypeWithRuntime = Exclude<ProjectUnitType, "common">;

/** Static ordering for filters and labels (matches backend `ProjectUnitType`). */
export const STATIC_PROJECT_UNIT_TYPES: readonly ProjectUnitType[] = [
    "api",
    "actor",
    "workflow",
    "queue_worker",
    "common",
] as const;

export function projectUnitTypeHasLiveInteraction(
    unitType: ProjectUnitType,
): unitType is ProjectUnitTypeWithRuntime {
    return unitType !== "common";
}

export function runtimeBaseUrlForUnitType(
    runtimes: ProjectRuntimesBaseUrls,
    unitType: ProjectUnitType,
): string | undefined {
    if (!projectUnitTypeHasLiveInteraction(unitType)) return undefined;
    const raw = runtimes[unitType]?.trim() ?? "";
    if (raw.length === 0) return undefined;
    return raw.replace(/\/$/, "");
}

export interface ContextModulePair {
    context_slug: string;
    module_slug: string;
}

export interface ListReleaseUnitsAllRequest {
    page?: number;
    page_size?: number;
    unit_types?: ProjectUnitType[];
    context_slugs?: string[];
    context_module_pairs?: ContextModulePair[];
    /** When set, returns units for these paths (no pagination). Omit other filter fields so none apply. */
    units_paths?: string[];
    exclude_deleted?: boolean;
}

export interface ListReleaseUnitsAllResponse {
    units: ProjectUnitResponse[];
    total: number;
    page: number;
    page_size: number;
}

export interface ContextModulesByContextRow {
    context_slug: string;
    module_slugs: string[];
}

export interface UnitJsonSchemaPart {
    jsonSchema?: string | null;
}

export interface ApiUnitMetadata {
    method?: string | null;
    requestBody?: UnitJsonSchemaPart;
    requestParams?: UnitJsonSchemaPart;
    responseBody?: UnitJsonSchemaPart;
}

export interface ActorUnitMetadata {
    state?: UnitJsonSchemaPart | null;
    handlerInputs?: Record<string, UnitJsonSchemaPart> | null;
    handlerOutputs?: Record<string, UnitJsonSchemaPart> | null;
}

export interface WorkflowUnitMetadata {
    input?: UnitJsonSchemaPart | null;
    output?: UnitJsonSchemaPart | null;
    handlerInputs?: Record<string, UnitJsonSchemaPart> | null;
    handlerOutputs?: Record<string, UnitJsonSchemaPart> | null;
}

export interface QueueWorkerUnitMetadata {
    input?: UnitJsonSchemaPart | null;
    output?: UnitJsonSchemaPart | null;
    batchOutput?: UnitJsonSchemaPart | null;
}

export interface ProjectUnitResponse {
    id: string;
    project_id: string;
    code: string | null;
    explanation: string | null;
    revision: number;
    latest_revision?: number;
    context_slug: string;
    module_slug: string;
    unit_name_slug: string;
    unit_type: ProjectUnitType;
    is_draft: boolean;
    is_deleted?: boolean;
    is_rejected?: boolean;
    chat_session_id: string | null;
    /** Comma-separated dependency unit paths (no revision). */
    depends_on?: string | null;
    metadata?: unknown;
}

/** Shown when `brief_note` or `notes` are null or blank. */
export const EMPTY_RELEASE_NOTE_DISPLAY = "- No release note";

export interface ReleaseResponse {
    id: string;
    project_id: string;
    chat_session_id?: string | null;
    /** Short summary for lists and cards; full text is `notes`. */
    brief_note: string | null;
    notes: string | null;
    /** Release row revision (major.minor string, e.g. `1`, `1.12`, `10.2`). */
    revision: string;
    is_stage: boolean;
    created_at: string;
    base_production_release_id: string | null;
    base_production_release: ReleaseResponse | null;
}

export enum PlatformEnvironmentType {
    stage = "stage",
    prod = "prod",
}

export interface ProjectRuntimeResponse {
    id: string;
    project_id: string;
    name: string;
    slug: string;
    environment: PlatformEnvironmentType;
    /** Embedded release row when this runtime has a live release; omitted or null when idle. */
    live_release?: ReleaseResponse | null;
    live_release_id?: string | null;
}

export interface StageReleaseRequest {
    stage_project_runtime_id: string;
}

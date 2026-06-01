import { SORTED_PROJECT_UNIT_TYPES, type ProjectUnitResponse, type ProjectUnitType } from "@/modules/project/types";

const UNIT_TYPE_SORT_INDEX = new Map(SORTED_PROJECT_UNIT_TYPES.map((type, index) => [type, index]));

export function sortedProjectUnitTypes(types: Iterable<ProjectUnitType>): ProjectUnitType[] {
    return [...types].sort(
        (a, b) => (UNIT_TYPE_SORT_INDEX.get(a) ?? 0) - (UNIT_TYPE_SORT_INDEX.get(b) ?? 0),
    );
}

export function groupUnitsByType(units: ProjectUnitResponse[]): Map<ProjectUnitType, ProjectUnitResponse[]> {
    const map = new Map<ProjectUnitType, ProjectUnitResponse[]>();
    for (const unit of units) {
        const existing = map.get(unit.unit_type) ?? [];
        existing.push(unit);
        map.set(unit.unit_type, existing);
    }
    return map;
}

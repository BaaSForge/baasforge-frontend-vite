import type { ProjectUnitResponse, ProjectUnitType } from "@/modules/project/types";

export function groupUnitsByType(units: ProjectUnitResponse[]): Map<ProjectUnitType, ProjectUnitResponse[]> {
    const map = new Map<ProjectUnitType, ProjectUnitResponse[]>();
    for (const unit of units) {
        const existing = map.get(unit.unit_type) ?? [];
        existing.push(unit);
        map.set(unit.unit_type, existing);
    }
    return map;
}

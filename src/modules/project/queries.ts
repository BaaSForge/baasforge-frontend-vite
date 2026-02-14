import { useQuery } from "@tanstack/react-query";
import { QueryKeys } from "@/constants/query-keys";
import { getProject, getProjects, getProjectUnits, getDraftUnits, getReleases } from "./api";

export function useProjectsQuery() {
  return useQuery({
    queryKey: QueryKeys.PROJECTS_LIST,
    queryFn: getProjects,
  });
}

export function useProjectQuery(projectId: number | undefined) {
  return useQuery({
    queryKey: QueryKeys.projectDetail(projectId ?? 0),
    queryFn: () => getProject(projectId!),
    enabled: projectId != null && projectId > 0,
  });
}

export function useProjectUnitsQuery(projectId: number | undefined) {
  return useQuery({
    queryKey: QueryKeys.projectUnits(projectId ?? 0),
    queryFn: () => getProjectUnits(projectId!),
    enabled: projectId != null && projectId > 0,
  });
}

export function useProjectDraftUnitsQuery(
  projectId: number | undefined,
  chatSessionId: number | undefined
) {
  return useQuery({
    queryKey: QueryKeys.projectDraftUnits(projectId ?? 0, chatSessionId ?? 0),
    queryFn: () => getDraftUnits(projectId!, chatSessionId!),
    enabled:
      projectId != null &&
      projectId > 0 &&
      chatSessionId != null &&
      chatSessionId > 0,
  });
}

export function useProjectReleasesQuery(projectId: number | undefined) {
  return useQuery({
    queryKey: QueryKeys.projectReleases(projectId ?? 0),
    queryFn: () => getReleases(projectId!),
    enabled: projectId != null && projectId > 0,
  });
}
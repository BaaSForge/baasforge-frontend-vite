import { useQuery } from "@tanstack/react-query";
import { QueryKeys } from "@/constants/query-keys";
import { getProject, getProjects } from "./api";

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

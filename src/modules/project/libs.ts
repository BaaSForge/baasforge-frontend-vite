import type { Location, Params } from "react-router";

export function getSwitchProjectLink(
  location: Location,
  params: Params,
  newProjectId: string
) {
  if (!params.projectId) {
    return {
      pathname: `/dashboard/projects/${newProjectId}`,
      search: "",
    };
  }

  const currentProjectId = params.projectId;
  const hasExtraParams = Object.keys(params).length > 1;

  const basePath = location.pathname.replace(
    `/projects/${currentProjectId}`,
    `/projects/${newProjectId}`
  );

  const pathname = hasExtraParams
    ? `/dashboard/projects/${newProjectId}/conversations`
    : basePath;

  return {
    pathname,
    search: "",
  };
}

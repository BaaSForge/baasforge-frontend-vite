import type { Location, Params } from "react-router";

export function getSwitchProjectLink(location: Location, params: Params, newProjectId: number | string) {
  const paramProjectId = params?.projectId;
  if (paramProjectId) {
    const replaced = location.pathname.replace(
      new RegExp(`(/projects/)${paramProjectId}\\b`),
      `$1${newProjectId}`
    );
    return {
      pathname: replaced,
      search: location.search,
    };
  }
  return {
    pathname: `/dashboard/projects/${newProjectId}`,
    search: "",
  };
}
import { getCalendarConfig } from "@calendar/core/config";

function stripTrailingSlash(path: string) {
  return path.endsWith("/") ? path.slice(0, -1) : path;
}

function joinRoute(base: string, path: string) {
  const normalizedBase = stripTrailingSlash(base);
  if (!path || path === "/") return `${normalizedBase}/`;
  return `${normalizedBase}/${path.replace(/^\/+/, "")}`;
}

export function getCalendarUiConfig() {
  const config = getCalendarConfig();
  return {
    ...config,
    routes: {
      ...config.routes,
      calendarBase: stripTrailingSlash(config.routes.calendarBase),
      adminBase: stripTrailingSlash(config.routes.adminBase),
      authBase: stripTrailingSlash(config.routes.authBase),
      apiCalendarBase: stripTrailingSlash(config.routes.apiCalendarBase),
      apiAdminBase: stripTrailingSlash(config.routes.apiAdminBase),
      apiCalendarAdminBase: stripTrailingSlash(
        config.routes.apiCalendarAdminBase,
      ),
      calendarLoginPath: stripTrailingSlash(config.routes.calendarLoginPath),
      calendarLoginRedirectPath: stripTrailingSlash(
        config.routes.calendarLoginRedirectPath,
      ),
    },
  };
}

export function withCalendarRoute(path = "") {
  return joinRoute(getCalendarUiConfig().routes.calendarBase, path);
}

export function withAdminRoute(path = "") {
  return joinRoute(getCalendarUiConfig().routes.adminBase, path);
}

export function withCalendarApi(path: string) {
  return `${getCalendarUiConfig().routes.apiCalendarBase}${path}`;
}

export function withAdminApi(path: string) {
  return `${getCalendarUiConfig().routes.apiAdminBase}${path}`;
}

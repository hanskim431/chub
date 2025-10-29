import type { Route, routeList } from "@/app/routes/routeList";

const protectedRoutes: readonly Route[] = [];

export const protectedRouteList: routeList = Object.freeze({
  protected: protectedRoutes,
});

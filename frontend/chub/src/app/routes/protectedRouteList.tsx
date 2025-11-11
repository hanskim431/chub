import type { Route, routeList } from "@/app/routes/routeList";
import MyPage from "@pages/myPage/page";

const protectedRoutes: readonly Route[] = [
  { path: "/my", element: <MyPage />, label: "my-page" },
];

export const protectedRouteList: routeList = Object.freeze({
  protected: protectedRoutes,
});

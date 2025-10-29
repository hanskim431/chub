import HomePage from "@/pages/homePage/page";
import LoginPage from "@/pages/loginPage/page";
export interface Route {
  path: string;
  element: React.ReactNode;
  label: string;
}

export interface routeList {
  [layoutName: string]: readonly Route[];
}

const mainLayoutRoutes: readonly Route[] = [
  { path: "/", element: <HomePage />, label: "Home" },
  { path: "/login", element: <LoginPage />, label: "Login" },
];

const routeList: routeList = Object.freeze({ mainLayout: mainLayoutRoutes });

export { routeList, mainLayoutRoutes };

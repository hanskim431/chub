import HomePage from "@/pages/homePage/page";
import LoginPage from "@/pages/loginPage/page";
//import RecruiterListPage from "@/pages/recruiterListPage/page";
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
  // {
  //   path: "/interviewers",
  //   element: <RecruiterListPage />,
  //   label: "Interviewers",
  // },
];

const routeList: routeList = Object.freeze({ mainLayout: mainLayoutRoutes });

export { routeList, mainLayoutRoutes };

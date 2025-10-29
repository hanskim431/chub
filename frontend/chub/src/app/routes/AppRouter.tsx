import { routeList } from "@/app/routes/routeList";
import { Route, Routes } from "react-router-dom";
import MainLayout from "@/app/layouts/MainLayout";
import ProtectedLayout from "@/app/layouts/ProtectedLayout";
import { protectedRouteList } from "@/app/routes/protectedRouteList";

function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {routeList.mainLayout.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Route>
      <Route element={<ProtectedLayout />}>
        {protectedRouteList.protected.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Route>
    </Routes>
  );
}

export default AppRouter;

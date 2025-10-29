import { MemoryRouter, Route, Routes } from "react-router-dom";
import { mainLayoutRoutes } from "@/app/routes/routeList";
import { QueryProvider } from "@/app/queryProvider/QueryProvider";

interface MemoryRouterWrappedProps {
  component: React.ReactNode;
  initialEntries?: string[];
  path?: string;
}

function MemoryRouterWrapped({
  component,
  initialEntries = ["/test"],
  path = "/test",
}: MemoryRouterWrappedProps) {
  const routes = mainLayoutRoutes;
  return (
    <QueryProvider>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path={path} element={component} />
          {routes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Routes>
      </MemoryRouter>
    </QueryProvider>
  );
}

export default MemoryRouterWrapped;

import { Outlet } from "react-router-dom";
import Header from "@/widgets/header";

function MainLayout() {
  return (
    <div className="flex h-full flex-col">
      <Header />
      <Outlet />
    </div>
  );
}

export default MainLayout;

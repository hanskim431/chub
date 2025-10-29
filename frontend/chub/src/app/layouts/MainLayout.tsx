import { Outlet } from "react-router-dom";
import Header from "@/widgets/header";

function MainLayout() {
  return (
    <div className="bg-background relative h-full min-h-screen w-full">
      <div className={`flex h-full flex-col transition-all duration-300`}>
        <Header />
        <Outlet />
      </div>
    </div>
  );
}

export default MainLayout;

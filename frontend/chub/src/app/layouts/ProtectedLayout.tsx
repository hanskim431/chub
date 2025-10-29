import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/widgets/header";

function ProtectedLayout() {
  const navigate = useNavigate();
  const isAuthenticated = true;
  //todo: useme 구현해야 함
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [navigate, isAuthenticated]);
  return (
    <div className="flex h-full flex-col">
      <Header />
      <Outlet />
    </div>
  );
}

export default ProtectedLayout;

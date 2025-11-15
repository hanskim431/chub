import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/widgets/header";
import { useMe } from "@/features/auth/api/me";

function ProtectedLayout() {
    const navigate = useNavigate();
    const { data, isLoading, error } = useMe();
    const isAuthenticated = !isLoading && data?.data && !error;

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate("/login");
        }
    }, [navigate, isAuthenticated, isLoading]);

    if (isLoading) {
        return (
            <div className="flex h-full flex-col">
                <Header />
                <div className="flex items-center justify-center h-full">
                    <div className="text-gray-500">로딩 중...</div>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="flex h-full flex-col">
            <Header />
            <Outlet />
        </div>
    );
}

export default ProtectedLayout;

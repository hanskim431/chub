import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Card from "@/shared/ui/Card";
import Logo from "@/shared/ui/Logo";
import { useMe } from "@/features/auth/api/me";

function HomePage() {
    const navigate = useNavigate();
    const { data, isLoading, error } = useMe();
    const isAuthenticated = !isLoading && !error && data?.success && data?.data;

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/dashboard");
        }
    }, [isAuthenticated, navigate]);

    if (isLoading) {
        return (
            <main
                aria-label="home-page"
                className="bg-background relative flex w-full flex-col items-center justify-start min-h-[calc(100vh-4rem)] overflow-y-auto"
            >
                <div className="flex items-center justify-center h-full">
                    <div className="text-gray-500">로딩 중...</div>
                </div>
            </main>
        );
    }

    if (isAuthenticated) {
        return null;
    }

    return (
        <main
            aria-label="home-page"
            className="bg-background relative flex w-full flex-col items-center justify-start min-h-[calc(100vh-4rem)] overflow-y-auto"
        >
            {/* Hero Section */}
            <section className="flex flex-col items-center justify-center gap-8 w-full max-w-7xl px-8 py-20">
                <div className="flex flex-col items-center gap-6 text-center">
                    <Logo className="w-32 h-32" />
                    <h1 className="text-5xl font-bold text-text-black">
                        실전 면접 준비를 한 번에
                    </h1>
                    <p className="text-xl text-text-gray max-w-2xl">
                        나에게 맞는 면접관을 선택하고 실전처럼 피드백을
                        받아보세요.
                        <br />
                        면접 준비의 모든 것을 한 곳에서 관리하세요.
                    </p>
                    <div className="flex gap-4 mt-4">
                        <Link
                            to="/interviewers"
                            className="px-8 py-3 bg-point text-white rounded-lg font-semibold hover:bg-point-500 transition-colors"
                        >
                            면접관 찾기
                        </Link>
                        <Link
                            to="/login"
                            className="px-8 py-3 border-2 border-point text-point rounded-lg font-semibold hover:bg-point-100 transition-colors"
                        >
                            로그인하기
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="flex flex-col items-center gap-8 w-full max-w-7xl px-8 py-12">
                <div className="flex flex-col items-center gap-2">
                    <h2 className="text-3xl font-bold text-text-black">
                        주요 기능
                    </h2>
                    <p className="text-lg text-text-gray">
                        면접 준비를 위한 다양한 기능을 제공합니다
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                    <Card className="p-6 flex flex-col gap-4">
                        <div className="text-4xl mb-2">🎯</div>
                        <h3 className="text-xl font-bold text-text-black">
                            맞춤 면접관 찾기
                        </h3>
                        <p className="text-text-gray">
                            다양한 분야의 면접관 중에서 나에게 맞는 면접관을
                            선택하고 실전 면접 경험을 쌓을 수 있습니다.
                        </p>
                    </Card>
                    <Card className="p-6 flex flex-col gap-4">
                        <div className="text-4xl mb-2">📝</div>
                        <h3 className="text-xl font-bold text-text-black">
                            이력서 관리
                        </h3>
                        <p className="text-text-gray">
                            이력서를 업로드하고 관리하여 면접 준비에 필요한 모든
                            문서를 한 곳에서 관리할 수 있습니다.
                        </p>
                    </Card>
                    <Card className="p-6 flex flex-col gap-4">
                        <div className="text-4xl mb-2">💬</div>
                        <h3 className="text-xl font-bold text-text-black">
                            실시간 피드백
                        </h3>
                        <p className="text-text-gray">
                            면접 후 전문 면접관으로부터 상세한 피드백을 받아
                            성장할 수 있습니다.
                        </p>
                    </Card>
                </div>
            </section>

            {/* CTA Section */}
            <section className="flex flex-col items-center gap-6 w-full max-w-7xl px-8 py-16">
                <Card
                    width="full"
                    className="p-12 flex flex-col items-center gap-6 bg-point-100 border-point-300"
                >
                    <h2 className="text-3xl font-bold text-text-black text-center">
                        지금 바로 시작해보세요
                    </h2>
                    <p className="text-lg text-text-gray text-center max-w-xl">
                        면접 준비의 모든 것을 한 곳에서 관리하고 실전 경험을
                        쌓아보세요.
                    </p>
                    <Link
                        to="/interviewers"
                        className="px-8 py-3 bg-point text-white rounded-lg font-semibold hover:bg-point-500 transition-colors"
                    >
                        면접관 찾기 시작하기
                    </Link>
                </Card>
            </section>
        </main>
    );
}

export default HomePage;

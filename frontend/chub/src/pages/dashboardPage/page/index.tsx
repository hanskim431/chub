import { useDashboardStats } from "../api/query";
import Card from "@/shared/ui/Card";
import { InterviewRequestList } from "../ui/InterviewRequestList";

export default function DashboardPage() {
    const { data, isLoading } = useDashboardStats();

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="flex items-center justify-center h-64">
                    <div className="text-gray-500">로딩 중...</div>
                </div>
            </div>
        );
    }

    const stats = data?.data;

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <h1 className="text-3xl font-bold mb-8">대시보드</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="p-6">
                    <div className="flex flex-col gap-2">
                        <h3 className="text-sm font-medium text-gray-600">
                            받은 요청
                        </h3>
                        <p className="text-3xl font-bold text-text-black">
                            {stats?.receivedRequests ?? 0}
                        </p>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex flex-col gap-2">
                        <h3 className="text-sm font-medium text-gray-600">
                            보낸 요청
                        </h3>
                        <p className="text-3xl font-bold text-text-black">
                            {stats?.sentRequests ?? 0}
                        </p>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex flex-col gap-2">
                        <h3 className="text-sm font-medium text-gray-600">
                            예정된 면접
                        </h3>
                        <p className="text-3xl font-bold text-text-black">
                            {stats?.scheduledInterviews ?? 0}
                        </p>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex flex-col gap-2">
                        <h3 className="text-sm font-medium text-gray-600">
                            완료된 면접
                        </h3>
                        <p className="text-3xl font-bold text-text-black">
                            {stats?.completedInterviews ?? 0}
                        </p>
                    </div>
                </Card>
            </div>

            <InterviewRequestList />
        </div>
    );
}

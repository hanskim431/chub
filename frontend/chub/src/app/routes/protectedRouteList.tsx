import type { Route, routeList } from "@/app/routes/routeList";
import MyPage from "@pages/myPage/page";
import DashboardPage from "@pages/dashboardPage/page";
import InterviewRecordPage from "@pages/interviewRecordPage/page";
import InterviewerDetailPage from "@pages/interviewerDetailPage/page";

const protectedRoutes: readonly Route[] = [
    { path: "/dashboard", element: <DashboardPage />, label: "dashboard-page" },
    { path: "/my", element: <MyPage />, label: "my-page" },
    {
        path: "/interviews/records/:id",
        element: <InterviewRecordPage />,
        label: "interview-record-page",
    },
    {
        path: "/interviewers/:id",
        element: <InterviewerDetailPage />,
        label: "interviewer-detail-page",
    },
];

export const protectedRouteList: routeList = Object.freeze({
    protected: protectedRoutes,
});

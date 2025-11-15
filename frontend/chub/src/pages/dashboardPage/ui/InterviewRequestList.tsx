import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Card from "@/shared/ui/Card";
import { useMyInterviewerProfile } from "@/entities/interviewer/api/query";
import type { InterviewRequestStatus } from "@/pages/dashboardPage/api/interviewRequests";
import { RoleSwitcher } from "@/pages/dashboardPage/ui/components/RoleSwitcher";
import { TabNavigation } from "@/pages/dashboardPage/ui/components/TabNavigation";
import { StatusFilter } from "@/pages/dashboardPage/ui/components/StatusFilter";
import { SentInterviewRequests } from "@/pages/dashboardPage/ui/lists/SentInterviewRequests";
import { ReceivedInterviewRequests } from "@/pages/dashboardPage/ui/lists/ReceivedInterviewRequests";
import { ScheduledInterviews } from "@/pages/dashboardPage/ui/lists/ScheduledInterviews";
import { CancelledInterviewRequests } from "@/pages/dashboardPage/ui/lists/CancelledInterviewRequests";
import { CompletedInterviews } from "@/pages/dashboardPage/ui/lists/CompletedInterviews";
import type { Role, TabId, Tab } from "@/pages/dashboardPage/ui/types";

const INTERVIEWEE_TABS: Tab[] = [
    { id: "sent", label: "보낸 요청" },
    { id: "cancelled", label: "취소된 요청" },
    { id: "scheduled", label: "예정된 면접" },
    { id: "completed", label: "완료된 면접" },
];

const INTERVIEWER_TABS: Tab[] = [
    { id: "received", label: "받은 요청" },
    { id: "cancelled", label: "취소된 요청" },
    { id: "scheduled", label: "예정된 면접" },
    { id: "completed", label: "완료된 면접" },
];

const STATUS_FILTERS: {
    value: InterviewRequestStatus | undefined;
    label: string;
}[] = [
    { value: undefined, label: "전체" },
    { value: "PENDING", label: "대기 중" },
    { value: "ACCEPTED", label: "수락됨" },
    { value: "REJECTED", label: "거절됨" },
    { value: "COMPLETED", label: "완료됨" },
];

const getDefaultTab = (role: Role): TabId => {
    return role === "interviewee" ? "sent" : "received";
};

export function InterviewRequestList() {
    const location = useLocation();
    const { data: interviewerProfile } = useMyInterviewerProfile();
    const isInterviewer =
        interviewerProfile?.success && interviewerProfile?.data !== null;

    const state = location.state as
        | { role?: Role; activeTab?: string }
        | null
        | undefined;

    const [role, setRole] = useState<Role>(
        state?.role ?? (isInterviewer ? "interviewer" : "interviewee")
    );
    const tabs = role === "interviewee" ? INTERVIEWEE_TABS : INTERVIEWER_TABS;

    const [activeTab, setActiveTab] = useState<TabId>(
        (state?.activeTab as TabId) ?? getDefaultTab(role)
    );
    const [sentStatusFilter, setSentStatusFilter] = useState<
        InterviewRequestStatus | undefined
    >(undefined);

    // 역할이 변경되면 해당 역할의 첫 번째 탭으로 변경
    useEffect(() => {
        const defaultTab = getDefaultTab(role);
        const currentTabs =
            role === "interviewee" ? INTERVIEWEE_TABS : INTERVIEWER_TABS;
        const isValidTab = currentTabs.some((tab) => tab.id === activeTab);

        if (!isValidTab) {
            setActiveTab(defaultTab);
            setSentStatusFilter(undefined);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [role, activeTab]);

    const handleRoleChange = (newRole: Role) => {
        setRole(newRole);
        setActiveTab(getDefaultTab(newRole));
        setSentStatusFilter(undefined);
    };

    const handleTabChange = (tab: TabId) => {
        setActiveTab(tab);
        if (tab !== "sent" && tab !== "cancelled") {
            setSentStatusFilter(undefined);
        }
    };

    return (
        <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">면접 목록</h2>

            <RoleSwitcher role={role} onRoleChange={handleRoleChange} />

            <TabNavigation
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={handleTabChange}
            />

            {/* 상태 필터 (면접관의 보낸 요청일 때만 표시) */}
            {activeTab === "sent" && role === "interviewer" && (
                <StatusFilter
                    filters={STATUS_FILTERS}
                    selectedFilter={sentStatusFilter}
                    onFilterChange={setSentStatusFilter}
                />
            )}

            {/* 콘텐츠 */}
            <div className="mt-4">
                {activeTab === "sent" && (
                    <SentInterviewRequests
                        status={sentStatusFilter}
                        role={role}
                    />
                )}
                {activeTab === "received" && (
                    <ReceivedInterviewRequests role={role} />
                )}
                {activeTab === "cancelled" && (
                    <CancelledInterviewRequests role={role} />
                )}
                {activeTab === "scheduled" && (
                    <ScheduledInterviews role={role} />
                )}
                {activeTab === "completed" && (
                    <CompletedInterviews role={role} activeTab={activeTab} />
                )}
            </div>
        </Card>
    );
}

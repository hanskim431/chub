import { useState } from "react";
import { useUserResume } from "@/entities/resume/api/query";
import { ResumePreviewModal } from "@/pages/myPage/ui/ResumePreviewModal";

interface ResumeButtonProps {
    userId: number | undefined;
    userName: string;
    role: "interviewee" | "interviewer";
}

export function ResumeButton({ userId, userName, role }: ResumeButtonProps) {
    const [showResumeModal, setShowResumeModal] = useState(false);
    const { data: resumeData, isLoading } = useUserResume(userId);

    if (role !== "interviewer" || !userId) {
        return null;
    }

    if (isLoading) {
        return (
            <div className="px-4 py-2 text-gray-400 text-sm">로딩 중...</div>
        );
    }

    if (!resumeData?.data?.pdfUrl) {
        return (
            <div className="px-4 py-2 text-gray-400 text-sm">이력서 없음</div>
        );
    }

    return (
        <>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setShowResumeModal(true);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center gap-2"
                title="이력서 보기"
            >
                <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                </svg>
                이력서
            </button>

            {showResumeModal && resumeData.data.pdfUrl && (
                <ResumePreviewModal
                    pdfUrl={resumeData.data.pdfUrl}
                    resumeName={`${userName}님의 이력서`}
                    onClose={() => setShowResumeModal(false)}
                />
            )}
        </>
    );
}

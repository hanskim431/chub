import { useState } from "react";
import { useUserResume } from "@/entities/resume/api/query";
import { ResumePreviewModal } from "@/pages/myPage/ui/ResumePreviewModal";

interface ResumeButtonProps {
    userId: number | undefined;
    userName: string;
    role: "interviewee" | "interviewer";
    pdfUrl?: string | null; // API 응답에서 받은 pdfUrl (선택적)
}

export function ResumeButton({ userId, userName, role, pdfUrl }: ResumeButtonProps) {
    const [showResumeModal, setShowResumeModal] = useState(false);
    // pdfUrl이 제공되면 별도 API 호출 없이 사용, 없으면 기존처럼 API 호출
    const { data: resumeData, isLoading } = useUserResume(pdfUrl ? undefined : userId);
    
    // pdfUrl이 제공되면 그것을 사용, 없으면 API 응답의 pdfUrl 사용
    const finalPdfUrl = pdfUrl || resumeData?.data?.pdfUrl;

    if (role !== "interviewer" || !userId) {
        return null;
    }

    // pdfUrl이 제공되지 않고 API 호출 중이면 로딩 표시
    if (!pdfUrl && isLoading) {
        return (
            <div className="px-4 py-2 text-gray-400 text-sm">로딩 중...</div>
        );
    }

    if (!finalPdfUrl) {
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

            {showResumeModal && finalPdfUrl && (
                <ResumePreviewModal
                    pdfUrl={finalPdfUrl}
                    resumeName={`${userName}님의 이력서`}
                    onClose={() => setShowResumeModal(false)}
                />
            )}
        </>
    );
}

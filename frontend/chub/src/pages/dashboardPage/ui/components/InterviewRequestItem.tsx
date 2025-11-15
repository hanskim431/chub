import { useState, useRef } from "react";
import Card from "@/shared/ui/Card";
import Modal from "@/shared/ui/Modal";
import { useUpdateInterviewRequestStatus } from "@/pages/dashboardPage/api/interviewQuery";
import type { InterviewRequest } from "@/pages/dashboardPage/api/interviewRequests";
import { StatusBadge } from "@/pages/dashboardPage/ui/components/StatusBadge";
import { ResumeButton } from "@/pages/dashboardPage/ui/components/ResumeButton";
import type { Role } from "@/pages/dashboardPage/ui/types";

interface InterviewRequestItemProps {
    request: InterviewRequest;
    role: Role;
}

export function InterviewRequestItem({
    request,
    role,
}: InterviewRequestItemProps) {
    const { mutate: updateStatus, isPending } =
        useUpdateInterviewRequestStatus();
    const [showModal, setShowModal] = useState(false);
    const [modalAction, setModalAction] = useState<"accept" | "reject" | null>(
        null
    );
    const modalContentRef = useRef<HTMLDivElement>(null);

    // 면접관이 받은 요청일 때는 면접 신청자 정보, 면접자가 보낸 요청일 때는 면접관 정보
    const opponentName =
        role === "interviewer" && request.interviewee
            ? request.interviewee.name
            : request.interviewer.name;
    const opponentField =
        role === "interviewer" && request.interviewee
            ? request.interviewee.field || ""
            : request.interviewer.field;
    const opponentAvatar =
        role === "interviewer" && request.interviewee
            ? request.interviewee.avatar
            : request.interviewer.avatar;

    const intervieweeId =
        role === "interviewer" ? request.interviewee?.id : undefined;

    const handleAcceptClick = () => {
        setModalAction("accept");
        setShowModal(true);
    };

    const handleRejectClick = () => {
        setModalAction("reject");
        setShowModal(true);
    };

    const handleConfirm = () => {
        if (modalAction === "accept") {
            updateStatus({ id: request.id, accepted: true });
        } else if (modalAction === "reject") {
            updateStatus({ id: request.id, accepted: false });
        }
        setShowModal(false);
        setModalAction(null);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setModalAction(null);
    };

    const showActionButtons =
        role === "interviewer" && request.status === "PENDING";

    return (
        <>
            <Card className="p-0 hover:shadow-lg transition-shadow overflow-hidden">
                <div className="flex items-stretch">
                    <StatusBadge status={request.status} />

                    {/* 가운데 콘텐츠 */}
                    <div className="flex items-start gap-4 flex-1 p-4 min-w-0">
                        <img
                            src={opponentAvatar}
                            alt={opponentName}
                            className="w-16 h-16 rounded-full object-cover border-2 border-point-100 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-text-black mb-2">
                                {opponentName}
                            </h3>
                            <p className="text-sm text-text-gray mb-2">
                                {opponentField}
                            </p>
                            <p className="text-sm text-text-black line-clamp-2 mb-2">
                                {request.requestMessage}
                            </p>
                            <p className="text-xs text-text-gray">
                                {new Date(request.createdAt).toLocaleDateString(
                                    "ko-KR",
                                    {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    }
                                )}
                            </p>
                        </div>
                    </div>

                    {/* 오른쪽 액션 버튼 영역 */}
                    {role === "interviewer" || showActionButtons ? (
                        <div className="flex-shrink-0 flex flex-row gap-3 p-4 items-center">
                            {showActionButtons && (
                                <>
                                    <ResumeButton
                                        userId={intervieweeId}
                                        userName={opponentName}
                                        role={role}
                                    />
                                    <button
                                        onClick={handleAcceptClick}
                                        disabled={isPending}
                                        className="px-6 py-3 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        수락
                                    </button>
                                    <button
                                        onClick={handleRejectClick}
                                        disabled={isPending}
                                        className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        거절
                                    </button>
                                </>
                            )}
                        </div>
                    ) : null}
                </div>
            </Card>

            {/* 확인 모달 */}
            {showModal && modalAction && (
                <Modal
                    title={
                        modalAction === "accept"
                            ? "면접 요청 수락"
                            : "면접 요청 거절"
                    }
                    subtitle={`${opponentName} · ${opponentField} · ${new Date(
                        request.createdAt
                    ).toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    })}`}
                    onClose={handleCloseModal}
                    contentRef={modalContentRef}
                >
                    <div className="flex flex-col gap-4">
                        <div className="text-center py-4">
                            <p className="text-lg text-text-black">
                                <span className="font-bold text-point">
                                    {opponentName}
                                </span>
                                님의 면접 요청을{" "}
                                <span
                                    className={`font-bold ${
                                        modalAction === "accept"
                                            ? "text-emerald-600"
                                            : "text-red-600"
                                    }`}
                                >
                                    {modalAction === "accept" ? "수락" : "거절"}
                                </span>
                                하시겠습니까?
                            </p>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={handleCloseModal}
                                className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                            >
                                돌아가기
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={isPending}
                                className={`px-6 py-2 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                    modalAction === "accept"
                                        ? "bg-emerald-500 hover:bg-emerald-600"
                                        : "bg-red-500 hover:bg-red-600"
                                }`}
                            >
                                {modalAction === "accept"
                                    ? "수락하기"
                                    : "거절하기"}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </>
    );
}

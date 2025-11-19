import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { InterviewRoom } from "@/pages/interviewRoomPage/ui/InterviewRoom";
import { useInterviewRoom } from "@/pages/interviewRoomPage/hooks/useInterviewRoom";

export default function InterviewRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    localStream,
    remoteStream,
    isConnected,
    opponentInfo,
    messages,
    interviewStatus,
    timeRemaining,
    sendMessage,
    endInterview,
    leaveRoom,
    startInterview,
    error,
    isLocalAudioEnabled,
    isRemoteAudioEnabled,
    toggleLocalAudio,
    toggleRemoteAudio,
    isRecording,
    toggleRecording,
    tailQuestions,
    currentQuestion,
    userRole,
  } = useInterviewRoom(roomId || "");
  
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [showEndInterviewModal, setShowEndInterviewModal] = useState(false);
  const [showLeaveRoomModal, setShowLeaveRoomModal] = useState(false);
  const pendingNavigationRef = useRef<string | null>(null);
  const shouldBlockRef = useRef(true); // 면접이 완료되지 않았으면 블록
  const previousPathRef = useRef(location.pathname);

  useEffect(() => {
    if (!roomId) {
      navigate("/dashboard");
    }
  }, [roomId, navigate]);

  // 면접 완료 시 블로킹 해제
  useEffect(() => {
    if (interviewStatus === "COMPLETED") {
      shouldBlockRef.current = false;
    }
  }, [interviewStatus]);

  // 경로 변경 감지 (내부 네비게이션)
  useEffect(() => {
    const currentPath = location.pathname;
    const previousPath = previousPathRef.current;

    // 경로가 변경되었고, 면접방 페이지가 아니고, 블로킹이 활성화되어 있으면
    if (
      currentPath !== previousPath &&
      !currentPath.includes("/interview/room/") &&
      shouldBlockRef.current &&
      previousPath.includes("/interview/room/")
    ) {
      // 이전 경로로 되돌리고 모달 표시
      navigate(previousPath, { replace: true });
      pendingNavigationRef.current = currentPath;
      setShowLeaveRoomModal(true);
    }

    previousPathRef.current = currentPath;
  }, [location.pathname, navigate]);

  // 브라우저 뒤로가기/앞으로가기 버튼 감지
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (shouldBlockRef.current) {
        // 뒤로가기를 막고 모달 표시
        window.history.pushState(null, "", window.location.href);
        setShowLeaveRoomModal(true);
        event.preventDefault();
      }
    };

    // 히스토리 상태 추가 (뒤로가기 감지용)
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // 브라우저 닫기/새로고침 감지
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (shouldBlockRef.current) {
        event.preventDefault();
        event.returnValue = ""; // Chrome에서 필요
        return ""; // 일부 브라우저에서 필요
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // 면접 완료 시 모달 표시
  useEffect(() => {
    if (interviewStatus === "COMPLETED") {
      setShowCompletedModal(true);
    }
  }, [interviewStatus]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">오류 발생</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            대시보드로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const handleEndInterview = () => {
    setShowEndInterviewModal(true);
  };

  const handleConfirmEndInterview = () => {
    setShowEndInterviewModal(false);
    endInterview();
  };

  const handleLeaveRoom = () => {
    setShowLeaveRoomModal(true);
  };

  const handleConfirmLeaveRoom = () => {
    setShowLeaveRoomModal(false);
    leaveRoom();
    
    // 대기 중인 네비게이션이 있으면 해당 경로로 이동
    if (pendingNavigationRef.current) {
      navigate(pendingNavigationRef.current);
      pendingNavigationRef.current = null;
    } else {
      // 일반 버튼 클릭이면 직접 네비게이션
      navigate("/dashboard");
    }
  };

  const handleCancelLeaveRoom = () => {
    setShowLeaveRoomModal(false);
    pendingNavigationRef.current = null;
  };

  const handleCloseCompletedModal = () => {
    setShowCompletedModal(false);
    navigate("/dashboard");
  };

  return (
    <>
      <InterviewRoom
        localStream={localStream}
        remoteStream={remoteStream}
        isConnected={isConnected}
        opponentInfo={opponentInfo}
        messages={messages}
        interviewStatus={interviewStatus}
        timeRemaining={timeRemaining}
        onSendMessage={sendMessage}
        onEndInterview={handleEndInterview}
        onLeaveRoom={handleLeaveRoom}
        onStartInterview={startInterview}
        isLocalAudioEnabled={isLocalAudioEnabled}
        isRemoteAudioEnabled={isRemoteAudioEnabled}
        onToggleLocalAudio={toggleLocalAudio}
        onToggleRemoteAudio={toggleRemoteAudio}
        isRecording={isRecording}
        onToggleRecording={toggleRecording}
        tailQuestions={tailQuestions}
        currentQuestion={currentQuestion}
        userRole={userRole}
      />

      {/* 면접 종료 확인 모달 */}
      {showEndInterviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mb-4">
                <svg
                  className="mx-auto h-16 w-16 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                면접 종료 확인
              </h2>
              <p className="text-gray-600 mb-6">
                면접을 종료하시겠습니까?<br />
                종료하면 다시 접속할 수 없습니다.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowEndInterviewModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleConfirmEndInterview}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  종료하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 방 나가기 확인 모달 */}
      {showLeaveRoomModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mb-4">
                <svg
                  className="mx-auto h-16 w-16 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                방 나가기 확인
              </h2>
              <p className="text-gray-600 mb-6">
                면접방에서 나가시겠습니까?<br />
                면접이 종료되기 전까지는 다시 들어올 수 있습니다.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleCancelLeaveRoom}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleConfirmLeaveRoom}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  나가기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 면접 종료 모달 */}
      {showCompletedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mb-4">
                <svg
                  className="mx-auto h-16 w-16 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                면접이 종료되었습니다
              </h2>
              <p className="text-gray-600 mb-6">
                면접이 성공적으로 종료되었습니다.
              </p>
              <button
                onClick={handleCloseCompletedModal}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                대시보드로 돌아가기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

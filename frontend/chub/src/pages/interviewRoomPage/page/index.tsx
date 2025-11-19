import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { InterviewRoom } from "@/pages/interviewRoomPage/ui/InterviewRoom";
import { useInterviewRoom } from "@/pages/interviewRoomPage/hooks/useInterviewRoom";

export default function InterviewRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
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

  useEffect(() => {
    if (!roomId) {
      navigate("/dashboard");
    }
  }, [roomId, navigate]);

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
    navigate("/dashboard");
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
                  onClick={() => setShowLeaveRoomModal(false)}
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

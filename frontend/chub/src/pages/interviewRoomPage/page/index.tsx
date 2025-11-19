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
    if (window.confirm("면접을 종료하시겠습니까? 종료하면 다시 접속할 수 없습니다.")) {
      endInterview();
    }
  };

  const handleLeaveRoom = () => {
    if (window.confirm("면접방에서 나가시겠습니까? 면접이 종료되기 전까지는 다시 들어올 수 있습니다.")) {
      leaveRoom();
      navigate("/dashboard");
    }
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

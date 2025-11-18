import { useEffect } from "react";
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
    error,
    isLocalAudioEnabled,
    isRemoteAudioEnabled,
    toggleLocalAudio,
    toggleRemoteAudio,
    isRecording,
    toggleRecording,
    tailQuestions,
    userRole,
  } = useInterviewRoom(roomId || "");

  useEffect(() => {
    if (!roomId) {
      navigate("/dashboard");
    }
  }, [roomId, navigate]);

  // 면접 완료 시 대시보드로 이동
  useEffect(() => {
    if (interviewStatus === "COMPLETED") {
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    }
  }, [interviewStatus, navigate]);

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
    if (window.confirm("면접을 종료하시겠습니까?")) {
      endInterview();
    }
  };

  return (
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
      isLocalAudioEnabled={isLocalAudioEnabled}
      isRemoteAudioEnabled={isRemoteAudioEnabled}
      onToggleLocalAudio={toggleLocalAudio}
      onToggleRemoteAudio={toggleRemoteAudio}
      isRecording={isRecording}
      onToggleRecording={toggleRecording}
      tailQuestions={tailQuestions}
      userRole={userRole}
    />
  );
}

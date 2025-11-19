import { useRef, useEffect } from "react";
import { VideoPlayer } from "./VideoPlayer";
import { ChatPanel } from "./ChatPanel";
import { InterviewHeader } from "./InterviewHeader";
import { InterviewerInfo } from "./InterviewerInfo";
import { useMe } from "@/features/auth/api/me";

interface Message {
  id: string;
  senderId: number | null;
  senderName: string | null;
  receiverId?: number | null;
  receiverNickname?: string | null;
  content: string;
  timestamp: string;
  type: "USER" | "SYSTEM" | "SYSTEM_QUESTION" | "SYSTEM_ANSWER";
}

interface OpponentInfo {
  id: number;
  name: string;
  avatar: string;
  company?: string;
  position?: string;
  field?: string;
  interviewStyle?: string;
}

type InterviewStatus = "WAITING" | "QUESTION" | "ANSWER" | "COMPLETED" | string;

interface InterviewRoomProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isConnected: boolean;
  opponentInfo: OpponentInfo | null;
  messages: Message[];
  interviewStatus: InterviewStatus;
  timeRemaining: number; // 초 단위
  onSendMessage: (message: string) => void;
  onEndInterview: () => void;
  onLeaveRoom: () => void;
  onStartInterview: () => void;
  isLocalAudioEnabled: boolean;
  isRemoteAudioEnabled: boolean;
  onToggleLocalAudio: () => void;
  onToggleRemoteAudio: () => void;
  isRecording: boolean;
  onToggleRecording: () => void;
  tailQuestions: string[];
  currentQuestion: string | null;
  userRole: "INTERVIEWER" | "INTERVIEWEE" | null;
}

export function InterviewRoom({
  localStream,
  remoteStream,
  isConnected,
  opponentInfo,
  messages,
  interviewStatus,
  timeRemaining,
  onSendMessage,
  onEndInterview,
  onLeaveRoom,
  onStartInterview,
  isLocalAudioEnabled,
  isRemoteAudioEnabled,
  onToggleLocalAudio,
  onToggleRemoteAudio,
  isRecording,
  onToggleRecording,
  tailQuestions,
  currentQuestion,
  userRole,
}: InterviewRoomProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const { data: meData } = useMe();
  const currentUserId = meData?.data?.id;

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      // 원격 오디오 on/off 제어
      remoteVideoRef.current.muted = !isRemoteAudioEnabled;
    }
  }, [remoteStream, isRemoteAudioEnabled]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-gray-50">
      {/* 헤더 */}
      <InterviewHeader
        timeRemaining={timeRemaining}
        formattedTime={formatTime(timeRemaining)}
        interviewStatus={interviewStatus}
        onEndInterview={onEndInterview}
        onLeaveRoom={onLeaveRoom}
        isConnected={isConnected}
      />

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* 왼쪽: 면접관 정보 */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {opponentInfo && (
            <InterviewerInfo
              name={opponentInfo.name}
              avatar={opponentInfo.avatar}
              company={opponentInfo.company}
              position={opponentInfo.position}
              field={opponentInfo.field}
              interviewStyle={opponentInfo.interviewStyle}
            />
          )}

          {/* 채팅 패널 */}
          <div className="flex-1 border-t border-gray-200 min-h-0 flex flex-col">
            <ChatPanel
              messages={messages}
              onSendMessage={onSendMessage}
              isConnected={isConnected}
              currentUserId={currentUserId}
            />
          </div>
        </div>

        {/* 오른쪽: 비디오 영역 */}
        <div className="flex-1 flex flex-col bg-gray-900">
          {/* 현재 질문 표시 영역 */}
          {currentQuestion && (
            <div className="bg-blue-900 border-b border-blue-700 px-6 py-4">
              <div className="max-w-4xl mx-auto">
                <div className="text-blue-200 text-sm font-semibold mb-2">
                  현재 질문
                </div>
                <div className="text-white text-lg">{currentQuestion}</div>
              </div>
            </div>
          )}
          <div className="flex-1 flex items-center justify-center p-4 gap-4">
            {/* 원격 비디오 (면접관) */}
            <div className="flex-1 h-full max-w-4xl relative">
              <VideoPlayer
                ref={remoteVideoRef}
                label={opponentInfo?.name || "면접관"}
                isLocal={false}
                isConnected={isConnected}
              />
              {/* 상대방 음성 on/off 버튼 */}
              <button
                onClick={onToggleRemoteAudio}
                className={`absolute top-4 right-4 p-3 rounded-full shadow-lg transition-all ${
                  isRemoteAudioEnabled
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
                title={
                  isRemoteAudioEnabled ? "상대방 음성 끄기" : "상대방 음성 켜기"
                }
              >
                {isRemoteAudioEnabled ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                    />
                  </svg>
                )}
              </button>
            </div>

            {/* 로컬 비디오 (나) */}
            <div className="w-64 h-48 rounded-lg overflow-hidden border-2 border-white shadow-lg relative">
              <VideoPlayer
                ref={localVideoRef}
                label="나"
                isLocal={true}
                isConnected={isConnected}
              />
              {/* 내 마이크 on/off 버튼 */}
              <button
                onClick={onToggleLocalAudio}
                className={`absolute top-2 right-2 p-2 rounded-full shadow-lg transition-all ${
                  isLocalAudioEnabled
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
                title={isLocalAudioEnabled ? "마이크 끄기" : "마이크 켜기"}
              >
                {isLocalAudioEnabled ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* 하단 버튼 영역 */}
          <div className="p-4 bg-gray-800 border-t border-gray-700">
            {/* 대기 상태: 면접관에게만 시작하기 버튼 표시 */}
            {interviewStatus === "WAITING" && userRole === "INTERVIEWER" && (
              <div className="flex justify-center">
                <button
                  onClick={onStartInterview}
                  disabled={!isConnected}
                  className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-full font-semibold text-lg transition-all disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>면접 시작하기</span>
                </button>
              </div>
            )}

            {/* 질문 단계: 면접관에게만 녹음 버튼 표시 */}
            {interviewStatus === "QUESTION" && userRole === "INTERVIEWER" && (
              <>
                <div className="flex justify-center mb-4">
                  <button
                    onClick={onToggleRecording}
                    disabled={!isConnected}
                    className={`px-6 py-3 rounded-full font-semibold transition-all ${
                      isRecording
                        ? "bg-red-600 hover:bg-red-700 text-white animate-pulse"
                        : "bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-600 disabled:cursor-not-allowed"
                    }`}
                  >
                    {isRecording ? (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                        <span>녹음 종료하기</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                          />
                        </svg>
                        <span>질문 녹음하기</span>
                      </div>
                    )}
                  </button>
                </div>

                {/* 꼬리 질문 (면접관에게만 표시) */}
                {tailQuestions.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-white font-semibold mb-2">
                      꼬리 질문 선택지
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {tailQuestions.map((question, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            // 꼬리 질문을 채팅으로 전송
                            onSendMessage(question);
                          }}
                          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* 답변 단계: 면접자에게만 녹음 버튼 표시 */}
            {interviewStatus === "ANSWER" && userRole === "INTERVIEWEE" && (
              <div className="flex justify-center">
                <button
                  onClick={onToggleRecording}
                  disabled={!isConnected}
                  className={`px-6 py-3 rounded-full font-semibold transition-all ${
                    isRecording
                      ? "bg-red-600 hover:bg-red-700 text-white animate-pulse"
                      : "bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-600 disabled:cursor-not-allowed"
                  }`}
                >
                  {isRecording ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                      <span>녹음 종료하기</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                        />
                      </svg>
                      <span>답변 녹음하기</span>
                    </div>
                  )}
                </button>
              </div>
            )}

            {/* 종료 단계: 면접 종료하기 버튼 */}
            {interviewStatus === "COMPLETED" && (
              <div className="flex justify-center">
                <button
                  onClick={onEndInterview}
                  className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold text-lg transition-all flex items-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  <span>면접 종료하기</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

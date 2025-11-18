import { useRef, useEffect } from "react";
import { VideoPlayer } from "./VideoPlayer";
import { ChatPanel } from "./ChatPanel";
import { InterviewHeader } from "./InterviewHeader";
import { InterviewerInfo } from "./InterviewerInfo";

interface Message {
  id: string;
  senderId: number;
  senderName: string;
  content: string;
  timestamp: string;
  type: "CHAT" | "SYSTEM";
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

type InterviewStatus = "WAITING" | "QUESTION" | "ANSWER" | "COMPLETED";

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
}: InterviewRoomProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 헤더 */}
      <InterviewHeader
        timeRemaining={timeRemaining}
        formattedTime={formatTime(timeRemaining)}
        interviewStatus={interviewStatus}
        onEndInterview={onEndInterview}
        isConnected={isConnected}
      />

      <div className="flex-1 flex overflow-hidden">
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
          <div className="flex-1 border-t border-gray-200">
            <ChatPanel
              messages={messages}
              onSendMessage={onSendMessage}
              isConnected={isConnected}
            />
          </div>
        </div>

        {/* 오른쪽: 비디오 영역 */}
        <div className="flex-1 flex flex-col bg-gray-900">
          <div className="flex-1 flex items-center justify-center p-4 gap-4">
            {/* 원격 비디오 (면접관) */}
            <div className="flex-1 h-full max-w-4xl">
              <VideoPlayer
                ref={remoteVideoRef}
                label={opponentInfo?.name || "면접관"}
                isLocal={false}
                isConnected={isConnected}
              />
            </div>

            {/* 로컬 비디오 (나) */}
            <div className="w-64 h-48 rounded-lg overflow-hidden border-2 border-white shadow-lg">
              <VideoPlayer
                ref={localVideoRef}
                label="나"
                isLocal={true}
                isConnected={isConnected}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


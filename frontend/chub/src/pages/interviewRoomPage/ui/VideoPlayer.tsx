import { forwardRef } from "react";

interface VideoPlayerProps {
  label: string;
  isLocal: boolean;
  isConnected: boolean;
}

export const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  ({ label, isLocal, isConnected }, ref) => {
    return (
      <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
        <video
          ref={ref}
          autoPlay
          playsInline
          muted={isLocal}
          className="w-full h-full object-cover"
        />
        {/* 로컬 비디오는 연결 상태와 관계없이 표시, 원격 비디오만 연결 상태 표시 */}
        {!isLocal && !isConnected && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-sm">연결 중...</p>
            </div>
          </div>
        )}
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
          {label}
        </div>
      </div>
    );
  }
);

VideoPlayer.displayName = "VideoPlayer";


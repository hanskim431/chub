import Modal from "@/shared/ui/Modal";
import { useRef } from "react";

interface CreateChatRoomModalProps {
  isOpen: boolean;
  interviewerName: string;
  onClose: () => void;
  onConfirm: () => void;
  isPending?: boolean;
}

export function CreateChatRoomModal({
  isOpen,
  interviewerName,
  onClose,
  onConfirm,
  isPending = false,
}: CreateChatRoomModalProps) {
  const modalContentRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  return (
    <Modal
      title="메시지 보내기"
      subtitle=""
      onClose={onClose}
      contentRef={modalContentRef}
    >
      <div className="flex flex-col gap-4">
        <div className="text-center py-4">
          <p className="text-lg text-text-black">
            <span className="font-bold text-point">{interviewerName}</span>
            면접관에게 메시지를 보내겠습니까?
          </p>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="px-6 py-2 bg-point text-white rounded-lg font-semibold hover:bg-point-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "처리 중..." : "확인"}
          </button>
        </div>
      </div>
    </Modal>
  );
}


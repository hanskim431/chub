import { useState, useRef } from "react";
import type { RecruiterOverview } from "@mocks/model/constants";
import { Link, useNavigate } from "react-router-dom";
import { useCreateChatRoom } from "@/entities/chat/api/query";
import { CreateChatRoomModal } from "@/widgets/chat/ui/CreateChatRoomModal";
import { useCreateInterviewRequest } from "@/pages/interviewerDetailPage/api/query";
import { useQueryClient } from "@tanstack/react-query";
import Card from "@/shared/ui/Card";
import Pill from "@/shared/ui/Pill";
import Modal from "@/shared/ui/Modal";

function RecruiterListItem({
  recruiterOverview,
}: {
  recruiterOverview: RecruiterOverview;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutate: createChatRoom, isPending: isCreatingChatRoom } =
    useCreateChatRoom();
  const { mutate: createRequest, isPending: isCreatingRequest } =
    useCreateInterviewRequest();
  const [showChatModal, setShowChatModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const modalContentRef = useRef<HTMLDivElement>(null);
  return (
    <Card
      width="full"
      height="full"
      className="relative transition-all duration-200 has-[a:hover]:shadow-xl has-[a:hover]:scale-[1.02] has-[a:hover]:border-point-400 has-[button:hover]:shadow-xl has-[button:hover]:scale-[1.02] has-[button:hover]:border-point-400 p-6"
    >
      <Link
        to={`/interviewers/${recruiterOverview.id}`}
        className="absolute hover:cursor-pointer inset-0 z-0"
        aria-label="면접관 상세 페이지 링크"
      />
      <div
        aria-label="RecruiterListItem"
        className="flex flex-col items-start justify-between gap-5 w-full h-full"
      >
        <div className="flex items-start justify-start gap-5 w-full">
          <img
            src={recruiterOverview.avatar}
            alt={recruiterOverview.name}
            aria-label={recruiterOverview.name}
            className="w-24 h-24 rounded-xl object-cover shrink-0 border-2 border-point-100"
          />
          <div className="flex flex-col flex-1 w-full items-start justify-start gap-3 min-w-0">
            <div className="flex items-center justify-between gap-3 flex-wrap w-full">
              <span className="text-xl font-bold text-text-black">
                {recruiterOverview.name}
              </span>
              <Pill color="gray">{recruiterOverview.field}</Pill>
            </div>

            <div className="flex flex-col items-start justify-start gap-2.5 w-full">
              <span
                aria-label={
                  recruiterOverview.company + " " + recruiterOverview.position
                }
                className="text-sm text-text-gray font-medium"
              >
                {recruiterOverview.company + " · " + recruiterOverview.position}
              </span>
              <p className="text-sm text-text-black leading-relaxed line-clamp-2">
                {recruiterOverview.bio}
              </p>
              <div className="flex items-center justify-start gap-2 flex-wrap">
                {recruiterOverview.experiences.map((experience, index) => (
                  <Pill key={index} color="point">
                    {"#" + experience.company}
                  </Pill>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 w-full mt-auto z-1 pt-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowRequestModal(true);
              setRequestMessage("");
            }}
            disabled={isCreatingRequest}
            className="flex-1 rounded-lg border-2 border-point-400 bg-white px-4 py-2.5 text-sm font-semibold text-point-400 shadow-sm transition-all duration-300 hover:cursor-pointer hover:bg-point-100 hover:border-point-500 hover:text-point-500 hover:shadow-lg hover:scale-[1.02] hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-point-500/60 focus-visible:outline-none active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 z-10 relative"
          >
            {isCreatingRequest ? "신청 중..." : "면접 신청하기"}
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowChatModal(true);
            }}
            className="flex-1 rounded-lg border-2 border-point-400 bg-white px-4 py-2.5 text-sm font-semibold text-point-400 shadow-sm transition-all duration-300 hover:cursor-pointer hover:bg-point-100 hover:border-point-500 hover:text-point-500 hover:shadow-lg hover:scale-[1.02] hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-point-500/60 focus-visible:outline-none active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 z-10 relative"
          >
            메세지 보내기
          </button>
        </div>
      </div>

      {/* 면접 신청 모달 */}
      {showRequestModal && (
        <Modal
          title="면접 신청"
          subtitle={`${recruiterOverview.name} · ${recruiterOverview.field}`}
          onClose={() => {
            setShowRequestModal(false);
            setRequestMessage("");
          }}
          contentRef={modalContentRef}
        >
          <div className="flex flex-col gap-4">
            <div className="text-center py-4">
              <p className="text-lg text-text-black">
                <span className="font-bold text-point">
                  {recruiterOverview.name}
                </span>
                님께 면접을 신청하시겠습니까?
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                면접 신청 메시지
              </label>
              <textarea
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder="면접 신청과 함께 전달할 메시지를 입력해주세요."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-point focus:border-point resize-none"
                rows={5}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowRequestModal(false);
                  setRequestMessage("");
                }}
                className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                돌아가기
              </button>
              <button
                onClick={() => {
                  if (!requestMessage.trim()) {
                    alert("면접 신청 메시지를 입력해주세요.");
                    return;
                  }
                  createRequest(
                    {
                      interviewerId: recruiterOverview.id,
                      requestMessage: requestMessage.trim(),
                    },
                    {
                      onSuccess: () => {
                        setShowRequestModal(false);
                        setRequestMessage("");
                        alert("면접 신청이 완료되었습니다.");
                        navigate("/dashboard");
                      },
                      onError: () => {
                        alert("면접 신청에 실패했습니다. 다시 시도해주세요.");
                      },
                    }
                  );
                }}
                disabled={isCreatingRequest || !requestMessage.trim()}
                className="px-6 py-2 bg-point text-white rounded-lg font-semibold hover:bg-point-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingRequest ? "신청 중..." : "신청하기"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 메시지 보내기 모달 */}
      <CreateChatRoomModal
        isOpen={showChatModal}
        interviewerName={recruiterOverview.name}
        onClose={() => setShowChatModal(false)}
        onConfirm={() => {
          createChatRoom(
            { opponentId: recruiterOverview.userId },
            {
              onSuccess: async (response) => {
                if (response.success && response.data) {
                  setShowChatModal(false);
                  // 채팅방 목록이 업데이트될 때까지 기다린 후 채팅방 열기
                  await queryClient.refetchQueries({ queryKey: ["chatRooms"] });
                  // 채팅방 생성 완료 후 해당 채팅방 열기
                  const roomId = response.data.roomId;
                  // 약간의 지연을 두어 채팅방 목록이 완전히 업데이트되도록 함
                  setTimeout(() => {
                    // 커스텀 이벤트를 통해 FloatingChat에 채팅방 열기 요청
                    const event = new CustomEvent("openChatRoom", {
                      detail: roomId,
                    });
                    window.dispatchEvent(event);
                  }, 100);
                }
              },
              onError: () => {
                alert("채팅방 생성에 실패했습니다. 다시 시도해주세요.");
              },
            }
          );
        }}
        isPending={isCreatingChatRoom}
      />
    </Card>
  );
}

export default RecruiterListItem;

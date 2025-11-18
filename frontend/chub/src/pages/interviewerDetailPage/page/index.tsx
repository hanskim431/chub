import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useInterviewerDetail, useCreateInterviewRequest } from "@/pages/interviewerDetailPage/api/query";
import { useCreateChatRoom } from "@/entities/chat/api/query";
import { CreateChatRoomModal } from "@/widgets/chat/ui/CreateChatRoomModal";
import Card from "@/shared/ui/Card";
import Pill from "@/shared/ui/Pill";
import Modal from "@/shared/ui/Modal";

export default function InterviewerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useInterviewerDetail(Number(id));
  const { mutate: createRequest, isPending } = useCreateInterviewRequest();
  const { mutate: createChatRoom, isPending: isCreatingChatRoom } = useCreateChatRoom();
  const [showModal, setShowModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const modalContentRef = useRef<HTMLDivElement>(null);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="text-gray-500">면접관 정보를 불러올 수 없습니다.</div>
          <button
            onClick={() => navigate("/interviewers")}
            className="px-4 py-2 bg-point text-white rounded-lg font-semibold hover:bg-point-500 transition-colors"
          >
            면접관 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const interviewer = data.data;

  const handleRequestClick = () => {
    setShowModal(true);
    setRequestMessage("");
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setRequestMessage("");
  };

  const handleConfirm = () => {
    if (!requestMessage.trim()) {
      alert("면접 신청 메시지를 입력해주세요.");
      return;
    }
    createRequest(
      {
        interviewerId: interviewer.id,
        requestMessage: requestMessage.trim(),
      },
      {
        onSuccess: () => {
          setShowModal(false);
          setRequestMessage("");
          alert("면접 신청이 완료되었습니다.");
          navigate("/dashboard");
        },
        onError: () => {
          alert("면접 신청에 실패했습니다. 다시 시도해주세요.");
        },
      }
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <button
          onClick={() => navigate("/interviewers")}
          className="text-gray-600 hover:text-point transition-colors mb-4"
        >
          ← 면접관 목록으로 돌아가기
        </button>
        <div className="flex items-start gap-6 mb-6">
          <img
            src={interviewer.avatar || "/logo.png"}
            alt={interviewer.name}
            className="w-32 h-32 rounded-xl object-cover border-2 border-point-100 flex-shrink-0"
          />
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{interviewer.name}</h1>
            <Pill color="gray" className="mb-3">
              {interviewer.field}
            </Pill>
            {interviewer.company && interviewer.position && (
              <p className="text-lg text-gray-600 mb-2">
                {interviewer.company} · {interviewer.position}
              </p>
            )}
            {interviewer.bio && (
              <p className="text-base text-text-black leading-relaxed">
                {interviewer.bio}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 전문 분야 */}
      {interviewer.specialties && interviewer.specialties.length > 0 && (
        <Card height="fit" className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">전문 분야</h2>
          <div className="flex flex-wrap gap-2">
            {interviewer.specialties.map((specialty, index) => (
              <Pill key={index} color="point">
                {specialty}
              </Pill>
            ))}
          </div>
        </Card>
      )}

      {/* 경력 */}
      {interviewer.experiences && interviewer.experiences.length > 0 && (
        <Card height="fit" className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">경력</h2>
          <div className="space-y-4">
            {/* 헤더 */}
            <div className="flex items-center gap-4 pb-2 border-b border-gray-200">
              <div className="flex-shrink-0 w-1"></div>
              <div className="flex-1 flex items-center gap-4">
                <p className="text-sm font-semibold text-gray-600 min-w-[200px]">회사</p>
                <p className="text-sm font-semibold text-gray-600 flex-1">직무</p>
                <p className="text-sm font-semibold text-gray-600 whitespace-nowrap">기간</p>
              </div>
            </div>
            {/* 경력 항목 */}
            {interviewer.experiences.map((experience, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex-shrink-0 w-1 h-12 bg-point-200 rounded"></div>
                <div className="flex-1 flex items-center gap-4">
                  <p className="font-semibold text-lg min-w-[200px]">{experience.company}</p>
                  <p className="text-gray-600 flex-1">{experience.role}</p>
                  <p className="text-sm text-gray-500 whitespace-nowrap">
                    {experience.startedYear} -{" "}
                    {experience.endedYear || "재직중"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 학력 */}
      {interviewer.education && interviewer.education.length > 0 && (
        <Card height="fit" className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">학력</h2>
          <div className="space-y-4">
            {/* 헤더 */}
            <div className="flex items-center gap-4 pb-2 border-b border-gray-200">
              <div className="flex-shrink-0 w-1"></div>
              <div className="flex-1 flex items-center gap-4">
                <p className="text-sm font-semibold text-gray-600 min-w-[200px]">학교</p>
                <p className="text-sm font-semibold text-gray-600 flex-1">학위</p>
                <p className="text-sm font-semibold text-gray-600 whitespace-nowrap">기간</p>
              </div>
            </div>
            {/* 학력 항목 */}
            {interviewer.education.map((edu, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex-shrink-0 w-1 h-12 bg-point-200 rounded"></div>
                <div className="flex-1 flex items-center gap-4">
                  <p className="font-semibold text-lg min-w-[200px]">{edu.school}</p>
                  <p className="text-gray-600 flex-1">{edu.role}</p>
                  <p className="text-sm text-gray-500 whitespace-nowrap">
                    {edu.startedYear && edu.endedYear
                      ? `${edu.startedYear} - ${edu.endedYear}`
                      : "-"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 자격증 */}
      {interviewer.certifications && interviewer.certifications.length > 0 && (
        <Card height="fit" className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">자격증</h2>
          <div className="space-y-2">
            {interviewer.certifications.map((cert, index) => (
              <div key={index} className="flex items-center justify-between">
                <p className="font-medium">{cert.name}</p>
                <p className="text-sm text-gray-500">{cert.year}년</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 언어 */}
      {interviewer.languages && interviewer.languages.length > 0 && (
        <Card height="fit" className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">언어</h2>
          <div className="flex flex-wrap gap-2">
            {interviewer.languages.map((language, index) => (
              <Pill key={index} color="gray">
                {language}
              </Pill>
            ))}
          </div>
        </Card>
      )}

      {/* 면접 스타일 */}
      {interviewer.interviewStyle && (
        <Card height="fit" className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">면접 스타일</h2>
          <p className="text-base text-text-black leading-relaxed whitespace-pre-wrap">
            {interviewer.interviewStyle}
          </p>
        </Card>
      )}

      {/* 가격 및 면접 신청 - 하단 고정 */}
      <div className="sticky bottom-0 z-10 mt-8">
        <Card height="fit" className="p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold mb-2">면접 비용</h2>
              <p className="text-2xl font-bold text-point">
                {interviewer.price.toLocaleString()}원
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRequestClick}
              className="flex-1 px-6 py-3 bg-point text-white rounded-lg font-semibold hover:bg-point-500 transition-colors"
            >
              면접 신청하기
            </button>
            <button
              onClick={() => {
                setShowChatModal(true);
              }}
              className="flex-1 px-6 py-3 border-2 border-point text-point rounded-lg font-semibold hover:bg-point-100 transition-colors"
            >
              메시지 보내기
            </button>
          </div>
        </Card>
      </div>

      {/* 면접 신청 모달 */}
      {showModal && (
        <Modal
          title="면접 신청"
          subtitle={`${interviewer.name} · ${interviewer.field} · ${interviewer.price.toLocaleString()}원`}
          onClose={handleCloseModal}
          contentRef={modalContentRef}
        >
          <div className="flex flex-col gap-4">
            <div className="text-center py-4">
              <p className="text-lg text-text-black">
                <span className="font-bold text-point">{interviewer.name}</span>
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
                onClick={handleCloseModal}
                className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                돌아가기
              </button>
              <button
                onClick={handleConfirm}
                disabled={isPending || !requestMessage.trim()}
                className="px-6 py-2 bg-point text-white rounded-lg font-semibold hover:bg-point-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? "신청 중..." : "신청하기"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 메시지 보내기 모달 */}
      <CreateChatRoomModal
        isOpen={showChatModal}
        interviewerName={interviewer.name}
        onClose={() => setShowChatModal(false)}
        onConfirm={() => {
          createChatRoom(
            { opponentId: interviewer.id },
            {
              onSuccess: (response) => {
                if (response.success && response.data) {
                  setShowChatModal(false);
                  // 채팅창 열기 (FloatingChat에서 처리)
                  // TODO: 채팅창을 열고 해당 roomId로 이동
                  console.log("채팅방 생성 완료:", response.data.roomId);
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
    </div>
  );
}


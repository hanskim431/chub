import { http, HttpResponse } from "msw";
import { mockRecruiters } from "@mocks/model/constants";
import type { ApiResponse } from "@/entities/interviewer/model/types";
import type {
  CreateChatRoomRequest,
  CreateChatRoomResponse,
  GetChatRoomsResponse,
  ChatRoom,
  GetChatMessagesResponse,
  OpponentLastReadResponse,
  ChatMessage,
  ChatMessagesPagination,
} from "@/entities/chat/model/types";

// 채팅방 목록 상태 관리
let chatRooms: ChatRoom[] = [
  {
    roomId: "1:2",
    opponent: {
      id: 2,
      name: "김민준",
      avatar:
        "https://lh3.googleusercontent.com/-lzSeccV9KtY/AAAAAAAAAAI/AAAAAAAAAAA/ALKGfkmpTYDCiyOwx1lDP39LTQlME_NzvQ/photo.jpg?sz=46",
    },
    lastMessage: {
      content: "안녕하세요?",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    unreadCount: 0,
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    roomId: "1:3",
    opponent: {
      id: 3,
      name: "강현호",
      avatar:
        "https://lh3.googleusercontent.com/-lzSeccV9KtY/AAAAAAAAAAI/AAAAAAAAAAA/ALKGfkmpTYDCiyOwx1lDP39LTQlME_NzvQ/photo.jpg?sz=46",
    },
    lastMessage: {
      content: "확인했습니다.",
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
    unreadCount: 1,
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    roomId: "1:4",
    opponent: {
      id: 4,
      name: "이서준",
      avatar:
        "https://lh3.googleusercontent.com/-lzSeccV9KtY/AAAAAAAAAAI/AAAAAAAAAAA/ALKGfkmpTYDCiyOwx1lDP39LTQlME_NzvQ/photo.jpg?sz=46",
    },
    lastMessage: {
      content: "자료 전달드렸습니다.",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    unreadCount: 2,
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

// 면접관 정보를 가져오는 헬퍼 함수
const getInterviewerInfo = (
  opponentId: number
): { name: string; avatar: string } => {
  const defaultAvatar =
    "https://lh3.googleusercontent.com/-lzSeccV9KtY/AAAAAAAAAAI/AAAAAAAAAAA/ALKGfkmpTYDCiyOwx1lDP39LTQlME_NzvQ/photo.jpg?sz=46";

  // 기존 채팅방에서 찾기
  const existingRoom = chatRooms.find(
    (room) => room.opponent.id === opponentId
  );
  if (existingRoom) {
    return {
      name: existingRoom.opponent.name,
      avatar: existingRoom.opponent.avatar,
    };
  }

  // 면접관 목록에서 찾기
  const interviewer = mockRecruiters.find((r) => r.id === String(opponentId));
  if (interviewer) {
    return {
      name: interviewer.name,
      avatar: interviewer.avatar,
    };
  }

  // 기본값 반환
  return {
    name: `면접관 ${opponentId}`,
    avatar: defaultAvatar,
  };
};

export const chatHandlers = [
  // 채팅방 생성
  http.post(
    `${import.meta.env.VITE_API_URL}/api/chat/rooms/create`,
    async ({ request }) => {
      const body = (await request.json()) as CreateChatRoomRequest;
      const { opponentId } = body;

      // 이미 존재하는 채팅방이 있는지 확인
      const existingRoom = chatRooms.find(
        (room) => room.opponent.id === opponentId
      );

      if (existingRoom) {
        return HttpResponse.json<ApiResponse<CreateChatRoomResponse>>({
          success: true,
          status: 200,
          data: {
            roomId: existingRoom.roomId,
          },
          timestamp: new Date().toISOString(),
        });
      }

      // 새 채팅방 생성
      const interviewer = getInterviewerInfo(opponentId);

      // roomId 생성 (작은 id:큰 id 형식으로 정렬)
      const currentUserId = 1; // 현재 사용자 ID (실제로는 인증 정보에서 가져와야 함)
      const [smallerId, largerId] = [currentUserId, opponentId].sort(
        (a, b) => a - b
      );
      const newRoomId = `${smallerId}:${largerId}`;
      const newRoom: ChatRoom = {
        roomId: newRoomId,
        opponent: {
          id: opponentId,
          name: interviewer.name,
          avatar: interviewer.avatar,
        },
        lastMessage: null,
        unreadCount: 0,
        updatedAt: new Date().toISOString(),
      };

      chatRooms.push(newRoom);

      return HttpResponse.json<ApiResponse<CreateChatRoomResponse>>({
        success: true,
        status: 200,
        data: {
          roomId: newRoomId,
        },
        timestamp: new Date().toISOString(),
      });
    }
  ),

  // 채팅방 목록 조회
  http.get(`${import.meta.env.VITE_API_URL}/api/chat/rooms`, async () => {
    return HttpResponse.json<ApiResponse<GetChatRoomsResponse>>({
      success: true,
      status: 200,
      data: {
        rooms: chatRooms.sort((a, b) => {
          const timeA = new Date(a.updatedAt).getTime();
          const timeB = new Date(b.updatedAt).getTime();
          return timeB - timeA; // 최신순 정렬
        }),
      },
      timestamp: new Date().toISOString(),
    });
  }),

  // 채팅 메시지 목록 조회
  http.get(
    `${import.meta.env.VITE_API_URL}/api/chat/rooms/:roomId/messages`,
    async ({ params }) => {
      const { roomId } = params;

      // roomId에서 사용자 ID와 상대방 ID 추출 (예: "1:2" -> userId: "1", opponentId: "2")
      const roomIdParts = roomId?.toString().split(":");
      if (!roomIdParts || roomIdParts.length !== 2) {
        return HttpResponse.json<ApiResponse<GetChatMessagesResponse>>({
          success: false,
          status: 400,
          data: undefined,
          timestamp: new Date().toISOString(),
        });
      }
      const userId = roomIdParts[0];

      // 채팅방 목록에서 상대방 ID 찾기
      const room = chatRooms.find((r) => r.roomId === roomId);
      if (!room) {
        return HttpResponse.json<ApiResponse<GetChatMessagesResponse>>({
          success: false,
          status: 404,
          data: undefined,
          timestamp: new Date().toISOString(),
        });
      }
      const opponentId = String(room.opponent.id);

      // roomId별로 다른 대화 내용 제공 (senderId는 실제 userId 또는 opponentId 사용)
      let messages: ChatMessage[] = [];
      let pagination: ChatMessagesPagination = {
        pageSize: 20,
        hasNext: false,
      };

      if (room.opponent.id === 2) {
        // 김민준과의 대화 (안읽은 메시지 있음)
        // 안읽은 메시지가 있는 경우 - 더 많은 메시지 추가
        messages = [
          {
            id: "507f1f77bcf86cd799439011",
            senderId: opponentId,
            content: "안녕하세요?",
            createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          },
          {
            id: "507f1f77bcf86cd799439012",
            senderId: userId,
            content: "네, 안녕하세요. 연락주셔서 감사합니다.",
            createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          },
          {
            id: "507f1f77bcf86cd799439013",
            senderId: opponentId,
            content: "어제 전달드린 자료는 잘 보셨나요?",
            createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          },
          {
            id: "507f1f77bcf86cd799439014",
            senderId: userId,
            content: "네, 전체적으로 확인했습니다.",
            createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
          },
          {
            id: "507f1f77bcf86cd799439015",
            senderId: opponentId,
            content: "혹시 수정이 필요한 부분 있을까요?",
            createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
          },
          {
            id: "507f1f77bcf86cd799439016",
            senderId: userId,
            content: "두 번째 페이지 항목만 조금 보완되면 좋겠습니다.",
            createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          },
          {
            id: "507f1f77bcf86cd799439017",
            senderId: opponentId,
            content: "알겠습니다. 바로 반영해보겠습니다.",
            createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
          },
          {
            id: "507f1f77bcf86cd799439018",
            senderId: userId,
            content: "수정되면 한 번 더 전달 부탁드립니다.",
            createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
          },
          {
            id: "507f1f77bcf86cd799439019",
            senderId: opponentId,
            content: "네, 수정본 만들고 바로 공유 드릴게요.",
            createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          },
          {
            id: "507f1f77bcf86cd799439020",
            senderId: userId,
            content: "감사합니다. 급한 일정은 아닙니다.",
            createdAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
          },
          {
            id: "507f1f77bcf86cd799439021",
            senderId: opponentId,
            content: "넵, 그래도 빠르게 처리해두겠습니다.",
            createdAt: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
          },
          {
            id: "507f1f77bcf86cd799439022",
            senderId: userId,
            content: "고생 많으십니다.",
            createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          },
          {
            id: "507f1f77bcf86cd799439023",
            senderId: opponentId,
            content: "괜찮습니다. 진행하면서 또 확인해보겠습니다.",
            createdAt: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
          },
          {
            id: "507f1f77bcf86cd799439024",
            senderId: userId,
            content: "네, 추가 요청 있으면 바로 말씀드릴게요.",
            createdAt: new Date(Date.now() - 70 * 60 * 1000).toISOString(),
          },
          {
            id: "507f1f77bcf86cd799439025",
            senderId: opponentId,
            content: "좋습니다. 말씀만 주세요.",
            createdAt: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
          },
          {
            id: "507f1f77bcf86cd799439026",
            senderId: userId,
            content: "현재까지는 문제 없습니다.",
            createdAt: new Date(Date.now() - 80 * 60 * 1000).toISOString(),
          },
          {
            id: "507f1f77bcf86cd799439027",
            senderId: opponentId,
            content: "진행 상황은 계속 공유드리겠습니다.",
            createdAt: new Date(Date.now() - 85 * 60 * 1000).toISOString(),
          },
          {
            id: "507f1f77bcf86cd799439028",
            senderId: userId,
            content: "네, 감사드립니다.",
            createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
          },
          {
            id: "507f1f77bcf86cd799439029",
            senderId: opponentId,
            content: "수정본 업로드 완료하면 바로 알려드릴게요.",
            createdAt: new Date(Date.now() - 95 * 60 * 1000).toISOString(),
          },
          {
            id: "507f1f77bcf86cd799439030",
            senderId: userId,
            content: "확인 후 다시 말씀드리겠습니다.",
            createdAt: new Date(Date.now() - 100 * 60 * 1000).toISOString(),
          },
          {
            id: "507f1f77bcf86cd799439031",
            senderId: userId,
            content: "수정사항 확인 부탁드립니다.",
            createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          },
        ];

        pagination = {
          pageSize: 20,
          hasNext: true,
          nextCursor: new Date(Date.now() - 100 * 60 * 1000).toISOString(),
        };
      } else if (room.opponent.id === 3) {
        // 강현호와의 대화 - 상대가 마지막으로 메시지를 보낸 상태
        messages = [
          {
            id: "507f1f77bcf86cd799439101",
            senderId: opponentId,
            content: "면접 일정 확인 부탁드립니다.",
            createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          },
          {
            id: "507f1f77bcf86cd799439102",
            senderId: userId,
            content: "네, 확인했습니다. 내일 오후 2시로 예약되어 있네요.",
            createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
          },
          {
            id: "507f1f77bcf86cd799439103",
            senderId: opponentId,
            content:
              "좋습니다. 준비물은 이력서와 포트폴리오만 가져오시면 됩니다.",
            createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
          },
          {
            id: "507f1f77bcf86cd799439104",
            senderId: userId,
            content: "알겠습니다. 감사합니다!",
            createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          },
          {
            id: "507f1f77bcf86cd799439105",
            senderId: opponentId,
            content: "추가로 궁금한 점이 있으면 언제든지 말씀해주세요.",
            createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          },
        ];
      } else if (room.opponent.id === 4) {
        // 이서준과의 대화
        messages = [
          {
            id: "507f1f77bcf86cd799439201",
            senderId: opponentId,
            content: "자료 전달드렸습니다.",
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "507f1f77bcf86cd799439202",
            senderId: userId,
            content: "네, 확인했습니다. 잘 정리되어 있네요.",
            createdAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "507f1f77bcf86cd799439203",
            senderId: opponentId,
            content: "추가로 필요한 자료 있으시면 말씀해주세요.",
            createdAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "507f1f77bcf86cd799439204",
            senderId: userId,
            content: "감사합니다. 필요하면 연락드리겠습니다.",
            createdAt: new Date(Date.now() - 21 * 60 * 60 * 1000).toISOString(),
          },
        ];
      } else {
        // 기본 대화 내용
        messages = [
          {
            id: "507f1f77bcf86cd799439301",
            senderId: opponentId,
            content: "안녕하세요?",
            createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          },
          {
            id: "507f1f77bcf86cd799439302",
            senderId: userId,
            content: "네, 안녕하세요!",
            createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          },
        ];
      }

      // unreadCount만큼 상대가 보낸 메시지를 마지막에 추가
      if (room.unreadCount > 0) {
        const unreadMessages: ChatMessage[] = [];
        const now = Date.now();
        const unreadContents = [
          "네, 확인했습니다.",
          "감사합니다!",
          "좋은 소식이네요.",
          "알겠습니다.",
          "바로 처리하겠습니다.",
          "문의 주셔서 감사합니다.",
          "확인 후 답변드리겠습니다.",
          "이해했습니다.",
        ];

        for (let i = 0; i < room.unreadCount; i++) {
          unreadMessages.push({
            id: `unread-${room.roomId}-${i}-${Date.now()}`,
            senderId: opponentId,
            content:
              unreadContents[i % unreadContents.length] || `메시지 ${i + 1}`,
            createdAt: new Date(
              now - (room.unreadCount - i - 1) * 60 * 1000
            ).toISOString(),
          });
        }
        // 기존 메시지 뒤에 추가 (시간 순서 유지)
        messages = [...messages, ...unreadMessages];
        // 시간 순서대로 정렬 (오래된 것부터)
        messages.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }

      // participants 정보 생성
      const participants: Record<
        string,
        { id: number; name: string; avatar: string }
      > = {
        [userId]: {
          id: Number(userId),
          name: "현재 사용자",
          avatar:
            "https://lh3.googleusercontent.com/-lzSeccV9KtY/AAAAAAAAAAI/AAAAAAAAAAA/ALKGfkmpTYDCiyOwx1lDP39LTQlME_NzvQ/photo.jpg?sz=46",
        },
        [opponentId]: {
          id: room.opponent.id,
          name: room.opponent.name,
          avatar: room.opponent.avatar,
        },
      };

      return HttpResponse.json<ApiResponse<GetChatMessagesResponse>>({
        success: true,
        status: 0,
        data: {
          roomId: roomId as string,
          message: messages,
          participants,
          pagination,
        },
        timestamp: new Date().toISOString(),
      });
    }
  ),

  // 상대방 마지막 읽은 시간 조회
  http.get(
    `${
      import.meta.env.VITE_API_URL
    }/api/chat/rooms/:roomId/messages/opponent-last-read`,
    async ({ params }) => {
      const { roomId } = params;

      // 채팅방 목록에서 상대방 ID 찾기
      const room = chatRooms.find((r) => r.roomId === roomId);
      if (!room) {
        return HttpResponse.json<ApiResponse<OpponentLastReadResponse>>({
          success: false,
          status: 404,
          data: undefined,
          timestamp: new Date().toISOString(),
        });
      }

      let lastReadAt: string | null = null;

      if (room.opponent.id === 2) {
        // 김민준: 마지막에 내가 메시지를 보낸 상태, 상대는 안읽은 상태
        // 상대방이 마지막으로 읽은 시간을 내가 마지막으로 보낸 메시지(2분 전) 이전으로 설정
        // 내가 보낸 메시지 중 2분 전 이후의 메시지(2분 전)가 안읽은 메시지로 표시됨
        lastReadAt = new Date(Date.now() - 3 * 60 * 1000).toISOString(); // 3분 전 (2분 전 메시지가 안읽음)
      } else if (room.opponent.id === 3) {
        // 강현호: 상대가 마지막으로 메시지를 보낸 상태
        // 상대가 마지막으로 읽은 시간은 null (모든 메시지를 읽음 - 내가 보낸 메시지에 안읽음 표시 없음)
        lastReadAt = null;
      }
      // 그 외의 경우: null 반환 (모든 메시지를 읽음)

      return HttpResponse.json<ApiResponse<OpponentLastReadResponse>>({
        success: true,
        status: 0,
        data: {
          lastReadAt,
        },
        timestamp: new Date().toISOString(),
      });
    }
  ),
];

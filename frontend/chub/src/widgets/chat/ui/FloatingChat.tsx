import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useMe } from "@/features/auth/api/me";
import {
  useChatRooms,
  useChatMessages,
  useOpponentLastRead,
} from "@/entities/chat/api/query";
import type { ChatRoom, ChatMessage } from "@/entities/chat/model/types";
import type { Conversation, FloatingChatProps } from "@/widgets/chat/ui/types";
import { useChatWebSocketContext } from "@/widgets/chat/context/ChatWebSocketContext";
import { ChatToggleButton } from "@/widgets/chat/ui/ChatToggleButton";
import { ChatList } from "@/widgets/chat/ui/ChatList";
import { ChatHeader } from "@/widgets/chat/ui/ChatHeader";
import { ChatMessages } from "@/widgets/chat/ui/ChatMessages";
import { ChatInput } from "@/widgets/chat/ui/ChatInput";
import { EmptyChatState } from "@/widgets/chat/ui/EmptyChatState";
import { X } from "lucide-react";

export function FloatingChat({ messages = [] }: FloatingChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [readRoomIds, setReadRoomIds] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const unreadDividerRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);
  const hasScrolledToUnread = useRef(false);
  const { data: meData } = useMe();
  const currentUserId = meData?.data?.id;
  const isAuthenticated = !!(meData?.success && meData?.data);
  const { data: chatRoomsData } = useChatRooms();

  // 로그인하지 않은 경우 아무것도 렌더링하지 않음
  if (!isAuthenticated) {
    return null;
  }

  // 선택한 채팅방의 메시지 가져오기
  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    error: messagesError,
  } = useChatMessages(selectedRoomId);
  const { data: opponentLastReadData, isLoading: isLoadingLastRead } =
    useOpponentLastRead(selectedRoomId);

  // 디버깅: selectedRoomId 변경 시 로그
  useEffect(() => {
    if (selectedRoomId) {
      console.log("[FloatingChat] selectedRoomId 변경:", selectedRoomId);
      console.log("[FloatingChat] isLoadingMessages:", isLoadingMessages);
      console.log("[FloatingChat] messagesData:", messagesData);
      console.log("[FloatingChat] messagesError:", messagesError);
    }
  }, [selectedRoomId, isLoadingMessages, messagesData, messagesError]);

  // API에서 받은 채팅방 목록을 conversations로 변환
  const conversations = useMemo(() => {
    if (!chatRoomsData?.success || !chatRoomsData?.data?.rooms) {
      // API 데이터가 없으면 기존 messages 기반으로 생성
      if (!currentUserId) return [];

      const conversationMap = new Map<number, Conversation>();

      messages.forEach((message) => {
        if (message.type === "SYSTEM") return;

        const otherUserId =
          message.senderId === currentUserId
            ? message.recipientId || message.senderId
            : message.senderId;

        if (!otherUserId || otherUserId === currentUserId) return;

        const existing = conversationMap.get(otherUserId);
        const messageTime = new Date(message.timestamp).getTime();
        const lastTime = existing?.lastMessageTime
          ? new Date(existing.lastMessageTime).getTime()
          : 0;

        if (!existing || messageTime > lastTime) {
          const userName =
            message.senderId === currentUserId
              ? `User ${otherUserId}`
              : message.senderName;

          // roomId 생성 (작은 id:큰 id 형식으로 정렬)
          const [smallerId, largerId] = [currentUserId, otherUserId].sort(
            (a, b) => a - b
          );
          const roomId = `${smallerId}:${largerId}`;

          conversationMap.set(otherUserId, {
            roomId: roomId,
            userId: otherUserId,
            userName: userName,
            lastMessage: message.content,
            lastMessageTime: message.timestamp,
            unreadCount: existing?.unreadCount || 0,
          });
        }
      });

      return Array.from(conversationMap.values()).sort((a, b) => {
        const timeA = a.lastMessageTime
          ? new Date(a.lastMessageTime).getTime()
          : 0;
        const timeB = b.lastMessageTime
          ? new Date(b.lastMessageTime).getTime()
          : 0;
        return timeB - timeA;
      });
    }

    // API 데이터를 사용하여 conversations 생성
    // 가장 최근에 받은 채팅창부터 보여주기 위해 최신순 정렬
    return chatRoomsData.data.rooms
      .map(
        (room: ChatRoom): Conversation => ({
          roomId: room.roomId,
          userId: room.opponent.id,
          userName: room.opponent.name,
          userAvatar: room.opponent.avatar,
          lastMessage: room.lastMessage?.content,
          lastMessageTime: room.lastMessage?.timestamp || room.updatedAt,
          // 읽은 채팅방은 unreadCount를 0으로 설정
          unreadCount: readRoomIds.has(room.roomId) ? 0 : room.unreadCount,
        })
      )
      .sort((a, b) => {
        // lastMessageTime을 기준으로 최신순 정렬 (큰 값이 위로)
        const timeA = a.lastMessageTime
          ? new Date(a.lastMessageTime).getTime()
          : 0;
        const timeB = b.lastMessageTime
          ? new Date(b.lastMessageTime).getTime()
          : 0;
        // 내림차순 정렬 (최신이 위로)
        return timeB - timeA;
      });
  }, [chatRoomsData, messages, currentUserId, readRoomIds]);

  // 웹소켓 함수 가져오기 (ProtectedLayout에서 초기화됨)
  const { wsConnected, sendMessage, markAsRead, setOnMessageReceived } =
    useChatWebSocketContext();

  // 메시지 수신 시 현재 열려있는 채팅방이면 자동으로 읽음 처리
  const handleMessageReceived = useCallback(
    (roomId: string) => {
      // 현재 선택된 채팅방과 메시지가 온 채팅방이 같으면 자동으로 읽음 처리
      if (selectedRoomId === roomId && isOpen) {
        console.log("[FloatingChat] 메시지 수신 - 자동 읽음 처리:", roomId);
        markAsRead(roomId);
        setReadRoomIds((prev) => new Set(prev).add(roomId));
      }
    },
    [selectedRoomId, isOpen, markAsRead]
  );

  // 메시지 수신 콜백 등록
  useEffect(() => {
    setOnMessageReceived(handleMessageReceived);
    return () => {
      setOnMessageReceived(null);
    };
  }, [handleMessageReceived, setOnMessageReceived]);

  // API에서 받은 메시지를 변환하고 안읽은 메시지 구분
  const { processedMessages, unreadIndex } = useMemo(() => {
    if (!messagesData?.success || !messagesData?.data) {
      return { processedMessages: [], unreadIndex: -1 };
    }

    const messages = messagesData.data.message;
    if (!messages || messages.length === 0) {
      return { processedMessages: [], unreadIndex: -1 };
    }

    const opponentLastReadAt =
      opponentLastReadData?.success && opponentLastReadData?.data?.lastReadAt
        ? new Date(opponentLastReadData.data.lastReadAt).getTime()
        : null;

    const participants = messagesData.data.participants;
    const currentUserIdStr = currentUserId ? String(currentUserId) : null;

    // 선택한 채팅방의 원본 unreadCount 가져오기 (구분선용)
    // 목록의 배지는 readRoomIds로 제어하지만, 구분선은 실제 unreadCount를 사용
    const originalRoom = chatRoomsData?.data?.rooms?.find(
      (room: ChatRoom) => room.roomId === selectedRoomId
    );
    const unreadCount = originalRoom?.unreadCount || 0;

    // 메시지를 변환하고 안읽은 메시지 여부 판단
    // 위에서부터 오래된 메시지가 오도록 시간 순서대로 정렬 (오래된 것부터)
    const sortedMessages = [...messages].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const processed: Array<
      ChatMessage & { isUnread: boolean; senderName: string }
    > = sortedMessages.map((msg) => {
      const sender = participants[msg.senderId];
      const senderName = sender?.name || `User ${msg.senderId}`;

      // 내가 보낸 메시지인지 판단 (senderId가 현재 사용자 ID와 같으면 내 메시지)
      const isMyMessage = currentUserIdStr && msg.senderId === currentUserIdStr;

      // 내가 보낸 메시지 중 상대가 마지막으로 읽은 시간 이후의 메시지는 안읽음
      // (상대가 아직 읽지 않은 내 메시지 - 읽음 표시 "1"용)
      const isUnreadForReadReceipt =
        isMyMessage && opponentLastReadAt !== null
          ? new Date(msg.createdAt).getTime() > opponentLastReadAt
          : false;

      return {
        ...msg,
        isUnread: isUnreadForReadReceipt,
        senderName,
      };
    });

    // 안읽은 메시지의 첫 번째 인덱스 찾기 (내가 읽지 않은 상대 메시지)
    // unreadCount만큼 상대가 보낸 메시지를 뒤에서부터 찾아서 첫 번째 안읽은 메시지 위치 찾기
    let unreadIdx = -1;
    if (unreadCount > 0) {
      let unreadFound = 0;
      const unreadIndices: number[] = [];

      // 뒤에서부터 상대가 보낸 메시지 찾기
      for (let i = processed.length - 1; i >= 0; i--) {
        const msg = processed[i];
        const isMyMessage =
          currentUserIdStr && msg.senderId === currentUserIdStr;
        // 상대가 보낸 메시지 중 unreadCount만큼 안읽은 것으로 표시
        if (!isMyMessage && unreadFound < unreadCount) {
          unreadIndices.push(i);
          unreadFound++;
        }
      }

      // 첫 번째 안읽은 메시지의 인덱스 (가장 오래된 안읽은 메시지)
      if (unreadIndices.length > 0) {
        unreadIdx = unreadIndices[unreadIndices.length - 1];
      }
    }

    return { processedMessages: processed, unreadIndex: unreadIdx };
  }, [
    messagesData,
    opponentLastReadData,
    currentUserId,
    selectedRoomId,
    chatRoomsData,
  ]);

  // 채팅창이 열릴 때 선택된 채팅 초기화
  useEffect(() => {
    if (isOpen && !isAnimating) {
      // 채팅창이 열릴 때 아무 채팅도 선택하지 않음
      setSelectedRoomId(null);
      hasScrolledToUnread.current = false;
    }
  }, [isOpen, isAnimating]);

  // 채팅방이 변경되면 스크롤 초기화 및 읽음 처리
  useEffect(() => {
    if (selectedRoomId) {
      hasScrolledToUnread.current = false;
      // 채팅방을 열면 읽음 처리
      setReadRoomIds((prev) => new Set(prev).add(selectedRoomId));
      // 웹소켓으로 읽음 처리 전송
      markAsRead(selectedRoomId);
    }
  }, [selectedRoomId, markAsRead]);

  // 안읽은 메시지로 스크롤 조정 (애니메이션 없이 즉시)
  useEffect(() => {
    if (
      isOpen &&
      !isAnimating &&
      selectedRoomId &&
      processedMessages.length > 0 &&
      !hasScrolledToUnread.current
    ) {
      // requestAnimationFrame을 사용하여 DOM이 완전히 렌더링된 후 스크롤
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (
            unreadIndex >= 0 &&
            unreadDividerRef.current &&
            messagesContainerRef.current
          ) {
            // 안읽은 메시지가 있으면 그 위치로 스크롤 (애니메이션 없이)
            const container = messagesContainerRef.current;
            const divider = unreadDividerRef.current;
            const containerHeight = container.clientHeight;
            const dividerTop = divider.offsetTop;

            // 중앙에 오도록 즉시 스크롤
            container.scrollTop = dividerTop - containerHeight / 2;
            hasScrolledToUnread.current = true;
          } else if (messagesEndRef.current && messagesContainerRef.current) {
            // 안읽은 메시지가 없으면 맨 아래로 즉시 스크롤
            const container = messagesContainerRef.current;
            const endElement = messagesEndRef.current;
            container.scrollTop = endElement.offsetTop;
            hasScrolledToUnread.current = true;
          }
        });
      });
    }
  }, [processedMessages, isOpen, isAnimating, selectedRoomId, unreadIndex]);

  // 첫 렌더링 시 애니메이션 없이 표시
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
  }, []);

  const handleClose = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsAnimating(false);
    }, 150); // 300ms -> 150ms로 속도 향상
  };

  const handleOpen = () => {
    setIsOpen(true);
    setIsAnimating(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsAnimating(false);
      });
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[FloatingChat] handleSubmit 호출:", {
      input: input.trim(),
      selectedRoomId,
      wsConnected,
    });

    if (!input.trim()) {
      console.warn("[FloatingChat] 입력값이 비어있습니다.");
      return;
    }
    if (!selectedRoomId) {
      console.warn("[FloatingChat] 선택된 채팅방이 없습니다.");
      return;
    }
    if (!wsConnected) {
      console.warn("[FloatingChat] WebSocket이 연결되지 않았습니다.");
      return;
    }

    // 웹소켓으로 메시지 전송
    const result = sendMessage(selectedRoomId, input.trim());
    console.log("[FloatingChat] sendMessage 결과:", result);
    if (result) {
      setInput("");
    }
  };

  const handleSelectRoom = (roomId: string) => {
    console.log("[FloatingChat] 채팅방 선택:", roomId);
    setSelectedRoomId(roomId);
    hasScrolledToUnread.current = false;
    // 채팅방을 클릭하면 즉시 읽음 처리
    setReadRoomIds((prev) => new Set(prev).add(roomId));
  };

  const handleCloseChat = () => {
    setSelectedRoomId(null);
    hasScrolledToUnread.current = false;
  };

  const selectedConversation = conversations.find(
    (conv) => conv.roomId === selectedRoomId
  );

  const totalUnreadCount = conversations.reduce(
    (sum, conv) => sum + conv.unreadCount,
    0
  );

  return (
    <>
      <ChatToggleButton
        isOpen={isOpen}
        totalUnreadCount={totalUnreadCount}
        onToggle={isOpen ? handleClose : handleOpen}
      />

      {isOpen && (
        <div
          className={`w-[500px] h-[400px] bg-white rounded-xl shadow-2xl border border-gray-300 overflow-hidden flex z-40 ${
            isAnimating && !isFirstRender.current
              ? "opacity-0 translate-y-4"
              : "opacity-100 translate-y-0"
          }`}
          style={{
            position: "fixed",
            bottom: "5rem",
            right: "1rem",
            transition: "opacity 0.15s ease-out, transform 0.15s ease-out",
          }}
        >
          {/* 채팅창 전체 닫기 버튼 (채팅이 선택되지 않았을 때만 표시) */}
          {!selectedRoomId && (
            <div className="absolute top-2 right-2 z-50">
              <button
                onClick={handleClose}
                className="p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
                title="채팅창 닫기"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <ChatList
            conversations={conversations}
            selectedRoomId={selectedRoomId}
            onSelectRoom={handleSelectRoom}
          />

          <div className="flex-1 flex flex-col bg-white min-h-0">
            {selectedRoomId && selectedConversation ? (
              <>
                <ChatHeader
                  userName={selectedConversation.userName}
                  onClose={handleCloseChat}
                />

                <ChatMessages
                  messages={processedMessages}
                  isLoading={isLoadingMessages || isLoadingLastRead}
                  error={messagesError}
                  unreadIndex={unreadIndex}
                  currentUserId={currentUserId}
                  userAvatar={selectedConversation.userAvatar}
                  messagesContainerRef={messagesContainerRef}
                  unreadDividerRef={unreadDividerRef}
                  messagesEndRef={messagesEndRef}
                />

                <ChatInput
                  input={input}
                  wsConnected={wsConnected}
                  onInputChange={setInput}
                  onSubmit={handleSubmit}
                />
              </>
            ) : (
              <EmptyChatState />
            )}
          </div>
        </div>
      )}
    </>
  );
}

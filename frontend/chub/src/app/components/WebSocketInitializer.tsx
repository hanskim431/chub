import { useMe } from "@/features/auth/api/me";
import { useWebSocket } from "@/shared/websocket/useWebSocket";

/**
 * WebSocket 연결을 초기화하는 컴포넌트
 * QueryProvider 안에서만 사용되어야 함 (useMe가 React Query를 사용)
 */
export function WebSocketInitializer() {
  const { data } = useMe();
  const isAuthenticated = !!(data?.success && data?.data);
  const currentUserId = data?.data?.id;

  // WebSocket 연결 초기화 (전역에서 한 번만, 인증된 경우에만)
  useWebSocket({
    enabled: isAuthenticated && !!currentUserId,
  });

  return null; // 이 컴포넌트는 렌더링하지 않음
}


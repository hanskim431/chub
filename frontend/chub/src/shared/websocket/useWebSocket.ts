import { useEffect, useRef, useState, useCallback } from "react";
import { Client, type Message as StompMessage } from "@stomp/stompjs";
// @ts-ignore - sockjs-client 타입 정의 없음
import SockJS from "sockjs-client";
import type {
  WebSocketConfig,
  Subscription,
  SubscriptionCallback,
} from "./types";

// 전역 WebSocket 클라이언트 인스턴스 (싱글톤)
let globalClient: Client | null = null;
let globalClientRefCount = 0;
let globalConnectionState = false;
const subscriptions = new Map<string, Subscription>();
const connectionStateListeners = new Set<() => void>();

// 전역 연결 상태 업데이트 함수
function updateConnectionState(connected: boolean) {
  globalConnectionState = connected;
  connectionStateListeners.forEach((listener) => listener());
}

// WebSocket 연결 초기화 (한 번만 실행)
function initializeWebSocket(config?: WebSocketConfig) {
  if (globalClient) {
    return; // 이미 연결되어 있음
  }

  const apiUrl =
    config?.apiUrl || import.meta.env.VITE_API_URL || "http://localhost:8080";

  const socket = new SockJS(`${apiUrl}/ws`);
  globalClient = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: config?.reconnectDelay || 5000,
    heartbeatIncoming: config?.heartbeatIncoming || 4000,
    heartbeatOutgoing: config?.heartbeatOutgoing || 4000,
    onConnect: () => {
      console.log("[WebSocket] 연결됨");
      updateConnectionState(true);
      config?.onConnect?.();
    },
    onStompError: (frame) => {
      console.error("[WebSocket] STOMP 에러:", frame);
      updateConnectionState(false);
      config?.onError?.(frame);
    },
    onDisconnect: () => {
      console.log("[WebSocket] 연결 해제됨");
      updateConnectionState(false);
      config?.onDisconnect?.();
    },
    onWebSocketClose: () => {
      console.log("[WebSocket] WebSocket 닫힘");
      updateConnectionState(false);
    },
  });

  globalClient.activate();
}

export function useWebSocket(config?: WebSocketConfig) {
  const [isConnected, setIsConnected] = useState(globalConnectionState);
  const clientRef = useRef<Client | null>(null);

  // 연결 상태 리스너 등록
  useEffect(() => {
    const listener = () => {
      setIsConnected(globalConnectionState);
    };
    connectionStateListeners.add(listener);
    setIsConnected(globalConnectionState);

    return () => {
      connectionStateListeners.delete(listener);
    };
  }, []);

  // WebSocket 연결 초기화 (한 번만)
  useEffect(() => {
    // enabled가 false이면 연결하지 않음
    const shouldConnect = config?.enabled !== false;
    if (!shouldConnect) {
      return;
    }

    // 전역 클라이언트가 없으면 생성 (이미 연결되어 있으면 재연결하지 않음)
    if (!globalClient) {
      initializeWebSocket(config);
    }

    globalClientRefCount++;
    clientRef.current = globalClient;

    return () => {
      globalClientRefCount--;
      // 마지막 사용자가 해제되면 연결 종료
      if (globalClientRefCount === 0 && globalClient) {
        // 모든 구독 해제
        subscriptions.forEach((sub) => {
          try {
            sub.subscription?.unsubscribe();
          } catch (e) {
            console.error("[WebSocket] 구독 해제 실패:", e);
          }
        });
        subscriptions.clear();

        globalClient.deactivate();
        globalClient = null;
        updateConnectionState(false);
      }
    };
    // config?.enabled가 변경되어도 연결은 한 번만 수행 (globalClient 체크로 보호)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.enabled]);

  // 구독
  const subscribe = useCallback(
    (destination: string, callback: SubscriptionCallback) => {
      if (!clientRef.current?.connected) {
        console.warn(`[WebSocket] 연결되지 않음, 구독 대기: ${destination}`);
        // 연결 대기 후 구독
        const checkConnection = setInterval(() => {
          if (clientRef.current?.connected) {
            clearInterval(checkConnection);
            doSubscribe(destination, callback);
          }
        }, 100);
        // 10초 후 타임아웃
        setTimeout(() => clearInterval(checkConnection), 10000);
        return () => {
          clearInterval(checkConnection);
          unsubscribe(destination);
        };
      }

      return doSubscribe(destination, callback);
    },
    []
  );

  const doSubscribe = (destination: string, callback: SubscriptionCallback) => {
    if (!clientRef.current) {
      console.error("[WebSocket] 클라이언트가 없습니다.");
      return () => {};
    }

    // 이미 구독 중이면 해제 후 재구독
    if (subscriptions.has(destination)) {
      const existingSub = subscriptions.get(destination);
      try {
        existingSub?.subscription?.unsubscribe();
      } catch (e) {
        console.error("[WebSocket] 기존 구독 해제 실패:", e);
      }
    }

    console.log(`[WebSocket] 구독: ${destination}`);
    const subscription = clientRef.current.subscribe(destination, callback);
    subscriptions.set(destination, {
      destination,
      callback,
      subscription,
    });

    // 구독 해제 함수 반환
    return () => {
      unsubscribe(destination);
    };
  };

  // 구독 해제
  const unsubscribe = useCallback((destination: string) => {
    const sub = subscriptions.get(destination);
    if (sub) {
      try {
        sub.subscription?.unsubscribe();
        subscriptions.delete(destination);
        console.log(`[WebSocket] 구독 해제: ${destination}`);
      } catch (e) {
        console.error("[WebSocket] 구독 해제 실패:", e);
      }
    }
  }, []);

  // 메시지 전송
  const publish = useCallback((destination: string, body: string) => {
    if (!clientRef.current?.connected) {
      console.error(
        "[WebSocket] 연결되지 않음, 메시지 전송 실패:",
        destination
      );
      return false;
    }

    try {
      clientRef.current.publish({
        destination,
        body,
      });
      return true;
    } catch (error) {
      console.error("[WebSocket] 메시지 전송 실패:", error);
      return false;
    }
  }, []);

  return {
    isConnected,
    client: clientRef.current,
    subscribe,
    unsubscribe,
    publish,
  };
}

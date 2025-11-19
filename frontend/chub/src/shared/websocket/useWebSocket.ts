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
const subscriptions = new Map<string, Subscription>();

export function useWebSocket(config?: WebSocketConfig) {
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const configRef = useRef(config);

  // config 업데이트
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  // WebSocket 연결
  useEffect(() => {
    // enabled가 false이면 연결하지 않음
    if (config?.enabled === false) {
      return;
    }

    const apiUrl =
      config?.apiUrl || import.meta.env.VITE_API_URL || "http://localhost:8080";

    // 전역 클라이언트가 없으면 생성
    if (!globalClient) {
      const socket = new SockJS(`${apiUrl}/ws`);
      globalClient = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: config?.reconnectDelay || 5000,
        heartbeatIncoming: config?.heartbeatIncoming || 4000,
        heartbeatOutgoing: config?.heartbeatOutgoing || 4000,
        onConnect: () => {
          console.log("[WebSocket] 연결됨");
          setIsConnected(true);
          configRef.current?.onConnect?.();
        },
        onStompError: (frame) => {
          console.error("[WebSocket] STOMP 에러:", frame);
          setIsConnected(false);
          configRef.current?.onError?.(frame);
        },
        onDisconnect: () => {
          console.log("[WebSocket] 연결 해제됨");
          setIsConnected(false);
          configRef.current?.onDisconnect?.();
        },
        onWebSocketClose: () => {
          console.log("[WebSocket] WebSocket 닫힘");
          setIsConnected(false);
        },
      });

      globalClient.activate();
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
        setIsConnected(false);
      }
    };
  }, [
    config?.apiUrl,
    config?.reconnectDelay,
    config?.heartbeatIncoming,
    config?.heartbeatOutgoing,
  ]);

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

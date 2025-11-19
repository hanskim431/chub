import { Client, type Message as StompMessage } from "@stomp/stompjs";

export interface WebSocketMessage<T = unknown> {
  type: string;
  data: T;
  timestamp: string;
}

export type SubscriptionCallback = (message: StompMessage) => void;

export interface Subscription {
  destination: string;
  callback: SubscriptionCallback;
  subscription: any; // STOMP subscription object
}

export interface WebSocketConfig {
  apiUrl?: string;
  reconnectDelay?: number;
  heartbeatIncoming?: number;
  heartbeatOutgoing?: number;
  enabled?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
}

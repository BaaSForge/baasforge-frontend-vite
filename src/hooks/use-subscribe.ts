import { useEffect, useRef, useCallback } from "react";

const DEFAULT_RECONNECT_INTERVAL_MS = 2000;
const MAX_RECONNECT_INTERVAL_MS = 30_000;
const BACKOFF_MULTIPLIER = 1.5;

export interface UseSubscribeOptions {
  onMessage?: (data: unknown) => void;
  onOpen?: () => void;
  onClose?: (code: number, reason: string, wasClean: boolean) => void;
  onError?: (event: Event) => void;
  reconnectIntervalMs?: number;
  maxReconnectIntervalMs?: number;
  enabled?: boolean;
}

export function useSubscribe(
  url: string,
  topic: string,
  options: UseSubscribeOptions = {}
): void {
  const {
    onMessage,
    onOpen,
    onClose,
    onError,
    reconnectIntervalMs = DEFAULT_RECONNECT_INTERVAL_MS,
    maxReconnectIntervalMs = MAX_RECONNECT_INTERVAL_MS,
    enabled = true,
  } = options;

  const onMessageRef = useRef(onMessage);
  const onOpenRef = useRef(onOpen);
  const onCloseRef = useRef(onClose);
  const onErrorRef = useRef(onError);
  const enabledRef = useRef(enabled);
  onMessageRef.current = onMessage;
  onOpenRef.current = onOpen;
  onCloseRef.current = onClose;
  onErrorRef.current = onError;
  enabledRef.current = enabled;

  const reconnectIntervalRef = useRef(reconnectIntervalMs);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const topicRef = useRef(topic);
  topicRef.current = topic;

  const connect = useCallback(() => {
    if (!url || !topic.trim() || !enabled) return;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      reconnectIntervalRef.current = reconnectIntervalMs;
      ws.send(
        JSON.stringify({
          action: "subscribe",
          topic: topicRef.current,
        })
      );
      onOpenRef.current?.();
    };

    ws.onmessage = (event: MessageEvent) => {
      let data: unknown = event.data;
      if (typeof event.data === "string") {
        try {
          data = JSON.parse(event.data);
        } catch {
          console.error("Failed to parse message", event.data);
        }
      }
      onMessageRef.current?.(data);
    };

    ws.onerror = (event) => {
      onErrorRef.current?.(event);
    };

    ws.onclose = (event) => {
      wsRef.current = null;
      onCloseRef.current?.(event.code, event.reason ?? "", event.wasClean);

      if (!enabledRef.current) return;

      const delay = reconnectIntervalRef.current;
      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectTimeoutRef.current = null;
        reconnectIntervalRef.current = Math.min(
          Math.floor(reconnectIntervalRef.current * BACKOFF_MULTIPLIER),
          maxReconnectIntervalMs
        );
        connect();
      }, delay);
    };
  }, [
    url,
    topic,
    enabled,
    reconnectIntervalMs,
    maxReconnectIntervalMs,
  ]);

  useEffect(() => {
    if (!enabled || !url || !topic.trim()) return;

    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [enabled, url, topic, connect]);
}

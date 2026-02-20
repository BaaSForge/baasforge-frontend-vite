import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import { useSubscribe } from "@/hooks/use-subscribe";
import { envConfig } from "@/lib/env";
import { QueryKeys } from "@/constants/query-keys";
import {
  ChatMessageDeliveryStatus,
  ChatMessageType,
  ChatSessionRoleType,
  type ChatMessageWithDeliveryStatus,
} from "@/modules/project-chat/types";
import { useAuth } from "@/modules/auth";
import { modifyInfiniteCacheData } from "@/lib/react-query-utils";

const NO_STREAM = -1;

function isChatSessionNewMessageChunk(
  data: unknown
): data is { type: "chat_session_new_message_chunk"; topic: string; chunk_index: number; content: string; done: boolean } {
  return (
    typeof data === "object" &&
    data !== null &&
    "type" in data &&
    (data as { type: string }).type === "chat_session_new_message_chunk" &&
    "chunk_index" in data &&
    "content" in data &&
    "done" in data
  );
}

const STREAMING_MESSAGE_ID = -1;

export function useSubscribeSession(projectId: number | undefined, sessionId: number | undefined): void {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const wsUrl = envConfig.wsUrl;
  const topic =
    user != null && projectId != null && sessionId != null
      ? `chat_session:${user.id}:${projectId}:${sessionId}`
      : "";

  const lastAppliedChunkIndexRef = useRef<number>(NO_STREAM);

  useEffect(() => {
    lastAppliedChunkIndexRef.current = NO_STREAM;
  }, [sessionId]);

  useSubscribe(wsUrl, topic, {
    enabled: !!projectId && !!sessionId && !!user && !!wsUrl,
    onMessage(data) {
      if (!isChatSessionNewMessageChunk(data) || projectId == null || sessionId == null) return;

      // Only apply chunks for this conversation; ignore messages for other sessions
      // (e.g. when backend broadcasts to a wider channel or multiple tabs share state).
      if (data.topic != null && data.topic !== topic) return;

      const { chunk_index, content, done } = data;
      const cacheKey = QueryKeys.projectChatSessionMessages(projectId, sessionId);

      if (chunk_index === 0) {
        if (lastAppliedChunkIndexRef.current >= 0) {
          return;
        }
        lastAppliedChunkIndexRef.current = 0;

        const newMessage: ChatMessageWithDeliveryStatus = {
          id: STREAMING_MESSAGE_ID,
          chat_session_id: sessionId,
          role: ChatSessionRoleType.Ai,
          type: ChatMessageType.Text,
          payload: content,
          created_at: new Date().toISOString(),
          is_first: false,
          delivery_status: ChatMessageDeliveryStatus.Delivered,
        };
        queryClient.setQueryData<InfiniteData<ChatMessageWithDeliveryStatus[]>>(cacheKey, (old) =>
          modifyInfiniteCacheData(old, (pages) => {
            const lastPage = pages[pages.length - 1] ?? [];
            const last = lastPage[lastPage.length - 1];
            let base = lastPage;
            if (last?.id === STREAMING_MESSAGE_ID) {
              const finalized: ChatMessageWithDeliveryStatus = {
                ...last,
                id: new Date().getTime() + Math.random(),
              };
              base = [...lastPage.slice(0, -1), finalized];
            }
            return [...pages.slice(0, -1), [...base, newMessage]];
          })
        );
        if (done) {
          lastAppliedChunkIndexRef.current = NO_STREAM;
        }
        return;
      }

      if (chunk_index !== lastAppliedChunkIndexRef.current + 1) {
        return;
      }
      lastAppliedChunkIndexRef.current = chunk_index;

      queryClient.setQueryData<InfiniteData<ChatMessageWithDeliveryStatus[]>>(cacheKey, (old) =>
        modifyInfiniteCacheData(old, (pages) => {
          const lastPage = pages[pages.length - 1];
          const last = lastPage[lastPage.length - 1];
          if (last?.id !== STREAMING_MESSAGE_ID) return pages;
          const currentPayload = typeof last.payload === "string" ? last.payload : "";
          const updated: ChatMessageWithDeliveryStatus = {
            ...last,
            payload: currentPayload + content,
          };

          if (done) {
            updated.id = new Date().getTime() + Math.random();
          }

          return [
            ...pages.slice(0, -1),
            [...lastPage.slice(0, -1), updated],
          ];
        })
      );

      if (done) {
        lastAppliedChunkIndexRef.current = NO_STREAM;
      }
    },
  });
}

function getScrollRoot(): Element {
  return document.scrollingElement ?? document.documentElement;
}

type ScrollSnapshot = { scrollTop: number; scrollHeight: number };

export function useCaptureDocumentScroll<T>(dep: T) {
  const snapshotRef = useRef<ScrollSnapshot | null>(null);

  /**
   * Call this *before* loading more content (e.g. before fetchPreviousPage()).
   * Stores the current scroll position and height so we can restore after the
   * new content is in the DOM.
   */
  const capture = useCallback(() => {
    const el = getScrollRoot();
    snapshotRef.current = {
      scrollTop: el.scrollTop,
      scrollHeight: el.scrollHeight,
    };
  }, []);

  useLayoutEffect(() => {
    const snapshot = snapshotRef.current;
    if (snapshot == null) return;

    const el = getScrollRoot();
    const newHeight = el.scrollHeight;
    const heightDelta = newHeight - snapshot.scrollHeight;
    if (heightDelta <= 0) return;

    // Defer scroll to the next frame so layout has settled (avoids fighting
    // reflow at breakpoints like 767px when the sidebar hides/shows).
    const rafId = requestAnimationFrame(() => {
      const root = getScrollRoot();
      const targetTop = snapshot.scrollTop + heightDelta;
      const maxScrollTop = root.scrollHeight - root.clientHeight;
      root.scrollTop = Math.min(targetTop, maxScrollTop);
    });
    snapshotRef.current = null;
    return () => cancelAnimationFrame(rafId);
  }, [dep]);

  return capture;
}

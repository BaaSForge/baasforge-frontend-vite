import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import { useSubscribe } from "@/hooks/use-subscribe";
import { envConfig } from "@/lib/env";
import { QueryKeys } from "@/constants/query-keys";
import { ChatMessageStatus, type ChatMessageWithDeliveryStatus } from "@/modules/project-chat/types";
import { useAuth } from "@/modules/auth";
import { modifyInfiniteCacheData } from "@/lib/react-query-utils";
import { isChatSessionNewMessageChunkEvent } from "@/lib/ws-events";

const NO_STREAM = -1;

function applyChunkToMessageInPages(
  pages: ChatMessageWithDeliveryStatus[][],
  messageId: number,
  content: string,
  done: boolean,
): ChatMessageWithDeliveryStatus[][] {
  for (let i = pages.length - 1; i >= 0; i--) {
    const page = pages[i];
    const idx = page.findIndex((msg) => msg.id === messageId);
    if (idx === -1) continue;
    const msg = page[idx];
    const currentPayload = typeof msg.payload === "string" ? msg.payload : "";
    const updated: ChatMessageWithDeliveryStatus = {
      ...msg,
      payload: currentPayload + content,
      status: done ? ChatMessageStatus.Completed : ChatMessageStatus.Generating,
    };
    const newPage = [...page];
    newPage[idx] = updated;
    return [...pages.slice(0, i), newPage, ...pages.slice(i + 1)];
  }
  return pages;
}

export function useSubscribeSession(projectId: number | undefined, sessionId: number | undefined): void {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const wsUrl = envConfig.wsUrl;
  const topic =
    user != null && projectId != null && sessionId != null
      ? `chat_session:${user.id}:${projectId}:${sessionId}`
      : "";

  /** Tracks last applied chunk index per message_id for ordering. */
  const lastAppliedChunkByMessageRef = useRef(new Map<number, number>());

  useEffect(() => {
    lastAppliedChunkByMessageRef.current.clear();
  }, [sessionId]);

  useSubscribe(wsUrl, topic, {
    enabled: !!projectId && !!sessionId && !!user && !!wsUrl,
    onMessage(data) {
      if (!isChatSessionNewMessageChunkEvent(data) || projectId == null || sessionId == null) return;

      // Only apply chunks for this conversation; ignore messages for other sessions
      // (e.g. when backend broadcasts to a wider channel or multiple tabs share state).
      if (data.topic != null && data.topic !== topic) return;

      const { message_id, chunk_index, content, done } = data;
      const cacheKey = QueryKeys.projectChatSessionMessages(projectId, sessionId);
      const lastApplied = lastAppliedChunkByMessageRef.current.get(message_id) ?? NO_STREAM;

      if (chunk_index === 0) {
        if (lastApplied >= 0) return;
        lastAppliedChunkByMessageRef.current.set(message_id, 0);

        queryClient.setQueryData<InfiniteData<ChatMessageWithDeliveryStatus[]>>(cacheKey, (old) =>
          modifyInfiniteCacheData(old, (pages) => applyChunkToMessageInPages(pages, message_id, content, done))
        );
        if (done) lastAppliedChunkByMessageRef.current.delete(message_id);
        return;
      }

      if (chunk_index !== lastApplied + 1) return;
      lastAppliedChunkByMessageRef.current.set(message_id, chunk_index);

      queryClient.setQueryData<InfiniteData<ChatMessageWithDeliveryStatus[]>>(cacheKey, (old) =>
        modifyInfiniteCacheData(old, (pages) => applyChunkToMessageInPages(pages, message_id, content, done))
      );

      if (done) lastAppliedChunkByMessageRef.current.delete(message_id);
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

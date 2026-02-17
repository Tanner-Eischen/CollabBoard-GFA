"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import type { ConnectionStatus } from "./useSocket";
import { flush } from "@/lib/socket/offlineQueue";

/**
 * Flushes offline queue when connection returns.
 * Call from board page or layout when user is authenticated.
 */
export function useOfflineQueueFlush(status: ConnectionStatus): void {
  const { data: session, status: authStatus } = useSession();
  const prevStatus = useRef<ConnectionStatus>("offline");

  useEffect(() => {
    if (authStatus !== "authenticated" || !session?.apiToken) return;

    const token = session.apiToken as string;
    const nowConnected = status === "connected";
    const wasNotConnected = prevStatus.current !== "connected";

    if (nowConnected && wasNotConnected) {
      flush(token).catch(() => {});
    }

    prevStatus.current = status;
  }, [status, session?.apiToken, authStatus]);
}

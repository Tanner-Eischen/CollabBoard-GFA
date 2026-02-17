"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import type { Socket } from "socket.io-client";
import { createSocketClient } from "@/lib/socket/client";

export type ConnectionStatus = "connected" | "reconnecting" | "offline";

export interface UseSocketResult {
  socket: Socket | null;
  status: ConnectionStatus;
}

/**
 * Creates and manages socket connection. Connects when session has apiToken.
 * Exposes connection status for UI and offline queue flush.
 */
export function useSocket(): UseSocketResult {
  const { data: session, status } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("offline");

  useEffect(() => {
    if (status !== "authenticated" || !session?.apiToken) {
      setSocket((prev) => {
        if (prev) {
          prev.disconnect();
        }
        return null;
      });
      setConnectionStatus("offline");
      return;
    }

    const s = createSocketClient(session.apiToken);
    setSocket(s);

    let wasConnected = false;

    const onConnect = () => {
      wasConnected = true;
      setConnectionStatus("connected");
    };

    const onDisconnect = () => {
      if (wasConnected) {
        setConnectionStatus("reconnecting");
      } else {
        setConnectionStatus("offline");
      }
    };

    const onReconnectAttempt = () => {
      setConnectionStatus("reconnecting");
    };

    const onReconnect = () => {
      setConnectionStatus("connected");
    };

    const onReconnectFailed = () => {
      setConnectionStatus("offline");
    };

    if (s.connected) {
      setConnectionStatus("connected");
      wasConnected = true;
    } else {
      setConnectionStatus("reconnecting");
    }

    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);
    s.on("reconnect_attempt", onReconnectAttempt);
    s.on("reconnect", onReconnect);
    s.on("reconnect_failed", onReconnectFailed);

    return () => {
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
      s.off("reconnect_attempt", onReconnectAttempt);
      s.off("reconnect", onReconnect);
      s.off("reconnect_failed", onReconnectFailed);
      s.disconnect();
      setSocket(null);
      setConnectionStatus("offline");
    };
  }, [session?.apiToken, status]);

  return { socket, status: connectionStatus };
}

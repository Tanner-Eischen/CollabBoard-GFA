"use client";

import { useEffect } from "react";
import type { Socket } from "socket.io-client";
import { SOCKET_EVENTS } from "@/lib/socket/events";
import { usePresenceStore } from "@/stores/presenceStore";
import type { UserPresence } from "@collabboard/shared";

/**
 * Joins board room, subscribes to presence events, and updates store.
 * Call from board page with boardId and socket.
 */
export function useBoardPresence(boardId: string | undefined, socket: Socket | null) {
  const setUsers = usePresenceStore((s) => s.setUsers);
  const addUser = usePresenceStore((s) => s.addUser);
  const removeUser = usePresenceStore((s) => s.removeUser);

  useEffect(() => {
    if (!boardId || !socket) return;

    const doJoin = () => {
      socket.emit(SOCKET_EVENTS.BOARD_JOIN, {
        boardId,
        displayName: undefined,
        color: undefined,
      });
    };
    if (socket.connected) doJoin();
    socket.on("connect", doJoin);

    const onUsersList = (payload: { users: UserPresence[] }) => {
      setUsers(payload.users ?? []);
    };
    const onUserJoined = (payload: { user: UserPresence }) => {
      if (payload.user) addUser(payload.user);
    };
    const onUserLeft = (payload: { userId: string }) => {
      if (payload.userId) removeUser(payload.userId);
    };

    socket.on(SOCKET_EVENTS.USERS_LIST, onUsersList);
    socket.on(SOCKET_EVENTS.USER_JOINED, onUserJoined);
    socket.on(SOCKET_EVENTS.USER_LEFT, onUserLeft);

    return () => {
      socket.off("connect", doJoin);
      socket.emit(SOCKET_EVENTS.BOARD_LEAVE, { boardId });
      socket.off(SOCKET_EVENTS.USERS_LIST, onUsersList);
      socket.off(SOCKET_EVENTS.USER_JOINED, onUserJoined);
      socket.off(SOCKET_EVENTS.USER_LEFT, onUserLeft);
      usePresenceStore.getState().reset();
    };
  }, [boardId, socket, setUsers, addUser, removeUser]);
}

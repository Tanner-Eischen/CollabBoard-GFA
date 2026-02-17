/**
 * Socket event names and typed helpers.
 * Mirrors packages/shared socket-events.
 */

export const SOCKET_EVENTS = {
  BOARD_JOIN: "board:join",
  BOARD_LEAVE: "board:leave",
  CURSOR_MOVE: "cursor:move",
  CURSOR_UPDATE: "cursor:update",
  USER_JOINED: "user:joined",
  USER_LEFT: "user:left",
  USERS_LIST: "users:list",
  OBJECTS_LIST: "objects:list",
  OBJECT_CREATED: "object:created",
  OBJECT_UPDATED: "object:updated",
  OBJECT_DELETED: "object:deleted",
} as const;
